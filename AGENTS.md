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
# 0. Get this repo. Skip if `git remote -v` already prints Michael-Lizzio/Portfolio.
git clone https://github.com/Michael-Lizzio/Portfolio.git
cd Portfolio

git checkout main && git pull
git checkout -b project/rpi-doorbell          # branch name is always project/<slug>

npm ci                                        # Node 24 (§3). Once per machine, and again
                                              # whenever package-lock.json changes on main.
npm run new:project -- rpi-doorbell           # scaffolds content/projects/rpi-doorbell/

# ... go run the actual project, screenshot it, record it ...
# drop the RAW files here, flat (no subfolders). Any size — the next step shrinks them:
cp ~/shots/doorbell_cover.png  content/projects/rpi-doorbell/media/
cp ~/shots/doorbell_demo.mov   content/projects/rpi-doorbell/media/

npm run media -- rpi-doorbell                 # compresses IN PLACE: images -> .webp,
                                              # videos -> .mp4 capped at 1280px wide + a poster,
                                              # and deletes the originals it replaced.
                                              # It keeps your filenames — §7.

# Now write the real content (§4) into content/projects/rpi-doorbell/project.json, using your
# normal file-editing tool. Don't shell out to $EDITOR: it is unset on plenty of machines, and
# where it is set it may open vi and hang a non-interactive session.

npm run validate                              # schema gate. Fix everything it prints.
npm run dev                                   # read the URL Next prints — a busy port 3000
                                              # silently becomes 3001. /work/rpi-doorbell 404s
                                              # while published is false; §9 has the three-line
                                              # recipe for looking at a draft.
npm run build                                 # must pass before you open the PR

git status --short                            # nothing but content/projects/rpi-doorbell/
git add content/projects/rpi-doorbell
git commit -m "Add rpi-doorbell project"
git push -u origin project/rpi-doorbell
gh pr create --title "Add rpi-doorbell" --body-file .github/pull_request_template.md
# Then edit the PR body and actually answer the checklist. Not `gh pr create --fill`: that
# takes the body from your commit message and silently drops the template.
# `gh` not logged in? Common — it is not logged in on this machine today. §3 has two
# fallbacks, and neither one counts as failing.
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

It is a guarantee about *git*, and it assumes one agent per checkout — which is the normal case,
since agents run on different machines. If two of you ever share a working copy, note that
`public/media/` and port 3000 are not yours alone: the preview step in §9 regenerates
`public/media/` from **every** project, so running it wipes the other agent's draft media
mid-preview. Nothing is lost — `content/` is the source of truth and another sync restores it —
but it is confusing if you do not expect it.

The legacy site this replaces did have a central `data/projects.json`, and it rotted: the live copy
listed two projects while a `data/projects copy.json` next to it listed six. That failure mode is
the thing this layout deletes.

---

## 3. Prerequisites and commands

### What has to be on the machine

**Node 24.** This was written on v24.15.0, npm 11.12.1. `package.json` declares
`"engines": { "node": ">=24" }`, but npm only *warns* about a mismatch
(`npm warn EBADENGINE Unsupported engine`) and installs anyway — so `npm ci` succeeding tells you
nothing. Check `node -v` yourself. On an old Node the first real failure comes later and looks
unrelated: `npm run validate` runs `node --experimental-strip-types`, a flag that needs Node ≥ 22.6,
and dies with `node: bad option: --experimental-strip-types`. There is no `.nvmrc`, `.node-version`
or `.tool-versions` in this repo, so a bare `nvm use` will not work; use whatever the machine
actually has — `nvm install 24 && nvm use 24`, `fnm use 24`, `volta install node@24`,
`mise use node@24`, or `brew install node@24`. (Michael's current Mac has no version manager at all:
`node` is `/usr/local/bin/node`.)

`npm ci`, not `npm install` — `npm install` can rewrite `package-lock.json`, which is a shared file
(§5). If `npm run validate` already runs, the dependencies are installed and you can skip `npm ci`.

**ffmpeg and ffprobe on PATH.** `npm run media` is a thin wrapper around them and exits 1 without
them. Before you start:

