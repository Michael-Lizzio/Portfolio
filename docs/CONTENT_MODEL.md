# The content model

The authoritative definition is `src/lib/schema.ts` — zod schemas, from which every TypeScript type
in the site is inferred. This document is that file in prose: what each field means, what "good"
looks like, how visibility and ordering work, and why the whole thing sits behind one module.

If you are an agent adding a project, you want [AGENTS.md](../AGENTS.md) instead — it's the recipe.
This is the reference.

---

## Shape

```
content/
  profile.json                        -> Profile
  projects/
    <slug>/
      project.json                    -> Project
      media/<file>                    -> the bytes referenced by Media.src
```

One directory per project. **There is no index, manifest, or registry**, and there is no route file
per project — `/work/<slug>` is a single dynamic route fed by `getProjectSlugs()`. Adding a project
means adding a directory; removing one means deleting a directory. Nothing else in the repo has to
know.

Two consequences worth stating plainly:

- **Parallel authorship is conflict-free.** Two agents adding two projects write two disjoint sets
  of paths. There is no shared list for them to both append to, so there is nothing for git to
  merge. This is the central design decision of the content layer.
- **A malformed project is contained.** It fails `npm run validate` by name and doesn't corrupt a
  shared file.

---

## `Project` — `content/projects/<slug>/project.json`

### Identity

| Field | Type | Required | Default |
|---|---|---|---|
| `slug` | `string` | yes | — |
| `title` | `string` | yes | — |
| `tagline` | `string` | yes | — |
| `summary` | `string` | yes | — |

**`slug`** — matched against `/^[a-z0-9]+(-[a-z0-9]+)*$/` and **must equal the directory name**.
It is the URL (`/work/cryptogram`), the media namespace (`/media/cryptogram/…`), and the identity
this project carries into Supabase later, so it should never change once published. Good:
`wordle-solver`, `cyber-ttm`, `la2028`. Bad: `Wordle_Solver`, `wordle solver`, `-foo`, `foo--bar`.

**`title`** — the display name. Title case, as a person would say it: `"Cryptogram Solver"`,
`"LA28 Olympic Itinerary Planner"`.

**`tagline`** — one line, `min 1`, **`max 140`**, and realistically you want under 90 because it is
the entire body of the card on `/work`. It should say what the thing *does*, not what category it is
in. Real example: `"A backtracking program that cracks cryptogram puzzles word by word"` — you know
what it is and roughly how it works before you click.

**`summary`** — two to four sentences at the top of the detail page. The good ones answer: what is
it, how does it actually work, and what is on this page. It is the only prose many visitors read.

### Visibility and ordering

| Field | Type | Required | Default |
|---|---|---|---|
| `published` | `boolean` | no | **`false`** |
| `featured` | `boolean` | no | `false` |
| `date` | `string \| null` | no | `null` |
| `status` | `string \| null` | no | `null` |

**`published`** defaults to `false`, and that default is load-bearing. A project can be merged,
reviewed, and left sitting in the repo indefinitely without appearing anywhere on the site. It is
how work stays staged: agents add projects with `published: false`, and the owner flips the flag when
a page is ready. `getProjects()`, `getProject()` and `getProjectSlugs()` all filter to published
only, so an unpublished project has no page, no card, and no entry in `generateStaticParams` — the
URL 404s. `getAllProjects()` is the one function that includes unpublished projects; it exists for
the owner's own review surfaces.

**`featured`** promotes a project to the front of the ordering and onto the homepage.

**`date`** is `"YYYY"` or `"YYYY-MM"` (`/^\d{4}(-\d{2})?$/`) — a sortable string, not a `Date`,
because half of these projects are only datable to the year. `"2022"` and `"2024-03"` are valid;
`"March 2024"`, `"2024-3"` and `"2024-03-15"` are not. `null` means genuinely unknown, and sorts
last — that is better than a guess.

**The ordering, exactly.** `getProjects()` and `getAllProjects()` both return:

1. `featured: true` first, then the rest;
2. within each group, `date` descending — newest first;
3. `date: null` last within its group.

So a featured 2019 project outranks an unfeatured 2026 one. Featured is an editorial override, not a
recency signal.

**`status`** is a free-text badge — `"In progress"`, `"Archived"`, `"Shipped 2024"`. `null` when the
project doesn't declare one; don't invent a status to fill the field.

