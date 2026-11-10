#!/usr/bin/env node
/**
 * card-images - small copies of each project's cover for the project cards.
 *
 *   npm run cards
 *
 * A card shows its cover about 280px wide (4 across), so the full cover (up to
 * 1800px and 270 KB) is several times more than it needs. This writes a 720px
 * WebP of every published project's cover to public/images/cards/, named
 * <slug>--<cover file name>.webp. src/lib/project-card.ts uses it when it is
 * there and falls back to the full cover when it is not, so a project whose
 * cover changed still shows the right picture until this is run again.
 *
 * Commit the results: the Cloudflare build does not have ffmpeg. Old card
 * images that no longer match a cover are deleted. Requires ffmpeg on PATH.
 */
import { readdir, readFile, rm, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PROJECTS = path.join(ROOT, "content", "projects");
const OUT = path.join(ROOT, "public", "images", "cards");
const WIDTH = 720;

export function cardImageName(slug, coverSrc) {
  return `${slug}--${path.basename(coverSrc, path.extname(coverSrc))}.webp`;
}

const wanted = new Set();
for (const slug of (await readdir(PROJECTS)).sort()) {
  let project;
  try {
    project = JSON.parse(await readFile(path.join(PROJECTS, slug, "project.json"), "utf8"));
  } catch {
    continue;
  }
  if (!project.published || !project.hero) continue;
  const cover = project.hero.kind === "image" ? project.hero.src : project.hero.poster;
  if (!cover) continue;
  const name = cardImageName(slug, cover);
  wanted.add(name);
  const target = path.join(OUT, name);
  const source = path.join(PROJECTS, slug, cover);
  const [src, out] = await Promise.all([stat(source), stat(target).catch(() => null)]);
  if (out && out.mtimeMs >= src.mtimeMs) continue;
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", source, "-vf", `scale='min(${WIDTH},iw)':-2`, "-quality", "78", target]);
  console.log(`card  ${name}  ${((await stat(target)).size / 1024).toFixed(0)} KB`);
}
for (const name of await readdir(OUT).catch(() => [])) {
  if (name.endsWith(".webp") && !wanted.has(name)) {
    await rm(path.join(OUT, name));
    console.log(`removed  ${name}`);
  }
}
console.log(`cards: ${wanted.size} card images in public/images/cards/`);
