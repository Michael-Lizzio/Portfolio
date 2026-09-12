#!/usr/bin/env node
/**
 * validate-content — the gate. Run it before you open a PR; CI runs it too.
 *
 *   npm run validate
 *
 * It reports EVERY problem it can find in one pass, grouped by project and
 * prefixed with the file path, so an agent fixing its own PR can work the whole
 * list without running the script nine times.
 *
 * ERROR fails the build. WARN is advice: dead weight, or a nicety you skipped.
 *
 * Checks
 *   - content/profile.json parses and passes ProfileSchema
 *   - every content/projects/*./project.json parses and passes ProjectSchema
 *   - slug equals the folder name, and no two projects share a slug
 *   - every media src/poster points at a file that is actually on disk
 *   - kind matches the file extension, and posters are images
 *   - images carry non-empty alt text                     (accessibility gate)
 *   - no media file is larger than 8 MB
 *   - videos have a poster frame                                       (warn)
 *   - every file in a media folder is referenced by project.json       (warn)
 *
 * This is a .ts run through Node's native type stripping, so it can import the
 * real schemas from src/lib/schema.ts instead of restating them — one source of
 * truth, no drift between what the site accepts and what the gate accepts.
 * Dependencies: zod and node builtins. Nothing else.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import type { Dirent } from "node:fs";
import type { ZodError } from "zod";

import { ProfileSchema, ProjectSchema, type Media, type Project } from "../src/lib/schema.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const PROJECTS_DIR = path.join(ROOT, "content", "projects");
const PROFILE_FILE = path.join(ROOT, "content", "profile.json");

const MAX_MEDIA_BYTES = 8 * 1024 * 1024;
const IMAGE_EXTENSIONS = new Set([".webp", ".jpg", ".jpeg", ".png"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm"]);

/* -------------------------------------------------------------------------- */
/* findings                                                                   */
/* -------------------------------------------------------------------------- */

type Level = "ERROR" | "WARN";

interface Finding {
  level: Level;
  /** Repo-relative path the problem lives in. Printed verbatim. */
  file: string;
  message: string;
  /** Optional second line: what to actually do about it. */
  fix?: string;
}

/** Findings keyed by group heading, in insertion order. */
const groups = new Map<string, Finding[]>();

function report(group: string, finding: Finding): void {
  const list = groups.get(group);
  if (list) list.push(finding);
  else groups.set(group, [finding]);
}

const rel = (file: string): string => path.relative(ROOT, file) || file;

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

/** "sections[2].media[0].alt" — the exact key to open and edit. */
function formatPath(segments: readonly PropertyKey[]): string {
  if (segments.length === 0) return "(root)";
  return segments.reduce<string>((acc, segment) => {
    if (typeof segment === "number") return `${acc}[${segment}]`;
    return acc === "" ? String(segment) : `${acc}.${String(segment)}`;
  }, "");
}

function reportZod(group: string, file: string, error: ZodError): void {
  for (const issue of error.issues) {
    report(group, {
      level: "ERROR",
      file: rel(file),
      message: `${formatPath(issue.path)}: ${issue.message}`,
    });
  }
}

/* -------------------------------------------------------------------------- */
/* filesystem helpers                                                         */
/* -------------------------------------------------------------------------- */

