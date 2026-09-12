## What this is

<!-- One project per PR. Which project, and what it does. -->

**Slug:** `` <!-- e.g. rpi-doorbell — must equal the folder name -->
**Where I found it:** <!-- e.g. old MacBook, ~/code/2019/doorbell -->

## Did it run?

<!-- Required. Pick one and fill it in. This is what separates a documented project from a guess. -->

- [ ] **Ran it.** Command(s) used, and what I saw:
- [ ] **Could not run it.** Reason, and the exact error:

Everything I wrote in `project.json` I observed by running this project or reading its source.
Anything I could not verify is written as "unknown" or recorded in `notes`.

- [ ] No invented facts. No guessed language/framework in `tech`, no unverified links, no inferred
      date presented as fact.
- [ ] Every screenshot and video is **of this project** — not another project's, not a mock, not a
      stock image.
- [ ] Every image has real `alt` text describing what is in the frame (not "screenshot of app").
- [ ] Uncertainties, omissions and anything I chose not to claim are recorded in `notes`.

## Gates

- [ ] `npm run validate` passes
- [ ] `npm run build` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run media -- <slug>` was run after the last media change, and every path in
      `project.json` matches the filenames it left in `content/projects/<slug>/media/`
- [ ] I loaded the page in `npm run dev` and looked at it

## Media

- [ ] All media is compressed — WebP for images, MP4 (H.264) for video. No `.mov`, `.HEIC`, `.gif`,
      or straight-off-the-clipboard PNGs.
- [ ] **Every file is under 8 MB.** Verified with
      `find content/projects/<slug>/media -type f -size +8M` (prints nothing).
- [ ] Every video has a generated `poster` pointing at its `<name>.poster.webp`.

## Scope

- [ ] **This PR touches only `content/projects/<slug>/`.** Verified with
      `git diff --stat main...HEAD`. (`public/media/<slug>/` is generated at build time and
      gitignored — it is never part of a diff.)
- [ ] No other project's folder was edited.
- [ ] Nothing under `src/` was edited.
- [ ] `package.json`, `package-lock.json`, `next.config.ts` and `content/profile.json` are untouched.
      No new dependencies.
- [ ] `published` is `false` and `featured` is `false`.

<!-- The one legitimate exception: `next dev` may re-add its managed block to AGENTS.md. Committing
     that single hunk is fine. Anything else outside that folder needs explaining here. -->

## Notes for review

<!-- Problems you spotted in OTHER projects (do not fix them here), decisions you made,
     anything that needs a human eye. -->
