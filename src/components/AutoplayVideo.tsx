"use client";

import { useEffect, useRef } from "react";

/**
 * A muted, looping video that plays while at least half of it is on screen and
 * pauses when it scrolls away. Controls stay on, so a visitor can still pause,
 * scrub or unmute.
 *
 * Reduced motion: the observer is never attached, so the video behaves like any
 * other click-to-play video. If the browser blocks autoplay anyway, play()
 * rejects and the video simply waits for a click.
 */
export function AutoplayVideo({
  src,
  poster,
  label,
}: {
  src: string;
  poster?: string;
  label?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    // Set the property as well as the attribute: some browsers only honour
    // muted autoplay when the DOM property is true before play() is called.
    video.muted = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          video.play().catch(() => {
            /* Autoplay refused: leave it for the visitor to start. */
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="block h-auto w-full"
      src={src}
      poster={poster}
      aria-label={label}
      controls
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}
