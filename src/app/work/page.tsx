import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { getProfile, getProjects, getWork } from "@/lib/content";

export const metadata: Metadata = {
  title: "Work",
  description: "Where I've worked: two summers at Greenman Pedersen and one at TTM Technologies.",
};

/**
 * Work experience: the job half of the resume, from content/work.json. Each job
 * links to the published projects that came out of it, so the Work page and the
 * Projects page point at each other instead of repeating the same write-ups.
 */
export default async function WorkPage() {
  const [work, profile, projects] = await Promise.all([getWork(), getProfile(), getProjects()]);
  const titleBySlug = new Map(projects.map((project) => [project.slug, project.title]));

  return (
    <>
      <PageHeader
        title="Work"
        tagline={work.intro}
        meta={
          profile.resume ? (
            <a
              className="btn btn-outline"
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
            >
              Resume (PDF)
            </a>
          ) : undefined
        }
      />

      <section className="py-14 md:py-20">
        <Container size="prose">
          <h2 className="sr-only">Experience</h2>
          <ol className="flex flex-col gap-14">
            {work.jobs.map((job) => {
              const related = job.projects.filter((slug) => titleBySlug.has(slug));

              return (
                <li key={`${job.company}-${job.dates}`}>
                  <article>
                    <p className="font-mono text-xs text-fg-faint">{job.dates}</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-fg">
                      {job.role}
                    </h3>
                    <p className="mt-1 text-fg-muted">
                      {job.company}
                      {job.location ? <span aria-hidden="true"> · </span> : null}
                      {job.location}
                    </p>

                    <p className="mt-5 text-lg text-fg">{job.summary}</p>

                    {job.highlights.length > 0 ? (
                      <ul className="mt-5 flex list-disc flex-col gap-2 pl-5 text-fg">
                        {job.highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                    ) : null}

                    {related.length > 0 ? (
                      <p className="mt-5 text-sm text-fg-muted">
                        Projects from this job:{" "}
                        {related.map((slug, index) => (
                          <span key={slug}>
                            {index > 0 ? ", " : null}
                            <Link className="link" href={`/projects/${slug}`}>
                              {titleBySlug.get(slug)}
                            </Link>
                          </span>
                        ))}
                      </p>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ol>

          {work.education.length > 0 ? (
            <>
              <h2 className="mt-20 text-2xl font-semibold tracking-tight text-fg">Education</h2>
              <ul className="mt-6 flex flex-col gap-8">
                {work.education.map((school) => (
                  <li key={school.school}>
                    <p className="font-mono text-xs text-fg-faint">{school.dates}</p>
                    <p className="mt-2 text-lg font-medium text-fg">{school.school}</p>
                    <p className="text-fg-muted">{school.degree}</p>
                    {school.details.length > 0 ? (
                      <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 text-fg">
                        {school.details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </Container>
      </section>
    </>
  );
}