```bash
ffmpeg -version && ffprobe -version      # both must print a version

# macOS    brew install ffmpeg
# Debian   sudo apt install ffmpeg
# Fedora   sudo dnf install ffmpeg
# Windows  winget install Gyan.FFmpeg    (or: choco install ffmpeg) — then reopen the shell
```

The script needs the **encoders**, not just the binary: its preflight only runs `ffmpeg -version`,
so a stripped build passes it and then fails on every single file with `Unknown encoder 'libwebp'`.
Check once:

```bash
ffmpeg -hide_banner -encoders | grep -E "libx264|libwebp"    # macOS / Linux — both must appear
ffmpeg -hide_banner -encoders | findstr "libx264 libwebp"    # PowerShell / cmd
```

(Michael's current Mac: ffmpeg 8.1.2, with both.) If ffmpeg cannot be installed at all, do **not**
dead-end and do **not** commit raw files — §7 has a legal way to ship without it.

**`gh`, installed and logged in.** `gh auth status` must say it is logged in to github.com. Expect
it not to be: on this machine today it prints `The token in default is invalid.` That is normal, and
there are two fallbacks, neither of which is a failure:

1. `gh auth login` — which also sets up git's credential helper, via `gh auth setup-git`; or
2. skip `gh` entirely. Push the branch, then open
   `https://github.com/Michael-Lizzio/Portfolio/compare/project/<slug>?expand=1`
   in a browser — that URL loads the PR template pre-filled.

If you can do neither, stop after a successful `git push` and report the branch name. A pushed
branch is a complete handoff; an unpushed one is not.

**git able to commit and push as Michael.** On a machine that has never pushed this repo:

```bash
git config user.name && git config user.email   # both must print something
git config user.name  "Michael Lizzio"          # only if they are empty
git config user.email "<Michael's GitHub email>"
```

`origin` is HTTPS (`https://github.com/Michael-Lizzio/Portfolio.git`), so pushing needs a credential
helper. This Mac has `credential.helper=osxkeychain`; an older one may have nothing, in which case
`git push` prompts for a username and password and a non-interactive agent hangs. Fix that with
`gh auth login`. Do **not** rewrite the remote to SSH, and do not paste a token onto a command line.
If you still cannot push: commit locally, run `git format-patch main --stdout > ~/<slug>.patch`, and
tell Michael where that file is. That is a legitimate finish, not a failure.

### Commands

| Command | What it does |
|---|---|
| `npm run new:project -- <slug>` | Creates `content/projects/<slug>/project.json` + `media/` with a valid skeleton. |
| `npm run media -- <slug>` | Compresses `content/projects/<slug>/media/*` **in place**: images to `.webp` (max 1800px), videos to H.264 `.mp4` (max 1280px) plus a `.poster.webp` frame. Deletes the originals it replaced. Writes nothing outside `content/`. Safe to re-run. Exits non-zero if any file failed. |
| `npm run validate` | Checks `content/profile.json` and every `content/projects/*/project.json` against `src/lib/schema.ts` — **and** the on-disk facts the schema cannot see (§8). Non-zero exit on any ERROR. |
| `npm run dev` | Dev server. Usually http://localhost:3000, but if something already owns 3000 it takes the next free port and only *warns* (`Port 3000 is in use by process <pid>, using available port 3001 instead.`). Read the URL it prints. Pin it with `npm run dev -- -p 3210`. |
| `npm run build` | Production build. Runs `prebuild` → `scripts/sync-media.mjs` first, which regenerates `public/media/` from `content/` — published projects only. |
| `node scripts/sync-media.mjs` | The same sync, on its own. This is what decides whether your images exist at a URL. Run it after flipping `published` locally, or they 404 (§9). |
| `npm run typecheck` | TypeScript, strict. |
| `npm run lint` | ESLint. |

CI (`.github/workflows/ci.yml`) runs `validate`, `typecheck`, `lint` and `build` on every PR **and**
on every push to `main`. Before those four it runs one more gate:
`find content public/media -type f -size +8M` must print nothing. Note that this covers *all* of
`content/`, while `npm run validate`'s own size check only walks `content/projects/*/media/`. So the
local equivalent is those four commands **plus**:

```bash
find content -type f -size +8M          # prints nothing = the ceiling is clear
```

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
| `tech` | string[] | no — defaults `[]` | What it is actually **built with**, one entry each. Not file formats it happens to read. **Max 40 characters per entry** — each one renders as a pill label, not a sentence; the explanation belongs in a section. Over 40 fails validate with `a tech entry is a pill label, not a sentence`. Real entries, from cryptogram: `"Backtracking algorithm"`, `"Frequency-ordered word lists"`. |
| `links` | Link[] | no — defaults `[]` | `{ "label": "Repo", "href": "https://github.com/..." }`. `href` must be a **full absolute URL** — `github.com/x` fails, `https://github.com/x` passes. Empty array if there is no public repo or demo. |
| `hero` | Media \| null | no — defaults `null` | The big image at the top of the detail page and the card image. **Use an image.** That is a convention, not a constraint: a `kind: "video"` hero parses, validates, and renders (the page falls back to its poster frame for the share image) — it is just not what this slot is for. `null` is allowed and renders fine. |
| `sections` | Section[] | no — defaults `[]` | The body of the page, in order. See below. |
| `notes` | string \| null | no — defaults `null` | **Internal. Never rendered.** Where you record provenance, uncertainty, and what you could not verify. Use it generously — see §6. |

### Section

| Field | Type | Required | Rules |
|---|---|---|---|
| `heading` | string \| null | no — defaults `null` | `null` for an untitled lead-in section. |
| `body` | string[] | no — defaults `[]` | **One string per paragraph.** Plain text only — no HTML, no markdown, no `\n\n`. Empty strings are rejected; drop the element instead. `[]` is fine for an images-only section. |
| `codeBlocks` | string[] | no — defaults `[]` | Fixed-width, whitespace-preserving blocks for code, terminal output or alignment-sensitive text. Keep ordinary prose in `body`. |
| `layout` | `"stack"` \| `"media-left"` \| `"media-right"` | no — defaults `"stack"` | With one media item and body copy, the left/right options create a two-column desktop pairing that stacks on mobile. Other section shapes render as `"stack"`. |
| `media` | Media[] | no — defaults `[]` | Images and videos shown with this section, in order. |

### Media

| Field | Type | Required | Rules |
|---|---|---|---|
| `src` | string | **yes** | Relative to the project folder and flat: `"media/cover.webp"`. Regex: `^media/[A-Za-z0-9._-]+\.(webp\|jpg\|jpeg\|png\|mp4\|webm)$`. **No subfolders, no leading slash, no `public/`, no `../`.** `"/media/cryptogram/cover.webp"` ✘ `"media/shots/a.webp"` ✘ |
| `kind` | `"image"` \| `"video"` | **yes** | Exactly one of those two strings. |
| `poster` | string \| null | no — defaults `null` | Videos only. Same `media/...` shape. `npm run media` generates `<name>.poster.webp` next to the video — point at that. `null` for images. |
| `alt` | string \| null | **yes for images** — the schema allows `null`, validate rejects it | An image with `alt` null or blank is a hard ERROR: `<path>.alt: images need alt text`. Describe what is actually in the frame, not the medium. `"Screenshot of the program's output showing the class handout cryptogram solved"` ✔ `"screenshot of app"` ✘ `"Image 1"` ✘. `null` is for videos. |
| `caption` | string \| null | no — defaults `null` | Visible text under the media. Optional. |

Every path you write is relative. The build rewrites `media/cover.webp` →
`/media/<slug>/cover.webp` before any component sees it. **Never do that path math yourself.**

### A real, filled-in example

The best model in the repo is `content/projects/cryptogram/project.json` — 155 lines, 8 sections,
images, videos with posters, and a long `notes`. Open it. What follows are two **verbatim** slices
of that file, copied as-is:

**Lines 1–34** — the top of the file, down through the first media item of the first section:

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
    "Frequency-ordered word lists"
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
      "heading": "Cryptogram Examples",
      "body": [],
      "media": [
        {
          "src": "media/example_quote_0.webp",
          "kind": "image",
          "poster": null,
          "alt": "Example cryptogram 1; this is the image loaded in the large viewer by default",
          "caption": null
        },
```

**Lines 112–131** — the "Videos" section, which is how a video and its generated poster look:

```jsonc
    {
      "heading": "Videos",
      "body": [],
      "media": [
        {
          "src": "media/compressed_splitscreen_cryptogram.mp4",
          "kind": "video",
          "poster": "media/compressed_splitscreen_cryptogram.poster.webp",
          "alt": "Split-screen screen recording of the solver running against puzzles on a puzzle website",
          "caption": "This shows a modified version of my code solving cryptograms on a puzzle website I found."
        },
        {
          "src": "media/fullscreen_cryptogram.mp4",
          "kind": "video",
          "poster": "media/fullscreen_cryptogram.poster.webp",
          "alt": "Full-screen screen recording of the puzzle website being solved, without the program window in view",
          "caption": "This is the cryptogram solving the same puzzles from the website shown in the other video, just showing the webpage."
        }
      ]
    },
```

What is cut between and after those two slices, so you are not guessing: the other three images of
section 1 (lines 35–55), six sections — "The Backstory", "Teacher's Original Handout",
"Solved Quote", "My Whiteboard" (lines 58–111) and "Epilogue", "Worked Example" (lines 132–152) —
the `notes` field (line 154), and the closing brace (line 155). Nothing inside the two blocks above
is edited, abridged or reordered. If you reformat or re-key anything from them, you are no longer
quoting the file.

The `notes` field is 9,313 bytes and does not fit here. One paragraph of it — wrapped to fit this
page, otherwise word-for-word — is the point of the whole field:

> LANGUAGE / LINKS: the page never says what the solver is written in — do not label it Python (the
> homepage bio mentions Python experience generally, but that is not a claim about this project).
> There are no outbound links, no repo link and no demo link anywhere on the page, and the 'puzzle
> website' in the videos is never named, so links is empty.

That is the standard: `notes` records, permanently, *why* `tech` does not say "Python" and *why*
`links` is empty.

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
content/projects/<slug>/media/*        # the scaffold's media/.gitkeep can stay or go — compress,
                                       # sync and validate all skip dotfiles either way
AGENTS.md                              # ONLY if `next dev` re-added its managed block (see §9)
```

Two checks, not one:

- **While you work**, `git status --short` should show nothing but `content/projects/<slug>/`. This
  is the one that catches a stray `npm install`, an edited `content/profile.json` or a leftover
  scratch file while undoing it is still free.
- **Before you push**, `git diff --stat main...HEAD` should show nothing else either.

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
only way to know what you were unsure about. The cryptogram `notes` field is 9,313 bytes of exactly
this.

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
| Images | **WebP** (`.webp`) | ≤ 1800 px wide, 100–400 KB | 8 MB |
| Videos | **MP4**, H.264 + AAC | ≤ 1280 px wide, under ~5 MB | 8 MB |
| Posters | generated — don't make them by hand | | |

1800 px is not a round number picked for taste: it is `MAX_IMAGE_WIDTH` in
`scripts/compress-media.mjs`. A `.webp` wider than that is not skipped on the next
`npm run media` — it is re-encoded, which is a second lossy pass.

Aspect: landscape 16:9 or 4:3. Avoid ultrawide and avoid tall portrait screenshots — they render as
a skinny column. `.png`, `.jpg`, `.jpeg` and `.webm` are accepted by the schema, but **prefer WebP
and MP4**; convert rather than committing a PNG screenshot straight off the clipboard.

Concrete conversions. `npm run media` already does all of this — reach for these only for a one-off,
or to rescue a file the script could not handle. Every recipe here is ffmpeg, which is the only tool
`npm run media` uses and which behaves the same on macOS, Linux and Windows. (`sips` is macOS-only
and `cwebp` is a separate package; neither is needed. Do not assume either exists — the machine you
are on may not be Michael's current Mac.)

```bash
# any image (PNG/JPEG/HEIC/…) -> WebP, capped at 1800px wide
ffmpeg -i shot.png -vf "scale='min(1800,iw)':-1" -c:v libwebp -quality 80 \
       content/projects/rpi-doorbell/media/doorbell_ui.webp

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

# check before committing (macOS / Linux):
find content/projects/rpi-doorbell/media -type f -size +8M
du -h content/projects/rpi-doorbell/media/*
```

On Windows, `find` is an unrelated program and there is no `/tmp`. Same size check in PowerShell:

```powershell
Get-ChildItem content\projects\rpi-doorbell\media -Recurse |
  Where-Object Length -gt 8MB | Select-Object Name, Length
```

The npm scripts themselves — `new:project`, `media`, `validate`, `build` — are plain Node and run
unchanged on all three platforms.

### No ffmpeg, and you cannot install one

Don't dead-end, and don't commit raw files either. Downgrade the media, not the honesty:

- **Images:** `.png`, `.jpg` and `.jpeg` are accepted by the schema, by `npm run validate` and by
  CI. Export or resize them under 8 MB with whatever the machine has, commit those instead of WebP,
  and skip `npm run media`.
- **Video:** skip it entirely. Two honest stills beat a page that never ships.
- **Write it down in `notes`:** "no ffmpeg available on the machine used to document this — images
  are PNG rather than WebP and no video is included; re-run `npm run media -- <slug>` on a machine
  with ffmpeg to compress them."

Then open the PR normally. `npm run validate` and CI both pass on that.

### Naming

Flat, lowercase, `[A-Za-z0-9._-]` only — **no spaces**. `doorbell_ui.webp`, `screen_0.webp`,
`ball_tracking.mp4`. Never `Screen Shot 2024-03-01 at 4.21.09 PM.png`; it fails the schema regex
*and* it tells the reader nothing.

Then:

```bash
npm run media -- rpi-doorbell
```

It rewrites each file in place, **keeping your filename and changing only the extension**:
`doorbell_cover.png` → `doorbell_cover.webp`, `doorbell_demo.mov` → `doorbell_demo.mp4`, plus a
`doorbell_demo.poster.webp` frame next to the video. It will not tidy a careless name for you, so
pick the final filenames when you capture. Where an extension changed it prints "These filenames
changed — update project.json to match"; point the video's `poster` field at
`"media/doorbell_demo.poster.webp"`.

Anything it could **not** convert is left untouched in `media/`, listed under "Problems", and the
command exits non-zero. Run `ls content/projects/<slug>/media` afterwards and look:
`npm run validate` does not ERROR on a stray file you never reference, but it does WARN — it maps
every non-dotfile in `media/` and flags anything `project.json` does not point at. So an unconverted
`.mov` left in the folder shows up as `not referenced by project.json — it ships but nothing shows
it`, and it would be copied to `public/` verbatim if the project were ever published. Delete it.

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
go to that spot, fix the value, run it again.

Some messages are written in `schema.ts`, some come from zod itself — this repo is on **zod 4**, so
the wording differs from the zod 3 strings you may have seen elsewhere:

- `must look like "media/name.webp" — relative to the project folder, no subfolders`
- `lowercase-kebab-case only`
- `use "YYYY" or "YYYY-MM"`
- `a tech entry is a pill label, not a sentence` — a `tech` entry over 40 characters.
- `Too small: expected string to have >=1 characters` — an empty string where content is required
  (usually an empty `""` left in a `body` array; delete the element).
- `Too big: expected string to have <=140 characters` — the `tagline` cap.
- `Invalid URL` — a `links[].href` without `https://`.

**`validate` is not only a schema check.** `scripts/validate-content.ts` also checks the things the
schema cannot see, and those are the errors agents actually trip:

- `slug` equals the folder name, and no two projects claim the same slug
- every media `src` and `poster` resolves to a file that is really on disk
- `kind` matches the file extension, and a `poster` is an image
- every image has non-empty alt text — `<path>.alt: images need alt text`
- no media file is over 8 MB

It also prints WARNs: a video with no poster, a media file nothing references, a subfolder under
`media/`, a résumé path with no file behind it. **WARNs do not fail the run.** Fix them anyway.

The last line is the summary. A clean tree today:

```
OK  0 errors, 0 warnings  —  9 projects (5 published), 60 media files, 39.5 MB
```

What validate cannot know is whether your screenshots are of the right project. §6 is on you.

---

## 9. Troubleshooting

**`npm error Missing script: "validate"`** — you are on a stale `main`. `git checkout main && git pull`,
then `npm ci`.

**Node is too old** — and `npm ci` will not stop you. `package.json` declares
`"engines": { "node": ">=24" }`, but npm treats that as advice: it prints
`npm warn EBADENGINE Unsupported engine` and installs anyway. The first hard failure comes later and
looks unrelated — `npm run validate` dies with `node: bad option: --experimental-strip-types` (that
flag needs Node ≥ 22.6; this repo targets 24). Next itself only requires ≥ 20.9, so `dev` and
`build` can look healthy while validate cannot run at all. So check first: `node -v` must print
`v24.x`. §3 lists the ways to get there — there is no `.nvmrc` here, so a bare `nvm use` will not
work.

**`gh pr create` fails with an auth error** — expected, not a failed task: `gh auth status` does not
pass on this machine today. §3 has the two fallbacks (log in, or push the branch and open the
compare URL in a browser). Report the pushed branch name either way.

**`slug` must equal the folder name** — you renamed the folder after scaffolding, or vice versa. Both
must match exactly, including hyphens. Rename the folder to the slug, not the other way round, and
re-run `npm run media -- <slug>`.

**Draft project 404s, or its images are broken, in `npm run dev`** — one root cause: nothing about
an unpublished project is served.

- *The page.* `/work/<slug>` 404s while `published` is `false` — under `npm run dev` **and** under
  `npm run build && npm start`. `getProject()` returns null for an unpublished slug, and
  `generateStaticParams()` only emits published ones. Building and starting does not help.
- *The images.* `public/media/` is generated and gitignored, so on a fresh clone it does not exist
  at all. Only `prebuild` regenerates it — there is **no `predev`**, so `npm run dev` never runs the
  sync no matter how often you restart it. And the sync copies `published: true` projects only.

The only way to look at a draft is to flip it locally, and put it back:

```bash
# 1. set "published": true in content/projects/<slug>/project.json
node scripts/sync-media.mjs          # now public/media/<slug>/ exists
ls public/media/<slug>/              # confirm the files landed
npm run dev                          # look at /work/<slug>
# 2. set "published" back to false before you stage anything
```

Never commit a `published: true` flip you were not asked for (§5, rule 7). `git status --short` and
`git diff main...HEAD -- content/projects/<slug>/project.json` will both show it if you forget.

**You are looking at the wrong server** — `next dev` does not fail when port 3000 is taken. It warns
(`Port 3000 is in use by process <pid>, using available port 3001 instead.`) and carries on, so a
leftover `npm start` from an earlier step will serve you a stale 404 that is byte-identical to the
draft 404 above. Read the URL Next actually prints, or pin one: `npm run dev -- -p 3210`. To stop a
stray server, `pkill -f next-server` — the process is titled `next-server (v16.3.5)`, so
`pkill -f "next start"` finds nothing.

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
`nextjs-agent-rules` block at the bottom of this file. That is expected. Commit it
along with your work rather than reverting it; reverting only makes it come back.

**Stray files in `git status`** — `.DS_Store` is gitignored. So, now, is
`<name>.compress-tmp.<ext>`: that is the scratch file `npm run media` encodes into next to its
target, and a run killed mid-encode leaves one behind. Delete it anyway rather than relying on the
ignore rule — `sync-media` copies every non-hidden file in `media/`, so a leftover scratch file
would ship to `public/`, and validate would WARN that nothing references it. Nothing in this repo
writes `*.orig.*` files.

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
