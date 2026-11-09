import type { Diagram } from "@/lib/schema";

/**
 * A flow diagram drawn as HTML instead of a picture: boxes and arrows from the
 * content file. Because it is plain text in the page's own colors, it reads the
 * same in light and dark mode, scales with the text size, and a screen reader
 * gets it as an ordered list.
 *
 * Up to four steps run left to right from md up. Five or more run top to bottom
 * everywhere, since five boxes in a row would be too narrow to read. Below md
 * every diagram runs top to bottom.
 */
const HORIZONTAL_MAX_STEPS = 4;

export function FlowDiagram({ diagram }: { diagram: Diagram }) {
  const horizontal = diagram.steps.length <= HORIZONTAL_MAX_STEPS;

  return (
    <figure className="rounded-md border border-border-default bg-bg-subtle p-5 sm:p-8">
      <ol
        aria-label={diagram.label}
        className={horizontal ? "flex flex-col md:flex-row md:items-stretch" : "flex flex-col"}
      >
        {diagram.steps.map((step, index) => (
          <li
            key={index}
            className={
              horizontal
                ? "flex flex-col items-stretch md:min-w-0 md:flex-1 md:flex-row md:items-center"
                : "flex flex-col items-stretch"
            }
          >
            {index > 0 ? <Arrow label={step.arrow} horizontal={horizontal} /> : null}
            <ul
              className={
                horizontal
                  ? "flex flex-wrap justify-center gap-3 md:min-w-0 md:flex-1 md:flex-col md:flex-nowrap"
                  : "flex flex-wrap justify-center gap-3"
              }
            >
              {step.nodes.map((node) => (
                <li
                  key={node.title}
                  className="min-w-0 flex-1 basis-40 rounded-md border border-accent-border bg-surface px-4 py-3 text-center shadow-card md:basis-auto"
                >
                  <span className="block font-medium text-fg">{node.title}</span>
                  {node.detail ? (
                    <span className="mt-1 block text-sm text-fg-muted">{node.detail}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {diagram.caption ? (
        <figcaption className="mt-5 text-center text-sm text-fg-muted">{diagram.caption}</figcaption>
      ) : null}
    </figure>
  );
}

function Arrow({ label, horizontal }: { label: string | null; horizontal: boolean }) {
  return (
    <div
      className={
        horizontal
          ? "flex shrink-0 items-center justify-center gap-2 py-2 text-accent md:w-14 md:flex-col md:gap-1 md:px-1 md:py-0"
          : "flex shrink-0 items-center justify-center gap-2 py-2 text-accent"
      }
    >
      <ArrowIcon direction="down" className={horizontal ? "md:hidden" : undefined} />
      {horizontal ? <ArrowIcon direction="right" className="hidden md:block" /> : null}
      {label ? (
        <span
          className={
            horizontal
              ? "font-mono text-xs text-fg-muted md:order-first md:whitespace-nowrap md:text-center"
              : "font-mono text-xs text-fg-muted"
          }
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

function ArrowIcon({ direction, className }: { direction: "down" | "right"; className?: string }) {
  // Drawn pointing down; the right-pointing one is the same path, rotated.
  return (
    <svg
      aria-hidden="true"
      className={["size-6 shrink-0", direction === "right" ? "-rotate-90" : "", className]
        .filter(Boolean)
        .join(" ")}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 4v15" />
      <path d="m6 13 6 6 6-6" />
    </svg>
  );
}
