import type { ReactNode } from "react";

/** A static label. Not a link, not a filter, not a button. */
export function TechPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-accent-border bg-accent-surface px-2.5 py-0.5 text-xs font-medium text-accent">
      {children}
    </span>
  );
}
