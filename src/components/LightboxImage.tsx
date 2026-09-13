import Image from "next/image";

import type { ResolvedMedia } from "@/lib/schema";

type ImageMedia = ResolvedMedia & { kind: "image" };

export function LightboxImage({
  media,
  galleryIndex,
  priority,
  sizes,
}: {
  media: ImageMedia;
  galleryIndex: number;
  priority: boolean;
  sizes: string;
}) {
  return (
    <a
      id={`project-image-trigger-${galleryIndex}`}
      href={`#project-image-${galleryIndex}`}
      className="group block w-full cursor-zoom-in text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      aria-label={`Enlarge ${media.alt ?? "image"}`}
    >
      <Image
        className="block h-auto w-full motion-safe:transition group-hover:opacity-90"
        src={media.src}
        alt={media.alt ?? ""}
        width={media.width ?? 1600}
        height={media.height ?? 900}
        sizes={sizes}
        priority={priority}
      />
    </a>
  );
}
