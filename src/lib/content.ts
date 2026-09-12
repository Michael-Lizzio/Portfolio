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
  type ResolvedProject,
} from "./schema";

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

function resolveMedia(slug: string, media: Media): Media {
  return {
    ...media,
    src: toPublicUrl(slug, media.src),
    poster: media.poster === null ? null : toPublicUrl(slug, media.poster),
  };
}

function resolveProject(slug: string, project: Project): ResolvedProject {
  return {
    ...project,
    hero: project.hero === null ? null : resolveMedia(slug, project.hero),
    sections: project.sections.map((section) => ({
      ...section,
      media: section.media.map((media) => resolveMedia(slug, media)),
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* ordering                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Featured first, then newest date first, then undated. Ties break on title so
 * the order is identical on every machine and every build — static output must
 * not depend on how the filesystem happened to list the directory.
 *
 * Dates are "YYYY" or "YYYY-MM", so plain string comparison already sorts them.
 */
function byFeaturedThenDate(a: ResolvedProject, b: ResolvedProject): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  if (a.date !== b.date) {
    if (a.date === null) return 1;
    if (b.date === null) return -1;
    return b.date.localeCompare(a.date);
  }
  return a.title.localeCompare(b.title) || a.slug.localeCompare(b.slug);
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

  return projects.sort(byFeaturedThenDate);
});

/* -------------------------------------------------------------------------- */
/* public API — the whole surface the rest of the app is allowed to use        */
/* -------------------------------------------------------------------------- */

/** The site owner: name, headline, bio, links, long-form about copy. */
export async function getProfile(): Promise<Profile> {
  return loadProfile();
}

/** Published projects only. Featured first, then newest first, undated last. */
export async function getProjects(): Promise<ResolvedProject[]> {
  const projects = await loadProjects();
  return projects.filter((project) => project.published);
}

/** Every project, including unpublished drafts. Same ordering. */
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
