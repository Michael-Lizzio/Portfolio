import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Local media is pre-compressed to WebP; these are the widths the layout asks for.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1280, 1920],
    imageSizes: [96, 160, 256, 384, 640],
  },

  // The legacy site lived on GitHub Pages with .html URLs. Keep inbound links working.
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/pages/about.html", destination: "/about", permanent: true },
      { source: "/pages/connect.html", destination: "/contact", permanent: true },
      { source: "/pages/archive.html", destination: "/work", permanent: true },
      {
        source: "/project_pages/:slug/:slug2.html",
        destination: "/work/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
