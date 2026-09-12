# Contributing

This is Michael's portfolio. Two kinds of change land here, and they have different rules.

**Adding or editing a project → read [AGENTS.md](./AGENTS.md).** That is the full recipe, and it is
written for the coding agents doing the bulk of this work. Don't reinvent the steps from memory.

---

## Setup

```bash
npm ci          # Node 24+ (node -v should say v24.x)
npm run dev     # http://localhost:3000
```

## The ninety-second version

```bash
git checkout -b project/rpi-doorbell
npm run new:project -- rpi-doorbell
cp shots/*.webp content/projects/rpi-doorbell/media/
npm run media -- rpi-doorbell
$EDITOR content/projects/rpi-doorbell/project.json
npm run validate && npm run build
```

One project per branch. One project per PR. Branch name `project/<slug>`.

## The model, in one paragraph

A project is **one folder**: `content/projects/<slug>/project.json` plus `media/` next to it. There
is no index file and no per-project route — the site lists whatever directories exist. That is why
several agents can add projects at the same time on different machines and never conflict: their
diffs don't overlap. The guarantee holds exactly as long as nobody edits shared files
(`package.json`, `package-lock.json`, `src/**`, `content/profile.json`) in a content PR.

Media paths inside `project.json` are relative (`"media/cover.webp"`) and get rewritten to
`/media/<slug>/cover.webp` by the build. Never write the public path by hand.

## Switches you own

- `published` defaults to `false`. Agents leave it `false`. **You** flip it to `true` when a page is
  good enough to be on the live site. Everything else is staged in the repo, invisible, costing
  nothing.
- `featured` promotes a project to the top of `/work` and onto the homepage. Also yours.

Flipping either is a one-line edit — `content/projects/<slug>/project.json` — and can go straight to
`main`.

## Reviewing an agent's PR

The PR checklist covers the mechanics; CI enforces `validate`, `typecheck`, `lint`, `build` and the
8 MB media ceiling. What CI cannot check, and what you should:

1. `git diff --stat main...HEAD` — does it touch anything outside
   `content/projects/<slug>/` and `public/media/<slug>/`? If yes, send it back.
2. **Are the screenshots actually of this project?** The old site shipped one project's videos on
   another project's page. Assume nothing.
3. **Does the copy claim anything the agent couldn't have observed?** A language in `tech`, a repo
   link, a date. Read `notes` — that's where the agent is required to record what it wasn't sure of.
4. Does it read like you?

## Editing the site itself

Components (`src/components/`), styles (`src/app/globals.css`), routes (`src/app/`), the data layer
(`src/lib/content.ts`), and the scripts in `scripts/` are all normal code changes — separate branch,
separate PR, keep them out of content PRs. `src/lib/schema.ts` is the content contract: changing it
means every `project.json` has to still validate, so change it deliberately and run
`npm run validate` immediately.

Content lives behind `src/lib/content.ts` on purpose — it's the seam for moving to Supabase later.
See [docs/CONTENT_MODEL.md](./docs/CONTENT_MODEL.md).

## Deploying

Vercel builds `main`. Merging is deploying. See the README.
