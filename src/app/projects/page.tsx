import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { ProjectGrid } from "@/components/ProjectGrid";
import { getProjects } from "@/lib/content";

/**
 * The project index. It is generated from the content directory itself, so a
 * project appears here the moment `published` is true. The order, and where
 * "Load more" starts, come from src/lib/project-order.ts.
 */
export const metadata: Metadata = {
  title: "Projects",
  description:
    "Apps I've shipped, things I built at my internships, and a lot of side projects, best first.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHeader
        title="Projects"
        tagline="Apps I've shipped, things I built at my internships, and a lot of side projects. The best ones are first."
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
              {/* The cards carry <h3>; without this the page would jump h1 to h3. */}
              <h2 className="sr-only">All projects</h2>
              <ProjectGrid projects={projects} />
            </>
          ) : (
            /* Reachable only if every project is unpublished. Say so plainly
               rather than rendering an empty grid that looks broken. */
            <p className="max-w-prose text-lg text-fg-muted">
              Nothing is published yet. Projects show up here as I write them up.
            </p>
          )}
        </Container>
      </section>
    </>
  );
}
