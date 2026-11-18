import type { Metadata } from "next";

import { getProfile } from "./content";

/**
 * The site's public origin, used for every absolute URL the build writes:
 * canonical links, og:url, og:image / twitter:image, and the sitemap.
 *
 * The same out/ folder is served from two places - Cloudflare Pages (the
 * primary, at the custom domain michaeljlizzio.com, which michaeljlizzio.pages.dev
 * also serves and michaellizzio.com redirects to) and the
 * michael-lizzio.github.io mirror - so this is always the primary. On the
 * mirror, canonical points back to the primary on purpose: search engines
 * index one copy, and share images load from a domain that is always up to
 * date. NEXT_PUBLIC_SITE_URL overrides it.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://michaeljlizzio.com").replace(
  /\/+$/,
  "",
);

/** The default share card (1200x630), for every page without its own cover. */
export const DEFAULT_SHARE_IMAGE = {
  url: "/images/share.png",
  width: 1200,
  height: 630,
} as const;

/**
 * The site-wide Open Graph block. A page that sets openGraph replaces the
 * layout's whole block (Next.js does not merge nested metadata), so pages that
 * need their own og:url build it here instead of losing the title, image and
 * site name. Pass the page's path for an absolute og:url (via metadataBase).
 */
export async function siteOpenGraph(url?: string): Promise<NonNullable<Metadata["openGraph"]>> {
  const profile = await getProfile();
  const title = `${profile.name} · ${profile.headline}`;

  return {
    type: "website",
    siteName: profile.name,
    title,
    description: profile.bio,
    ...(url ? { url } : {}),
    images: [{ ...DEFAULT_SHARE_IMAGE, alt: title }],
  };
}
