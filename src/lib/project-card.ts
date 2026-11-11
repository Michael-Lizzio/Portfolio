import { existsSync } from "node:fs";
import path from "node:path";

import { APP_SHOWCASE } from "./apps";
import type { ResolvedProject } from "./schema";

/**
 * Exactly what a project card shows, and nothing more.
 *
 * ProjectGrid is a client component, so everything passed to it is serialized
 * into the page's HTML. Passing whole projects shipped every section's text
 * and the internal `notes` field to the browser. Build this on the server and
 * pass it instead; anything not listed here never leaves the server.
 */
export type ProjectCardData = {
  slug: string;
  title: string;
  tagline: string;
  date: string | null;
  endDate: string | "present" | null;
  development: ResolvedProject["development"];
  cover: { src: string; alt: string } | null;
  coverPosition: string | null;
};

/**
 * The card-size copy of a cover made by `npm run cards` (scripts/card-images.mjs),
 * or the full cover when there is none yet. Server only.
 */
function cardImage(slug: string, coverSrc: string): string {
  const name = `${slug}--${path.basename(coverSrc, path.extname(coverSrc))}.webp`;
  return existsSync(path.join(process.cwd(), "public", "images", "cards", name))
    ? `/images/cards/${name}`
    : coverSrc;
}

export function toProjectCardData(project: ResolvedProject): ProjectCardData {
  // A hero may be a video; its poster frame is the still we want on the card.
  const hero = project.hero;
  const heroSrc = hero?.kind === "image" ? hero.src : (hero?.poster ?? null);
  const cardSrc = APP_SHOWCASE[project.slug]?.cardSrc ?? null;
  const coverSrc = cardSrc ?? (heroSrc ? cardImage(project.slug, heroSrc) : null);

  return {
    slug: project.slug,
    title: project.title,
    tagline: project.tagline,
    date: project.date,
    endDate: project.endDate,
    development: project.development,
    cover: hero && coverSrc ? { src: coverSrc, alt: hero.alt ?? "" } : null,
    coverPosition: cardSrc ? null : (APP_SHOWCASE[project.slug]?.cardPosition ?? null),
  };
}
