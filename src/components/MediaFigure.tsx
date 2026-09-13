import { LightboxImage } from "@/components/LightboxImage";
import type { ResolvedMedia } from "@/lib/schema";

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

type ImageMedia = ResolvedMedia & { kind: "image" };

export function MediaFigure({
  media,
  priority = false,
  sizes = SIZES,
  gallery = [],
}: {
  media: ResolvedMedia;
  priority?: boolean;
  /** Override when the figure is not in the 45rem prose column. */
  sizes?: string;
  /** All project images, in reading order, for previous/next lightbox controls. */
  gallery?: ImageMedia[];
}) {
  const galleryIndex =
    media.kind === "image" ? gallery.findIndex((item) => item.src === media.src) : -1;

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
          <LightboxImage
            media={media as ImageMedia}
            galleryIndex={galleryIndex >= 0 ? galleryIndex : 0}
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
