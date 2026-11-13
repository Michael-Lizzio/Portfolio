import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/Container";
import { MediaFigure } from "@/components/MediaFigure";
import { PageHeader } from "@/components/PageHeader";
import { ProjectLightbox } from "@/components/ProjectLightbox";
import { Prose } from "@/components/Prose";
import { getProfile } from "@/lib/content";
import type { ResolvedMedia } from "@/lib/schema";
import { siteOpenGraph } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About",
    description:
      "How a Raspberry Pi I got for Christmas in 2018 turned into years of building things.",
    alternates: { canonical: "/about/" },
    openGraph: await siteOpenGraph("/about/"),
  };
}

/**
 * The collage is site furniture rather than project media, so it lives in
 * /public/images and is handed to MediaFigure as an already-resolved Media
 * object. Same figure treatment as everything else on the site; no second way
 * of framing a picture. It opens in the same lightbox as project images, so
 * the click on it goes somewhere (it used to point at a viewer that was never
 * on this page).
 */
const COLLAGE: ResolvedMedia & { kind: "image" } = {
  src: "/images/collage.webp",
  kind: "image",
  poster: null,
  alt: "A six-photo collage: skiing through falling snow, two swimmers standing in the surf, a beach at dusk, family and a dog beside a lighthouse, skis held overhead on a foggy slope, and a foosball table at home rigged with an overhead camera mount.",
  caption: "Skiing, the ocean, home, and the foosball table that became KURT.",
  autoplay: false,
  width: 1800,
  height: 1170,
};

export default async function AboutPage() {
  const profile = await getProfile();
  const paragraphs = profile.about.length > 0 ? profile.about : [profile.bio];

  return (
    <>
      <PageHeader
        title="About"
        tagline={profile.headline}
        meta={
          profile.location ? (
            <p className="font-mono text-xs text-fg-faint">{profile.location}</p>
          ) : undefined
        }
      />

      <section className="py-14 md:py-20">
        <Container size="prose">
          <Prose paragraphs={paragraphs} />

          <div className="mt-12">
            <MediaFigure media={COLLAGE} gallery={[COLLAGE]} />
          </div>
          <ProjectLightbox gallery={[COLLAGE]} />

          <p className="mt-12 text-lg text-fg-muted">
            You can see what I&apos;ve built on{" "}
            <Link className="link" href="/projects">
              the projects page
            </Link>
            , where I&apos;ve worked on{" "}
            <Link className="link" href="/work">
              the work page
            </Link>
            , and how to reach me on{" "}
            <Link className="link" href="/contact">
              the contact page
            </Link>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
