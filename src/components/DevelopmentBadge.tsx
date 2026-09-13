import type { Project } from "@/lib/schema";

type Development = NonNullable<Project["development"]>;

const LABELS: Record<Development, string> = {
  "human-led": "Human-led",
  "ai-assisted": "AI-assisted",
  "ai-generated": "AI-generated",
};

const DESCRIPTIONS: Record<Development, string> = {
  "human-led": "The implementation was written primarily by the developer.",
  "ai-assisted": "The implementation was human-led with AI used as a development tool.",
  "ai-generated": "Most of the implementation was generated with AI under human direction.",
};

/** A quiet disclosure about how a project was implemented. */
export function DevelopmentBadge({ development }: { development: Development }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-surface px-2 py-0.5 font-mono text-[0.6875rem] text-fg-faint"
      title={DESCRIPTIONS[development]}
    >
      <span aria-hidden="true" className="size-1 rounded-full bg-current opacity-60" />
      {LABELS[development]}
    </span>
  );
}
