import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/Container";

export const metadata: Metadata = {
  title: "Page not found",
  // Without this the page inherits the layout's description (the profile
  // headline), which describes the person rather than the 404.
  description: "That address does not exist. Every project is listed on the work page.",
};

/**
 * 404. Reached by an unknown URL, and by notFound() from /work/[slug] for a
 * slug that does not exist or is not published.
 *
 * The legacy site was hosted from .html files; those paths are redirected in
 * next.config.ts, but anything it misses lands here, so the page names the new
 * shape of the URLs and points at the one index that lists everything.
 */
export default function NotFound() {
  return (
    <section className="py-24 md:py-32">
      <Container size="prose">
        <p className="font-mono text-xs text-fg-faint">404</p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-fg">
          There is nothing at this address
        </h1>

        <p className="mt-5 text-lg text-fg-muted">
          The link may be from the old site — projects now live at{" "}
          <span className="font-mono text-base text-fg-faint">/work/&lt;project&gt;</span>. The
          work page lists every one of them.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="btn btn-primary" href="/work">
            See all work
          </Link>
          <Link className="btn btn-outline" href="/">
            Home
          </Link>
        </div>
      </Container>
    </section>
  );
}
