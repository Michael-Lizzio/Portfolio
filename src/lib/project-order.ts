/**
 * The portfolio owner's deliberate presentation order.
 *
 * This is separate from dates: "relevant" means the projects Michael wants a
 * visitor to encounter first, not newest or featured. New slugs that are not
 * yet placed here fall to the end in title order.
 */
export const RELEVANCE_ORDER = [
  "calcardo",
  "parcel-web-analyzer",
  "cyber-ttm",
  "alarm-system",
  "ai-database-filter",
  "web-browser-mcp",
  "symposium",
  "document-management-system",
  "foosball",
  "cryptogram",
  "wasted-asphalt",
  "trip-planner",
  "u-fund",
  "blackjack",
  "rit-dining-notifications",
  "wordle-solver",
  "sudoku-creator",
  "roman-numerals",
  "rit-laundry-tracker",
  "tic-tac-toe",
  "warm-cold-square",
  "one-line-rock-paper-scissors",
  "legacy-data-cleanup",
  "agentic-report-generator",
  "duolingo-hack",
] as const;

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
