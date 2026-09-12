import Image from "next/image";
import type { Media } from "@/lib/schema";

/**
 * Media inside an article. `media.src` and `media.poster` arrive already
 * rewritten to public `/media/<slug>/...` URLs — this component never does
 * path math.
 *
 * Defaults to the 45rem reading column, which is where most figures live. A
 * route that lays figures out in a wider grid must pass its own `sizes` — a
 * 3-up gallery in the page column is a ~22rem slot, and the default would
 * fetch roughly 4x the pixels it needs.
 */
const SIZES = "(min-width: 48rem) 45rem, 100vw";

/**
 * Nominal intrinsic size. The content model has no width/height, so this only
 * supplies an aspect ratio for the space reserved before the file loads; the
 * `h-auto` below (and Tailwind's preflight) hands the real ratio back to the
 * image the moment it arrives. Adding width/height to MediaSchema would remove
 * that one reflow.
 */
const NOMINAL_WIDTH = 1600;
const NOMINAL_HEIGHT = 900;

export function MediaFigure({
  media,
  priority = false,
  sizes = SIZES,
}: {
  media: Media;
  priority?: boolean;
  /** Override when the figure is not in the 45rem prose column. */
  sizes?: string;
}) {
  return (
    <figure>
      <div className="overflow-hidden rounded-md border border-border-default bg-bg-subtle">
        {media.kind === "video" ? (
          <video
            className="block h-auto w-full"
            src={media.src}
            // poster is null for any video the media pipeline has not framed yet.
            poster={media.poster ?? undefined}
            aria-label={media.alt ?? undefined}
            controls
            playsInline
            preload="metadata"
          />
        ) : (
          <Image
            className="block h-auto w-full"
            src={media.src}
            // alt is nullable in the schema; a null alt means decorative.
            alt={media.alt ?? ""}
            width={NOMINAL_WIDTH}
            height={NOMINAL_HEIGHT}
            sizes={sizes}
            priority={priority}
          />
        )}
      </div>

      {media.caption ? (
        <figcaption className="mt-3 text-sm text-fg-muted">{media.caption}</figcaption>
      ) : null}
    </figure>
  );
}
