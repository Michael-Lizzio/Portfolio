import Image from "next/image";
import Link from "next/link";
import type { ResolvedProject } from "@/lib/schema";
import { APP_SHOWCASE } from "@/lib/apps";
import { DevelopmentBadge } from "./DevelopmentBadge";

/** A small thumbnail below sm, then two, three and four columns. */
const HERO_SIZES = "(min-width: 64rem) 17rem, (min-width: 48rem) 30vw, (min-width: 40rem) 45vw, 7rem";

/**
 * Years only, so every card's meta line is short and lines up: "2022",
 * "2025 to 2026", "2026 to now". The project page has the full dates.
 */
function cardYears(project: ResolvedProject): string | null {
  if (!project.date) return null;
  const start = project.date.slice(0, 4);
  if (!project.endDate) return start;
  if (project.endDate === "present") return `${start} to now`;
  const end = project.endDate.slice(0, 4);
  return end === start ? start : `${start} to ${end}`;
}

/**
 * The one project card, used by every grid on the site. A fixed 16:10 picture,
 * the title, the one-line tagline, then the years and how it was built. No tech
 * pills: the project page lists the stack, and on a card they were noise.
 *
 * The whole card is a single link, so there is exactly one tab stop and one
 * focus ring per project.
 */
export function ProjectCard({ project }: { project: ResolvedProject }) {
  const years = cardYears(project);
  const coverPosition = APP_SHOWCASE[project.slug]?.cardPosition;

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
        href={`/projects/${project.slug}`}
        className="group flex h-full flex-row overflow-hidden rounded-md border border-border-default bg-surface shadow-card hover:border-border-strong hover:shadow-raised motion-safe:transition motion-safe:hover:-translate-y-0.5 sm:flex-col"
      >
        {cover ? (
          <div className="relative my-3.5 ml-3.5 aspect-[16/10] w-28 shrink-0 self-start overflow-hidden rounded-sm border border-border-default bg-bg-subtle sm:m-0 sm:w-full sm:self-auto sm:rounded-none sm:border-x-0 sm:border-t-0">
            <Image
              className="object-cover object-top motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.02]"
              src={cover.src}
              alt={cover.alt ?? ""}
              fill
              sizes={HERO_SIZES}
              style={coverPosition ? { objectPosition: coverPosition } : undefined}
            />
          </div>
        ) : (
          /* A few projects genuinely have no screenshot. Rather than a broken
             image or a stock placeholder, the card shows the project's name. */
          <div className="my-3.5 ml-3.5 flex aspect-[16/10] w-28 shrink-0 self-start items-center justify-center rounded-sm border border-border-default bg-bg-subtle px-3 sm:m-0 sm:w-full sm:self-auto sm:rounded-none sm:border-x-0 sm:border-t-0 sm:px-6">
            <span className="text-center text-sm font-semibold tracking-tight text-fg-faint sm:text-lg">
              {project.title}
            </span>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1 p-3.5 sm:gap-1.5 sm:p-4">
          <h3 className="text-base font-semibold tracking-tight text-fg">{project.title}</h3>

          <p className="text-sm text-fg-muted [overflow-wrap:anywhere]">{project.tagline}</p>

          {years || project.development ? (
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 sm:pt-3">
              {years ? (
                <p className="font-mono text-xs text-fg-faint">
                  <time dateTime={project.date ?? undefined}>{years}</time>
                </p>
              ) : null}
              {project.development ? <DevelopmentBadge development={project.development} /> : null}
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
