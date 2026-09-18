import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { WorkProjectGrid } from "@/components/WorkProjectGrid";
import { getProjects } from "@/lib/content";

/**
 * The work index — the page the legacy site never had.
 *
 * Its homepage read data/projects.json, which listed two of the nine projects
 * that existed on disk; the other seven had finished pages and no link in from
 * anywhere. This page is generated from the content directory itself, so a
 * project appears here the moment `published` is true and cannot be forgotten
 * by a hand-maintained list again.
 */
export const metadata: Metadata = {
  title: "Work",
  description:
    "Every project with a write-up: robotics, algorithms, embedded hardware and web apps.",
};

export default async function WorkPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHeader
        title="Work"
        tagline="Everything with a write-up — robotics, algorithms, embedded hardware and web apps."
        meta={
          <p className="font-mono text-xs text-fg-faint">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </p>
        }
      />

      <section className="py-16 md:py-24">
        <Container>
          {projects.length > 0 ? (
            <>
              {/* The cards carry <h3>; without this the page would jump h1 → h3. */}
              <h2 className="sr-only">All projects</h2>
              <WorkProjectGrid projects={projects} />
            </>
          ) : (
            /* Reachable only if every project is unpublished. Say so plainly
               rather than rendering an empty grid that looks broken. */
            <p className="max-w-prose text-lg text-fg-muted">
              Nothing is published yet. Projects appear here as they are written up.
            </p>
          )}
        </Container>
      </section>
    </>
  );
}
