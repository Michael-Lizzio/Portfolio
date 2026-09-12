# AGENTS.md — adding a project to this portfolio

You are probably a coding agent on one of Michael's machines, holding an old project folder and a
job: run it, look at it, document it, ship a PR that adds it to this site. **This file is the whole
job.** You do not need to read `src/`, and you should not.

Other agents are doing the same thing on other machines right now. The rules below are what keep
your PR from colliding with theirs.

---

## 1. TL;DR — the whole recipe

Assume the project you are documenting is `~/code/old/rpi-doorbell` and you have decided its slug is
`rpi-doorbell`. From the root of **this** repo:

```bash
git checkout main && git pull
git checkout -b project/rpi-doorbell          # branch name is always project/<slug>

npm ci                                        # Node 24+. Do this once per machine.
npm run new:project -- rpi-doorbell           # scaffolds content/projects/rpi-doorbell/

# ... go run the actual project, screenshot it, record it ...
# drop the RAW files here, flat (no subfolders). Any size — the next step shrinks them:
cp ~/shots/doorbell_cover.png  content/projects/rpi-doorbell/media/
cp ~/shots/doorbell_demo.mov   content/projects/rpi-doorbell/media/

npm run media -- rpi-doorbell                 # compresses IN PLACE: images -> .webp,
                                              # videos -> 720p .mp4 + <name>.poster.webp,
                                              # and deletes the originals it replaced

$EDITOR content/projects/rpi-doorbell/project.json   # write the real content (§4)

npm run validate                              # schema gate. Fix everything it prints.
npm run dev                                   # look at http://localhost:3000/work/rpi-doorbell
npm run build                                 # must pass before you open the PR

git add content/projects/rpi-doorbell
git commit -m "Add rpi-doorbell project"
git push -u origin project/rpi-doorbell
gh pr create --fill
```

`published` defaults to `false`, so merging your PR does **not** put the project on the live site.
Michael flips `published` to `true` himself when he is happy with it. That is the safety net — use
it. Do not set `published: true` to "show your work".

---

## 2. What this repo is, and why there is no registry file

A Next.js 16 (App Router) portfolio site. Every project on it is **one folder** under
`content/projects/`:

```
content/
  profile.json                       # Michael's name, bio, links. Not yours to edit.
  projects/
    cryptogram/
      project.json                   # all the text + which media goes where
      media/
        cryptogram_cover.webp
        fullscreen_cryptogram.mp4
        fullscreen_cryptogram.poster.webp
    foosball/
      project.json
      media/...
    rpi-doorbell/                    # <- the folder you add
      project.json
      media/...
```

**There is no projects index, no registry, no `projects.json` list, no route file per project.**
The site discovers projects by reading the directory `content/projects/*/`. `src/lib/content.ts`
does that once; everything else imports from it. `/work/<slug>` is one dynamic route that calls
`getProjectSlugs()`.

This is the architectural reason parallel agents are safe here:

| You touch | Another agent touches | Conflict? |
|---|---|---|
| `content/projects/rpi-doorbell/**` | `content/projects/plasma-cutter/**` | never — disjoint paths |
| *(nothing else)* | *(nothing else)* | never |

The guarantee only holds while you stay inside your own two folders. The moment two agents both
edit `package.json`, `package-lock.json`, `src/lib/content.ts`, or any shared component, git has to
merge and the guarantee is gone. **So don't.** See §5.

The legacy site this replaces did have a central `data/projects.json`, and it rotted: the live copy
listed two projects while a `data/projects copy.json` next to it listed six. That failure mode is
the thing this layout deletes.

---

## 3. Prerequisites and commands

Node **24** (this was written on v24.15.0, npm 11.12.1). `npm ci`, not `npm install` — `npm install`
can rewrite `package-lock.json`, which is a shared file (§5).

