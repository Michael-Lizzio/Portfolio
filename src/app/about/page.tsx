import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/Container";
import { MediaFigure } from "@/components/MediaFigure";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { getProfile } from "@/lib/content";
import type { Media } from "@/lib/schema";

export const metadata: Metadata = {
  title: "About",
  description:
    "How a Raspberry Pi at Christmas grew into years of programming — and what I look for in a project now.",
};

/**
 * The collage is site furniture rather than project media, so it lives in
 * /public/images and is handed to MediaFigure as an already-resolved Media
 * object. Same figure treatment as everything else on the site; no second way
 * of framing a picture.
 */
const COLLAGE: Media = {
  src: "/images/collage.webp",
  kind: "image",
  poster: null,
  alt: "A six-photo collage: skiing through falling snow, two swimmers standing in the surf, a beach at dusk, family and a dog beside a lighthouse, skis held overhead on a foggy slope, and a foosball table at home rigged with an overhead camera mount.",
  caption: "Skiing, the ocean, home — and the foosball table that became KURT.",
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
            <MediaFigure media={COLLAGE} />
          </div>

          <p className="mt-12 text-lg text-fg-muted">
            The projects are on{" "}
            <Link className="link" href="/work">
              the work page
            </Link>
            , and the fastest way to reach me is on{" "}
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
