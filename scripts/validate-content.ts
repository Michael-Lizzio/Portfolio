#!/usr/bin/env node
/**
 * validate-content - the gate. Run it before you open a PR; CI runs it too.
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
 *   - content/work.json parses and passes WorkSchema, and links real projects
 *   - no em dash (U+2014) anywhere in content, notes included (Michael's rule)
 *   - Michael's own pages (ownWords) still show exactly his words       (pinned)
 *   - every content/projects/*./project.json parses and passes ProjectSchema
 *   - slug equals the folder name, and no two projects share a slug
 *   - every media src/poster points at a file that is actually on disk
 *   - kind matches the file extension, and posters are images
 *   - images carry non-empty alt text                     (accessibility gate)
 *   - no media file is larger than 8 MB
 *   - videos have a poster frame                                       (warn)
 *   - every file in a media folder is referenced by project.json       (warn)
 *   - no public/_redirects placeholder rule catches a page or its data files
 *   - public/stats.json, when present, passes StatsFileSchema and names only
 *     published projects (it is optional: no file means no stats lines)
 *
 * This is a .ts run through Node's native type stripping, so it can import the
 * real schemas from src/lib/schema.ts instead of restating them - one source of
 * truth, no drift between what the site accepts and what the gate accepts.
 * Dependencies: zod and node builtins. Nothing else.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import type { Dirent } from "node:fs";
import type { ZodError } from "zod";

import {
  ProfileSchema,
  ProjectSchema,
  StatsFileSchema,
  WorkSchema,
  type Media,
  type Project,
} from "../src/lib/schema.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const PROJECTS_DIR = path.join(ROOT, "content", "projects");
const PROFILE_FILE = path.join(ROOT, "content", "profile.json");
const WORK_FILE = path.join(ROOT, "content", "work.json");
const REDIRECTS_FILE = path.join(ROOT, "public", "_redirects");
const STATS_FILE = path.join(ROOT, "public", "stats.json");
const EM_DASH = "\u2014";

/**
 * Michael's own pages, restored word for word in November 2026 after an earlier
 * port reworded them (cryptogram and foosball from his old site at 081ec8c,
 * symposium from his SynapsisNotes README). The hash covers every word the
 * site shows from the file: tagline, summary, headings, paragraphs, bullets,
 * code blocks and captions. Alt text is not pinned. If this check fails,
 * someone changed his words: put them back. Only update a hash when Michael
 * himself asked for that exact change. Last update: November 9, 2026, his
 * spelling and punctuation pass (every fix is listed in docs/REFRESH-NOV-2026.md).
 */
const OWN_WORDS: Record<string, string> = {
  cryptogram: "e5dbb1a049e1c3e7",
  foosball: "395367c79bba5e87",
  symposium: "b3162c80bfb382cf",
};

