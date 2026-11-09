import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { getProfile, getProjects, getWork } from "@/lib/content";
import { jobAnchor } from "@/lib/work-anchor";

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
  const projectBySlug = new Map(projects.map((project) => [project.slug, project]));

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

      <section className="pb-14 pt-4 md:pb-20 md:pt-6">
        <Container>
          <h2 className="sr-only">Experience</h2>
          <ol>
            {work.jobs.map((job) => {
              const related = job.projects
                .map((slug) => projectBySlug.get(slug))
                .filter((project) => project !== undefined);

              return (
                <li
                  key={`${job.company}-${job.dates}`}
                  id={jobAnchor(job)}
                  className="scroll-mt-20 border-b border-border-default py-10 md:py-12"
                >
                  <article className="grid gap-4 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-10">
                    <div>
                      <p className="font-mono text-xs leading-8 text-fg-faint">{job.dates}</p>
                    </div>

                    <div className="max-w-prose">
                      <h3 className="text-2xl font-semibold tracking-tight text-fg">{job.role}</h3>
                      <p className="mt-1 text-fg-muted">
                        {job.company}
                        {job.location ? <span aria-hidden="true"> · </span> : null}
                        {job.location}
                      </p>

                      <p className="mt-5 text-lg text-fg">{job.summary}</p>

                      {job.highlights.length > 0 ? (
                        <ul className="mt-5 flex flex-col gap-2.5 text-fg">
                          {job.highlights.map((highlight) => (
                            <li key={highlight} className="relative pl-5">
                              <span
                                aria-hidden="true"
                                className="absolute left-0 top-[0.7em] size-1.5 rounded-full bg-[var(--border-control)]"
                              />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {related.length > 0 ? (
                        <div className="mt-7">
                          <p className="text-sm font-medium text-fg-muted">Projects from this job</p>
                          <ul className="mt-3 flex flex-wrap gap-2.5">
                            {related.map((project) => {
                              const thumb =
                                project.hero?.kind === "image"
                                  ? project.hero.src
                                  : (project.hero?.poster ?? null);
                              return (
                                <li key={project.slug}>
                                  <Link
                                    href={`/projects/${project.slug}`}
                                    className={`flex h-11 items-center gap-2.5 rounded-md border border-border-default bg-surface pr-3.5 text-sm ${thumb ? "pl-1.5" : "pl-3.5"} font-medium text-fg shadow-card hover:border-border-strong hover:text-accent motion-safe:transition`}
                                  >
                                    {thumb ? (
                                      <Image
                                        className="h-8 w-11 rounded-sm border border-border-default object-cover object-top"
                                        src={thumb}
                                        alt=""
                                        width={88}
                                        height={64}
                                      />
                                    ) : null}
                                    {project.title}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>

          {work.education.length > 0 ? (
            <div className="grid gap-4 pt-14 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-10 md:pt-16">
              <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-base md:leading-8 md:text-fg-muted">
                Education
              </h2>
              <ul className="flex flex-col gap-8">
                {work.education.map((school) => (
                  <li key={school.school} className="max-w-prose">
                    <p className="text-2xl font-semibold tracking-tight text-fg">{school.school}</p>
                    <p className="mt-1 text-fg-muted">
                      {school.degree}
                      <span aria-hidden="true"> · </span>
                      {school.dates}
                    </p>
                    {school.details.length > 0 ? (
                      <ul className="mt-4 flex flex-col gap-1.5 text-fg">
                        {school.details.map((detail) => (
                          <li key={detail} className="relative pl-5">
                            <span
                              aria-hidden="true"
                              className="absolute left-0 top-[0.7em] size-1.5 rounded-full bg-[var(--border-control)]"
                            />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Container>
      </section>
    </>
  );
}
