/**
 * The portfolio owner's deliberate presentation order, and the one place that
 * decides what a visitor sees first.
 *
 * "Relevant" means the projects Michael wants a visitor to meet first, not
 * newest. The first INITIAL_VISIBLE slugs show on /projects straight away; the
 * rest sit behind "Load more". New slugs that are not placed here fall to the
 * end in title order, so they land behind "Load more" until someone ranks them.
 *
 * Ranking agreed November 2026: the three shipped apps first, then the strongest
 * stories and internship work, then smaller and older projects. The last six
 * are the ones Michael named as not worth front placement.
 */
export const RELEVANCE_ORDER = [
  // The three apps.
  "engine-miles",
  "burrow",
  "relayreply",
  // Shown before "Load more".
  "calcardo",
  "ai-database-filter",
  "foosball",
  "cryptogram",
  "document-management-system",
  "alarm-system",
  "parcel-web-analyzer",
  "cyber-ttm",
  "blackjack",
  // Behind "Load more".
  "symposium",
  "wordle-solver",
  "web-browser-mcp",
  "wasted-asphalt",
  "u-fund",
  "sudoku-creator",
  "warm-cold-square",
  "agentic-report-generator",
  "legacy-data-cleanup",
  "duolingo-hack",
  "trip-planner",
  "rit-dining-notifications",
  "rit-laundry-tracker",
  "roman-numerals",
  "one-line-rock-paper-scissors",
  "tic-tac-toe",
] as const;

/** How many projects /projects shows before the "Load more" button. */
export const INITIAL_VISIBLE = 12;

type OrderableProject = {
  slug: string;
  title: string;
  date: string | null;
  endDate: string | "present" | null;
};

const relevanceRank = new Map<string, number>(
  RELEVANCE_ORDER.map((slug, index) => [slug, index]),
);

export function compareProjectsByRelevance(
  a: Pick<OrderableProject, "slug" | "title">,
  b: Pick<OrderableProject, "slug" | "title">,
): number {
  const rankA = relevanceRank.get(a.slug) ?? Number.POSITIVE_INFINITY;
  const rankB = relevanceRank.get(b.slug) ?? Number.POSITIVE_INFINITY;

  return rankA - rankB || a.title.localeCompare(b.title) || a.slug.localeCompare(b.slug);
}

/** Keep undated work at the end in either direction; relevance breaks date ties. */
export function compareProjectsByDate(
  a: OrderableProject,
  b: OrderableProject,
  direction: "asc" | "desc",
): number {
  if (a.date === null) return 1;
  if (b.date === null) return -1;

  const dateA = direction === "desc" ? (a.endDate ?? a.date) : a.date;
  const dateB = direction === "desc" ? (b.endDate ?? b.date) : b.date;

  if (dateA === dateB) return compareProjectsByRelevance(a, b);
  if (dateA === "present") return -1;
  if (dateB === "present") return 1;

  return direction === "desc" ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
}
