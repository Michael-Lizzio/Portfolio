import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AppCard } from "@/components/AppCard";
import { Container } from "@/components/Container";
import { Circled, HandNote } from "@/components/HandNote";
import { HeroCarousel, type HeroSlide } from "@/components/HeroCarousel";
import { ProjectGrid } from "@/components/ProjectGrid";
import { APP_SHOWCASE, APP_SLIDE_ART, EXTRA_SLIDES } from "@/lib/apps";
import { getProfile, getProjects, getWork } from "@/lib/content";
import { toProjectCardData } from "@/lib/project-card";
import { compareProjectsByRelevance } from "@/lib/project-order";
import { siteOpenGraph } from "@/lib/site";
import { jobAnchor } from "@/lib/work-anchor";

/**
 * Home.
 *
 * Says who I am in one screen with the apps (and CalCardo and KURT) sliding by
 * beside it, then the three apps, the rest of the projects (best first, the
 * small ones behind "Load more"), where I've worked, and school. The apps are the `featured` projects;
 * the order everywhere comes from src/lib/project-order.ts.
 */

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: "/" },
    openGraph: await siteOpenGraph("/"),
  };
}

/** How many non-app projects the home grid shows before "Load more". Two rows of four. */
const HOME_VISIBLE = 8;

export default async function HomePage() {
  const [profile, projects, work] = await Promise.all([getProfile(), getProjects(), getWork()]);

  const ranked = [...projects].sort(compareProjectsByRelevance);
  const apps = ranked.filter((project) => project.featured);
  const others = ranked.filter((project) => !project.featured);

  const github = profile.links.find((link) => link.label.toLowerCase() === "github") ?? null;

  const appSlides: HeroSlide[] = apps.flatMap((project) =>
    project.hero && project.hero.kind === "image" && project.hero.width && project.hero.height
      ? [
          {
            slug: project.slug,
            title: project.title,
            status: project.status,
            src: project.hero.src,
            width: project.hero.width,
            height: project.hero.height,
            alt: project.hero.alt ?? "",
            ...APP_SLIDE_ART[project.slug],
          },
        ]
      : [],
  );
  const extraSlides: HeroSlide[] = EXTRA_SLIDES.flatMap((extra) => {
    const project = projects.find((candidate) => candidate.slug === extra.slug);
    if (!project) return [];
    return [
      {
        slug: extra.slug,
        title: extra.title ?? project.title,
        status: extra.label,
        src: extra.src,
        width: extra.width,
        height: extra.height,
        alt: project.hero?.alt ?? "",
        position: extra.position,
        phonePosition: extra.phonePosition,
      },
    ];
  });
  const slides = [...appSlides, ...extraSlides];

  return (
    <>
      <section className="border-b border-border-default bg-bg-subtle">
        <Container className="py-14 md:py-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-16">
            <div className="max-w-xl">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <Image
                  className="size-11 rounded-full border border-border-default object-cover"
                  src="/images/profile.webp"
                  alt=""
                  width={88}
                  height={88}
                  priority
                />
                <p className="font-mono text-sm text-fg-muted">Software Engineering at RIT</p>
              </div>

              <h1 className="mt-7 text-5xl font-semibold tracking-[-0.025em] text-fg md:text-[3.5rem] md:leading-[1.05]">
                Hi, I&apos;m Michael.
                <br />I build things <span className="text-accent">people use.</span>
              </h1>

              <p className="mt-6 text-lg text-fg-muted">
                It started with a Raspberry Pi I got for Christmas in 2018. Since then I&apos;ve built a
                robot foosball goalie, AI tools at my internships, and now my own apps. Two are on the App
                Store and the third is in public beta.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="btn btn-primary" href="/projects">
                  See my projects
                </Link>
                {profile.resume ? (
                  <a className="btn btn-outline" href={profile.resume} target="_blank" rel="noopener noreferrer">
                    Resume
                  </a>
                ) : null}
                {github ? (
                  <a className="btn btn-outline" href={github.href} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                ) : null}
              </div>
            </div>

            {slides.length > 0 ? <HeroCarousel slides={slides} label="My apps and projects" /> : null}
          </div>
        </Container>
      </section>

      {apps.length > 0 ? (
        <section className="pt-16 md:pt-24" aria-labelledby="apps-title">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
              <div>
                <h2 id="apps-title" className="text-3xl font-semibold tracking-tight text-fg">
                  My apps
                </h2>
                <p className="mt-2 text-fg-muted">Three products I designed, built and shipped myself.</p>
              </div>
              {/* A marker aside, so it stays out of the heading's accessible name. */}
              <HandNote marker="ink" tilt={-3} className="pb-2 pr-5 text-[1.75rem] md:text-[2rem]">
                Apps I&apos;ve <Circled className="ml-3">shipped</Circled>
              </HandNote>
            </div>

            <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {apps.map((project) => (
                <li key={project.slug}>
                  <AppCard project={project} showcase={APP_SHOWCASE[project.slug]} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {others.length > 0 ? (
        <section id="projects" className="scroll-mt-20 pt-16 md:pt-24" aria-labelledby="projects-title">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
              <div>
                <h2 id="projects-title" className="text-3xl font-semibold tracking-tight text-fg">
                  Projects
                </h2>
                <p className="mt-2 text-fg-muted">My favorites first. The smaller ones are one click away.</p>
              </div>
              <Link className="link text-sm font-medium" href="/projects">
                All {projects.length} projects
              </Link>
            </div>

            <div className="mt-8">
              <ProjectGrid
                projects={others.map(toProjectCardData)}
                initialVisible={HOME_VISIBLE}
                sortable={false}
                moreNote={
                  <HandNote marker="green" tilt={-2} className="text-[1.375rem]">
                    the small stuff lives here
                  </HandNote>
                }
              />
            </div>
          </Container>
        </section>
      ) : null}

      {work.jobs.length > 0 ? (
        <section
          className={work.education.length > 0 ? "pt-16 md:pt-24" : "py-16 md:py-24"}
          aria-labelledby="work-title"
        >
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
              <div>
                <h2 id="work-title" className="text-3xl font-semibold tracking-tight text-fg">
                  Work
                </h2>
                <p className="mt-2 text-fg-muted">
                  {work.jobs.length === 3 ? "Three summers of internships." : "Where I've worked."}
                </p>
              </div>
              <Link className="link text-sm font-medium" href="/work">
                Full work history
              </Link>
            </div>

            <ul className="mt-8 border-t border-border-default">
              {work.jobs.map((job) => (
                <li key={`${job.company}-${job.dates}`} className="border-b border-border-default">
                  <Link
                    href={`/work#${jobAnchor(job)}`}
                    className="group grid gap-1 py-6 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:gap-6"
                  >
                    <span className="font-mono text-xs leading-7 text-fg-faint">{job.dates}</span>
                    <span>
                      <span className="block text-lg font-semibold tracking-tight text-fg group-hover:text-accent motion-safe:transition">
                        {job.role}
                      </span>
                      <span className="block text-sm text-fg-muted">
                        {job.company}
                        {job.location ? ` · ${job.location}` : null}
                      </span>
                      <span className="mt-2 block max-w-prose text-fg">{job.summary}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="hidden text-fg-faint group-hover:text-accent motion-safe:transition motion-safe:group-hover:translate-x-0.5 sm:block sm:leading-7"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {work.education.length > 0 ? (
        <section className="py-16 md:py-24" aria-labelledby="education-title">
          <Container>
            <h2 id="education-title" className="text-3xl font-semibold tracking-tight text-fg">
              Education
            </h2>

            <ul className="mt-8 border-t border-border-default">
              {work.education.map((school) => (
                <li
                  key={school.school}
                  className="grid gap-1 border-b border-border-default py-6 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6"
                >
                  <span className="font-mono text-xs leading-7 text-fg-faint">{school.dates}</span>
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-fg">{school.school}</p>
                    <p className="text-sm text-fg-muted">{school.degree}</p>
                    {school.details.length > 0 ? (
                      <ul className="mt-3 flex max-w-prose flex-col gap-1.5 text-fg">
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
                  </div>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
    </>
  );
}
