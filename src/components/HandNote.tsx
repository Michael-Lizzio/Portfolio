import type { ReactNode } from "react";

type Marker = "blue" | "red" | "green";

const COLOR: Record<Marker, string> = {
  blue: "text-marker-blue",
  red: "text-marker-red",
  green: "text-marker-green",
};

/**
 * A short handwritten aside, like a note in marker on a whiteboard.
 *
 * Use sparingly: a few per page at most, a handful of words each, and never for
 * anything a visitor has to read to understand the page. They are decorative
 * asides, so they stay in the text flow for screen readers but carry no
 * information that isn't said elsewhere.
 */
export function HandNote({
  children,
  marker = "blue",
  tilt = -2,
  className,
}: {
  children: ReactNode;
  marker?: Marker;
  /** Degrees. Small numbers only (-4 to 4). */
  tilt?: number;
  className?: string;
}) {
  return (
    <span
      className={["inline-block font-hand text-2xl font-semibold leading-none", COLOR[marker], className]
        .filter(Boolean)
        .join(" ")}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {children}
    </span>
  );
}

/**
 * A word with a hand-drawn marker loop around it ("Apps I've (shipped)").
 * The loop is decoration only, so it is hidden from assistive tech.
 */
export function Circled({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block px-1">
      {children}
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 200 80"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -left-[8%] -top-[30%] h-[160%] w-[116%] overflow-visible text-marker-red"
      >
        <path
          d="M18 40 C 16 12, 180 6, 188 36 C 196 66, 30 78, 12 50 C 6 38, 40 18, 70 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}
