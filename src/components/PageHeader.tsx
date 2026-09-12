import type { ReactNode } from "react";
import { Container } from "./Container";

/**
 * The single page-opening block: one `<h1>`, an optional standfirst, and an
 * optional meta row (tech pills, a date, a back-link — whatever the route needs).
 *
 * Every page uses this one, which is what retires the six different
 * `#project-title` boxes the legacy site carried.
 */
export function PageHeader({
  title,
  tagline,
  meta,
}: {
  title: string;
  tagline?: string;
  meta?: ReactNode;
}) {
  return (
    <header className="border-b border-border-default bg-bg-subtle">
      <Container className="py-14 md:py-20">
        <h1 className="text-4xl font-semibold tracking-tight text-fg">{title}</h1>

        {tagline ? <p className="mt-4 max-w-prose text-lg text-fg-muted">{tagline}</p> : null}

        {meta ? <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">{meta}</div> : null}
      </Container>
    </header>
  );
}
