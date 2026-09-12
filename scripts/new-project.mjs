#!/usr/bin/env node
/**
 * new-project — scaffold one project folder.
 *
 *   npm run new:project -- my-new-thing
 *
 * Creates content/projects/<slug>/{project.json,media/} from a template that
 * already passes `npm run validate`, with `published: false` so nothing shows
 * up on the site half-written. Every string you have to replace says TODO.
 *
 * It refuses to touch a folder that already exists — this script only ever
 * creates.
 */
import { mkdir, writeFile, readdir, access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
const PROJECTS_DIR = path.join(ROOT, "content", "projects");

/** Same shape the schema enforces: lowercase, digits, single hyphens. */
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function template(slug) {
  return {
    slug,
    title: "TODO: the name of the project, as a person would say it",
    tagline: "TODO: one line under 90 characters. What is it, and why care?",
    summary:
      "TODO: two to four sentences for the top of the detail page. What it does, " +
      "what you built it with, and what was actually hard about it.",

    published: false,
    featured: false,

    date: null,
    status: null,

    // Max 40 chars per entry — these are pill labels, not sentences.
    tech: ["TODO: e.g. Python (max 40 chars)"],
    links: [],

    hero: null,
    sections: [
      {
        heading: "TODO: a section heading, or null for an unheaded block",
        body: [
          "TODO: one string per paragraph. Plain text — no HTML, no markdown.",
        ],
        media: [],
      },
    ],

    notes:
      "TODO (internal, never rendered): sources, decisions, open questions, " +
      "anything the next person should know. Delete this line when it is real.",
  };
}

const MEDIA_EXAMPLE = `  "hero": {
    "src": "media/cover.webp",
    "kind": "image",
    "poster": null,
    "alt": "What is actually in the picture — not \\"cover image\\"",
    "caption": null
  }

  videos additionally need a poster:
  { "src": "media/demo.mp4", "kind": "video",
    "poster": "media/demo.poster.webp", "alt": "…", "caption": null }`;

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function die(message, ...rest) {
  console.error(message);
  for (const line of rest) console.error(line);
  process.exitCode = 1;
}

async function main() {
  const slug = process.argv[2];

  if (!slug) {
    const existing = (await readdir(PROJECTS_DIR, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    die(
      "usage: npm run new:project -- <slug>",
      "",
      `  <slug> is lowercase-kebab-case and becomes the URL: /work/<slug>`,
      `  taken: ${existing.join(", ")}`,
    );
    return;
  }

  if (!SLUG_PATTERN.test(slug)) {
    die(
      `"${slug}" is not a valid slug.`,
      "",
      "  lowercase letters, digits and single hyphens only — no spaces, no",
      "  underscores, no capitals, no leading or trailing hyphen.",
      `  try: ${slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-project"}`,
    );
    return;
  }

  const dir = path.join(PROJECTS_DIR, slug);
  if (await exists(dir)) {
    die(
      `content/projects/${slug}/ already exists — refusing to overwrite it.`,
      "",
      "  pick another slug, or edit the project that is already there.",
    );
    return;
  }

  await mkdir(path.join(dir, "media"), { recursive: true });
  // Git does not track empty directories; this keeps media/ in the repo so the
  // next person can see where the files go.
  await writeFile(path.join(dir, "media", ".gitkeep"), "");
  await writeFile(
    path.join(dir, "project.json"),
    `${JSON.stringify(template(slug), null, 2)}\n`,
    "utf8",
  );

  console.log(`Created content/projects/${slug}/`);
  console.log(`  project.json   published: false — invisible on the site until you flip it`);
  console.log(`  media/         raw images and video go here, flat, no subfolders`);
  console.log("");
  console.log("Next:");
  console.log(`  1. copy the raw media in:  cp ~/shots/*.png content/projects/${slug}/media/`);
  console.log(`  2. npm run media -- ${slug}`);
  console.log(`       compresses in place (images -> webp, video -> mp4) and makes poster frames`);
  console.log(`  3. edit content/projects/${slug}/project.json — replace every TODO, then`);
  console.log(`     point hero and sections at the files that step 2 produced:`);
  console.log("");
  console.log(MEDIA_EXAMPLE);
  console.log("");
  console.log(`  4. npm run validate          fix whatever it lists`);
  console.log(`  5. leave "published" and "featured" false — they are Michael's switches,`);
  console.log(`     and he flips them once he has looked at the project himself (AGENTS.md §5).`);
}

main().catch((error) => {
  console.error(`new-project failed: ${error.message}`);
  process.exitCode = 1;
});
