import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Static export. Every route in this app is prerendered — there are no API
   * routes, no middleware, no server actions and no revalidation — so there is
   * nothing for a server to do at runtime. `next build` writes plain HTML to
   * out/, which Cloudflare Pages serves for free with unlimited bandwidth.
   *
   * This is the line to revisit when the Supabase admin panel arrives: an
   * authenticated write path needs a server, at which point this becomes
   * `@opennextjs/cloudflare` on Workers. See README.
   */
  output: "export",

  images: {
    /**
     * Next's image optimizer is a server feature and cannot run in an export.
     * That costs us little here: scripts/compress-media.mjs already caps images
     * at 1800px and converts them to WebP before they are ever committed, so
     * the bytes on disk are close to what the optimizer would have produced.
     */
    unoptimized: true,
  },

  /**
   * Trailing slashes produce out/work/foosball/index.html rather than
   * out/work/foosball.html, which is the layout Cloudflare Pages resolves most
   * predictably for nested routes.
   */
  trailingSlash: true,

  /**
   * NOTE: `redirects()` does not run in a static export — it needs a server.
   * The legacy GitHub Pages URLs are redirected by public/_redirects instead,
   * which Cloudflare Pages reads natively. Keep the two in sync if either
   * changes.
   */
};

export default nextConfig;
