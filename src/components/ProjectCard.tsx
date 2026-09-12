import Image from "next/image";
import Link from "next/link";
import type { ResolvedProject } from "@/lib/schema";
import { TechPill } from "./TechPill";
import { formatProjectDate } from "./date";

/** More than four pills stops reading as a list and starts reading as noise. */
const MAX_PILLS = 4;

/** One column below md, two at md, three at lg. */
const HERO_SIZES = "(min-width: 64rem) 22rem, (min-width: 48rem) 45vw, 100vw";

/**
 * The one card. Every project on every page uses it — which is the structural
 * answer to the legacy site's three different card styles for the same idea,
 * and to the homepage rule (`.project-card p { display: none }`) that made the
 * tagline unrenderable.
 *
 * The whole card is a single link, so there is exactly one tab stop and one
 * focus ring per project.
 */
export function ProjectCard({ project }: { project: ResolvedProject }) {
  const pills = project.tech.slice(0, MAX_PILLS);
  const remaining = project.tech.length - pills.length;

  // A hero may be a video; its poster frame is the still we want on the card.
  const cover =
    project.hero?.kind === "image"
      ? { src: project.hero.src, alt: project.hero.alt }
      : project.hero?.poster
        ? { src: project.hero.poster, alt: project.hero.alt }
        : null;

  return (
    <article className="h-full">
      <Link
        href={`/work/${project.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-md border border-border-default bg-surface shadow-card hover:border-border-strong hover:shadow-raised motion-safe:transition motion-safe:hover:-translate-y-0.5"
      >
        {cover ? (
          <div className="relative aspect-video w-full border-b border-border-default bg-bg-subtle">
            <Image
              className="object-cover"
              src={cover.src}
              alt={cover.alt ?? ""}
              fill
              sizes={HERO_SIZES}
            />
          </div>
        ) : (
          /* Three projects genuinely have no screenshot. Rather than a broken
             image or a stock placeholder, the card states the route it leads to. */
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 border-b border-border-default bg-bg-subtle">
            <span aria-hidden="true" className="h-px w-10 bg-border-strong" />
            <span className="font-mono text-xs text-fg-faint">/work/{project.slug}</span>
          </div>
        )}

        <div className="flex flex-1 flex-col gap-2 p-5">
          <h3 className="text-xl font-semibold tracking-tight text-fg">{project.title}</h3>

          <p className="text-sm text-fg-muted">{project.tagline}</p>

          <div className="mt-auto flex flex-col gap-3 pt-4">
            {pills.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {pills.map((tech) => (
                  <li key={tech}>
                    <TechPill>{tech}</TechPill>
                  </li>
                ))}
                {remaining > 0 ? (
                  <li>
                    <TechPill>+{remaining}</TechPill>
                  </li>
                ) : null}
              </ul>
            ) : null}

            {project.date ? (
              <p className="font-mono text-xs text-fg-faint">
                <time dateTime={project.date}>{formatProjectDate(project.date)}</time>
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
