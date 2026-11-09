"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";

import type { ProjectCardData } from "@/lib/project-card";
import {
  INITIAL_VISIBLE,
  compareProjectsByDate,
  compareProjectsByRelevance,
} from "@/lib/project-order";
import { ProjectCard } from "./ProjectCard";

type SortMode = "relevance" | "date-desc" | "date-asc";

function sortStatus(mode: SortMode): string {
  if (mode === "date-desc") return "Projects sorted by date, newest first.";
  if (mode === "date-asc") return "Projects sorted by date, oldest first.";
  return "Projects sorted by relevance.";
}

/**
 * The project grid, on /projects and on the home page. "Best first" shows the
 * ranked list from project-order.ts and keeps everything past `initialVisible`
 * behind "Load more". The hidden cards are still in the HTML (with `hidden`), so
 * every project page stays linked for crawlers and for anyone without
 * JavaScript. Sorting by date shows everything, because a timeline with gaps in
 * it would be misleading. The home page turns the sort control off.
 */
export function ProjectGrid({
  projects,
  initialVisible = INITIAL_VISIBLE,
  sortable = true,
  moreNote,
}: {
  /** Card data only (toProjectCardData). Whole projects would leak into the page source. */
  projects: ProjectCardData[];
  initialVisible?: number;
  sortable?: boolean;
  /** Something small beside the "Load more" button (the home page's marker note). */
  moreNote?: ReactNode;
}) {
  const [sortMode, setSortMode] = useState<SortMode>("relevance");
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  const orderedProjects = useMemo(() => {
    const ordered = [...projects];

    if (sortMode === "date-desc") {
      return ordered.sort((a, b) => compareProjectsByDate(a, b, "desc"));
    }
    if (sortMode === "date-asc") {
      return ordered.sort((a, b) => compareProjectsByDate(a, b, "asc"));
    }
    return ordered.sort(compareProjectsByRelevance);
  }, [projects, sortMode]);

  const dateAscending = sortMode === "date-asc";
  const limited = sortMode === "relevance" && !expanded;
  const hiddenCount = limited ? Math.max(orderedProjects.length - initialVisible, 0) : 0;

  function loadMore() {
    setExpanded(true);
    // Keyboard and screen-reader users land on the first card that just appeared,
    // instead of on a button that no longer exists.
    requestAnimationFrame(() => {
      listRef.current
        ?.querySelectorAll<HTMLAnchorElement>("li > article > a")
        [initialVisible]?.focus();
    });
  }

  function toggleDateSort() {
    setSortMode((current) => (current === "date-desc" ? "date-asc" : "date-desc"));
  }

  const controlClass = (active: boolean) =>
    `inline-flex h-9 items-center gap-1.5 rounded-sm px-3 text-sm font-medium transition-colors ${
      active
        ? "bg-surface text-fg shadow-card"
        : "text-fg-muted hover:bg-surface-hover hover:text-fg"
    }`;

  return (
    <>
      {sortable ? (
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border-default pb-5">
        <span id="project-sort-label" className="text-sm font-medium text-fg-muted">
          Sort by
        </span>

        <div
          role="group"
          aria-labelledby="project-sort-label"
          className="inline-flex gap-1 rounded-md border border-border-default bg-bg-subtle p-1"
        >
          <button
            type="button"
            aria-pressed={sortMode === "relevance"}
            className={controlClass(sortMode === "relevance")}
            onClick={() => setSortMode("relevance")}
          >
            Best first
          </button>
          <button
            type="button"
            aria-pressed={sortMode !== "relevance"}
            className={controlClass(sortMode !== "relevance")}
            onClick={toggleDateSort}
            title={dateAscending ? "Oldest first; click for newest first" : "Newest first; click for oldest first"}
          >
            Date
            <span aria-hidden="true" className="font-mono text-xs">
              {dateAscending ? "↑" : "↓"}
            </span>
          </button>
        </div>
      </div>
      ) : null}

      {sortable ? (
        <p className="sr-only" aria-live="polite">
          {sortStatus(sortMode)}
        </p>
      ) : null}

      <ul ref={listRef} className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {orderedProjects.map((project, index) => (
          <li key={project.slug} className="min-w-0" hidden={limited && index >= initialVisible}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>

      {hiddenCount > 0 ? (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <button type="button" className="btn btn-outline" onClick={loadMore}>
            Load more projects ({hiddenCount})
          </button>
          {moreNote}
        </div>
      ) : null}
    </>
  );
}
