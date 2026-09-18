import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/Container";
import { ProjectCard } from "@/components/ProjectCard";
import { getProfile, getProjects } from "@/lib/content";
import { compareProjectsByRelevance } from "@/lib/project-order";
import type { Profile } from "@/lib/schema";

/**
 * Home.
 *
 * The legacy homepage was the whole site: a hero whose bio vanished on hover,
 * a landscape-mode warning, and a "My Top Projects" grid fed by a JSON file
 * that listed two of the nine projects. Two of nine was the site's real bug —
 * there was no route to the other seven from anywhere.
 *
 * So this page does one job: say who he is in a screen, then hand you off to
 * the work. Every project lives at /work, which is generated from the content
 * rather than hand-listed, so nothing can fall out of it again.
 */

/** How many projects the grid falls back to when nothing is flagged featured. */
const FALLBACK_COUNT = 3;

/**
 * `profile.bio` is currently the string "Michael Lizzio" — the name again,
 * which is the legacy `projects.json` habit of leaving a field filled but
 * empty of content. Printing the name twice under itself would look like a
 * bug, so when the bio says nothing the first `about` paragraph stands in.
 * Fix the field in content/profile.json and this page picks it up untouched.
 */
function heroBlurb(profile: Profile): string | null {
  const bio = profile.bio.trim();
  if (bio.length > 0 && bio.toLowerCase() !== profile.name.trim().toLowerCase()) {
    return bio;
  }
  return profile.about[0] ?? null;
}

export default async function HomePage() {
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);

  const relevantProjects = [...projects].sort(compareProjectsByRelevance);
  const featured = relevantProjects.filter((project) => project.featured);
  const highlights = (featured.length > 0 ? featured : relevantProjects).slice(0, FALLBACK_COUNT);

  const github = profile.links.find((link) => link.label.toLowerCase() === "github") ?? null;
  const blurb = heroBlurb(profile);

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

      <section className="py-16 md:py-24">
        <Container>
          <h2 className="text-3xl font-semibold tracking-tight text-fg">Selected work</h2>
          <p className="mt-4 max-w-prose text-lg text-fg-muted">
            The ones I’d show you first, with the story and artifacts behind each build.
          </p>

          {highlights.length > 0 ? (
            <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {highlights.map((project) => (
                <li key={project.slug}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          ) : null}

          {projects.length > 0 ? (
            <div className="mt-10">
              <Link className="btn btn-outline" href="/work">
                All {projects.length} {projects.length === 1 ? "project" : "projects"}
              </Link>
            </div>
          ) : null}
        </Container>
      </section>
    </>
  );
}
