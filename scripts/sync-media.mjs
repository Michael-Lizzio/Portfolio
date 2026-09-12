#!/usr/bin/env node
/**
 * sync-media — publish co-located project media to `public/`.
 *
 *   content/projects/<slug>/media/*   ->   public/media/<slug>/*
 *
 * Media lives next to the project.json that references it, so a project is one
 * self-contained folder you can move, copy or delete in one go. The browser
 * needs those bytes under `public/`, so this copies them at build time.
 * `src/lib/content.ts` rewrites every media `src` to `/media/<slug>/…` to match.
 *
 * Runs as `prebuild`, so `next build` — and therefore Vercel — picks it up with
 * no extra configuration.
 *
 * Managed directories are wiped before copying, so media deleted from `content/`
 * cannot linger in `public/` and quietly keep serving. Anything under
 * `public/media/` that is neither a project slug nor RESERVED is treated as a
 * leftover from a renamed project and removed.
 *
 * Only `published: true` projects are copied: an unpublished project is hidden
 * from the site, and shipping its media would serve the draft anyway.
 *
 * Quiet on success: one line.
 */
import { cp, mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
const PROJECTS_DIR = path.join(ROOT, "content", "projects");
const PUBLIC_MEDIA_DIR = path.join(ROOT, "public", "media");

/**
 * Directories under `public/media/` that are NOT derived from `content/` and
 * must survive the clean — site furniture (backdrops, portraits) that belongs
 * to the layout rather than to any one project. Add to this list rather than
 * letting hand-placed assets sit somewhere this script will eat them.
 */
const RESERVED = new Set();

/** Directory entries that are never content. */
const isHidden = (name) => name.startsWith(".");

async function listProjectSlugs() {
  const entries = await readdir(PROJECTS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !isHidden(entry.name))
    .map((entry) => entry.name)
    .sort();
}

/**
 * `published: false` hides a project from the site entirely — so its media must
 * not ship either. Without this check the drafts' bytes are deployed and served
 * at /media/<slug>/…, which is the whole unpublished write-up, one URL guess
 * away (blackjack's video walkthrough is 4.6 MB of it).
 *
 * Deliberately a raw JSON read rather than a zod parse: this script must not
 * import from `src/`, and a project whose JSON is malformed is already going to
 * fail the build loudly in `src/lib/content.ts`. Matching the schema default,
 * only an explicit `true` publishes.
 */
async function isPublished(slug) {
  const file = path.join(PROJECTS_DIR, slug, "project.json");
  try {
    return JSON.parse(await readFile(file, "utf8")).published === true;
  } catch {
    return false;
  }
}

async function listMediaFiles(slug) {
  const dir = path.join(PROJECTS_DIR, slug, "media");
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return []; // a project with no media yet
    throw error;
  }
  return entries
    .filter((entry) => entry.isFile() && !isHidden(entry.name))
    .map((entry) => entry.name)
    .sort();
}

async function main() {
  const slugs = await listProjectSlugs();
  const managed = new Set(slugs);

  // 1. Clean. Everything under public/media is derived, except RESERVED.
  await mkdir(PUBLIC_MEDIA_DIR, { recursive: true });
  const existing = await readdir(PUBLIC_MEDIA_DIR, { withFileTypes: true });
  let removed = 0;
  for (const entry of existing) {
    if (isHidden(entry.name) || RESERVED.has(entry.name)) continue;
    await rm(path.join(PUBLIC_MEDIA_DIR, entry.name), { recursive: true, force: true });
    if (!managed.has(entry.name)) removed += 1;
  }

  // 2. Copy — published projects only. Drafts were just cleaned away above, so
  //    un-publishing a project also un-publishes its media on the next build.
  let files = 0;
  let bytes = 0;
  let withMedia = 0;
  let drafts = 0;
  for (const slug of slugs) {
    if (!(await isPublished(slug))) {
      drafts += 1;
      continue;
    }
    const names = await listMediaFiles(slug);
    if (names.length === 0) continue;
    withMedia += 1;
    const destDir = path.join(PUBLIC_MEDIA_DIR, slug);
    await mkdir(destDir, { recursive: true });
    for (const name of names) {
      const from = path.join(PROJECTS_DIR, slug, "media", name);
      await cp(from, path.join(destDir, name));
      bytes += (await stat(from)).size;
      files += 1;
    }
  }

  const mb = (bytes / 1024 / 1024).toFixed(1);
  const stale = removed > 0 ? `, ${removed} stale folder${removed === 1 ? "" : "s"} removed` : "";
  // Published projects with no media contribute no directory, so withMedia + drafts
  // can be less than the total. Name that gap rather than leaving it to be puzzled over.
  const empty = slugs.length - withMedia - drafts;
  const skipped =
    (drafts > 0 ? `, ${drafts} unpublished skipped` : "") +
    (empty > 0 ? `, ${empty} published with no media` : "");
  console.log(
    `sync-media: ${files} file${files === 1 ? "" : "s"} (${mb} MB) from ${withMedia} of ${slugs.length} projects -> public/media${stale}${skipped}`,
  );
}

main().catch((error) => {
  console.error(`sync-media failed: ${error.message}`);
  process.exitCode = 1;
});