async function readJson(file: string): Promise<{ ok: true; value: unknown } | { ok: false; why: string }> {
  let raw: string;
  try {
    raw = await readFile(file, "utf8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    return { ok: false, why: code === "ENOENT" ? "file is missing" : `could not be read (${code})` };
  }
  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch (error) {
    return { ok: false, why: `is not valid JSON — ${(error as Error).message}` };
  }
}

async function sizeOf(file: string): Promise<number | null> {
  try {
    const stats = await stat(file);
    return stats.isFile() ? stats.size : null;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* profile                                                                    */
/* -------------------------------------------------------------------------- */

async function validateProfile(): Promise<void> {
  const group = rel(PROFILE_FILE);
  const json = await readJson(PROFILE_FILE);
  if (!json.ok) {
    report(group, { level: "ERROR", file: group, message: json.why });
    return;
  }

  const parsed = ProfileSchema.safeParse(json.value);
  if (!parsed.success) {
    reportZod(group, PROFILE_FILE, parsed.error);
    return;
  }

  // The resume link is served straight out of public/ — catch a dead link here
  // rather than in a recruiter's browser.
  const resume = parsed.data.resume;
  if (resume && resume.startsWith("/")) {
    const onDisk = path.join(ROOT, "public", resume.replace(/^\//, ""));
    if ((await sizeOf(onDisk)) === null) {
      report(group, {
        level: "WARN",
        file: group,
        message: `resume: "${resume}" has no file at ${rel(onDisk)}`,
        fix: "add the file to public/, or set resume to null",
      });
    }
  }
}

/* -------------------------------------------------------------------------- */
/* projects                                                                   */
/* -------------------------------------------------------------------------- */

/** Every media object in a project, with the JSON path it came from. */
function collectMedia(project: Project): Array<{ at: string; media: Media }> {
  const found: Array<{ at: string; media: Media }> = [];
  if (project.hero) found.push({ at: "hero", media: project.hero });
  project.sections.forEach((section, s) => {
    section.media.forEach((media, m) => {
      found.push({ at: `sections[${s}].media[${m}]`, media });
    });
  });
  return found;
}

interface ProjectResult {
  slug: string | null;
  published: boolean;
  mediaFiles: number;
  mediaBytes: number;
}

async function validateProject(folder: string): Promise<ProjectResult> {
  const group = `content/projects/${folder}`;
  const dir = path.join(PROJECTS_DIR, folder);
  const file = path.join(dir, "project.json");
  const mediaDir = path.join(dir, "media");
  const result: ProjectResult = { slug: null, published: false, mediaFiles: 0, mediaBytes: 0 };

  const json = await readJson(file);
  if (!json.ok) {
    report(group, {
      level: "ERROR",
      file: rel(file),
      message: json.why,
      fix: json.why === "file is missing" ? `npm run new:project -- ${folder}` : undefined,
    });
    return result;
  }

  const parsed = ProjectSchema.safeParse(json.value);
  if (!parsed.success) {
    reportZod(group, file, parsed.error);
    return result;
  }

  const project = parsed.data;
  result.slug = project.slug;
  result.published = project.published;

  if (project.slug !== folder) {
    report(group, {
      level: "ERROR",
      file: rel(file),
      message: `slug: "${project.slug}" does not match the folder name "${folder}"`,
      fix: `media resolves to /media/${folder}/… — set slug to "${folder}" or rename the folder`,
    });
  }

  // --- what is on disk -----------------------------------------------------
  const onDisk = new Map<string, number>(); // "media/name.ext" -> bytes
  let entries: Dirent[] = [];
  try {
    entries = await readdir(mediaDir, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    if (entry.isDirectory()) {
      report(group, {
        level: "WARN",
        file: `${group}/media/${entry.name}/`,
        message: "subfolders inside media/ are not published",
        fix: "flatten it — media paths are always \"media/<name>.<ext>\"",
      });
      continue;
    }
    const bytes = await sizeOf(path.join(mediaDir, entry.name));
    if (bytes !== null) onDisk.set(`media/${entry.name}`, bytes);
  }

  // --- size gate, on everything that would ship ----------------------------
  for (const [src, bytes] of onDisk) {
    result.mediaFiles += 1;
    result.mediaBytes += bytes;
    if (bytes > MAX_MEDIA_BYTES) {
      report(group, {
        level: "ERROR",
        file: `${group}/${src}`,
        message: `${formatSize(bytes)} — over the ${formatSize(MAX_MEDIA_BYTES)} limit`,
        fix: `npm run media -- ${folder}`,
      });
    }
  }

  // --- every reference resolves, and is well-formed ------------------------
  const referenced = new Set<string>();
  for (const { at, media } of collectMedia(project)) {
    referenced.add(media.src);
    if (media.poster) referenced.add(media.poster);

    if (!onDisk.has(media.src)) {
      report(group, {
        level: "ERROR",
        file: rel(file),
        message: `${at}.src: "${media.src}" — no such file at ${group}/${media.src}`,
        fix: "add the file, or fix the spelling",
      });
    }

    const extension = path.extname(media.src).toLowerCase();
    const expected = media.kind === "image" ? IMAGE_EXTENSIONS : VIDEO_EXTENSIONS;
    if (!expected.has(extension)) {
      report(group, {
        level: "ERROR",
        file: rel(file),
        message: `${at}: kind is "${media.kind}" but the file is ${extension}`,
        fix: `use kind "${media.kind === "image" ? "video" : "image"}", or point at the right file`,
      });
    }

    if (media.kind === "image" && (media.alt === null || media.alt.trim() === "")) {
      report(group, {
        level: "ERROR",
        file: rel(file),
        message: `${at}.alt: images need alt text`,
        fix: "describe what is in the picture, not that it is a picture",
      });
    }

    if (media.poster) {
      if (!onDisk.has(media.poster)) {
        report(group, {
          level: "ERROR",
          file: rel(file),
          message: `${at}.poster: "${media.poster}" — no such file at ${group}/${media.poster}`,
          fix: `npm run media -- ${folder} regenerates poster frames`,
        });
      }
      if (!IMAGE_EXTENSIONS.has(path.extname(media.poster).toLowerCase())) {
        report(group, {
          level: "ERROR",
          file: rel(file),
          message: `${at}.poster: "${media.poster}" is not an image`,
          fix: "a poster is a still frame — .webp",
        });
      }
      if (media.kind === "image") {
        report(group, {
          level: "WARN",
          file: rel(file),
          message: `${at}.poster is set on an image and will be ignored`,
        });
      }
    } else if (media.kind === "video") {
      report(group, {
        level: "WARN",
        file: rel(file),
        message: `${at}: video has no poster — it renders as a black box until it loads`,
        fix: `npm run media -- ${folder}`,
      });
    }
  }

  // --- dead weight ---------------------------------------------------------
  for (const src of onDisk.keys()) {
    if (referenced.has(src)) continue;
    report(group, {
      level: "WARN",
      file: `${group}/${src}`,
      message: "not referenced by project.json — it ships but nothing shows it",
      fix: "reference it from a section, or delete it",
    });
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* run                                                                        */
/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
  await validateProfile();

  let folders: string[] = [];
  try {
    const entries = await readdir(PROJECTS_DIR, { withFileTypes: true });
    folders = entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    console.error(`ERROR  content/projects — could not be listed (${(error as Error).message})`);
    process.exitCode = 1;
    return;
  }

  const results: ProjectResult[] = [];
  for (const folder of folders) {
    results.push(await validateProject(folder));
  }

  // Duplicate slugs. Folder names are unique, so this only fires when two
  // project.json files claim the same slug — which would fight over /work/<slug>.
  const byslug = new Map<string, string[]>();
  results.forEach((result, index) => {
    if (!result.slug) return;
    const folders_ = byslug.get(result.slug) ?? [];
    folders_.push(folders[index]!);
    byslug.set(result.slug, folders_);
  });
  for (const [slug, owners] of byslug) {
    if (owners.length < 2) continue;
    for (const owner of owners) {
      report(`content/projects/${owner}`, {
        level: "ERROR",
        file: `content/projects/${owner}/project.json`,
        message: `slug "${slug}" is also claimed by ${owners.filter((o) => o !== owner).join(", ")}`,
        fix: "slugs are the URL — they have to be unique",
      });
    }
  }

  // --- print ---------------------------------------------------------------
  let errors = 0;
  let warnings = 0;

  // Deterministic output: profile first, then projects alphabetically, and
  // errors before warnings inside each group. An agent reading this list top to
  // bottom is reading the things that break the build first.
  const rank = (finding: Finding): number => (finding.level === "ERROR" ? 0 : 1);
  const ordered = [...groups.entries()].sort(([a], [b]) => {
    const groupRank = (group: string): number => (group === rel(PROFILE_FILE) ? 0 : 1);
    return groupRank(a) - groupRank(b) || a.localeCompare(b);
  });

  for (const [group, unsorted] of ordered) {
    const findings = [...unsorted].sort((a, b) => rank(a) - rank(b));
    const groupErrors = findings.filter((f) => f.level === "ERROR").length;
    const groupWarnings = findings.length - groupErrors;
    errors += groupErrors;
    warnings += groupWarnings;

    const counts = [
      groupErrors > 0 ? `${groupErrors} error${groupErrors === 1 ? "" : "s"}` : null,
      groupWarnings > 0 ? `${groupWarnings} warning${groupWarnings === 1 ? "" : "s"}` : null,
    ]
      .filter(Boolean)
      .join(", ");

    console.log(`\n${group}  (${counts})`);
    for (const finding of findings) {
      console.log(`  ${finding.level.padEnd(5)}  ${finding.file}`);
      console.log(`         ${finding.message}`);
      if (finding.fix) console.log(`         fix: ${finding.fix}`);
    }
  }

  const published = results.filter((r) => r.published).length;
  const files = results.reduce((sum, r) => sum + r.mediaFiles, 0);
  const bytes = results.reduce((sum, r) => sum + r.mediaBytes, 0);
  const scope = `${folders.length} projects (${published} published), ${files} media files, ${formatSize(bytes)}`;

  console.log("");
  if (errors > 0) {
    console.log(
      `FAILED  ${errors} error${errors === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}  —  ${scope}`,
    );
    process.exitCode = 1;
  } else {
    console.log(
      `OK  0 errors, ${warnings} warning${warnings === 1 ? "" : "s"}  —  ${scope}`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(`validate-content crashed: ${(error as Error).stack ?? String(error)}`);
  process.exitCode = 1;
});
