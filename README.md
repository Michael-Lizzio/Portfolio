# Portfolio

Michael Lizzio's portfolio — the projects, and the story behind each one.

A Next.js App Router site that renders its content from flat files in `content/`. Every project is a
folder; there is no CMS, no database, and no index file to keep in sync.

## Stack

- **Next.js 16** (App Router, React Server Components) · **React 19**
- **TypeScript**, strict
- **Tailwind CSS v4** — tokens declared with `@theme` in `src/app/globals.css`; there is no
  `tailwind.config.js`
- **zod 4** — `src/lib/schema.ts` is the content contract, and every content type is inferred from it
- Content as JSON on disk, media served from `public/`

## Run it

Node **24+**.

```bash
npm ci
npm run dev        # http://localhost:3000
```

| Script | |
|---|---|
| `npm run dev` | dev server |
| `npm run build` / `npm start` | production build / serve |
| `npm run validate` | check all content against the schema |
| `npm run typecheck` | route types + `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run new:project -- <slug>` | scaffold a new project folder |
| `npm run media -- <slug>` | compress a project's media in place and generate video posters |

## How content works

```
content/
  profile.json              # name, bio, links, résumé
  projects/
    cryptogram/
      project.json          # all the copy, and which media goes where
      media/                # the images and videos, co-located with the project
```

- **One folder per project.** The site lists whatever directories exist under `content/projects/`.
  Adding a project is adding a folder — no registry to update, no route to write. Two people (or two
  agents on two machines) can add two projects without ever touching the same file.
- **Media paths are relative.** `"media/cover.webp"` in `project.json` is copied to
  `public/media/cryptogram/cover.webp` by `npm run build` — the `prebuild` hook runs
  `scripts/sync-media.mjs`, and only for `published: true` projects — and rewritten to the public URL
  `/media/cryptogram/cover.webp` before any component sees it. `npm run media` does something
  different: it compresses the files in `content/`, and never writes to `public/`.
- **`published: false` is the default.** Work can be merged and left staged; it appears on the site
  only when the flag is flipped. `featured: true` promotes a project to the homepage.
- **`src/lib/content.ts` is the only module that reads the filesystem for content.** Everything else
  imports from it. That indirection is the seam for moving this to Supabase later — see
  [docs/CONTENT_MODEL.md](docs/CONTENT_MODEL.md).

`npm run validate` checks every file against `src/lib/schema.ts` and is the first thing CI runs.

## Adding a project

**[AGENTS.md](AGENTS.md)** is the full, executable recipe — written for coding agents, and the right
thing for a human to follow too. The short version is in [CONTRIBUTING.md](CONTRIBUTING.md).

Every PR runs `validate`, `typecheck`, `lint` and `build`, and fails on any media file over 8 MB.

## Deploy

Vercel, from `main` — merging is deploying.

First-time setup: import the repo at [vercel.com/new](https://vercel.com/new). Framework preset
**Next.js**, build command `npm run build`, install command `npm ci`, Node **24.x** under
*Settings → General → Node.js Version*. No environment variables are required — the content is in
the repo. Pull requests get preview deployments automatically.

## Layout

```
src/app/          routes (/, /work, /work/[slug], /about, /contact) and globals.css
src/components/   Container, SiteNav, SiteFooter, PageHeader, ProjectCard, MediaFigure, TechPill, Prose
src/lib/          schema.ts (the zod contract) and content.ts (the only content reader)
scripts/          new-project, sync-media, validate-content
content/          the actual content
docs/             CONTENT_MODEL.md — the schema in prose
```
