"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

export type HeroSlide = {
  slug: string;
  title: string;
  status: string | null;
  src: string;
  width: number;
  height: number;
  alt: string;
};

/** Slow on purpose: long enough to read the name and look at the picture. */
const ADVANCE_MS = 6500;
/** How far a finger has to travel before it counts as a swipe. */
const SWIPE_PX = 40;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * The home page hero's slideshow of the apps: the name on top, the picture, and
 * a "View project" link under it.
 *
 * It moves on by itself every few seconds, and stops while the pointer is over
 * it, while anything in it has keyboard focus, while the tab is hidden, after
 * the pause button, and always for people who ask for reduced motion. Arrow
 * buttons sit on both sides, the arrow keys work while focus is inside, and on
 * a phone you can swipe. Slides that are off screen are inert, so the tab order
 * only ever reaches the visible slide's link.
 */
export function HeroCarousel({ slides, label }: { slides: HeroSlide[]; label: string }) {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reduced = usePrefersReducedMotion();
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const count = slides.length;
  const wrap = useCallback((i: number) => ((i % count) + count) % count, [count]);
  const go = useCallback((next: number) => setIndex(wrap(next)), [wrap]);
  /** Relative moves read the latest index, so two quick clicks move two slides. */
  const step = useCallback((delta: number) => setIndex((current) => wrap(current + delta)), [wrap]);

  useEffect(() => {
    const update = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  const rotating = count > 1 && !userPaused && !reduced;
  const moving = rotating && !hovering && !focused && !hidden;

  useEffect(() => {
    if (!moving) return;
    const timer = window.setTimeout(() => step(1), ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [moving, index, step]);

  if (count === 0) return null;

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") return;
    swipeStart.current = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
  }

  const arrowClass =
    "pointer-events-auto flex size-10 items-center justify-center rounded-full border border-border-default bg-surface/95 text-fg shadow-raised backdrop-blur hover:bg-surface-hover motion-safe:transition";

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
      onKeyDown={onKeyDown}
    >
      <div className="overflow-hidden" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (swipeStart.current = null)} style={{ touchAction: "pan-y" }}>
        <div
          className="flex motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
          aria-live={rotating ? "off" : "polite"}
        >
          {slides.map((slide, i) => {
            const current = i === index;
            return (
              <div
                key={slide.slug}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}: ${slide.title}`}
                aria-hidden={!current}
                inert={!current}
                className="w-full shrink-0"
              >
                <div className="flex h-8 items-baseline gap-2.5">
                  <p className="text-lg font-semibold tracking-tight text-fg">{slide.title}</p>
                  {slide.status ? <span className="text-sm text-fg-muted">{slide.status}</span> : null}
                </div>

                <Link
                  href={`/projects/${slide.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="mt-3 block overflow-hidden rounded-lg border border-border-default bg-surface"
                  draggable={false}
                >
                  <Image
                    className="aspect-[1200/630] w-full object-cover"
                    src={slide.src}
                    alt={slide.alt}
                    width={slide.width}
                    height={slide.height}
                    sizes="(min-width: 64rem) 36rem, 100vw"
                    loading="eager"
                    priority={i === 0}
                    draggable={false}
                  />
                </Link>

                <div className="mt-4 flex h-10 items-center">
                  <Link className="link text-sm font-medium" href={`/projects/${slide.slug}`}>
                    View project<span className="sr-only">: {slide.title}</span>
                    <span aria-hidden="true"> →</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {count > 1 ? (
        <>
          {/* The arrows sit over the picture's left and right edges. The box below is
              exactly the picture: the 2rem title row, the 0.75rem gap, then 1200:630. */}
          <div className="pointer-events-none absolute inset-x-0 top-11 flex aspect-[1200/630] items-center justify-between px-2 lg:-mx-5 lg:px-0">
            <button type="button" className={arrowClass} onClick={() => step(-1)} aria-label="Previous app">
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3.5 5.5 8l4.5 4.5" />
              </svg>
            </button>
            <button type="button" className={arrowClass} onClick={() => step(1)} aria-label="Next app">
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3.5 10.5 8 6 12.5" />
              </svg>
            </button>
          </div>

          <div className="absolute bottom-0 right-0 flex h-10 items-center gap-1">
            <div className="flex items-center" role="group" aria-label="Choose an app">
              {slides.map((slide, i) => (
                <button
                  key={slide.slug}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show ${slide.title}`}
                  aria-current={i === index ? "true" : undefined}
                  className="group flex size-7 items-center justify-center rounded-full"
                >
                  <span
                    aria-hidden="true"
                    className={`block h-1.5 rounded-full motion-safe:transition-all ${
                      i === index ? "w-5 bg-accent" : "w-1.5 bg-[var(--border-control)] group-hover:bg-fg-muted"
                    }`}
                  />
                </button>
              ))}
            </div>

            {!reduced ? (
              <button
                type="button"
                onClick={() => setUserPaused((paused) => !paused)}
                aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
                className="flex size-8 items-center justify-center rounded-full text-fg-muted hover:bg-surface-hover hover:text-fg"
              >
                {userPaused ? (
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="currentColor">
                    <path d="M5 3.2v9.6a.5.5 0 0 0 .76.43l7.6-4.8a.5.5 0 0 0 0-.86l-7.6-4.8A.5.5 0 0 0 5 3.2Z" />
                  </svg>
                ) : (
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="currentColor">
                    <rect x="4" y="3" width="2.75" height="10" rx="0.75" />
                    <rect x="9.25" y="3" width="2.75" height="10" rx="0.75" />
                  </svg>
                )}
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}
