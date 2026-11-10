import { Container } from "@/components/Container";
import { MediaFigure } from "@/components/MediaFigure";
import type { Overview, ResolvedMedia } from "@/lib/schema";

type ImageMedia = ResolvedMedia & { kind: "image" };

const ITEMS: { key: keyof Overview; label: string }[] = [
  { key: "what", label: "What it is" },
  { key: "why", label: "Why I made it" },
  { key: "did", label: "What I did" },
  { key: "result", label: "How it turned out" },
];

/**
 * The top of a project page: the 30-second version. A large hero next to four
 * short answers, so someone skimming gets the whole project before the details
 * start. Without a hero, the four answers sit in a two-by-two grid.
 */
export function ProjectOverview({
  overview,
  hero,
  gallery,
}: {
  overview: Overview;
  hero: ResolvedMedia | null;
  gallery: ImageMedia[];
}) {
  const list = (
    <dl className={hero ? "grid gap-6" : "grid gap-x-12 gap-y-8 md:grid-cols-2"}>
      {ITEMS.map(({ key, label }) => (
        <div key={key}>
          <dt className="font-mono text-xs uppercase tracking-wide text-fg-faint">{label}</dt>
          <dd className="mt-1.5 text-lg text-fg">{overview[key]}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <section aria-label="Overview">
      <Container>
        {hero ? (
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
            {/* The hero is the LCP candidate, so it is the one priority image. */}
            <div className="lg:col-span-7">
              <MediaFigure
                media={hero}
                gallery={gallery}
                priority
                sizes="(min-width: 72rem) 40rem, (min-width: 64rem) 55vw, 100vw"
              />
            </div>
            <div className="lg:col-span-5">{list}</div>
          </div>
        ) : (
          list
        )}
      </Container>
    </section>
  );
}