| Command | What it does |
|---|---|
| `npm run new:project -- <slug>` | Creates `content/projects/<slug>/project.json` + `media/` with a valid skeleton. |
| `npm run media -- <slug>` | Compresses `content/projects/<slug>/media/*` **in place**: images to `.webp` (max 1800px), videos to H.264 `.mp4` (max 1280px) plus a `.poster.webp` frame. Deletes the originals it replaced. Safe to re-run. |
| `npm run validate` | Validates `content/profile.json` and every `content/projects/*/project.json` against `src/lib/schema.ts`. Non-zero exit on failure. |
| `npm run dev` | Dev server on http://localhost:3000 |
| `npm run build` | Production build. Runs `sync-media` first, which regenerates `public/media/` from `content/`. |
| `npm run typecheck` | TypeScript, strict. |
| `npm run lint` | ESLint. |

CI runs `validate`, `typecheck`, `lint`, `build` on every PR. If those four pass locally, CI passes.

---

## 4. `project.json` — the full field reference

The schema lives in `src/lib/schema.ts` (zod). You don't have to read it; this section is the same
thing in English, and `npm run validate` quotes it back at you when you get it wrong.

### Top level

| Field | Type | Required | Rules and what good looks like |
|---|---|---|---|
| `slug` | string | **yes** | Must be **identical to the folder name**. Lowercase kebab-case only: `^[a-z0-9]+(-[a-z0-9]+)*$`. `wordle-solver` ✔ `Wordle_Solver` ✘ |
| `title` | string | **yes** | How a human says it. `"Cryptogram Solver"`, not `"cryptogram_solver"`. |
| `tagline` | string | **yes** | One line, max 140 chars, aim under 90. It is the whole card. Say what it *does*: `"A backtracking program that cracks cryptogram puzzles word by word"`. |
| `summary` | string | **yes** | 2–4 sentences, shown at the top of the detail page. What it is, how it works, what's on this page. |
| `published` | boolean | no — defaults `false` | `false` hides it from the site entirely without deleting it. **Leave it `false`.** |
| `featured` | boolean | no — defaults `false` | Promotes to the top of `/work` and onto the homepage. **Not yours to set.** Leave `false`. |
| `date` | string \| null | no — defaults `null` | `"YYYY"` or `"YYYY-MM"` only. `"2022"`, `"2024-03"`. `"March 2024"` fails. Drives ordering. `null` sorts last — use `null` if you genuinely can't date it. |
| `status` | string \| null | no — defaults `null` | Free text badge, e.g. `"In progress"`, `"Archived"`. `null` if the project doesn't say. |
| `tech` | string[] | no — defaults `[]` | What it is actually **built with**, one entry each. Not file formats it happens to read. Entries can be phrases: `"22 word lists indexed by word length, ordered common-to-uncommon"`. |
| `links` | Link[] | no — defaults `[]` | `{ "label": "Repo", "href": "https://github.com/..." }`. `href` must be a **full absolute URL** — `github.com/x` fails, `https://github.com/x` passes. Empty array if there is no public repo or demo. |
| `hero` | Media \| null | no — defaults `null` | The big image at the top of the detail page and the card image. One image (not a video). `null` is allowed and renders fine. |
| `sections` | Section[] | no — defaults `[]` | The body of the page, in order. See below. |
| `notes` | string \| null | no — defaults `null` | **Internal. Never rendered.** Where you record provenance, uncertainty, and what you could not verify. Use it generously — see §6. |

### Section

| Field | Type | Required | Rules |
|---|---|---|---|
| `heading` | string \| null | no — defaults `null` | `null` for an untitled lead-in section. |
| `body` | string[] | no — defaults `[]` | **One string per paragraph.** Plain text only — no HTML, no markdown, no `\n\n`. Empty strings are rejected; drop the element instead. `[]` is fine for an images-only section. |
| `media` | Media[] | no — defaults `[]` | Images and videos shown with this section, in order. |

### Media

