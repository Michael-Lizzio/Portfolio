/**
 * The site's public origin, used for every absolute URL the build writes:
 * canonical links, og:url, og:image / twitter:image, and the sitemap.
 *
 * The same out/ folder is served from two places - Cloudflare Pages (the
 * primary) and the michael-lizzio.github.io mirror - so this is always the
 * primary. On the mirror, canonical points back to the primary on purpose:
 * search engines index one copy, and share images load from a domain that is
 * always up to date. NEXT_PUBLIC_SITE_URL overrides it (e.g. a custom domain).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://michaeljlizzio.pages.dev").replace(
  /\/+$/,
  "",
);

/** The default share card (1200x630), for every page without its own cover. */
export const DEFAULT_SHARE_IMAGE = {
  url: "/images/share.png",
  width: 1200,
  height: 630,
} as const;
