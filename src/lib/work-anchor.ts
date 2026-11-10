import type { Job } from "./schema";

/** The id of a job on /work, so the home page can link straight to it ("/work#ttm-technologies-summer-2024"). */
export function jobAnchor(job: Pick<Job, "company" | "dates">): string {
  return `${job.company}-${job.dates}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