| Field | Type | Required | Rules |
|---|---|---|---|
| `src` | string | **yes** | Relative to the project folder and flat: `"media/cover.webp"`. Regex: `^media/[A-Za-z0-9._-]+\.(webp\|jpg\|jpeg\|png\|mp4\|webm)$`. **No subfolders, no leading slash, no `public/`, no `../`.** `"/media/cryptogram/cover.webp"` ✘ `"media/shots/a.webp"` ✘ |
| `kind` | `"image"` \| `"video"` | **yes** | Exactly one of those two strings. |
| `poster` | string \| null | no — defaults `null` | Videos only. Same `media/...` shape. `npm run media` generates `<name>.poster.webp` next to the video — point at that. `null` for images. |
| `alt` | string \| null | no — defaults `null` | **Write it on every image.** Describe what is actually in the frame, not the medium. `"Screenshot of the program's output showing the class handout cryptogram solved"` ✔ `"screenshot of app"` ✘ `"Image 1"` ✘ |
| `caption` | string \| null | no — defaults `null` | Visible text under the media. Optional. |

Every path you write is relative. The build rewrites `media/cover.webp` →
`/media/<slug>/cover.webp` before any component sees it. **Never do that path math yourself.**

### A real, filled-in example

This is the actual top of `content/projects/cryptogram/project.json`, unedited. Read the whole file
— it is the best model in the repo (8 sections, images, videos with posters, a long `notes`).

```jsonc
{
  "slug": "cryptogram",
  "title": "Cryptogram Solver",
  "tagline": "A backtracking program that cracks cryptogram puzzles word by word",
  "summary": "A program that solves cryptogram (substitution-cipher) puzzles automatically. It started just before February school break 2022, after the author grabbed an unsolved puzzle from an optional computer science lesson on cryptography and his dad challenged him to solve it with him; it grew into a backtracking search worked out on a whiteboard before he knew the technique had a name. The solver organizes the puzzle's words to try the largest ones first, tries candidate words from 22 word lists indexed by word length and ordered from common to uncommon, and backtracks whenever a guess leaves no possibilities. The page collects the original class handout, the program's solved output, the whiteboard photo, and two videos of the solver running against puzzles from a puzzle website.",
  "published": true,
  "featured": true,
  "date": "2022",
  "status": null,
  "tech": [
    "Backtracking algorithm",
    "Brute-force search",
    "22 word lists indexed by word length, ordered common-to-uncommon"
  ],
  "links": [],
  "hero": {
    "src": "media/cryptogram_cover.webp",
    "kind": "image",
    "poster": null,
    "alt": "Cover image for the Cryptogram Solver project",
    "caption": null
  },
  "sections": [
    {
      "heading": "Teacher's Original Handout",
      "body": [
        "The photo to the left is the exact cryptogram that started this. The solved puzzle to the left in the photo is my dad's work, and the other one is mine. ..."
      ],
      "media": [
        {
          "src": "media/original_quote.webp",
          "kind": "image",
          "poster": null,
          "alt": "Photo of the cryptogram handout from computer science class, solved twice by hand — the author's dad's solution alongside the author's own",
          "caption": "(To view the image larger, just click on it!)"
        }
      ]
    },
    {
      "heading": "Videos",
      "body": [],
      "media": [
        {
          "src": "media/fullscreen_cryptogram.mp4",
          "kind": "video",
          "poster": "media/fullscreen_cryptogram.poster.webp",
          "alt": "Full-screen screen recording of the puzzle website being solved, without the program window in view",
          "caption": "This is the cryptogram solving the same puzzles from the website shown in the other video, just showing the webpage."
        }
      ]
    }
  ],
  "notes": "LANGUAGE / LINKS: the page never says what the solver is written in — do not label it Python. There are no outbound links, no repo link and no demo link anywhere on the page, and the 'puzzle website' in the videos is never named, so links is empty. ..."
}
```

Note what that `notes` field is doing: recording, permanently, *why* `tech` does not say "Python"
and *why* `links` is empty. That is the standard.

Voice: `summary` and section `body` are written as Michael, first person, past tense, plain. If you
are documenting a project by running it rather than transcribing his old page, prefer neutral
description over putting words in his mouth — and put the uncertainty in `notes`.

---

## 5. Hard rules

These are not style preferences. Breaking one of them is what turns four parallel agents into a
merge disaster or a website that lies.

1. **One project per PR.** One branch `project/<slug>`, one folder, one PR. Two projects = two PRs.
2. **Never edit another project's folder.** Not to fix a typo, not to compress their oversized
   video, not to "while I'm here". If you spot a problem in `content/projects/foosball/`, write it
   in your PR description and move on.
