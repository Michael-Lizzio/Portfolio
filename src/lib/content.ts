/**
 * The data-access seam for all portfolio content.
 *
 * THIS IS THE ONLY MODULE IN THE APP THAT TOUCHES THE FILESYSTEM FOR CONTENT.
 * Pages, layouts and components import from here and nothing else — they never
 * read `content/`, never join paths, never resolve a media URL themselves.
 *
 * That indirection is deliberate and load-bearing: the plan is to move content
 * into Supabase. When that happens, this file's body is replaced with queries
 * and every caller keeps working untouched, because the exported signatures and
 * the shapes in `schema.ts` are the contract — not the JSON on disk.
 * If you find yourself adding `node:fs` anywhere else, the seam has leaked.
 *
 * Reads are wrapped in React's `cache()`, so one render pass reads each file at
 * most once no matter how many components ask for it.
 *
 * Content that fails its zod schema throws, loudly, with the file path and the
 * offending field. A malformed project must break the build — never disappear
 * quietly from the site. `npm run validate` reports every problem at once;
 * this module stops at the first, because by then the build is already wrong.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { ZodError } from "zod";

import {
  ProfileSchema,
  ProjectSchema,
  type Media,
  type Profile,
  type Project,
  type ResolvedMedia,
  type ResolvedProject,
} from "./schema";
import { compareProjectsByDate } from "./project-order";

const CONTENT_DIR = path.join(process.cwd(), "content");
const PROJECTS_DIR = path.join(CONTENT_DIR, "projects");
const PROFILE_FILE = path.join(CONTENT_DIR, "profile.json");

/* -------------------------------------------------------------------------- */
/* failing loudly                                                             */
/* -------------------------------------------------------------------------- */

/** Repo-relative path, so the error is copy-pasteable into an editor. */
function rel(file: string): string {
  return path.relative(process.cwd(), file) || file;
}

function contentError(file: string, detail: string): Error {
  return new Error(
    `[content] ${rel(file)}\n${detail}\n\n` +
      `Run \`npm run validate\` to see every content problem at once.`,
  );
}

function formatIssues(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const at = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `  - ${at}: ${issue.message}`;
    })
    .join("\n");
}

