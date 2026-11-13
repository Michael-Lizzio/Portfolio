import type { MetadataRoute } from "next";

import { getProjects } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

/** Written to out/sitemap.xml at build time; robots.ts points crawlers at it. */
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const pages = ["/", "/projects/", "/work/", "/about/", "/contact/"];

  return [
    ...pages.map((page) => ({ url: `${SITE_URL}${page}` })),
    ...projects.map((project) => ({ url: `${SITE_URL}/projects/${project.slug}/` })),
  ];
}