### Substance

| Field | Type | Required | Default |
|---|---|---|---|
| `tech` | `string[]` | no | `[]` |
| `links` | `Link[]` | no | `[]` |
| `hero` | `Media \| null` | no | `null` |
| `sections` | `Section[]` | no | `[]` |
| `notes` | `string \| null` | no | `null` |

**`tech`** — what the project is *built with*, one item per entry, rendered as pills. Not file
formats it happens to read, not tools you used to document it. Entries don't have to be single
words, but the schema caps each one at **40 characters** — they are pill labels, not sentences.
`"Frequency-ordered word lists"` is a real entry; the sentence it was condensed from belongs in a
section. An empty array is honest; a guessed language is not. If the source never says what it's
written in, leave it out and record that in `notes`.

**`links`** — `{ label, href }`. `href` is validated as a URL, so it needs the scheme:
`"https://github.com/michael-lizzio/x"` passes, `"github.com/..."` fails. Empty array when there is
no public repo or demo, which is the common case here.

**`hero`** — a single `Media` used as the page's lead image and the card image. Normally an image.
`null` is legitimate; `la2028` ships with `"hero": null` today.

**`sections`** — the body of the detail page, rendered in array order. See below.

**`notes`** — **internal, never rendered, unbounded.** This is the provenance field: what you
couldn't verify, what you inferred and from what, what the legacy page did that you deliberately
didn't reproduce, which claims you refused to make and why. `content/projects/cryptogram/project.json`
carries about 4 KB of it — including a note explaining that `"Web scraping"` was removed from `tech`
because its only basis was a copy-pasted HTML `id` attribute shared with three unrelated pages. That
is the standard to aim at. It costs nothing and it is the only channel to the next person.

---

## `Section`

| Field | Type | Required | Default |
|---|---|---|---|
| `heading` | `string \| null` | no | `null` |
| `body` | `string[]` | no | `[]` |
| `media` | `Media[]` | no | `[]` |

**`heading`** — `null` renders an unlabelled section, useful as a lead-in.

**`body`** — **one string per paragraph.** Plain text: no HTML, no markdown, no embedded `\n\n`. The
`Prose` component maps the array to `<p>` elements, which is why the array and not a blob. Each
string must be non-empty (`min(1)`), so delete empty elements rather than leaving `""`. `[]` is
correct for an images-only section.

**`media`** — images and videos belonging to this section, in order.

A section may be prose-only, media-only, or both. Sections are the only structure available — there
are no nested subsections and no rich text. If a project seems to need more, that's a signal to
split it into more sections, not to add markup.

---

## `Media`

| Field | Type | Required | Default |
|---|---|---|---|
| `src` | `string` | yes | — |
| `kind` | `"image" \| "video"` | yes | — |
| `poster` | `string \| null` | no | `null` |
| `alt` | `string \| null` | no | `null` |
| `caption` | `string \| null` | no | `null` |

**`src`** is matched against:

```
/^media\/[A-Za-z0-9._-]+\.(webp|jpg|jpeg|png|mp4|webm)$/
```

That is: the literal prefix `media/`, one flat filename, one of six extensions. **No subfolders, no
leading slash, no `public/`, no `../`, no spaces.** The path is relative to the project's own folder
— `"media/cover.webp"` inside `content/projects/cryptogram/` means
`content/projects/cryptogram/media/cover.webp`.

**`kind`** distinguishes an `<Image>` from a `<video controls preload="metadata" poster>`. It is not
inferred from the extension; set it.

**`poster`** — videos only, same path shape, pointing at the frame shown before playback.
`npm run media` generates one per video as `<name>.poster.webp` (that is where
`blackjack_show.poster.webp` and `fullscreen_cryptogram.poster.webp` come from). Leave `null` for
images.

**`alt`** — the accessible description. The type is nullable because a video's accessible name comes
from its surroundings, but **every image should have it**, and it should describe what is in the
frame rather than the medium. Compare the legacy site's `"Image 1"` / `"Main Image"` with the real
entry `"Photo of the cryptogram handout from computer science class, solved twice by hand — the
author's dad's solution alongside the author's own"`.

**`caption`** — visible text rendered under the media. Optional, and genuinely optional: most media
in the repo has `null`.

