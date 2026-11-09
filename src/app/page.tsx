import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/Container";
import { ProjectCard } from "@/components/ProjectCard";
import { getProfile, getProjects, getWork } from "@/lib/content";
import { compareProjectsByRelevance } from "@/lib/project-order";

/**
 * Home.
 *
 * Says who I am in one screen, shows the three apps, a few more projects, and
 * where I've worked, then hands off to /projects and /work. Which projects show
 * up here is decided by `featured` (Selected work) and by the ranking in
 * src/lib/project-order.ts (the row after it).
 */

/** How many projects the second row shows. */
const MORE_COUNT = 3;

export default async function HomePage() {
  const [profile, projects, work] = await Promise.all([getProfile(), getProjects(), getWork()]);

  const relevantProjects = [...projects].sort(compareProjectsByRelevance);
  const featured = relevantProjects.filter((project) => project.featured);
  const more = relevantProjects.filter((project) => !project.featured).slice(0, MORE_COUNT);

  const github = profile.links.find((link) => link.label.toLowerCase() === "github") ?? null;
  const blurb = profile.bio.trim();

  return (
    <>
      {/* The same subtle band + hairline every other page opens with (PageHeader),
          so the top of the site is one shape rather than six. */}
      <section className="border-b border-border-default bg-bg-subtle">
        <Container className="py-16 md:py-24">
          {/* Two columns from lg up: the bio never exceeds its measure, and the
              collage fills the half of the band it would otherwise leave empty. */}
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]">
            <div className="max-w-prose">
              <Image
                className="h-24 w-24 rounded-full border border-border-default object-cover"
                src="/images/profile.webp"
                alt={profile.name}
                width={96}
                height={96}
                priority
              />

            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-fg md:text-5xl">
              {profile.name}
            </h1>

            <p className="mt-4 text-lg text-fg-muted">{profile.headline}</p>

            {blurb ? <p className="mt-6 text-lg text-fg">{blurb}</p> : null}

            <div className="mt-8 flex flex-wrap gap-3">
              {profile.resume ? (
                <a
                  className="btn btn-primary"
                  href={profile.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Resume
                </a>
              ) : null}

              {github ? (
                <a
                  className="btn btn-outline"
                  href={github.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              ) : null}
              </div>
            </div>

            <Image
              className="hidden rounded-lg border border-border-default object-cover lg:block"
              src="/images/collage.webp"
              alt="A six-photo collage: skiing through falling snow, two swimmers standing in the surf, a beach at dusk, family and a dog beside a lighthouse, skis held overhead on a foggy slope, and a foosball table at home rigged with an overhead camera mount."
              width={1800}
              height={1170}
              sizes="(min-width: 64rem) 34rem, 0px"
              priority
            />
          </div>
        </Container>
      </section>

      {featured.length > 0 ? (
        <section className="pt-16 md:pt-24">
          <Container>
            <h2 className="text-3xl font-semibold tracking-tight text-fg">Selected work</h2>
            <p className="mt-4 max-w-prose text-lg text-fg-muted">
              The three apps I&apos;m building right now. Two are on the App Store and one is in a
              private beta.
            </p>

            <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((project) => (
                <li key={project.slug}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {more.length > 0 ? (
        <section className="pt-16 md:pt-24">
          <Container>
            <h2 className="text-2xl font-semibold tracking-tight text-fg">A few more I like</h2>

            <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {more.map((project) => (
                <li key={project.slug}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Link className="btn btn-outline" href="/projects">
                All {projects.length} {projects.length === 1 ? "project" : "projects"}
              </Link>
            </div>
          </Container>
        </section>
      ) : null}

      {work.jobs.length > 0 ? (
        <section className="py-16 md:py-24">
          <Container>
            <h2 className="text-2xl font-semibold tracking-tight text-fg">Where I&apos;ve worked</h2>

            <ul className="mt-8 border-t border-border-default">
              {work.jobs.map((job) => (
                <li
                  key={`${job.company}-${job.dates}`}
                  className="flex flex-col gap-1 border-b border-border-default py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <span className="text-fg">
                    {job.role}
                    <span className="text-fg-muted">, {job.company}</span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-fg-faint">{job.dates}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Link className="btn btn-outline" href="/work">
                More about my work
              </Link>
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
