#!/usr/bin/env node
/**
 * compress-media — turn whatever came off the camera into something the web can
 * serve, in place, inside one project's media folder.
 *
 *   npm run media -- <slug>
 *
 *   images  ->  .webp, max 1800px wide, quality 80
 *   videos  ->  .mp4  H.264, max 1280px wide, CRF 28, +faststart
 *               plus a <name>.poster.webp still frame
 *
 * "In place" means the compressed file replaces the original in
 * content/projects/<slug>/media/ and the oversized original is deleted. If the
 * extension changed (screen.png -> screen.webp) the script says so — those
 * paths live in project.json and have to be updated to match. `npm run validate`
 * will catch it if you forget.
 *
 * Safe to re-run: anything already in the target format at the target size is
 * skipped, so this costs nothing on a folder that is already done.
 *
 * Requires ffmpeg (and ffprobe) on PATH. No npm dependencies.
 */
import { readdir, rename, rm, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
const PROJECTS_DIR = path.join(ROOT, "content", "projects");

const MAX_IMAGE_WIDTH = 1800;
const IMAGE_QUALITY = 80;
const MAX_VIDEO_WIDTH = 1280;
const VIDEO_CRF = 28;

const IMAGE_INPUTS = new Set([".webp", ".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".gif", ".heic"]);
const VIDEO_INPUTS = new Set([".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi", ".wmv", ".flv"]);

/* -------------------------------------------------------------------------- */
/* shelling out                                                               */
/* -------------------------------------------------------------------------- */

function has(binary) {
  try {
    execFileSync(binary, ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function run(binary, args) {
  try {
    execFileSync(binary, args, { stdio: ["ignore", "pipe", "pipe"] });
    return { ok: true };
  } catch (error) {
    const stderr = String(error.stderr ?? "").trim().split("\n").slice(-3).join("\n");
    return { ok: false, why: stderr || error.message };
  }
}

/** Width and codec of the first video stream, or null if ffprobe can't tell. */
function probe(file) {
  try {
    const out = execFileSync(
      "ffprobe",
      [
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height,codec_name",
        "-of", "json",
        file,
      ],
      { encoding: "utf8" },
    );
    const stream = JSON.parse(out).streams?.[0];
    if (!stream) return null;
    return { width: stream.width ?? 0, height: stream.height ?? 0, codec: stream.codec_name ?? "" };
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* formatting                                                                 */
/* -------------------------------------------------------------------------- */

const size = async (file) => (await stat(file)).size;

function human(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function percent(before, after) {
  if (before === 0) return "";
  const change = Math.round((1 - after / before) * 100);
  return change > 0 ? `-${change}%` : `+${Math.abs(change)}%`;
}

/* -------------------------------------------------------------------------- */
/* the work                                                                   */
/* -------------------------------------------------------------------------- */

const rows = [];
const renames = [];
const problems = [];

function record(name, before, after, note) {
  rows.push({ name, before, after, note });
}

/** Encode to a scratch file next to the target so the rename is atomic-ish. */
const scratch = (target) => `${target}.compress-tmp${path.extname(target)}`;

async function doImage(dir, name) {
  const source = path.join(dir, name);
  const stem = name.slice(0, name.length - path.extname(name).length);
  const target = path.join(dir, `${stem}.webp`);
  const before = await size(source);
  const info = probe(source);

  const alreadyWebp = path.extname(name).toLowerCase() === ".webp";
  if (alreadyWebp && info && info.width > 0 && info.width <= MAX_IMAGE_WIDTH) {
    record(name, before, before, `skipped — already webp, ${info.width}px wide`);
    return;
  }

  if (!alreadyWebp && source !== target) {
    try {
      await stat(target);
      problems.push(`${stem}.webp already exists — delete ${name} yourself, or rename it first`);
      record(name, before, before, "skipped — target name is taken");
      return;
    } catch {
      /* target is free, carry on */
    }
  }

  const tmp = scratch(target);
  const result = run("ffmpeg", [
    "-y", "-loglevel", "error",
    "-i", source,
    "-vf", `scale='min(${MAX_IMAGE_WIDTH},iw)':-1:flags=lanczos`,
    "-c:v", "libwebp",
    "-quality", String(IMAGE_QUALITY),
    "-compression_level", "6",
    "-an",
    tmp,
  ]);
  if (!result.ok) {
    await rm(tmp, { force: true });
    problems.push(`${name}: ffmpeg failed — ${result.why}`);
    record(name, before, before, "FAILED");
    return;
  }

  const after = await size(tmp);
  await rename(tmp, target);
  if (source !== target) {
    await rm(source, { force: true });
    renames.push([name, `${stem}.webp`]);
  }
  record(name, before, after, source === target ? `resized to ${MAX_IMAGE_WIDTH}px` : `-> ${stem}.webp`);
}

async function makePoster(dir, stem) {
  const video = path.join(dir, `${stem}.mp4`);
  const poster = path.join(dir, `${stem}.poster.webp`);
  try {
    await stat(poster);
    return false; // already there; leave it alone
  } catch {
    /* needs one */
  }

  const frame = (seek) =>
    run("ffmpeg", [
      "-y", "-loglevel", "error",
      ...(seek > 0 ? ["-ss", String(seek)] : []),
      "-i", video,
      "-frames:v", "1",
      "-vf", `scale='min(${MAX_VIDEO_WIDTH},iw)':-1:flags=lanczos`,
      "-c:v", "libwebp",
      "-quality", String(IMAGE_QUALITY),
      poster,
    ]);

  // A second in is usually past the fade-in; fall back to the first frame for
  // clips shorter than that.
  let result = frame(1);
  if (!result.ok) result = frame(0);
  if (!result.ok) {
    problems.push(`${stem}.poster.webp: ffmpeg could not grab a frame — ${result.why}`);
    return false;
  }
  return true;
}

async function doVideo(dir, name) {
  const source = path.join(dir, name);
  const stem = name.slice(0, name.length - path.extname(name).length);
  const target = path.join(dir, `${stem}.mp4`);
  const before = await size(source);
  const info = probe(source);

  const alreadyMp4 = path.extname(name).toLowerCase() === ".mp4";
  const encoded =
    alreadyMp4 && info && info.codec === "h264" && info.width > 0 && info.width <= MAX_VIDEO_WIDTH;

  if (encoded) {
    record(name, before, before, `skipped — already h264, ${info.width}px wide`);
  } else {
    if (!alreadyMp4 && source !== target) {
      try {
        await stat(target);
        problems.push(`${stem}.mp4 already exists — delete ${name} yourself, or rename it first`);
        record(name, before, before, "skipped — target name is taken");
        return;
      } catch {
        /* target is free */
      }
    }

    const tmp = scratch(target);
    const result = run("ffmpeg", [
      "-y", "-loglevel", "error",
      "-i", source,
      "-vf", `scale='min(${MAX_VIDEO_WIDTH},iw)':-2:flags=lanczos`,
      "-c:v", "libx264",
      "-crf", String(VIDEO_CRF),
      "-preset", "slow",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      tmp,
    ]);
    if (!result.ok) {
      await rm(tmp, { force: true });
      problems.push(`${name}: ffmpeg failed — ${result.why}`);
      record(name, before, before, "FAILED");
      return;
    }

    const after = await size(tmp);
    await rename(tmp, target);
    if (source !== target) {
      await rm(source, { force: true });
      renames.push([name, `${stem}.mp4`]);
    }
    record(name, before, after, source === target ? `re-encoded` : `-> ${stem}.mp4`);
  }

  if (await makePoster(dir, stem)) {
    const poster = path.join(dir, `${stem}.poster.webp`);
    record(`${stem}.poster.webp`, 0, await size(poster), "new poster frame");
  }
}

/* -------------------------------------------------------------------------- */
/* run                                                                        */
/* -------------------------------------------------------------------------- */

async function main() {
  if (!has("ffmpeg") || !has("ffprobe")) {
    console.error("ffmpeg is not on your PATH, and this script is a thin wrapper around it.");
    console.error("");
    console.error("  macOS:   brew install ffmpeg");
    console.error("  Debian:  sudo apt install ffmpeg");
    console.error("");
    console.error("(ffprobe ships with ffmpeg — both are needed.)");
    process.exitCode = 1;
    return;
  }

  const slug = process.argv[2];
  const slugs = (await readdir(PROJECTS_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();

  if (!slug || !slugs.includes(slug)) {
    console.error(slug ? `no such project: ${slug}` : "usage: npm run media -- <slug>");
    console.error("");
    console.error(`  projects: ${slugs.join(", ")}`);
    process.exitCode = 1;
    return;
  }

  const dir = path.join(PROJECTS_DIR, slug, "media");
  let names;
  try {
    names = (await readdir(dir, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .sort();
  } catch {
    console.log(`content/projects/${slug}/media/ does not exist yet — nothing to compress.`);
    return;
  }

  for (const name of names) {
    // Leave generated poster frames alone; they are already at target size and
    // re-encoding them every run would only lose quality.
    if (name.endsWith(".poster.webp")) continue;
    const extension = path.extname(name).toLowerCase();
    if (IMAGE_INPUTS.has(extension)) await doImage(dir, name);
    else if (VIDEO_INPUTS.has(extension)) await doVideo(dir, name);
    else record(name, await size(path.join(dir, name)), await size(path.join(dir, name)), "skipped — not media");
  }

  if (rows.length === 0) {
    console.log(`content/projects/${slug}/media/ is empty — drop the raw files in first.`);
    return;
  }

  // --- the table -----------------------------------------------------------
  const width = (pick) => Math.max(...rows.map((row) => pick(row).length));
  const nameWidth = Math.max(width((row) => row.name), 4);
  const beforeWidth = Math.max(width((row) => (row.before ? human(row.before) : "—")), 6);
  const afterWidth = Math.max(width((row) => human(row.after)), 5);

  console.log(`content/projects/${slug}/media/`);
  console.log(
    `  ${"file".padEnd(nameWidth)}  ${"before".padStart(beforeWidth)}  ${"after".padStart(afterWidth)}  ${"change".padStart(6)}`,
  );
  let before = 0;
  let after = 0;
  for (const row of rows) {
    before += row.before;
    after += row.after;
    const beforeCell = row.before ? human(row.before) : "—";
    const change = row.before && row.after !== row.before ? percent(row.before, row.after) : "";
    console.log(
      `  ${row.name.padEnd(nameWidth)}  ${beforeCell.padStart(beforeWidth)}  ${human(row.after).padStart(afterWidth)}  ${change.padStart(6)}  ${row.note}`,
    );
  }
  console.log(
    `  ${"total".padEnd(nameWidth)}  ${human(before).padStart(beforeWidth)}  ${human(after).padStart(afterWidth)}  ${percent(before, after).padStart(6)}`,
  );

  if (renames.length > 0) {
    console.log("");
    console.log("These filenames changed — update project.json to match:");
    for (const [from, to] of renames) console.log(`  ${from}  ->  ${to}`);
  }

  if (problems.length > 0) {
    console.log("");
    console.log("Problems:");
    for (const problem of problems) console.log(`  ${problem}`);
    process.exitCode = 1;
    return;
  }

  console.log("");
  console.log(`Next: npm run validate`);
}

main().catch((error) => {
  console.error(`compress-media failed: ${error.message}`);
  process.exitCode = 1;
});
