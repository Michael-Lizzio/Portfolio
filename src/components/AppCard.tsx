import Image from "next/image";
import Link from "next/link";

import type { AppShowcase } from "@/lib/apps";
import type { ResolvedProject } from "@/lib/schema";
import { DevelopmentBadge } from "./DevelopmentBadge";

/** Each card is a third of the page column from lg up, full width below md. */
const PHONE_SIZES = "(min-width: 64rem) 9rem, (min-width: 48rem) 20vw, 40vw";
const CALL_SIZES = "(min-width: 64rem) 20rem, (min-width: 48rem) 40vw, 90vw";

/**
 * One app in "Apps I've shipped": white on top with the name, status and what
 * it does, and the bottom half in the app's own colour with real screens from
 * it. The whole card is one link to the app's project page.
 */
export function AppCard({
  project,
  showcase,
}: {
  project: ResolvedProject;
  showcase: AppShowcase | undefined;
}) {
  const statusLine = [showcase?.platform, project.status].filter(Boolean).join(" · ");

  return (
    <article className={`app-${project.slug} h-full`}>
      <Link
        href={`/projects/${project.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-lg border border-border-default bg-surface shadow-card hover:border-border-strong hover:shadow-raised motion-safe:transition motion-safe:hover:-translate-y-0.5"
      >
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-3.5">
            {showcase ? (
              <Image
                className="size-12 shrink-0 rounded-[0.8rem] shadow-card ring-1 ring-black/5"
                src={showcase.icon}
                alt=""
                width={48}
                height={48}
              />
            ) : null}
            <div className="min-w-0">
              <h3 className="text-2xl font-semibold tracking-tight text-fg">{project.title}</h3>
              {statusLine ? (
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-fg-muted">
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full bg-[var(--app)]"
                  />
                  {statusLine}
                </p>
              ) : null}
            </div>
          </div>

          <p className="mt-4 text-fg-muted">{project.tagline}</p>

          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            {project.development ? <DevelopmentBadge development={project.development} /> : <span />}
            <span className="text-sm font-medium text-[var(--app)]">
              View project
              <span aria-hidden="true" className="ml-1 inline-block motion-safe:transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </div>
        </div>

        {showcase && showcase.pictures.length > 0 ? (
          <div
            className="relative h-56 overflow-hidden border-t border-border-default bg-[var(--app-tint)] md:h-60"
            aria-hidden="true"
          >
            {showcase.panel === "phones" ? (
              <div className="absolute inset-x-0 top-6 flex justify-center gap-3 px-6">
                {showcase.pictures.slice(0, 2).map((picture) => (
                  <Image
                    key={picture.src}
                    className="w-[42%] max-w-40 rounded-t-xl shadow-raised ring-1 ring-black/5"
                    src={picture.src}
                    alt=""
                    width={picture.width}
                    height={picture.height}
                    sizes={PHONE_SIZES}
                  />
                ))}
              </div>
            ) : (
              <div className="absolute inset-x-6 top-6 flex flex-col items-center">
                {showcase.pictures[0] ? (
                  <Image
                    className="w-[88%] max-w-80 self-start rounded-xl shadow-card ring-1 ring-black/5"
                    src={showcase.pictures[0].src}
                    alt=""
                    width={showcase.pictures[0].width}
                    height={showcase.pictures[0].height}
                    sizes={CALL_SIZES}
                  />
                ) : null}
                {showcase.pictures[1] ? (
                  <Image
                    className="mt-2.5 w-[88%] max-w-80 self-end rounded-[1.1rem] shadow-raised"
                    src={showcase.pictures[1].src}
                    alt=""
                    width={showcase.pictures[1].width}
                    height={showcase.pictures[1].height}
                    sizes={CALL_SIZES}
                  />
                ) : null}
              </div>
            )}
          </div>
        ) : null}
      </Link>
    </article>
  );
}
