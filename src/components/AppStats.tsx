import type { AppStats as AppStatsData } from "@/lib/schema";

/** After this many days without an update, "updated daily" would be a fib, so the date shows instead. */
const STALE_AFTER_DAYS = 3;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function freshness(updatedAt: string, now: Date): string {
  const day = updatedAt.slice(0, 10);
  const [year, month, date] = day.split("-").map(Number);
  const updated = Date.UTC(year, month - 1, date);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const age = Math.round((today - updated) / 86_400_000);
  return age <= STALE_AFTER_DAYS ? "updated daily" : `as of ${MONTHS[month - 1]} ${date}`;
}

/**
 * "90+ users · 9 sales · updated daily", from public/stats.json. Rounded on
 * purpose: the totals are a sense of scale, not a dashboard. Renders nothing
 * without stats, so an app with no data simply has no line.
 *
 * The site is static, so "now" is the build time. Stats only change through a
 * commit, which rebuilds the site, so the two always agree.
 */
export function AppStats({
  stats,
  className = "",
}: {
  stats: AppStatsData | null;
  className?: string;
}) {
  if (!stats) return null;

  const salesWord = stats.sales === 1 ? "sale" : "sales";
  const when = freshness(stats.updated_at, new Date());

  return (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-muted ${className}`}>
      <span>
        <span className="font-semibold tabular-nums text-fg">{stats.users_rounded}</span> users
      </span>
      <span aria-hidden="true" className="text-fg-faint">
        ·
      </span>
      <span>
        <span className="font-semibold tabular-nums text-fg">{stats.sales}</span> {salesWord}
      </span>
      <span aria-hidden="true" className="text-fg-faint">
        ·
      </span>
      <span className="text-fg-faint">{when}</span>
    </p>
  );
}