### Path resolution — the one piece of magic

Everything written in `project.json` is relative. Two things then happen:

1. `scripts/sync-media.mjs` — the `prebuild` hook, so it runs on every `npm run build` — copies
   `content/projects/<slug>/media/*` to `public/media/<slug>/*`, for `published: true` projects
   only. (`npm run media` is a different script: `scripts/compress-media.mjs`, which compresses
   files in place inside `content/` and generates the video posters. It never writes to `public/`.)
2. `src/lib/content.ts` rewrites every `src` and `poster` on the way out, from `media/cover.webp` to
   the public URL `/media/<slug>/cover.webp`.

That rewritten object is the `ResolvedProject` type — structurally identical to `Project`, but
carrying URLs instead of relative paths. **Every function in the content API returns
`ResolvedProject`, never raw `Project`.** No component, page, or script does this path math itself;
if you find yourself concatenating `/media/` anywhere outside `content.ts`, that's a bug.

Media is stored next to its project rather than in a global `public/` pile so that deleting a project
deletes its assets, and so that two agents adding media never write into the same directory.

---

## `Profile` — `content/profile.json`

Exactly one of these, for the whole site.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `name` | `string` | yes | — | |
| `headline` | `string` | yes | — | One line under the name. |
| `bio` | `string` | yes | — | Short. Distinct from `about`. |
| `location` | `string \| null` | no | `null` | |
| `email` | `string \| null` | no | `null` | Validated as an email address. |
| `resume` | `string \| null` | no | `null` | A path under `public/`, e.g. `"/resume.pdf"`. Not URL-validated — keep the file in `public/` in sync by hand. |
| `links` | `Link[]` | no | `[]` | Same `{ label, href }` as projects; `href` must be an absolute URL. |
| `about` | `string[]` | no | `[]` | Long-form about copy, one string per paragraph, same rule as `Section.body`. |

`Link` is `{ label: string (min 1), href: string (valid URL) }` everywhere it appears.

---

## The data access API

`src/lib/content.ts` is the **only** module in the repo that reads the filesystem for content.

```ts
getProfile():            Promise<Profile>
getProjects():           Promise<ResolvedProject[]>          // published only, ordered
getAllProjects():        Promise<ResolvedProject[]>          // includes unpublished, same order
getProject(slug):        Promise<ResolvedProject | null>     // published only
getProjectSlugs():       Promise<string[]>                   // published only, for generateStaticParams
```

Pages and components import from here and nowhere else. No `fs` in a component, no
`import data from "../../content/projects/x/project.json"`, no `path.join` against `content/`.

## The Supabase seam

The content is intended to move to Supabase — projects as rows, media in storage, the owner editing
through an admin UI instead of a text editor. The single-module rule exists to make that migration a
rewrite of one file.

What makes the seam hold:

- **The schemas are the contract, not the storage.** `Project`, `Section`, `Media`, `Profile` are
  plain data. A Postgres row (or a `jsonb` column) can produce the same objects that
  `JSON.parse` produces today. `src/lib/schema.ts` stays as-is and keeps validating at the boundary,
  which is exactly where you want validation when the data starts coming from a network.
- **The API is already async.** Every function returns a `Promise`, including today when the work is
  synchronous. Callers already `await`, so swapping a file read for a network round trip changes no
  caller.
- **Callers never see storage-shaped values.** They get `ResolvedProject`, with public URLs already
  resolved. Today `/media/<slug>/cover.webp` is a file the build copied into `public/`; tomorrow it
  can be a Supabase Storage URL. The rewrite happens in `content.ts`, so no component changes.
- **`slug` is the stable key.** It is the directory name today and the primary key tomorrow, and the
  URL in both cases.
- **The filters and ordering live in `content.ts`.** `published`/`featured`/`date` logic becomes a
  `WHERE` clause and an `ORDER BY` in the same function, and every caller keeps its guarantees.

What would *break* the seam, and is therefore prohibited: reading `content/` from a component,
importing a `project.json` directly, hardcoding a `/media/...` path, or letting `Project` (rather
than `ResolvedProject`) reach a component. Keep all four out and the migration is one file.

`scripts/validate-content.ts` and `scripts/new-project.mjs` also read `content/` — deliberately.
They are build tooling, not the site; after a migration they become seed/export scripts or go away.