3. **Never edit `src/` when adding content.** No route file, no component, no `src/lib/content.ts`.
   If your project genuinely cannot be described with the fields in §4, stop and say so in the PR —
   do not invent a component. Adding a project is a **content-only** change.
4. **Never touch shared files.** `package.json`, `package-lock.json`, `next.config.ts`,
   `content/profile.json`, `src/app/globals.css`, `.github/**`, this file. Use `npm ci`, never
   `npm install <pkg>`. No new dependencies.
5. **Never commit raw, uncompressed media.** No `.mov`, no `.HEIC`, no 4000px phone photos, no
   40 MB screen recordings. Everything goes through §7. **Hard ceiling: 8 MB per file** (the
   largest file in the repo today is `foosball/media/stepper_motor.mp4` at 5,414,855 bytes). CI
   fails the PR on anything larger.
6. **Never invent a fact about a project.** If you did not observe it by running the code or reading
   the source in front of you, it does not go in `project.json`. See §6 — this is the important one.
7. **Leave `published: false` and `featured: false`.** Those are Michael's switches.
8. **`npm run validate` and `npm run build` both pass before you open the PR.** No exceptions, no
   "CI will tell me".

The files your commit is allowed to contain:

```
content/projects/<slug>/project.json
content/projects/<slug>/media/*
AGENTS.md                        # ONLY if `next dev` re-added its managed block (see §9)
```

`git diff --stat main...HEAD` should show nothing else. Check it before you push.

---

## 6. The honesty rule

**Describe only what you actually ran and saw. Where you don't know, write "unknown".**

This is not an abstract principle here. The legacy site had real instances of exactly this failure:

- `cyber_TTM.html` embedded **the cryptogram project's two videos** — a different project's
  screen recordings, presented as its own.
- The wrapper `<div class="video-box" id="webscraping-video">` is byte-identical across
  `wordle_solver.html`, `blackjack.html` and `cyber_TTM.html` — copy-pasted boilerplate that made
  an unrelated project look like it did web scraping. It nearly ended up in `tech` as
  "Web scraping" during the port, on the strength of a copy-pasted `id` attribute.
- Alt text across the old pages was `"Main Image"`, `"Image 1"`, `"Cryptogram Image 1"` — text that
  describes nothing.

So, concretely:

- **Ran it?** Then you can describe what it did. Quote the actual output.
- **Read the source but couldn't run it?** Say what the source does, and record
  `"NOT RUN: <reason>"` in `notes`.
- **Don't know the language / framework?** Leave it out of `tech`. An empty `tech` array is honest;
  a guessed one is a lie that will be on a public website under someone's name.
- **No repo, no demo, no deployed URL?** `"links": []`. Do not link a GitHub URL you have not
  opened and confirmed is this project.
- **Don't know the year?** `"date": null`. Don't infer it from a file mtime and present it as fact —
  if you infer it, say you inferred it in `notes` (`"date 2022 inferred from git log first commit"`).
- **Screenshot is of a different project, or of a mock, or a stock image?** Delete it. A project page
  with two honest screenshots is better than one with six borrowed ones.
