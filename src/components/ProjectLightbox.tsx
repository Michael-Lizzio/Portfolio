import Image from "next/image";

import type { ResolvedMedia } from "@/lib/schema";

type ImageMedia = ResolvedMedia & { kind: "image" };

function wrap(index: number, length: number): number {
  return (index + length) % length;
}

/**
 * A hash-target gallery works before React hydrates and when JavaScript is
 * disabled. That makes the portfolio's most basic interaction dependable in
 * dev previews, static exports, and the deployed site alike.
 */
export function ProjectLightbox({ gallery }: { gallery: ImageMedia[] }) {
  if (gallery.length === 0) return null;

  return (
    <div aria-label="Project image viewer">
      {gallery.map((media, index) => {
        const previous = wrap(index - 1, gallery.length);
        const next = wrap(index + 1, gallery.length);
        const canCycle = gallery.length > 1;

        return (
          <div
            id={`project-image-${index}`}
            key={media.src}
            role="dialog"
            aria-modal="true"
            aria-label={`Image ${index + 1} of ${gallery.length}`}
            className="fixed inset-0 z-[100] hidden items-center justify-center bg-n-950/95 p-4 text-white target:flex"
          >
            <a
              href={`#project-image-trigger-${index}`}
              className="absolute inset-0"
              aria-label="Close image viewer"
            />

            <a
              href={`#project-image-trigger-${index}`}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/50 text-2xl hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Close image viewer"
            >
              <span aria-hidden="true">×</span>
            </a>

            {canCycle ? (
              <a
                href={`#project-image-${previous}`}
                className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/50 text-2xl hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:left-6"
                aria-label="Previous image"
              >
                <span aria-hidden="true">←</span>
              </a>
            ) : null}

            <figure className="relative z-[1] flex max-h-full max-w-[calc(100vw-2rem)] flex-col items-center gap-3 sm:max-w-[calc(100vw-8rem)]">
              <Image
                className="h-auto max-h-[78vh] w-auto max-w-full rounded-md object-contain"
                src={media.src}
                alt={media.alt ?? ""}
                width={media.width ?? 1600}
                height={media.height ?? 900}
                sizes="100vw"
              />
              <figcaption className="max-w-prose text-center text-sm text-white/80">
                {media.caption ? <span>{media.caption} · </span> : null}
                <span>
                  {index + 1} of {gallery.length}
                </span>
              </figcaption>
            </figure>

            {canCycle ? (
              <a
                href={`#project-image-${next}`}
                className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/50 text-2xl hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:right-6"
                aria-label="Next image"
              >
                <span aria-hidden="true">→</span>
              </a>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
