"use client";

import { useMemo, useState } from "react";

import type { ResolvedProject } from "@/lib/schema";
import { compareProjectsByDate, compareProjectsByRelevance } from "@/lib/project-order";
import { ProjectCard } from "./ProjectCard";

type SortMode = "relevance" | "date-desc" | "date-asc";

function sortStatus(mode: SortMode): string {
  if (mode === "date-desc") return "Projects sorted by date, newest first.";
  if (mode === "date-asc") return "Projects sorted by date, oldest first.";
  return "Projects sorted by relevance.";
}

export function WorkProjectGrid({ projects }: { projects: ResolvedProject[] }) {
  const [sortMode, setSortMode] = useState<SortMode>("relevance");

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
            Relevant
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

      <p className="sr-only" aria-live="polite">
        {sortStatus(sortMode)}
      </p>

      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {orderedProjects.map((project) => (
          <li key={project.slug}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </>
  );
}