- **The project is broken and you couldn't get it running?** That is a legitimate, interesting
  finding. Write the truth in `summary`/`sections` ("the build no longer completes under Node 24;
  the last working state is documented from the source"), record the errors in `notes`, and ship it
  `published: false`. Do not fabricate a working demo.

Every uncertainty goes in `notes`. `notes` is never rendered, costs nothing, and is the next agent's
only way to know what you were unsure about. The cryptogram `notes` field is ~4 KB of exactly this.

---

## 7. Capturing media

### What to capture

Capture the project **doing its thing**, with real data in it. In rough priority order:

1. **One cover image** (`hero`) — the single most representative frame. Landscape.
2. **The core interaction** — the screen where the point of the project is visible.
3. **A short video** if the project is temporal (an animation, a solver running, a robot moving).
   15–40 seconds. Trim the dead time at the start.
4. **Supporting detail** — the wiring, the whiteboard, the hardware, the terminal output.

### Terminal / CLI projects

Screenshot the **terminal window**, not a code editor. The frame must contain the command you typed
and its real output. Before you shoot: bump the font size, use a light-on-dark theme consistently,
resize to roughly 100×30 columns so the text is legible when the image is scaled down, and clear the
scrollback so there is no unrelated noise (or your home directory path) in frame.

If the interesting thing is a long run, record it instead — `asciinema` output is not supported here,
so record the screen to `.mp4`.

### GUI / web projects

Capture the **app window only**, not the whole desktop. No menu bar, no dock, no other windows, no
notification banners. Use a clean browser profile: no bookmarks bar, no extension icons, no other
tabs. Set the window to a normal laptop size (1440×900 is a good default) rather than a 5K monitor —
a 5120px-wide screenshot scaled into a card just looks soft.

### Hardware / physical projects

Landscape, decent light, the thing filling the frame. `foosball/media/` is the model: the rig, the
wiring, the whiteboard plan, plus short clips of it moving.

### Format, size, and the 8 MB ceiling

| | Format | Target | Ceiling |
|---|---|---|---|
| Images | **WebP** (`.webp`) | ≤ 1920 px wide, 100–400 KB | 8 MB |
| Videos | **MP4**, H.264 + AAC | ≤ 1280 px wide, under ~5 MB | 8 MB |
| Posters | generated — don't make them by hand | | |

Aspect: landscape 16:9 or 4:3. Avoid ultrawide and avoid tall portrait screenshots — they render as
a skinny column. `.png`, `.jpg`, `.jpeg` and `.webm` are accepted by the schema, but **prefer WebP
and MP4**; convert rather than committing a PNG screenshot straight off the clipboard.

Concrete conversions (all of these are on Michael's Mac already; `brew install ffmpeg webp` if not):

```bash
# PNG/JPEG screenshot -> WebP, capped at 1920px wide
sips -Z 1920 shot.png --out /tmp/shot.png            # resize (macOS built-in)
cwebp -q 80 /tmp/shot.png -o content/projects/rpi-doorbell/media/doorbell_ui.webp

# HEIC phone photo -> WebP
sips -s format jpeg -Z 1920 IMG_1234.HEIC --out /tmp/p.jpg
cwebp -q 80 /tmp/p.jpg -o content/projects/rpi-doorbell/media/bench.webp

# .mov screen recording -> compressed MP4, 1280 wide, web-friendly
ffmpeg -i screen.mov -vf "scale=1280:-2" -c:v libx264 -crf 26 -preset slow \
       -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k \
       content/projects/rpi-doorbell/media/doorbell_demo.mp4

# silent clip? drop the audio track entirely:
ffmpeg -i clip.mov -vf "scale=1280:-2" -c:v libx264 -crf 26 -preset slow \
       -pix_fmt yuv420p -movflags +faststart -an \
       content/projects/rpi-doorbell/media/doorbell_demo.mp4

# still too big? raise the CRF (28-32) and/or scale to 960:
#   -vf "scale=960:-2" -crf 30

# check before committing:
find content/projects/rpi-doorbell/media -type f -size +8M
du -h content/projects/rpi-doorbell/media/*
```

### Naming

Flat, lowercase, `[A-Za-z0-9._-]` only — **no spaces**. `doorbell_ui.webp`, `screen_0.webp`,
`ball_tracking.mp4`. Never `Screen Shot 2024-03-01 at 4.21.09 PM.png`; it fails the schema regex
*and* it tells the reader nothing.

Then:

```bash
npm run media -- rpi-doorbell
```

which rewrites them in place as `doorbell_cover.webp` and `doorbell_demo.mp4`, and writes
`doorbell_demo.poster.webp` next to the video. Point the video's `poster` field at `"media/doorbell_demo.poster.webp"`.

---

## 8. Running and reading `npm run validate`

```bash
npm run validate
```

It parses `content/profile.json` and every `content/projects/*/project.json` against
`src/lib/schema.ts` and exits non-zero if anything fails. Read the failures from the top; one bad
character often produces several.

Each failure names a **path into your JSON** plus the rule. The path indexes exactly like JavaScript:
`sections[2].media[0].alt` = the third section, its first media item, its `alt` field. Open the file,
go to that spot, fix the value, run it again. The messages are the ones written in `schema.ts`, so
they say what is wanted:

- `must look like "media/name.webp" — relative to the project folder, no subfolders`
- `lowercase-kebab-case only`
- `use "YYYY" or "YYYY-MM"`
- `String must contain at least 1 character(s)` — you have an empty string where content is required
  (usually an empty `""` left in a `body` array; delete the element).
- `Invalid url` — an `href` without `https://`.

`validate` checks the JSON against the schema. It does not know whether your screenshots are of the
right project — §6 is on you.

---

## 9. Troubleshooting

**`npm error Missing script: "validate"`** — you are on a stale `main`. `git checkout main && git pull`,
then `npm ci`.

**`npm ci` fails / engine errors** — you are not on Node 24. `node -v` must print `v24.x`. `nvm use 24`.

**`slug` must equal the folder name** — you renamed the folder after scaffolding, or vice versa. Both
must match exactly, including hyphens. Rename the folder to the slug, not the other way round, and
re-run `npm run media -- <slug>`.

**Images 404 / broken in `npm run dev`** — `public/media/` is generated, and only for projects with
`published: true`. Restart `npm run dev` (it runs the sync), and check `ls public/media/<slug>/`. If
the project is still a draft this is expected: view it with `npm run build && npm start`, or flip
`published` locally to look at it. Never commit a `published: true` flip you were not asked for.

**Video shows a black box with no preview** — the `poster` field is `null`, or points at a file that
doesn't exist. Run `npm run media -- <slug>`, confirm `<name>.poster.webp` exists, and set
`"poster": "media/<name>.poster.webp"`.

**Media path rejected by validate** — the three usual causes: a leading slash
(`"/media/x.webp"`), a subfolder (`"media/shots/x.webp"`), or a filename with a space or an
unsupported extension (`.mov`, `.gif`, `.HEIC`, `.avif`). Rename/convert the file on disk, fix the
JSON, re-run `npm run media`.

**`npm run build` fails inside a project that isn't yours** — someone else's content is broken on
`main`. Don't fix it in your PR. Note it in the PR description; that is what the CI gate is for.

**Merge conflict in `package-lock.json`** — you ran `npm install` instead of `npm ci`. Reset it:
`git checkout main -- package-lock.json` and make sure no dependency change is in your diff.

**`git status` shows `AGENTS.md` modified and you didn't touch it** — `next dev` re-adds its managed
managed `nextjs-agent-rules` block at the bottom of this file. That is expected. Commit it
along with your work rather than reverting it; reverting only makes it come back.

**`.DS_Store` or `*.orig.*` files appear** — both are gitignored. If one is staged, unstage it.

**Your PR diff shows files outside `content/projects/<slug>/`** — stop.
`git diff --stat main...HEAD`, and remove everything that is not yours. This is the single most
common way a parallel agent breaks another agent's PR.

**The project won't run at all** — that is a finding, not a blocker. See the last bullet of §6.

---

## 10. Where things live, if you really do need to look

| Path | What | Who owns it |
|---|---|---|
| `content/projects/<slug>/` | one project | **you, for your slug only** |
| `content/profile.json` | Michael's bio, links, résumé path | Michael |
| `src/lib/schema.ts` | the zod contract — source of truth for §4 | read-only for you |
| `src/lib/content.ts` | the only module that reads the filesystem for content | read-only for you |
| `src/components/` | `ProjectCard`, `MediaFigure`, `Prose`, … | read-only for you |
| `src/app/` | routes | read-only for you |
| `scripts/` | `new-project.mjs`, `compress-media.mjs`, `sync-media.mjs`, `validate-content.ts` | read-only for you |
| `docs/CONTENT_MODEL.md` | the schema in prose, plus the planned Supabase migration | reference |
| `public/media/<slug>/` | generated at build from `content/`; gitignored — never commit it | generated |

Content is deliberately behind one module (`src/lib/content.ts`) because it is moving to Supabase
later. When it does, that one file changes and nothing else — including your `project.json`, whose
shape is the contract on both sides. See `docs/CONTENT_MODEL.md`.

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
