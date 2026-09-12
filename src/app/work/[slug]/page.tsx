import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/Container";
import { MediaFigure } from "@/components/MediaFigure";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { TechPill } from "@/components/TechPill";
import { formatProjectDate } from "@/components/date";
import { getProject, getProjectSlugs, getProjects } from "@/lib/content";
import type { Media, ResolvedProject, Section } from "@/lib/schema";

/**
 * One project.
 *
 * This route replaces six hand-written project pages — three of whose
 * stylesheets were byte-identical — with a single template driven by the
 * content model. The shape of the data varies a lot and every variation has to
 * look intentional, not merely not-crash:
 *
 *   foosball  10 sections, 23 media (a hero, 7 videos, a 15-photo gallery),
 *             a status line, 9 tech tags
 *   la2028     4 sections, no media at all, no hero, no links
 *   cryptogram sections that are nothing but a gallery, and no body copy
 *
 * So nothing here is conditional-on-truthiness-and-hope: each block states the
 * case it handles, and a project that has none of them still renders a header,
 * a summary and a way onward.
 */

/** Beyond two, media stops being an illustration and becomes a contact sheet. */
const GALLERY_THRESHOLD = 3;

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    // The page itself calls notFound(); metadata for a 404 just needs a title.
    return { title: "Not found" };
  }

  // A video hero has no still of its own — its poster frame is the share image.
  const image =
    project.hero?.kind === "image" ? project.hero.src : (project.hero?.poster ?? null);

  return {
    title: project.title,
    description: project.tagline,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.tagline,
      url: `/work/${project.slug}`,
      images: image ? [{ url: image, alt: project.hero?.alt ?? project.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: project.title,
      description: project.tagline,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = await getProject(slug);

  // getProject() returns null for an unknown slug *and* for an unpublished one,
  // so a draft is a 404 rather than a secret URL.
  if (!project) notFound();

  const projects = await getProjects();
  const index = projects.findIndex((candidate) => candidate.slug === project.slug);
  const previous = index > 0 ? projects[index - 1] : null;
  const next = index >= 0 && index < projects.length - 1 ? projects[index + 1] : null;

  const date = formatProjectDate(project.date);

  return (
    <>
      {/* Sits in the header's own band, so it reads as the top line of the
          header rather than a stray link floating above it. */}
      <nav aria-label="Breadcrumb" className="bg-bg-subtle">
        <Container className="pt-10">
          <ol className="flex items-center gap-2 font-mono text-xs text-fg-faint">
            <li>
              <Link className="rounded-sm hover:text-accent motion-safe:transition" href="/work">
                Work
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="min-w-0 truncate text-fg-muted">
              {project.title}
            </li>
          </ol>
        </Container>
      </nav>

      <PageHeader
        title={project.title}
        tagline={project.tagline}
        meta={
          <>
            {/* The card caps the pill list at four; here the full stack is the
                point, so all of it shows — la2028 has twelve. */}
            {project.tech.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <li key={tech}>
                    <TechPill>{tech}</TechPill>
                  </li>
                ))}
              </ul>
            ) : null}

            {date || project.status ? (
              <p className="font-mono text-xs text-fg-faint">
                {date ? <time dateTime={project.date ?? undefined}>{date}</time> : null}
                {date && project.status ? <span aria-hidden="true"> · </span> : null}
                {project.status}
              </p>
            ) : null}

            {/* basis-full puts links on their own line under the meta row,
                whatever wrapped above them. */}
            {project.links.length > 0 ? (
              <ul className="flex basis-full flex-wrap gap-3 pt-2">
                {project.links.map((link) => (
                  <li key={link.href}>
                    <a
                      className="btn btn-outline"
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        }
      />

      <article className="py-14 md:py-20">
        {/* Only the hero is priority: it is the LCP candidate when it exists. */}
        {project.hero ? (
          <Container size="prose">
            <MediaFigure media={project.hero} priority />
          </Container>
        ) : null}

        <Container size="prose" className={project.hero ? "mt-12" : undefined}>
          <Prose paragraphs={[project.summary]} />
        </Container>

        {project.sections.map((section, i) => (
          <ProjectSection key={i} section={section} />
        ))}
      </article>

      <ProjectFooterNav previous={previous} next={next} />
    </>
  );
}

/**
 * A section is any combination of heading, body and media — including a
 * heading with only a gallery under it (cryptogram) and a heading with only
 * prose (la2028, all four of them). A section that is entirely empty renders
 * nothing at all rather than an unexplained gap.
 */
function ProjectSection({ section }: { section: Section }) {
  const hasBody = section.body.length > 0;
  const hasMedia = section.media.length > 0;

  if (!section.heading && !hasBody && !hasMedia) return null;

  return (
    <section className="mt-14 md:mt-20">
      {section.heading || hasBody ? (
        <Container size="prose">
          {section.heading ? (
            <h2 className="text-2xl font-semibold tracking-tight text-fg">{section.heading}</h2>
          ) : null}

          {hasBody ? (
            <div className={section.heading ? "mt-5" : undefined}>
              <Prose paragraphs={section.body} />
            </div>
          ) : null}
        </Container>
      ) : null}

      {hasMedia ? <SectionMedia media={section.media} /> : null}
    </section>
  );
}

/**
 * Media widens with its count, and never nests containers:
 *
 *   one    the reading column, full width — a figure inside the argument
 *   two    the reading column, side by side at md and up
 *   three+ the page column as a gallery, because a 15-photo contact sheet in a
 *          720px column is a scroll, not a gallery
 *
 * Every grid is one column below md, which is the fix that deletes the legacy
 * site's "switch your phone to landscape" warning at the source.
 */
function SectionMedia({ media }: { media: Media[] }) {
  if (media.length === 1) {
    return (
      <Container size="prose" className="mt-8">
        <MediaFigure media={media[0]} />
      </Container>
    );
  }

  if (media.length < GALLERY_THRESHOLD) {
    return (
      <Container size="prose" className="mt-8">
        <ul className="grid gap-6 md:grid-cols-2">
          {media.map((item, i) => (
            <li key={`${i}-${item.src}`}>
              <MediaFigure media={item} sizes="(min-width: 48rem) 22rem, 100vw" />
            </li>
          ))}
        </ul>
      </Container>
    );
  }

  // Video needs the extra width more than a still does, so it never goes 3-up.
  const hasVideo = media.some((item) => item.kind === "video");
  const columns = hasVideo ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  // Must track `columns`: the page column is 72rem, so a 3-up slot is ~22rem.
  const sizes = hasVideo
    ? "(min-width: 40rem) 50vw, 100vw"
    : "(min-width: 64rem) 22rem, (min-width: 40rem) 50vw, 100vw";

  return (
    <Container className="mt-10">
      <ul className={`grid gap-6 ${columns}`}>
        {media.map((item, i) => (
          <li key={`${i}-${item.src}`}>
            <MediaFigure media={item} sizes={sizes} />
          </li>
        ))}
      </ul>
    </Container>
  );
}

/**
 * The end of a project is the one place a reader is certain to reach, so it is
 * where the next route in belongs — in the site's own order, not "related
 * projects" invented from tags.
 */
function ProjectFooterNav({
  previous,
  next,
}: {
  previous: ResolvedProject | null;
  next: ResolvedProject | null;
}) {
  return (
    <nav
      aria-label="More projects"
      className="border-t border-border-default bg-bg-subtle py-10"
    >
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {previous ? (
          <AdjacentProject project={previous} direction="previous" />
        ) : (
          <span className="hidden sm:block" />
        )}

        <Link className="btn btn-outline self-start sm:self-auto" href="/work">
          All work
        </Link>

        {next ? (
          <AdjacentProject project={next} direction="next" />
        ) : (
          <span className="hidden sm:block" />
        )}
      </Container>
    </nav>
  );
}

function AdjacentProject({
  project,
  direction,
}: {
  project: ResolvedProject;
  direction: "previous" | "next";
}) {
  const isNext = direction === "next";

  return (
    <Link
      className={`group block max-w-xs ${isNext ? "sm:text-right" : ""}`}
      href={`/work/${project.slug}`}
    >
      <span className="font-mono text-xs text-fg-faint">
        {isNext ? "Next" : "Previous"}
      </span>
      <span className="mt-1 block font-medium text-fg group-hover:text-accent motion-safe:transition">
        {project.title}
      </span>
    </Link>
  );
}