async function readJson(file: string): Promise<unknown> {
  let raw: string;
  try {
    raw = await readFile(file, "utf8");
  } catch (cause) {
    throw contentError(file, `  - could not be read: ${(cause as Error).message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (cause) {
    throw contentError(file, `  - is not valid JSON: ${(cause as Error).message}`);
  }
}

/* -------------------------------------------------------------------------- */
/* media path resolution                                                      */
/* -------------------------------------------------------------------------- */

/**
 * `media/cover.webp` in `content/projects/<slug>/` is published by
 * `scripts/sync-media.mjs` to `public/media/<slug>/cover.webp`, which the
 * browser sees at `/media/<slug>/cover.webp`. Callers only ever see the latter.
 */
function toPublicUrl(slug: string, relativeSrc: string): string {
  return `/media/${slug}/${relativeSrc.replace(/^media\//, "")}`;
}

function readUint24LE(buffer: Buffer, offset: number): number {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

/** Read just enough of the formats accepted by MediaSchema to reserve the real aspect ratio. */
function imageDimensions(buffer: Buffer): { width: number; height: number } | null {
  // PNG: signature + IHDR dimensions.
  if (buffer.length >= 24 && buffer.subarray(1, 4).toString("ascii") === "PNG") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  // WebP: walk RIFF chunks until the first image header.
  if (
    buffer.length >= 30 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    let offset = 12;
    while (offset + 8 <= buffer.length) {
      const kind = buffer.subarray(offset, offset + 4).toString("ascii");
      const size = buffer.readUInt32LE(offset + 4);
      const data = offset + 8;

      if (kind === "VP8 " && data + 10 <= buffer.length) {
        return {
          width: buffer.readUInt16LE(data + 6) & 0x3fff,
          height: buffer.readUInt16LE(data + 8) & 0x3fff,
        };
      }
      if (kind === "VP8L" && data + 5 <= buffer.length) {
        const b1 = buffer[data + 1];
        const b2 = buffer[data + 2];
        const b3 = buffer[data + 3];
        const b4 = buffer[data + 4];
        return {
          width: 1 + (((b2 & 0x3f) << 8) | b1),
          height: 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6)),
        };
      }
      if (kind === "VP8X" && data + 10 <= buffer.length) {
        return {
          width: 1 + readUint24LE(buffer, data + 4),
          height: 1 + readUint24LE(buffer, data + 7),
        };
      }

      offset = data + size + (size % 2);
    }
  }

  // JPEG: dimensions live in a start-of-frame segment.
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    const sof = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
    while (offset + 8 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      if (sof.has(marker)) {
        return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
      }
      if (marker === 0xd8 || marker === 0xd9) {
        offset += 2;
        continue;
      }
      const size = buffer.readUInt16BE(offset + 2);
      if (size < 2) break;
      offset += size + 2;
    }
  }

  return null;
}

async function resolveMedia(slug: string, media: Media): Promise<ResolvedMedia> {
  let dimensions: { width: number; height: number } | null = null;
  if (media.kind === "image") {
    const filename = media.src.replace(/^media\//, "");
    dimensions = imageDimensions(await readFile(path.join(PROJECTS_DIR, slug, "media", filename)));
  }

  return {
    ...media,
    src: toPublicUrl(slug, media.src),
    poster: media.poster === null ? null : toPublicUrl(slug, media.poster),
    ...(dimensions ?? {}),
  };
}

async function resolveProject(slug: string, project: Project): Promise<ResolvedProject> {
  return {
    ...project,
    hero: project.hero === null ? null : await resolveMedia(slug, project.hero),
    sections: await Promise.all(
      project.sections.map(async (section) => ({
        ...section,
        media: await Promise.all(section.media.map((media) => resolveMedia(slug, media))),
      })),
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* loaders (cached per render pass)                                           */
/* -------------------------------------------------------------------------- */

const loadProfile = cache(async (): Promise<Profile> => {
  const parsed = ProfileSchema.safeParse(await readJson(PROFILE_FILE));
  if (!parsed.success) {
    throw contentError(PROFILE_FILE, formatIssues(parsed.error));
  }
  return parsed.data;
});

const loadProjects = cache(async (): Promise<ResolvedProject[]> => {
  let entries;
  try {
    entries = await readdir(PROJECTS_DIR, { withFileTypes: true });
  } catch (cause) {
    throw contentError(
      PROJECTS_DIR,
      `  - could not be listed: ${(cause as Error).message}`,
    );
  }

  const slugs = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name);

  const projects = await Promise.all(
    slugs.map(async (slug) => {
      const file = path.join(PROJECTS_DIR, slug, "project.json");
      const parsed = ProjectSchema.safeParse(await readJson(file));
      if (!parsed.success) {
        throw contentError(file, formatIssues(parsed.error));
      }
      if (parsed.data.slug !== slug) {
        throw contentError(
          file,
          `  - slug: "${parsed.data.slug}" must match the folder name "${slug}"\n` +
            `    (media resolves to /media/<folder>/…, so a mismatch breaks every image)`,
        );
      }
      return resolveProject(slug, parsed.data);
    }),
  );

  return projects.sort((a, b) => compareProjectsByDate(a, b, "desc"));
});

/* -------------------------------------------------------------------------- */
/* public API — the whole surface the rest of the app is allowed to use        */
/* -------------------------------------------------------------------------- */

/** The site owner: name, headline, bio, links, long-form about copy. */
export async function getProfile(): Promise<Profile> {
  return loadProfile();
}

/** Published projects only. Newest first, then undated. */
export async function getProjects(): Promise<ResolvedProject[]> {
  const projects = await loadProjects();
  return projects.filter((project) => project.published);
}

/** Every project, including unpublished drafts. Same chronological ordering. */
export async function getAllProjects(): Promise<ResolvedProject[]> {
  return loadProjects();
}

/** One published project by slug, or null. Unpublished slugs return null. */
export async function getProject(slug: string): Promise<ResolvedProject | null> {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

/** Published slugs, for `generateStaticParams`. */
export async function getProjectSlugs(): Promise<string[]> {
  const projects = await getProjects();
  return projects.map((project) => project.slug);
}
