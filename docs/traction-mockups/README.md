# Traction mockups (November 11, 2026)

Branch `traction-mockups`, based on `origin/main` at b5e4af2 ("Publish Engine Miles: plug-in hybrid banner,
screenshots and wording"), so the screenshots show the plug-in hybrid banner. That banner and wording are already
live from that `main` commit; the traction work on this branch (the "How it went" section, the stats lines and
`public/stats.json`) is not merged and not live. Cloudflare Pages deploys from `main` only.

What's on the branch:

1. A **"How it went"** section on the Engine Miles page, right under the 30-second overview.
2. A small **stats line** ("90+ users · 9 sales · updated daily") on the app cards on the home page and in
   the header of each app's page.

## Three numbers differ from the plan. Please check these first

I checked every number myself, read-only, on November 11. Three of the numbers we talked about don't hold up,
so the mockup uses the real ones:

| What we said | What the data says | What the mockup shows |
|---|---|---|
| 13 sales | **9 paid sales.** PostHog's 13 includes 4 free "thank you" upgrades you gave old-price subscribers on Oct 26 (RevenueCat promotional grants, store `PROMOTIONAL`). RevenueCat's revenue chart counts 9 paid transactions: 2 monthly, 4 yearly, 3 lifetime. | 9 sales |
| 100+ users | **About 93 real users.** RevenueCat has 103 customers, but 10 of them are from before the App Store release (your phones, your dad's, TestFlight and App Review). PostHog has 93 people once TestFlight is left out. | 90+ users |
| Launched Oct 7 | **On the App Store Oct 20.** Oct 7 was when 1.0 went to App Review. Apple approved it and you released it on Oct 20 (D-100 in the EngineMiles decision log). | "Oct 20, 2026: Launched on the App Store" |

At the current pace, 100+ users is about a week or two away. Once the daily job writes the file, the line will
switch to "100+" on its own.

## The copy

### Stats line

`90+ users · 9 sales · updated daily`

- Home page: inside each app card, under the one-line description.
- App pages: in the header, on its own line under the date and status.
- If the file hasn't been updated in more than 3 days, "updated daily" becomes "as of Nov 11" so the line
  never claims something that isn't happening.
- No line at all for an app with no entry (RelayReply), or when `public/stats.json` is missing.

### How it went (Engine Miles page)

**Timeline**

1. September 2026: **Built it in a month**
2. Oct 20, 2026: **Launched on the App Store**
3. First three weeks: **90+ users and 9 sales**

The timeline is history, so its numbers stay fixed (true as of Nov 11). The live totals are the stats line in
the header.

**The fix** (next to the chart)

> In PostHog I could see that almost half the people who got to the step asking for their engine miles so far
> quit right there, because every answer needed a number they didn't have.
>
> So in version 1.2 I added "Not sure yet: start now", which lets you skip it and estimates those miles after
> your first tank. The early numbers look better: of the first 15 people on 1.2 who reached that step, 11
> finished setup, about 3 in 4.

The second paragraph names the sample (15 people, early) in the sentence itself, so a reader who skips the chart
caption still sees how small it is.

**Chart:** "Setting up the app, before and after the fix"

| Step | Before (1.0), Oct 20 to 26, 66 people | After (1.2), since Oct 25, 18 people |
|---|---|---|
| Started setup | 66 (100%) | 18 (100%) |
| Added their car | 59 (89%) | 17 (94%) |
| Asked for engine miles so far | 53 (80%) | 15 (83%) |
| Finished setup | 33 (50%) | 11 (61%) |

Note on the engine-miles row: "Quit at this step: 43% before (23 of 53), 27% after (4 of 15)".

Caption: "Share of people who started setup. The 1.2 group is still small (18 people), so the after numbers are
early and will move." Source line: "PostHog, App Store installs that share usage data, checked Nov 11, 2026".

**What I watch:** I use PostHog and RevenueCat to see where people get stuck and where they decide to buy, and I
ship updates based on that.

**Marketing:** I've been posting in plug-in hybrid communities to get it in front of more owners.

## Where every number comes from

All checked read-only on Nov 11, 2026. Keys were read from the Keychain and never printed or saved.

| Number | Source | How |
|---|---|---|
| 93 people (PostHog) | PostHog project 649862 "EngineMiles Production" | distinct people on any event, `$is_testflight` not true |
| 103 customers, 10 before release | RevenueCat project proj12c58415 | customer list, `first_seen_at`; 2 dated 2013 (App Review style accounts) and 8 from Oct 6 to 8 |
| 96 active users, 94 new customers, 6 active subscriptions (28 days) | RevenueCat overview metrics | matches the brief |
| 9 sales | RevenueCat revenue chart, Sep 1 to Nov 11 | 9 transactions: Oct 20 (1), Oct 21 (3), Nov 1 (2), Nov 2 (1), Nov 7 (1), Nov 9 (1) |
| 4 gifts, not sales | PostHog `rc_non_subscription_purchase_event` | 4 with store `PROMOTIONAL`, product `rc_promo_pro_custom`, all on Oct 26 at 01:04 UTC |
| Released Oct 20 | EngineMiles `docs/DECISIONS.md` D-100, `docs/release/2026-10-07/release-status.json` | READY_FOR_SALE, release date 2026-10-20; App Review submission 2026-10-07 |
| The skip shipped Oct 25 in 1.2 | EngineMiles D-109 ("Not sure yet: start now", decided Oct 21), commit 4ef0b19, HANDOFF ("1.1 was never shipped on its own; it was folded into 1.2", "1.2 has been on the App Store since 2026-10-25") | |
| Funnel | PostHog, `onboarding_step_viewed` (steps `welcome`, `vehicle`, `startingPoint`) and `onboarding_completed` | one row per person; version = the version of their first onboarding event (1.2 = after, 1.0/1.0.1 = before); TestFlight left out; first seen on or after Oct 20 so App Review phones don't count |
| 43% and 27% quit | same | reached `startingPoint` and never finished: 23 of 53 before, 4 of 15 after |
| Burrow 10+ users, 1 sale | RevenueCat project projdead8002 | 13 customers first seen on or after its App Store release (Oct 19); the other 80 are from the Oct 4 to 14 TestFlight period. Revenue chart: 1 transaction (Oct 19, a yearly plan) |
| RelayReply | none | no RevenueCat project and no billing yet, so no line |

Splitting the funnel by app version rather than by date is the honest cut: people who installed 1.0.1 after
Oct 25 still saw the old setup, and 1.2 is the first version anyone outside TestFlight had with the skip.

Two smaller things in the data: PostHog only counts people who share usage data (people in Europe and the UK only
if they opt in), so it undercounts a little. And of the 13 people on 1.2 who added a car, 3 picked "Not sure yet";
the rest still typed a number, so the option seems to help mostly by making the step feel optional.

## public/stats.json

```json
{
  "engine-miles": { "users_rounded": "90+", "sales": 9, "updated_at": "2026-11-11" },
  "burrow": { "users_rounded": "10+", "sales": 1, "updated_at": "2026-11-11" }
}
```

- Keyed by project slug. `users_rounded` is rounded down to the nearest 10 (or 50 from 100) with a plus. `sales`
  is exact and counts paid purchases only (new subscriptions plus lifetime), never gifts or promos. No revenue.
- Read at build time through `getAppStats()` in `src/lib/content.ts`. The site is static and the file only
  changes through a commit, which rebuilds the site, so the numbers in the HTML always match the file.
- A missing file hides every stats line. A broken file is ignored with a warning in the build (so a bad nightly
  write can't take the site down), and `npm run validate` fails on it.
- For Social Diffusion's daily job: users = RevenueCat customers first seen on or after the app's release date
  (Engine Miles 2026-10-20, Burrow 2026-10-19), sales = the RevenueCat revenue chart's transaction count since
  release. Write the file, commit, and the deploy picks it up.

## Screenshots

Page tops through the new parts, light and dark, desktop (1440) and phone (390, at 2x).

| | Light | Dark |
|---|---|---|
| Home, 1440 | `home-1440-light.png` | `home-1440-dark.png` |
| Home, 390 | `home-390-light.png` | `home-390-dark.png` |
| Engine Miles, 1440 | `engine-miles-1440-light.png` | `engine-miles-1440-dark.png` |
| Engine Miles, 390 | `engine-miles-390-light.png` | `engine-miles-390-dark.png` |

## Decisions for you

1. **Show the true numbers (90+ users, 9 sales, Oct 20)?** My lean: yes. They're still strong for a three-week-old
   app, and a recruiter who checks the App Store date or asks about sales gets the same story.
2. **Burrow's line reads "10+ users · 1 sale".** It's real, but it looks thin next to Engine Miles.
   - A: Show it (it's honest and shows Burrow is live and selling)
   - B: Hide Burrow's line until it passes 50 users (delete its entry from stats.json)
   My lean: B. The line is there to impress, and for Burrow it doesn't yet. (Also, Burrow's PostHog has no
   events since its App Store release, so its analytics may be off in the release build.)
3. **"Built it in a month":** the repo's first commit is Sep 30 and it was on the App Store Oct 20, so "in under
   a month" is also true. I kept your words.

## Files

| What | Where |
|---|---|
| "How it went" section | `src/components/HowItWent.tsx` |
| Stats line | `src/components/AppStats.tsx`, used in `src/components/AppCard.tsx` and `src/app/projects/[slug]/page.tsx` |
| Schemas (`howItWent`, `stats.json`) | `src/lib/schema.ts` |
| Stats loader | `src/lib/content.ts` (`getAppStats`) |
| Validator check for stats.json | `scripts/validate-content.ts` |
| Chart colours (light and dark) | `src/app/globals.css` (`--chart-before`, `--chart-after`) |
| Engine Miles copy and numbers | `content/projects/engine-miles/project.json` (`howItWent`) |
| Sample stats | `public/stats.json` |