function ownWordsHash(project: Project): string {
  const text = [
    project.tagline,
    project.summary,
    project.hero?.caption ?? "",
    ...project.sections.flatMap((section) => [
      section.heading ?? "",
      ...section.body,
      ...section.bullets,
      ...section.codeBlocks,
      ...section.media.map((media) => media.caption ?? ""),
    ]),
  ].join("\n");
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

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

/** "sections[2].media[0].alt" - the exact key to open and edit. */
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
    return { ok: false, why: `is not valid JSON - ${(error as Error).message}` };
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

/** Michael's rule: no em dashes anywhere on the site. Checks the raw file text. */
async function checkEmDashes(group: string, file: string): Promise<void> {
  let raw: string;
  try {
    raw = await readFile(file, "utf8");
  } catch {
    return; // readJson already reported a missing file.
  }
  const lines = raw.split("\n");
  lines.forEach((line, index) => {
    if (!line.includes(EM_DASH)) return;
    report(group, {
      level: "ERROR",
      file: `${rel(file)}:${index + 1}`,
      message: "contains an em dash",
      fix: "rewrite the sentence with a comma, a colon, a period or parentheses",
    });
  });
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

  await checkEmDashes(group, PROFILE_FILE);

  const parsed = ProfileSchema.safeParse(json.value);
  if (!parsed.success) {
    reportZod(group, PROFILE_FILE, parsed.error);
    return;
  }

  // The resume link is served straight out of public/ - catch a dead link here
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
/* work                                                                       */
/* -------------------------------------------------------------------------- */

/** Returns the project slugs work.json links to, so main() can check them. */
async function validateWork(): Promise<string[]> {
  const group = rel(WORK_FILE);
  const json = await readJson(WORK_FILE);
  if (!json.ok) {
    report(group, { level: "ERROR", file: group, message: json.why });
    return [];
  }
  await checkEmDashes(group, WORK_FILE);

  const parsed = WorkSchema.safeParse(json.value);
  if (!parsed.success) {
    reportZod(group, WORK_FILE, parsed.error);
    return [];
  }
  return parsed.data.jobs.flatMap((job) => job.projects);
}

/* -------------------------------------------------------------------------- */
/* redirects                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Cloudflare Pages applies public/_redirects BEFORE it serves files. So a
 * placeholder rule like "/work/:slug" also catches the files the site itself
 * needs under /work/: index.txt and the __next.*.txt data Next fetches when
 * someone clicks a link to that page. That sent every Work link to a 404 until
 * November 10, 2026. This checks every placeholder or splat rule against every
 * page the site builds and the data files beside it.
 */
function validateRedirects(publishedSlugs: string[]): void {
  const group = rel(REDIRECTS_FILE);
  let text = "";
  try {
    text = readFileSync(REDIRECTS_FILE, "utf8");
  } catch {
    return;
  }
  const pages = ["/", "/about/", "/contact/", "/projects/", "/work/", ...publishedSlugs.map((slug) => `/projects/${slug}/`)];
  const files = ["", "index.html", "index.txt", "__next._tree.txt", "__next._full.txt", "__next._index.txt", "__next.page.__PAGE__.txt"];
  const lines = text.split("\n");
  lines.forEach((line, index) => {
    const from = line.trim().split(/\s+/)[0];
    if (!from || from.startsWith("#") || !/[:*]/.test(from)) return;
    const pattern = new RegExp(
      "^" +
        from
          .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
          .replace(/:[A-Za-z_]+/g, "[^/]+")
          .replace(/\*/g, ".*") +
        "$",
    );
    const caught = pages.flatMap((page) => files.map((file) => page + file)).filter((url) => pattern.test(url));
    if (caught.length === 0) return;
    report(group, {
      level: "ERROR",
      file: `${group}:${index + 1}`,
      message: `"${from}" also catches ${caught.slice(0, 3).join(", ")}${caught.length > 3 ? ", ..." : ""}, which the site serves itself`,
      fix: "Cloudflare redirects before it serves files: list the old addresses one by one instead of a placeholder",
    });
  });
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

  await checkEmDashes(group, file);

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
      fix: `media resolves to /media/${folder}/… - set slug to "${folder}" or rename the folder`,
    });
  }

  // --- Michael's own words --------------------------------------------------
  const pinned = OWN_WORDS[project.slug];
  if (pinned !== undefined && !project.ownWords) {
    report(group, {
      level: "ERROR",
      file: rel(file),
      message: "ownWords must stay true: this is one of Michael's own pages",
    });
  } else if (pinned === undefined && project.ownWords) {
    report(group, {
      level: "ERROR",
      file: rel(file),
      message: "ownWords is only for Michael's own pages (cryptogram, foosball, symposium)",
      fix: "remove ownWords and write an overview instead",
    });
  } else if (pinned !== undefined && ownWordsHash(project) !== pinned) {
    report(group, {
      level: "ERROR",
      file: rel(file),
      message: "the visible text no longer matches Michael's original words",
      fix: "undo the text change; see docs/REFRESH-NOV-2026.md for his exact words",
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
        fix: "flatten it - media paths are always \"media/<name>.<ext>\"",
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
        message: `${formatSize(bytes)} - over the ${formatSize(MAX_MEDIA_BYTES)} limit`,
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
        message: `${at}.src: "${media.src}" - no such file at ${group}/${media.src}`,
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
          message: `${at}.poster: "${media.poster}" - no such file at ${group}/${media.poster}`,
          fix: `npm run media -- ${folder} regenerates poster frames`,
        });
      }
      if (!IMAGE_EXTENSIONS.has(path.extname(media.poster).toLowerCase())) {
        report(group, {
          level: "ERROR",
          file: rel(file),
          message: `${at}.poster: "${media.poster}" is not an image`,
          fix: "a poster is a still frame - .webp",
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
        message: `${at}: video has no poster - it renders as a black box until it loads`,
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
      message: "not referenced by project.json - it ships but nothing shows it",
      fix: "reference it from a section, or delete it",
    });
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* stats                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * public/stats.json is written by Social Diffusion once a day. The site hides
 * the stats lines when it is missing or broken, so this is where a bad write
 * gets caught.
 */
async function validateStats(publishedSlugs: Set<string>): Promise<void> {
  const group = rel(STATS_FILE);
  if ((await sizeOf(STATS_FILE)) === null) return; // Optional.
  const json = await readJson(STATS_FILE);
  if (!json.ok) {
    report(group, { level: "ERROR", file: group, message: json.why });
    return;
  }
  const parsed = StatsFileSchema.safeParse(json.value);
  if (!parsed.success) {
    reportZod(group, STATS_FILE, parsed.error);
    return;
  }
  for (const slug of Object.keys(parsed.data)) {
    if (publishedSlugs.has(slug)) continue;
    report(group, {
      level: "WARN",
      file: group,
      message: `"${slug}" is not a published project, so its stats never show`,
    });
  }
}

/* -------------------------------------------------------------------------- */
/* run                                                                        */
/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
  await validateProfile();
  const linkedFromWork = await validateWork();

  let folders: string[] = [];
  try {
    const entries = await readdir(PROJECTS_DIR, { withFileTypes: true });
    folders = entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    console.error(`ERROR  content/projects - could not be listed (${(error as Error).message})`);
    process.exitCode = 1;
    return;
  }

  const results: ProjectResult[] = [];
  for (const folder of folders) {
    results.push(await validateProject(folder));
  }

  // Duplicate slugs. Folder names are unique, so this only fires when two
  // project.json files claim the same slug - which would fight over /work/<slug>.
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
        fix: "slugs are the URL - they have to be unique",
      });
    }
  }

  // Projects named on the Work page must exist and be published, or the link
  // silently disappears from the page.
  const publishedSlugs = new Set(
    results.filter((result) => result.published && result.slug).map((result) => result.slug!),
  );
  for (const slug of linkedFromWork) {
    if (publishedSlugs.has(slug)) continue;
    report(rel(WORK_FILE), {
      level: "WARN",
      file: rel(WORK_FILE),
      message: `projects: "${slug}" is not a published project, so the Work page skips it`,
    });
  }

  validateRedirects([...publishedSlugs]);
  await validateStats(publishedSlugs);

  // --- print ---------------------------------------------------------------
  let errors = 0;
  let warnings = 0;

  // Deterministic output: profile first, then projects alphabetically, and
  // errors before warnings inside each group. An agent reading this list top to
  // bottom is reading the things that break the build first.
  const rank = (finding: Finding): number => (finding.level === "ERROR" ? 0 : 1);
  const ordered = [...groups.entries()].sort(([a], [b]) => {
    const groupRank = (group: string): number =>
      group === rel(PROFILE_FILE) ? 0 : group === rel(WORK_FILE) ? 1 : 2;
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
      `FAILED  ${errors} error${errors === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}  -  ${scope}`,
    );
    process.exitCode = 1;
  } else {
    console.log(
      `OK  0 errors, ${warnings} warning${warnings === 1 ? "" : "s"}  -  ${scope}`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(`validate-content crashed: ${(error as Error).stack ?? String(error)}`);
  process.exitCode = 1;
});
