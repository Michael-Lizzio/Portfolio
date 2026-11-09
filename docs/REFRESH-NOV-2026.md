# November 2026 refresh: what changed

Branch `refresh-nov-2026`, cut from `main` at 22e5517. Nothing is merged. Cloudflare Pages deploys
from `main`, so this only goes live when you merge it.

This file lists every change on the branch and, in the appendix, every project's copy before and
after, so you can check the wording line by line. The look of the site (colors, type, layout
directions) is a separate step and is not part of this branch.

## Quick summary

- **New projects:** Engine Miles, Burrow and RelayReply are now the three projects in "Selected work"
  on the home page and the first three on the Projects page.
- **Nav:** Home, Projects, Work, About, Contact, Resume. The old "Work" tab is now "Projects"
  (`/projects/`). "Work" (`/work/`) is a new page with the jobs from your resume.
- **Ranking:** Projects page shows the best 12 first, the rest behind a "Load more" button.
- **Copy:** every published page was rewritten in first person, shorter and plainer, except the
  cryptogram and foosball body text, which is untouched.
- **No em dashes** anywhere in content or site code. `npm run validate` now fails if one shows up.
- **Cryptogram videos:** the webpage-only video is gone. The solving video is now full page width
  and plays (muted, looped) when you scroll to it, and pauses when you scroll away.

## Structure and code changes

| What | Where |
|---|---|
| Project routes moved from `/work/<slug>/` to `/projects/<slug>/` | `src/app/projects/` (moved from `src/app/work/`) |
| New Work page from `content/work.json` | `src/app/work/page.tsx`, `content/work.json`, `WorkSchema` in `src/lib/schema.ts`, `getWork()` in `src/lib/content.ts` |
| Old `/work/<slug>` links redirect (301) to `/projects/<slug>/`; legacy github.io links now point at `/projects/...` (blackjack, wordle-solver and cyber-ttm now go to their pages, since they are published) | `public/_redirects` |
| Nav: added Projects, Work now means jobs | `src/components/SiteNav.tsx` |
| Ranking and "Load more" cutoff in one place | `src/lib/project-order.ts` (`RELEVANCE_ORDER`, `INITIAL_VISIBLE = 12`) |
| Projects grid: "Best first" / "Date" sort, "Load more" button (hidden cards stay in the HTML so links still work without JavaScript; focus moves to the first new card) | `src/components/ProjectGrid.tsx` (renamed from `WorkProjectGrid.tsx`) |
| Home: Selected work = the three apps, then "A few more I like" (next 3 by rank), then "Where I've worked" (from `work.json`) | `src/app/page.tsx` |
| Previous/next links on project pages follow the ranking instead of dates | `src/app/projects/[slug]/page.tsx` |
| Video autoplay on scroll (muted, loop, controls kept, off for reduced motion) | `src/components/AutoplayVideo.tsx`, `autoplay` field on media in `schema.ts`, `MediaFigure.tsx` |
| New section layout `wide` (media in the full page column) | `schema.ts`, `src/app/projects/[slug]/page.tsx` |
| Date ranges no longer drop the start month ("2025-April 2026" is now "November 2025 – April 2026") | `src/components/date.tsx` |
| Validator: checks `work.json`, warns if it links an unpublished project, fails on any em dash in content | `scripts/validate-content.ts` |
| Em dashes replaced in all content JSON (including `notes` and the unpublished `la2028` and `rit`) and in `src/` and `scripts/` code and comments | many files |
| Docs updated for the new routes, fields, ranking and writing rules | `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `docs/CONTENT_MODEL.md` |

The markdown docs (README, AGENTS, CONTRIBUTING, CONTENT_MODEL) still use em dashes in their own
older text. They are not on the site; say if you want those cleaned too.

## Media changes

- Removed `cryptogram/media/fullscreen_cryptogram.mp4` and its poster (the webpage-only video).
- Engine Miles: the TooAvid banner (with its "Android coming soon" line painted out, since that is
  not in the checked facts) and four App Store screenshots.
- Burrow: the TooAvid banner and five App Store screenshots.
- RelayReply: the TooAvid banner only. There is no real screenshot of a call yet.
- All copied from `~/cursor/Business/TooAvid/public/assets/` and compressed with `npm run media`.

## Ranking

Projects page, "Best first". The first 12 show; the rest are behind "Load more".

| # | Project | Why |
|---|---|---|
| 1 | Engine Miles | Shipped app, live on the App Store |
| 2 | Burrow | Shipped app, live on the App Store |
| 3 | RelayReply | The most ambitious; private beta |
| 4 | CalCardo | Full product taken to a live site |
| 5 | AI Database Filter | Real internship work with real numbers |
| 6 | Automated Foosball Goalie | Your best story, your own words |
| 7 | Cryptogram Solver | Your own words, and now the autoplay video |
| 8 | Document Management System | Biggest internship project |
| 9 | Automated Alarm System | Years of hardware and software with your dad |
| 10 | Parcel Web Analyzer | Clear, visual GIS project |
| 11 | RMF Checklist Automation | First internship, used for five quarters |
| 12 | Blackjack | Simple and nice, as you said |
| | **Load more** | |
| 13 | Symposium Notes | Hackathon, small and clear |
| 14 | Wordle Solver | Where the story starts |
| 15 | Web Browser MCP | Useful, but technical |
| 16 | WastedAsphalt | |
| 17 | U-Fund | |
| 18 | Sudoku Creator and Solver | |
| 19 | Warm Cold Square | |
| 20 | Agentic Report Generator | Experiment that didn't ship |
| 21 | Legacy Data Cleanup | Mostly AI-written code |
| 22 | Duolingo Hack | Funny, but a "hack" |
| 23 | Trip Planner | You named it as not front-page |
| 24 | RIT Dining Notifications | You named it |
| 25 | RIT Dorm Laundry Tracker | You named it |
| 26 | Roman Numeral Converter | You named it |
| 27 | One-Line Rock Paper Scissors | You named it |
| 28 | Tic-Tac-Toe | You called it weak |

**Kept unpublished, not deleted:** `rit` (the SWEN 101 page that runs away from the mouse, plus the
dorm dashboard; my guess for "the fun page"), `la2028` (the other trip planner), `gameface` and
`swen-344-library`. Nothing was deleted, so any of them can come back by flipping `published`.

**My view on dropping:** I would delete `rit` and `la2028` outright. Roman Numerals and One-Line Rock
Paper Scissors are fine at the very bottom, but if you ever drop them, also delete
`RomanNumeralConverter.tsx` and `RockPaperScissorsGame.tsx`, which only exist for those two pages.

## Site text, before and after

| Where | Before | After |
|---|---|---|
| Headline (`profile.json`) | Software Engineering Major at RIT | Software engineering student at RIT |
| Home bio (`profile.json`) | Aspiring software engineer with strong communication skills and a passion for sharing knowledge and collaborating on complex and challenging problems. I work mostly in Python, with a foundational understanding of several other languages, and I'm eager to expand my knowledge and keep learning new skills. | I'm a software engineering student at RIT, and I like building things people actually use. I have two iPhone apps on the App Store, Engine Miles and Burrow, and I'm working on a third, RelayReply, an AI that makes phone calls for you. |
| About, paragraph 1 | I'm a passionate computer programmer. When I got a Raspberry Pi for Christmas of 2018, I was super excited. Looking back on it, I am grateful that I had the unique opportunity to learn computer programming by just messing around and exploring the environment while making silly and sometimes complex projects. | I got a Raspberry Pi for Christmas in 2018 and I was super excited. I didn't really know what I was doing, so I just messed around with it and made silly projects, and some that were a lot more complicated than they needed to be. Looking back, I'm really glad I learned that way. |
| About, paragraph 2 | As my knowledge of computer science has grown over the years I have gradually realized how crucial syntax, code structure, and careful planning gives you the ability to create anything you can imagine. | Since then I've built a Wordle solver, a cryptogram solver, a robot foosball goalie (with some help from my dad), and a lot more. Now I'm studying software engineering at RIT, and I spend my summers interning. The last two were at Greenman Pedersen, working on AI and GIS tools. |
| About, paragraph 3 | What I find exciting about computer science is that there's always something new to learn. I'm looking forward to picking up more programming skills to improve my abilities. | These days most of my free time goes into my own apps. Engine Miles and Burrow are on the App Store, and RelayReply is in a private beta. What I liked about that first Raspberry Pi is still what I like now: there's always something new to figure out. |
| About, closing line | The projects are on the work page, and the fastest way to reach me is on the contact page. | You can see what I've built on the projects page, where I've worked on the work page, and how to reach me on the contact page. |
| About, collage caption | Skiing, the ocean, home — and the foosball table that became KURT. | Skiing, the ocean, home, and the foosball table that became KURT. |
| About, meta description | How a Raspberry Pi at Christmas grew into years of programming — and what I look for in a project now. | How a Raspberry Pi I got for Christmas in 2018 turned into years of building things. |
| Home, Selected work subtitle | The ones I'd show you first, with the story and artifacts behind each build. | The three apps I'm building right now. Two are on the App Store and one is in a private beta. |
| Home, new sections | (none) | "A few more I like" and "Where I've worked", with buttons "All 28 projects" and "More about my work" |
| Projects page tagline (was the Work page) | Everything with a write-up — robotics, algorithms, embedded hardware and web apps. | Apps I've shipped, things I built at my internships, and a lot of side projects. The best ones are first. |
| Projects page meta description | Every project with a write-up: robotics, algorithms, embedded hardware and web apps. | Apps I've shipped, things I built at my internships, and a lot of side projects, best first. |
| Projects page sort button | Relevant | Best first |
| Projects page, empty state | Nothing is published yet. Projects appear here as they are written up. | Nothing is published yet. Projects show up here as I write them up. |
| Project page breadcrumb and footer button | Work / All work | Projects / All projects |
| Contact tagline | Email is the surest way to reach me. Everything else below works too. | Email is the best way to reach me, but any of these work. |
| Contact meta description | Email, resume and every account worth linking to. | How to reach me: email, my resume and my other accounts. |
| 404 text | The link may be from the old site — projects now live at /work/<project>. The work page lists every one of them. | The link might be from an older version of this site. Projects live at /projects/<project> now, and the projects page lists every one of them. |
| 404 button | See all work | See all projects |
| Browser tab and share title | Michael Lizzio — Software Engineering Major at RIT | Michael Lizzio · Software engineering student at RIT |
| Site and share description | (the headline) | (the new bio) |

## The new Work page

Text is in `content/work.json`, written from your resume (`public/resume.pdf`, Sep 14 version).
Intro: "I've spent three summers working as a software intern: two at Greenman Pedersen (GPI) and
one at TTM Technologies. Here's what I did at each." Each job has a one or two sentence summary in
first person, three or four short points, and links to the projects from that job. Education is
RIT, B.S. in Software Engineering, 2024 to 2029, GIS immersion, GPA 3.8. No phone number.

## Your pages (cryptogram and foosball)

Body text, headings and captions are exactly as they were. What changed:

- **Cryptogram summary** (the paragraph under the photo) was third person ("after the author
  grabbed...") and still described two videos. It's now three first-person sentences. See the
  appendix. If you count the summary as yours, tell me and I'll put back whatever you want there.
- **Cryptogram image descriptions** (alt text, read by screen readers, not shown): "the author's
  dad's solution alongside the author's own" is now "my dad's solution next to mine", and "the
  author's rescued whiteboard" is now "my rescued whiteboard". The em dash is gone.
- **Cryptogram videos:** the webpage-only video was removed; the solving video is full width and
  autoplays on scroll. Its caption is unchanged. It still sits where it was, after "My Whiteboard";
  I didn't move it up because that changes your page's order. Easy to move if you want.
- **Foosball summary** was a description of the page ("a build log... the page is a dated timeline
  of seven videos"). It's now three first-person sentences about KURT.
- **Foosball gallery line** ("Select any image to open the gallery, then use the arrow keys...")
  was left alone because it's on your page, but it reads like UI help an agent added. Say the word
  and I'll remove it.

## Things I assumed (please check)

- Engine Miles and Burrow facts come from the checked facts files in SocialDiffusion and each app's
  HANDOFF: both live on the App Store since October 2026, Engine Miles Pro $1.99 / $9.99 / $29.99,
  Burrow Pro $4.99 / $29.49. The TooAvid site still says beta / TestFlight and old Engine Miles
  prices; that site is out of date.
- RelayReply has no link and no prices on the page, because its facts file says "not posting yet".
  The "Why I built it" section is written from the product brief (who it's for), not from a story
  you told. Please give me the real reason and I'll use your words.
- The Engine Miles story (your dad's 2022 RAV4 Prime and his paper logbook) and the "whole car" /
  "car's lifetime" moment are from the Engine Miles press drafts and decision log.
- Burrow's reason (wanting real time for projects and reading every week at college) is from its
  HANDOFF.
- Start dates: Engine Miles and Burrow September 2026, RelayReply April 2026 (each repo's first
  commit). The AI-assisted / human-led badge is left empty on all three until you pick one.
- Work page dates follow the resume ("Summer 2026" etc.). If 2026 at GPI was a co-op, not an
  internship, the title needs to change.

## How to look at it

```bash
cd ~/cursor/personal/Portfolio
git switch refresh-nov-2026
npm run build && python3 -m http.server -d out 3000    # or: npm run dev
```

Pushing the branch makes a Cloudflare preview; that preview is safe. Merging is deploying.


---

# Appendix: every project's copy, before and after

Before is `main` at 22e5517. After is this branch. Projects whose visible copy did not change are listed at the end.


## Agentic Report Generator (`agentic-report-generator`)

### Before

- Title: Agentic Report Generator
- Tagline: An experiment in letting a local AI research data and build its own reports
- Summary: I experimented with a local AI system that could take a question, research a complex operational database, create charts and maps, and write a report from what it found. I built the research tools, agent workflow, visualizations, streaming interface, and safeguards around database access. The prototype proved that the workflow was possible, but the available local models forced a tradeoff between useful reasoning and acceptable response time, so it never became reliable enough for production.
- Status: Experimental internship prototype

**The experiment**

> The idea was to give users a ChatGPT-style interface connected to the same operational data they already worked with. Instead of choosing tables, writing SQL, exporting results, and assembling a report by hand, someone could ask a question in plain English and let the system work through those steps.

> Users could choose from the local models installed on the workstation. Simple questions could return a short answer, while an explicit report request started a longer workflow that planned the research, gathered evidence, created visualizations, and composed a document.


**A report built in stages**

> I split the work into stages because asking one model call to understand the question, research the database, calculate results, and write a polished report was too much. The planning stage produced a title, research questions, and section outline. A research loop then chose tools and kept working until it had enough findings. Finally, the writing stage composed each section from the saved evidence rather than relying on the model's memory of earlier tool calls.

- Code block: QUESTION /    ↓ / UNDERSTAND  →  research plan + report outline /    ↓ / RESEARCH    →  schema search → read-only SQL → saved findings /    ↓                              ↘ charts + maps / COMPOSE     →  one grounded section at a time /    ↓ / REPORT

**Letting the model research**

> The model could inspect relevant schema descriptions, sample rows, check distinct values, and run its own SELECT queries. I added embedding-based schema retrieval so it received the tables related to the question instead of the entire database definition. This helped preserve the limited context window for the actual research and writing.

> Every successful query became a saved finding with its purpose, SQL, and result. The final report was grounded in that finding log, and large query results could be handed directly to visualization tools on the server without filling the model's context with thousands of values.


**Charts and maps as tools**

> I created chart tools for bar, line, pie, scatter, grouped, stacked, and histogram views. The model supplied a constrained data specification, and the server rendered the image with Matplotlib. The model never generated or executed plotting code, which made the feature more predictable and much safer.

> For geographic questions, the model could run a read-only query and turn the result into GeoJSON for an interactive map. The tool supported heat maps, points, clusters, and categories, automatically connected signal identifiers with coordinates when needed, and created a static snapshot that could be embedded in a report.


**Making long runs survivable**

> Report generation could take several minutes, so I made each run an independent background task rather than tying it to one browser request. Progress, model output, tool calls, and errors streamed through Server-Sent Events. If the browser disconnected, the work continued and the interface could reconnect and replay what it missed.

> Conversations, reports, charts, maps, and research findings were saved to disk. I also experimented with conversation compaction so longer chats could be summarized before they overflowed the model's context window.


**Keeping database access contained**

> The research agent was allowed to write flexible SQL, but it was not allowed to write to the database. Queries were checked to allow only a single SELECT or WITH statement, capped to a reasonable number of rows, and executed through PostgreSQL sessions configured as read-only with statement timeouts. The database itself was the final enforcement layer.

> Chart and map tools reused the same protected query path. Their inputs were validated specifications rather than arbitrary code, so adding a visual did not create a second route around the database or execution safeguards.


**Where the prototype fell short**

> The limiting factor was the local model. Smaller models fit the available hardware and responded quickly, but they often stopped their research too early, wrote shallow analysis, or mishandled a complicated sequence of tool calls. Larger models were noticeably better, but took too long for an interactive application on the workstation I had.

> I added routing, retries, context controls, SQL repair, automated tests, and evaluation scripts, but those systems could not create reasoning ability that the model did not have. The final prototype demonstrated the architecture and produced working reports, charts, and maps, but it never reached the consistency I would require before giving it to users.


**What I learned**

> This was useful precisely because it did not turn into a polished production feature. I learned how to break an open-ended task into agents and tools, preserve state across a long-running workflow, ground writing in recorded evidence, and design execution boundaries around generated SQL. I also learned to recognize when better orchestration could help and when the underlying model was simply the bottleneck.



### After

- Title: Agentic Report Generator
- Tagline: An experiment in letting a local AI research a database and write its own reports
- Summary: At my 2026 internship I tried building an AI that could take a question, dig through a big database on its own, make charts and maps, and write up a report. It worked, but the small models we could run locally weren't smart enough to do it reliably, so it stayed an experiment.
- Status: Internship experiment

**The idea**

> Instead of picking tables, writing SQL, exporting results and building a report by hand, you'd just ask a question in plain English. Simple questions got a short answer, and asking for a report started a longer process.


**How it worked**

> I split it into steps, because one AI call couldn't do everything at once. First it planned the report and the questions to answer. Then it researched: it looked up the tables it needed, ran read-only queries, and saved each result as a finding. Last, it wrote each section from those saved findings, so the report was based on real numbers instead of whatever the model remembered.

- Code block: QUESTION /    ↓ / UNDERSTAND  →  research plan + report outline /    ↓ / RESEARCH    →  schema search → read-only SQL → saved findings /    ↓                              ↘ charts + maps / COMPOSE     →  one grounded section at a time /    ↓ / REPORT

**Charts and maps**

> The AI could ask for charts and maps, but it never wrote plotting code. It just described what it wanted and the server drew it. Maps could show heat maps, points or clusters of signals.


**Keeping it safe**

> The AI could write its own queries, but only ones that read data, with a row limit and a timeout, on a read-only database connection. So even a bad query couldn't change anything.


**Why it stayed an experiment**

> Small models were fast but stopped researching too early or wrote shallow reports. Bigger ones did better but were way too slow on the computer I had. I added retries, better prompts and tests, but that can't make a model smarter than it is. It was still worth doing, because it taught me how to tell when the problem is my code and when it's the model.



## AI Database Filter (`ai-database-filter`)

### Before

- Title: AI Database Filter
- Tagline: A local AI assistant for exploring a complex database in plain English
- Summary: I built an end-to-end filtering system for a county traffic-signal management application covering more than 2,000 signals and a large network of related records. The finished feature combined a flexible visual query builder with a local AI assistant that could understand plain-English requests, propose filters for review, and help users repair filters they had already created. I also expanded it into a shared filter library, where people could save useful filters and groups to their accounts, organize them, and share them with the rest of the team. This page follows the project from the first manual controls through retrieval, model evaluation, prompt tuning, database safeguards, sharing, and production integration.
- Status: Internship project
- Hero caption: The finished workspace kept database exploration, active conditions, and reviewable AI suggestions in one place.

**Starting with the real filtering problem**

> The application brought together signal inventory, timing, maintenance, documents, locations, and other operational records. The tables were deeply connected, and many fields contained inconsistent or free-entry text. A useful filter could not stop at simple equals and greater-than conditions. It needed to follow relationships, search text, compare values, count related records, handle dates, rank results, and still make sense to someone who did not write SQL.

> I owned this feature end to end. Before adding AI, I built the visual filter system first. That forced me to understand the full set of operations, how filters should be represented, and what the interface needed to communicate. It also gave the AI a controlled language to work with later instead of letting it generate arbitrary database queries.

- Media `integrated-signal-filter.webp`: The filter workspace was integrated into the larger signal-management application instead of remaining a standalone prototype.

**Designing for imperfect data**

> Some of the hardest cases came from fields that were not as structured as their names suggested. A timing value, for example, could contain one number, several numbers, or ordinary text. I added operators that could recognize individual numbers inside mixed text, so a search for 3 could still match a record containing 3 and 5 without treating 13 as the same value.

> The query builder grew to support text and regular-expression searches, relative dates, column-to-column comparisons, counts and totals across related records, top-N rankings, and nested AND, OR, and NOT logic. Users could build those conditions manually, while the same filter model became the safe target for the AI assistant.


**Adding a conversational assistant**

> I added a chat interface beside the filter builder and connected it to a local language model through Ollama. A user could ask for one condition or an entire group of filters, inspect the proposed changes, and decide whether to add them. The assistant could also read the filters already on screen, explain unexpected results, and propose updates instead of starting over.

> The model never directly controlled the database or silently changed the interface. It produced structured filter actions, the backend checked them against live metadata, and the user received reviewable proposal cards. That separation made the AI useful without asking anyone to trust an invisible SQL query.

- Media `ai-chat-proposal.webp`: A plain-English request became a specific filter proposal that the user could inspect, approve, or deny.
- Media `structured-tool-call.webp`: An earlier development view exposed the structured tool call behind the conversation while I refined the assistant workflow.

**Giving a small model the right context**

> The full database description was too large to place in every prompt, especially on the limited hardware available. I built a retrieval system that embedded curated descriptions of the filterable tables and compared them with each request. The most relevant tables, columns, example values, and usage notes were placed into the prompt, while the central signals table and any tables already used by the current filters stayed available for continuity.

> The curated descriptions helped the model understand what the data meant, but they were never trusted as executable truth. Live PostgreSQL metadata still verified the tables, columns, types, and shortest join paths. Retrieval selected the useful context; the database schema decided what was actually valid.


**Testing models instead of guessing**

> The workstation had very limited GPU memory, so choosing a model was an engineering constraint rather than a preference. I built a repeatable evaluation harness and ran the same 200 requests across eight local models. The suite covered everyday filters as well as difficult combinations involving counts, rankings, dates, regular expressions, and related tables. Outputs were anonymized and graded against expected behavior, while the harness also measured response time.

> The original 4B model was accurate but took roughly 43 seconds for a typical response because it could not fit fully on the GPU. The best balance was Qwen2.5 Coder 3B. It fit the hardware and responded in about 8 seconds before tuning. The result also taught me that a coder-oriented model was a good match because the task was closer to generating a strict data structure than having an open-ended conversation.

- Media `local-model-hardware.webp`: The local model had to fit a 4 GB professional GPU, so memory use and response time became part of model selection.

**Learning how to tune the system**

> I used the evaluation results to find repeatable failure patterns instead of patching individual answers. The smaller model struggled most with related-record counts, rankings, and requests that combined a ranking with existing conditions. I ran about 50 controlled prompt experiments and learned that rules alone could make the model worse. Compact rules paired with carefully chosen few-shot examples worked much better.

> On the matched benchmark, the tuned 3B model improved from about 85% to 91% while keeping its median response near 10 seconds. I also tested it on a fresh set of messier prompts. That holdout showed a smaller improvement and a lower real-world score, which was a useful reminder that a benchmark can overstate progress when its wording resembles the examples used for tuning.


**Building safety around the AI**

> I treated generated output as untrusted input. The assistant could only propose supported filter operations, identifiers were checked against an allowlist and live schema metadata, values were passed as query parameters, and invalid actions were rejected or returned to the model for repair. The backend resolved joins rather than asking the model to invent them.

> Database execution ran inside read-only transactions with timeouts, and sensitive tables and columns were excluded from the metadata shown to the assistant. Development used a local database copy, but I still designed the safeguards as if the feature were already connected to production data.

- Media `applied-filter-proposals.webp`: The development interface made the generated conditions and SQL preview visible while keeping each proposed change behind a user decision.

**Turning filters into a shared library**

> Once the filters became useful, I expanded the system so they would not disappear at the end of a session. Each user could build a personal library of saved filters, give them names and descriptions, mark favorites, and organize several conditions into reusable groups. Groups could preserve their AND, OR, and NOT logic, so someone could save an entire investigation instead of rebuilding each condition one at a time.

> I also built the discovery side of the library. People could search the catalog, narrow it by table or column, and sort it alphabetically, by recency, by updates, or by how often it was used. Usage was tracked separately for each person's library and across the public catalog, which made frequently useful filters easier to find without changing the filter itself.

> Creators could publish a filter to the browsable catalog or keep it unlisted and share it through a short link. Other users could add a shared filter to their own library, and if its creator improved it later, they would see an update indicator rather than silently receiving a different result. I added ownership-aware editing, favorites, duplicate protection, and update acknowledgements so the library felt like a real collaborative feature instead of a folder of saved JSON.

- Media `public-filter-library.webp`: The public catalog let teammates discover and add filters that other users had already created.
- Media `saved-filter-editor.webp`: Saved filters kept their conditions, visibility, description, share link, and grouping in one editable record.

**From prototype to team feature**

> The project began as a standalone Fastify prototype and later became a production service integrated into the existing signal-management application. I built the backend, the filter and chat interfaces, streaming status updates, the shared library, and the connection between AI proposals and the existing data grid. I also packaged the frontend changes to minimize the amount of teammates' code that had to change.

> I used AI-assisted development throughout the project to prototype approaches, refactor code, and review large evaluation runs. The fast feedback loop helped me explore more options, but the architecture, expected behaviors, safety boundaries, and final decisions came from testing the complete system against the actual problem. Working closely with the production and data teams also helped turn a broad idea into something that fit the larger application.


**What I took away**

> This project changed how I think about small local models. Model size mattered less than choosing a model suited to the output, retrieving only the context it needed, and measuring the result on realistic requests. It also showed me that the most important part of an AI feature is often everything around the model: the interface, validation, database constraints, evaluation process, and the point where a person stays in control.



### After

- Title: AI Database Filter
- Tagline: A local AI assistant that turns plain English into database filters you can check
- Summary: At my 2026 internship I built a filtering system for a county traffic signal app that covers more than 2,000 signals. You could build filters by hand, or just ask in plain English and a small AI running on our own computer would suggest filters for you to approve. Later I turned it into a shared library so the team could save and share their filters.
- Status: Internship project
- Hero caption: The finished filter workspace: fields, active filters and AI suggestions side by side.

**Starting without AI**

> The database had everything about the signals: timing, maintenance, documents, locations, and a lot of tables all connected to each other. Plenty of fields were messy free text too. So before adding any AI, I built the filter builder by hand. It could search text, compare columns, count related records, handle dates, and nest AND, OR and NOT.

> Doing that first meant the AI later had a safe, limited set of filters to work with, instead of writing its own SQL.

- Media `integrated-signal-filter.webp`: The filter workspace inside the signal app.

**Asking in plain English**

> Next I added a chat panel next to the filters. You could ask for something like signals with vehicle detection, and it would come back with filter cards you could approve or deny. It could also read the filters already on screen and fix them.

> The AI never touched the database directly. Every suggestion got checked against the real database structure, and queries only ran read-only.

- Media `ai-chat-proposal.webp`: A plain-English request turned into a filter I can approve or deny.
- Media `structured-tool-call.webp`: An early version that showed the tool call behind the chat.
- Media `applied-filter-proposals.webp`: Applied filters, the SQL they make, and new suggestions waiting for a decision.

**Picking a model that fits**

> The work computer had a 4 GB GPU, which is tiny for AI. The model I started with was accurate but took about 43 seconds to answer. So I built a test harness and ran the same 200 requests across 8 local models, grading every answer. The winner was Qwen2.5 Coder 3B, which fit on the GPU and answered in about 8 seconds.

> After about 50 rounds of prompt tweaking, it went from about 85% to 91% on my tests. On a fresh set of messier prompts it improved less, which was a good reminder not to trust a benchmark too much.

- Media `local-model-hardware.webp`: Ollama running next to the GPU memory meter.

**Sharing filters**

> Once people started using it, I didn't want good filters to disappear when you closed the tab. So I added a library where you can save filters and groups of filters, favorite them, and share them with the team by link or in a public catalog. If someone updates a filter you saved, you get a small update notice instead of it changing under you.

- Media `public-filter-library.webp`: The public catalog of saved filters.
- Media `saved-filter-editor.webp`: Editing a saved filter.

**Where it ended up**

> It started as a standalone prototype and ended up built into the team's real app. The biggest thing I took from it is that the model was a small part of the work. Most of it was everything around the model: the checks, the testing, and making sure a person always gets the last word.



## Automated Alarm System (`alarm-system`)

### Before

- Title: Automated Alarm System
- Tagline: Three generations of a home alarm built from hacked hardware, a Raspberry Pi, and custom software
- Summary: This home alarm grew from a 2020 Raspberry Pi experiment with my dad into a custom Pygame console and, later, a remotely accessible web system. The first version decoded the indicator lights on an inexpensive RF alarm panel; the current version separates sensors, data, motion, cameras, audio, notifications, and the web interface into independent services connected by a JSON-over-TCP protocol. This page follows that evolution, including the long-runtime failure that forced me to rethink how the system stored state.
- Hero caption: The current browser dashboard running locally with isolated demonstration sensor data.

**Version one: reading the alarm panel**

> The project started around 2020 when my dad and I opened an inexpensive RF alarm panel and soldered leads onto the LEDs it used to show its wireless door-sensor states. A Raspberry Pi with a Pi-Plates TINKERplate sampled four analog channels for the garage, gate, back door, and front door. Instead of replacing the panel, the program learned to interpret the hardware that was already there.

> The decoder classified voltage ranges as no power, LED off, or LED on. It also counted the panel's blinking pattern over a 15-second window so it could distinguish a genuinely open sensor from a finicky one. Relays let the Pi silence the panel's native beeper or briefly interrupt its power for a reset. The embedded version notes show email alerts, daily rotating logs, mode-specific audio, Wi-Fi failure handling, and motion detection arriving between August 2020 and August 2021.

- Media `panel-opened.webp`: The inexpensive RF alarm panel opened on the workbench before the status-light signals were brought out to the Raspberry Pi.
- Media `led-wiring.webp`: The key hardware hack: leads soldered into the panel's indicator-light circuitry so the software could observe the four sensor states.
- Media `panel-interface.webp`: The added connector kept the modified panel self-contained while giving the external interface a clean place to attach.

**From the panel's LEDs to named sensor states**

> The early photos and videos show the whole idea more clearly than a diagram can. We kept the alarm panel as the RF receiver, tapped the signals it already displayed through its LEDs, routed those lines through a connector in the case, and built the Raspberry Pi-side interface around an expansion board, relays, and a small breadboard. The software then turned voltage levels and blink patterns into the garage, gate, back-door, and front-door states used everywhere else in the system.

> These are raw iPhone tests from July 2020, not a later recreation. The first clip checks the existing wireless sensor at the garage door. The second captures the modified panel changing its own indicator lights on the bench. The last places that hardware beside the running decoder, showing the physical alarm state reaching the program as readable output.

- Media `pi-interface.webp`: The early Pi-side bench setup used an expansion board, relay channels, a ribbon cable, and a breadboard indicator while we worked through the hardware interface.
- Media `garage-sensor-test.mp4`: Testing the existing wireless garage-door sensor in place before following its state through the rest of the system.
- Media `panel-led-test.mp4`: A bench test of the panel's original status display—the signals the Raspberry Pi interface was built to read.
- Media `decoder-bench-test.mp4`: An early end-to-end test with the physical panel in front of the live decoder output.

**Version two: a completely custom Pygame console**

> In August 2022 I turned the script into a full-screen control panel built entirely with Pygame, without AI assistance. Every panel, button, arrow, translucent overlay, line, label, and light/dark state was drawn with reusable Pygame primitives. Building those layout helpers taught me far more than simply following a tutorial would have: I was effectively making a small UI toolkit inside a game library.

> The home screen combined the current mode, automatic day/night state, Wi-Fi and power indicators, four large sensor tiles, settings access, and a screen saver intended to reduce burn-in on an always-on display. The archived hardware calls are disabled on this PC, but the interface itself still runs under its original Python 3.9 and Pygame 2.1.2 environment.

- Media `alarm_system_cover.webp`: The main Pygame display in AUTO / NIGHT mode.

**Modes, settings, locks, and statistics**

> HOME, NIGHT, OUT, and AWAY could each enable a different combination of messages, periodic status updates, motion alerts, voice, chimes, reminders, and other audio. AUTO selected HOME or NIGHT from configurable start times. Separate pages controlled master and category-level audio, screen and settings timeouts, motion-recording duration, notification cadence, and per-recipient email or SMS preferences.

> The settings hub also included PIN-protected administrative areas and a facts page. It tracked total and daily openings for each sensor, time spent open, average openings per day, average open duration, and finicky detections. The small mushroom in the corner was a deliberately playful hidden exit control.

- Media `pygame_settings.webp`: The settings hub, captured directly from the running Pygame framebuffer.

**The failure that changed the design**

> The Pygame version ran continuously on a Raspberry Pi, but after roughly a week or two it could exhaust resources and crash. I remembered the failure as an ever-growing list of alarm states. The surviving snapshot does not contain that exact unbounded list: its sensor, status, and blink arrays stay fixed at four entries. It does, however, run its main render loop with the 60 FPS limiter commented out and repeatedly reread small text files throughout that loop, so the precise trigger cannot be proven from this archive alone.

> Debugging a failure that only appears after days of uptime was an important lesson. The current design makes the intended safeguards explicit: service change buffers use bounded deques, log files rotate nightly with retention limits, and one data service owns persistent writes. That experience changed how I think about queues, logging, resource ownership, and testing software meant to run indefinitely.


**Version three: a network of services**

> The 2025 rebuild moved the interface to Flask and split the system into independently testable processes. I arrived at the shape by separating each responsibility and solving the communication problems as they appeared, before I had formally learned to call the result a microservice architecture. I did use ChatGPT while developing this generation; the earlier Raspberry Pi and Pygame versions were human-led.

> The main orchestrator starts the stack, waits for readiness, polls each service at an appropriate cadence, resolves AUTO into the active HOME or NIGHT policy, and routes events to audio and notification behavior. The hardware-server prototype remains in the source but is not started, and its default port currently collides with the motion server; the diagram marks that unfinished edge with an asterisk.

- Media `architecture.webp`: A Mermaid service map of the current system. Ports are the defaults found in the source; the hardware-server prototype's 9103 port overlaps the active motion server.

**The services**

> The Data Server is the only process that reads and writes the JSON store, using locks and atomic replacement. The System Server polls ADC voltages, applies the legacy blink-state algorithm, updates facts, and controls reset and beeper relays. The Audio Server serializes sound and speech requests through a playback queue and caches generated TTS. The Motion Server accepts bearer-authenticated Wi-Fi sensor posts, opens an event, extends it with new triggers, and closes it after an idle timeout followed by a cooldown.

> The Relay Server combines device-presence tracking with an HTTP bridge for iOS Shortcuts. The Notification Server handles Telegram commands and alerts with Gmail fallback. The Camera Hub accepts JPEG frames from ESP32-class devices, keeps only a short bounded frame buffer, watches liveness, and exposes an MJPEG viewer. Finally, the Flask app combines that state into the dashboard, facts, history, settings, and administrator pages.

- Code block: request / { /   "clientName": "MAIN->SYS", /   "clientCode": "…", /   "endpoint": "get_state", /   "body": {} / } /  / response / { /   "status": "ok", /   "endpoint": "get_state", /   "body": { "alarm": { "sensors": { "…": "…" } } } / }

**A web dashboard for a physical system**

> The browser interface preserves the glanceable four-sensor layout while making the system usable from laptops and phones. Closed sensors are green, open sensors are red, and live updates arrive without a page refresh. A separate facts view turns the long-running history into totals and per-door averages instead of forcing someone to interpret raw logs.

> Settings expose the selected operating mode, audio categories, the AUTO schedule, per-mode alert toggles, screen behavior, light/dark themes, security controls, and Telegram preferences. The history page can display event, motion, and system logs as a chronological timeline or grouped view, with filters and downloads.

- Media `web_facts.webp`: The facts page with isolated demonstration values used for the local test.

**Device approval and private remote access**

> Access is tied to the requesting device's IP address. A new address is recorded as pending; from the administrator console, a super user can name it and grant user, admin, or super access. The console also shows which approved devices are online or recently active, what page they last visited, their Telegram mapping, and controls for creating or editing accounts.

> At home the site is served on the local network. Tailscale extends that private network so the same dashboard can be reached remotely through a VPN without publishing it as a public website. The current implementation trusts the forwarded client-IP header, which is acceptable only behind a trusted proxy and is one of the security boundaries I would harden before treating the design as a general-purpose product.

- Media `web_admin.webp`: The administrator overview populated with fictional devices and documentation-only IP addresses.

**Motion, cameras, and notifications**

> Wi-Fi motion nodes authenticate with a per-device code, then report activity to the ingest server. The server treats the first trigger as the start of a session, extends the deadline for later triggers, automatically closes an idle session, and waits through a cooldown before starting another. Camera nodes follow a similar enrollment idea: an ESP32 can send JPEG frames to the hub, which reports frame rate and up/down state while serving the latest frames to the dashboard.

> Telegram was the most practical remote-control and alert channel to set up, so the system can apply each account's choices for door, motion, critical, status, and reminder messages. Gmail provides a fallback. Locally, the audio service can queue sound effects or cached voice announcements so two events do not talk over one another.


**Where I would take it next**

> The original sensors were physically wired into one Raspberry Pi through the alarm panel. The newer architecture makes it possible to add Wi-Fi sensor nodes built from Raspberry Pi Picos and camera nodes built from ESP32 hardware, extending coverage without running every signal back to the same board.

> If I rebuilt the transport today, I would evaluate Redis for shared state and queues or Kafka for durable event streams instead of maintaining every protocol primitive myself. Even so, writing the TCP framing, retrying clients, bounded queues, data ownership, and service supervision by hand made the reasons for those tools concrete rather than theoretical.



### After

- Title: Automated Alarm System
- Tagline: A home alarm my dad and I hacked together in 2020, and I've rebuilt twice since
- Summary: This started in 2020, when my dad and I opened up a cheap wireless alarm panel and wired its lights into a Raspberry Pi. Since then it's gone through three versions: the original script, a full-screen Pygame console, and now a web dashboard I can check from my phone.
- Hero caption: The current web dashboard, with demo sensor data.

**Version one: reading the lights (2020)**

> The alarm panel had a little light for each door sensor. Instead of replacing it, we soldered wires onto those lights and fed them into a Raspberry Pi, so my program could tell when the garage, gate, back door or front door opened. Some states blink, so the code watches each light for 15 seconds to tell a really open door from a flaky sensor. A relay let the Pi silence the panel's beeper too.

- Media `panel-opened.webp`: The panel opened up on the workbench.
- Media `led-wiring.webp`: Wires soldered onto the four status lights.
- Media `panel-interface.webp`: A connector so the panel could plug into the Pi.

**The first tests (July 2020)**

> These are the original phone videos from July 2020. First the garage sensor, then the panel's lights changing on the bench, and then the panel next to my program reading it live.

- Media `pi-interface.webp`: The Pi side of the setup: relays, a ribbon cable and a breadboard.
- Media `garage-sensor-test.mp4`: Testing the garage door sensor.
- Media `panel-led-test.mp4`: The panel's lights switching on the bench.
- Media `decoder-bench-test.mp4`: The panel next to my program reading it live.

**Version two: a Pygame console (2022)**

> In 2022 I turned it into a full-screen control panel in Pygame, without any AI help. Pygame doesn't come with buttons or menus, so I drew every one myself, which basically meant building my own small UI toolkit. It had modes like Home, Night and Away, each with its own alerts and sounds, plus a stats page that counted how often each door opened.

- Media `alarm_system_cover.webp`: The main screen in Auto Night mode.

**Settings and a hidden mushroom**

> The settings screen had audio, timers, modes, stats, motion and email settings, and some of it was locked behind a PIN. The little mushroom in the corner is a hidden exit button, just for fun.

- Media `pygame_settings.webp`: The settings screen.

**The crash that changed everything**

> The Pygame version ran all day on a Pi, but after a week or two it would run out of resources and crash. A bug that only shows up after days is really hard to track down. It taught me to think about things like memory that keeps growing, logs that never get cleaned up, and which part of a program owns which data.


**Version three: a team of small programs (2025)**

> So in 2025 I rebuilt it as a bunch of small programs that talk to each other: one for the sensors, one for the saved data, one for sound, one for motion sensors, one for cameras, one for Telegram alerts, and a Flask web app on top. I didn't know the word microservices yet. I just kept splitting things up until each part had one job. I used ChatGPT while building this version.

- Media `architecture.webp`: How the pieces connect.

**The web dashboard**

> The dashboard keeps the same four big door tiles, green for closed and red for open, and they update live. There's a facts page, a history page, settings, and an admin page where I approve new devices. It runs on our home network, and I use Tailscale to reach it from anywhere without putting it on the public internet.

- Media `web_facts.webp`: The facts page, with demo numbers.

**What's next**

> The new setup makes it easy to add sensors that don't have to wire back to one Pi, so next I want Wi-Fi motion sensors built from Raspberry Pi Picos and more ESP32 cameras. If I rebuilt the messaging today I'd probably use something like Redis instead of writing it all myself, but writing it myself is how I learned why tools like that exist.

- Media `web_admin.webp`: The admin page, filled in with made-up devices.


## Burrow (`burrow`)

New page.

### After

- Title: Burrow
- Tagline: An iPhone habit time tracker: tap an activity and your time starts
- Summary: Burrow is an iPhone app for making steady time for the things you care about, like reading, studying or side projects. You tap an activity's name to start a timer, answer a few questions you wrote yourself when you finish, and Marko the marmot cheers you on. It's been on the App Store since October 2026.
- Status: On the App Store

**Why I built it**

> At college I wanted real time for my projects and for reading every week, and I kept losing track of it. I'd feel like I was putting in the hours and then not actually know. A checkbox that says "read today" doesn't tell you if it was five minutes or two hours.

> So I wanted something where starting a timer is one tap, and where I could look back and see where my time really went.

- Media `burrow_timer.webp`: Tap a name and your time starts.

**How it works**

> You tap an activity's name and the timer starts. It also shows up on the Lock Screen and in the Dynamic Island, so you can pause or finish without opening the app. Each activity can have a goal for the day, week or month.

> When you finish, Burrow asks a few questions you wrote yourself, like how focused you were or how many pages you read. You can skip them, but they're what turns a pile of minutes into something useful later, like seeing which sessions actually go well.

- Media `burrow_reflect.webp`: Questions you write yourself, after each session.
- Media `burrow_lock_screen.webp`: The timer on the Lock Screen.

**Nudges, but only if you forget**

> Burrow learns when you usually start each activity. If you usually read around 9 and it's 9:10 and you haven't started, you get one nudge. If you already started, it stays quiet. I didn't want another app that buzzes at you all day.

- Media `burrow_nudge.webp`: Forgot to start? Marko noticed.

**Marko**

> Marko is an alpine marmot, and he's a big part of why the app doesn't feel like a spreadsheet. Sessions earn gems, and gems buy him outfits. Streaks have forgiving freezes too, because missing one day shouldn't wipe out a whole month.


**How I built it**

> Burrow is written in Swift and SwiftUI. Your data is stored on your phone in a SQLite database, with an optional backup to your own iCloud Drive, and there's no account. It used to be called DayMarko, and the code still says that everywhere.

> The free version covers three activities, and Burrow Pro unlocks everything else for $4.99 a month or $29.49 a year. It went live in October 2026, and now the hard part is getting people to find it.

- Media `burrow_insights.webp`: Your answers turn into insights over time.


## CalCardo (`calcardo`)

### Before

- Title: CalCardo
- Tagline: An AI calendar assistant that turns chats, syllabi, and email into reviewable events
- Summary: CalCardo was my first major full-stack project that I took from an idea to a production deployment. I built it to make keeping a real calendar feel easier: I could type a request, upload a syllabus, or let it find an event in Gmail, review what it proposed, and then push the accepted change to Google Calendar. The frontend is React and TypeScript with Tailwind CSS, the API is FastAPI and Python, and Supabase handles authentication, Postgres data, and storage.
- Status: Paused
- Hero caption: The basic CalCardo flow: tell it what is happening, review the proposed change, and then sync it to Google Calendar.

**Why I built it**

> I first had the idea during my first year at RIT. Campus events were scattered across email, different apps, and other sources, so it was easy to miss something. I wanted one place that could collect those events and keep me caught up.

> I also wanted calendar entry to feel less like a chore. Instead of opening Google Calendar and filling out a form, I wanted to type something like, "Get lunch with Jack next Tuesday at one," or upload a syllabus with important dates and let the app prepare the events for me.


**What it could do**

> CalCardo had three main ways to create an event: a normal event form, CalChat, and a Gmail pipeline. After signing in, a user could connect Google Calendar, choose which calendar CalCardo should write to, and pull existing events into the app. Changes made in CalCardo could then be written back to Google Calendar.

> The demo shows the full flow with real calendar data. I import events, edit an existing lunch, ask the chat to move it, create two new plans at once, create and later change a recurring swimming event, and confirm the results in Google Calendar.

> Gmail was a separate connection. When a likely event arrived by email, the app filtered it, extracted the date, time, location, and description, and placed a proposed event in an inbox. The user could inspect the original email, edit the proposal, ignore it, or accept it onto a chosen calendar.

- Media `calendar_existing_events.webp`: The linked Google Calendar supplied the existing schedule that CalCardo could import and reason over.
- Media `event_editor.webp`: The CalCardo event editor exposed both its own display fields and the date, time, visibility, recurrence, and calendar data needed for Google synchronization.

**CalChat was a proposal system, not just a chatbot**

> The assistant received a limited snapshot of the user's real schedule instead of pretending it knew the entire calendar. Its response had to follow a structured JSON contract that separated existing event references, edits, removals, and new event drafts. That structure let the interface show the right action for each result.

> The backend validated event IDs against the snapshot the model had actually seen, checked new drafts for time conflicts, and asked the user to clarify when more than one event matched. The model could suggest an action, but the user still had to apply or accept it. That review step was important because a calendar assistant should not silently change a real schedule.

- Media `chat_update_proposal.webp`: For an edit, CalChat showed the existing event separately from the proposed patch. Nothing changed until I pressed Apply update.
- Media `chat_multiple_drafts.webp`: One request could produce multiple structured drafts. Each event could be added, dismissed, edited manually, or revised with AI.
- Media `chat_recurrence_update.webp`: Recurring events were handled as real recurrence changes. Here the assistant proposed ending a swimming series one week earlier while preserving the earlier dates.

**From Gmail to a calendar event**

> The email side became a staged pipeline rather than one large AI call. Gmail messages were ingested, scored by a heuristic filter, sent to an extraction model only when they looked calendar-related, converted into a canonical event record, and placed in an in-review state. The later code also includes duplicate detection, update and cancellation proposals, and configurable auto-accept rules.

> Keeping the steps separate made failures easier to inspect and reduced unnecessary model calls. Rejected messages could have their body and snippet removed to limit retention, and CalChat was grounded on the resulting event fields rather than raw email bodies.

- Media `email_event_review.webp`: The Gmail pipeline extracted a two-hour campfire event, preserved a link to the source message, and placed it in a review queue instead of adding it automatically. The sender line has been removed from this portfolio screenshot.
- Media `google_calendar_email_event.webp`: After I accepted the proposal, the extracted event appeared in Google Calendar with its time, description, calendar, and reminder intact.

**Full-stack architecture**

> The frontend is a React 19 single-page app built with TypeScript, Vite, React Router, and Tailwind CSS. The Python backend is one FastAPI service split across 17 API routers for events, chat, Google connections, email processing, billing, storage, administration, and the other product areas.

> Supabase provides authentication, Postgres, and private file storage. The browser signs in through Supabase and sends its JWT to FastAPI, which validates the token before handling protected requests. The database layer uses the Supabase PostgREST client, and the migrations apply row-level security to user-owned data.

> The Google integration handles Calendar import and write-through updates, while Gmail can use Pub/Sub notifications or a manual sync. The code also includes Stripe subscriptions, feature entitlements, request IDs, rate limiting, error capture, and an append-only AI usage ledger that records token use and estimated cost for chat, summarization, filtering, extraction, attachments, and transcription.

- Code block: React + TypeScript /         | /         | Supabase JWT /         v / FastAPI API (17 routers) /         | /         +--> Supabase: Auth, Postgres, Storage /         +--> Google Calendar: import and write-through /         +--> Gmail: ingest, filter, extract, review /         +--> OpenAI: chat, vision, extraction /         +--> Stripe: plans and entitlements

**Building it with AI**

> I built early versions first, then used AI heavily while revising the product into something polished enough for friends to test. The most useful approach was to treat the AI like another intern: give it one bounded part of the system, enough context to understand that part, tests or a concrete way to verify the result, and feedback before moving on.

> The project taught me that AI does not replace system design. I still had to decide how calendar data should move through the product, where approval boundaries belonged, how the services fit together, and how to break a large idea into pieces the model could work on safely. The better I understood the architecture, the more useful the AI became.


**Why I paused it**

> Getting broad Google Calendar and Gmail access verified was a tedious final step. At the same time, general AI products started covering the basic use case of chatting with a calendar, which made the original idea less distinctive than it had been when I first thought of it.

> CalCardo still had useful details, especially its review queue and its ability to recognize that a new email might update or cancel an existing event. I decided those narrower advantages were not enough to justify taking the entire product further, so I moved on to ideas where I saw more room to build something different.


**Demo**

> The linked walkthrough covers account setup, Google Calendar authorization, calendar shortcuts, importing a date range, editing and syncing events, creating and revising events through CalChat, recurring schedules, Gmail connection, and reviewing an event extracted from a real email. The deployed frontend is still online, but the backend is currently turned off.



### After

- Title: CalCardo
- Tagline: An AI calendar assistant that turns chats, syllabi and emails into events you approve
- Summary: CalCardo was my first big full-stack project that I took all the way from an idea to a live website. You could type something like "lunch with Jack next Tuesday at one", upload a syllabus, or let it find events in your Gmail, and it would suggest calendar events for you to approve before they went into Google Calendar.
- Status: Paused
- Hero caption: Tell it what's happening, check what it suggests, then sync it to Google Calendar.

**Why I built it**

> I had the idea during my first year at RIT. Campus events were spread across emails, apps and flyers, and it was really easy to miss things. I wanted one place that caught all of it, and I wanted adding an event to feel like sending a text instead of filling out a form.


**Talking to your calendar**

> The main feature was CalChat. You tell it what's going on and it suggests changes, but nothing actually changes until you hit apply. That mattered to me, because an assistant that quietly moves things around on your real calendar is worse than no assistant at all.

> It could move an existing event, create a few events from one message, and even change a recurring event, like ending my swim practice a week early.

- Media `chat_update_proposal.webp`: Moving a lunch. Nothing changes until I hit Apply update.
- Media `chat_multiple_drafts.webp`: One message, two new events to add or dismiss.
- Media `chat_recurrence_update.webp`: Ending a recurring swim event a week early.

**Finding events in your email**

> You could also connect Gmail. When an email looked like it had an event in it, CalCardo pulled out the date, time and place and put it in an inbox for you to accept, edit or ignore. A cheap filter ran first, so the AI only looked at emails that actually seemed calendar related.

> Everything synced both ways with Google Calendar, so you could keep using Google's app like normal.

- Media `email_event_review.webp`: An event found in an email, waiting for me to accept it. The sender is cropped out.
- Media `google_calendar_email_event.webp`: The same event after I accepted it, in Google Calendar.
- Media `calendar_existing_events.webp`: My existing Google Calendar, which CalCardo could import.
- Media `event_editor.webp`: The event editor.

**How I built it**

> The frontend is React and TypeScript, the backend is Python and FastAPI, and Supabase handles accounts, the database and file storage. I wrote the early versions myself and then used AI a lot to get it polished enough for friends to test. What worked best was treating the AI like another intern: give it one piece at a time, enough context, and a way to check its work.


**Why I paused it**

> Getting Google to approve full Calendar and Gmail access was a long, tedious process, and around the same time the big AI apps started letting you chat with your calendar too. CalCardo still did a few things better, like the review inbox, but not enough to keep going, so I moved on to other ideas. The website is still up but the backend is off. The demo video shows the whole thing working.



## Cryptogram Solver (`cryptogram`)

### Before

- Title: Cryptogram Solver
- Tagline: A backtracking program that cracks cryptogram puzzles word by word
- Summary: A program that solves cryptogram (substitution-cipher) puzzles automatically. It started just before February school break 2022, after the author grabbed an unsolved puzzle from an optional computer science lesson on cryptography and his dad challenged him to solve it with him; it grew into a backtracking search worked out on a whiteboard before he knew the technique had a name. The solver organizes the puzzle's words to try the largest ones first, tries candidate words from 22 word lists indexed by word length and ordered from common to uncommon, and backtracks whenever a guess leaves no possibilities. The page collects the original class handout, the program's solved output, the whiteboard photo, and two videos of the solver running against puzzles from a puzzle website.

**Cryptogram Examples**

- Media `example_quote_0.webp`: (no caption)
- Media `example_quote_1.webp`: (no caption)
- Media `example_quote_2.webp`: (no caption)
- Media `example_quote_3.webp`: (no caption)

**The Backstory**

> First, let me explain how this all started. It was just before February school break 2022 and I had just finished my first big project, a Wordle solver, and had learned a lot in the process (this is another one of my projects that will soon be displayed on the home page). The day before school break, my computer science teacher had an optional fun lesson about cryptography; I already knew about cryptograms from my dad and wanted to do some more work on my other projects, but, as class ended I grabbed an unsolved puzzle on my way out, because I knew my dad likes doing them.

> After I got home I showed it to my dad and he challenged me to solve it with him. So I made another copy and we began. My dad was flying through it; I started to solve it, only to get lost in the idea of creating a computer algorithm to solve one. So during the school break I spent most of my time in front of my white board creating a backtracking algorithm without even knowing what one was!

> I got really far and almost had it working. I showed what I had to my dad and he suggested that I try a very simple puzzle with only one long word to see if it would work. I used the encrypted version of the word “BEGINNING”… AND IT WORKED! I was so happy, it was already late at night but I was willing to stay up until I got it to work. The next day I got a rough version to solve all sorts of puzzles. From there I only continued to improve and optimize the program.


**Teacher's Original Handout**

> The photo to the left is the exact cryptogram that started this. The solved puzzle to the left in the photo is my dad's work, and the other one is mine. I'm very happy that I had my dad to encourage me, though he was pretty skeptical after he saw what looked like hieroglyphics on my white board. After school break when I went back to school I was excited to show my computer science teacher the completed program and tell her that she inspired me to make it.

- Media `original_quote.webp`: The original handout, solved independently by my dad and me.

**Solved Quote**

> The snapshot of my program on the right is the solved cryptogram puzzle from above. It was solved by my computer program rather than a human (my dad). If you would like to know more on how this works check out the epilogue at the bottom of this page which goes into the overall functionality.

- Media `solved_original_quote.webp`: The same handout solved by the program.

**My Whiteboard**

> I don't know what I would do without my whiteboard! The whiteboard in the photo was on its way to the curb before I saved it. Now it's in my room in an unobtrusive spot. It is a crucial part of my planning process, I often write my quick thoughts on it before I finalize them on paper.

- Media `whiteboard.webp`: The whiteboard I used to work out the search process.

**Videos**

- Media `compressed_splitscreen_cryptogram.mp4`: This shows a modified version of my code solving cryptograms on a puzzle website I found.
- Media `fullscreen_cryptogram.mp4`: This is the cryptogram solving the same puzzles from the website shown in the other video, just showing the webpage.

**Epilogue**

> My program uses what some would call a brute force approach and consists of a few main parts. First we have the organizer; this organizes the words in a way to make more efficient guesses. It usually starts with the largest words of the puzzle first, contrary to a typical human’s strategy.

> My code has access to 22 word lists organized by word length. The lists are optimized in order of common to uncommon words; this is one of my optimization strategies. For example the beginning of word_list2 would have AS, AT, BE, BY, DO, GO…

> My code starts with an encrypted word like BWGQHFTL, and then tries every 8 letter word to see if their letters match up. For example, QUESTION would work. Then it would move onto the next word like OFLWHGQ and find that MINUTES works with QUESTION because their letters line up. The more we progress through the puzzle, the less likely a word will work because our vocabulary expands. For example right now we have (QUESTION = BWGQHFTL and MINUTES = OFLWHGQ) F=I, H=T, L=N, Q=S, G=E, W=U in both words.

> The issue is when there are no more possibilities. At some point there were 2 or more possibilities and the algorithm just chose the first one it came across. We would then have to back track to where we made that wrong guess and try to find another one that would work further along in the program. It does this until it makes it to the end, where in some cases there might be a wrong word or two. For example, FP could be either IF or ID (my program doesn't take apostrophes into account). My program handles this by allowing the user to say which word they would like to try again, and then it usually fixes it.


**Worked Example**

> Just by guessing QUESTION for the first encoded word (BWGQHFTL), it partially fills in a bunch of the other encrypted words.

- Code block: BWGQHFTL OFLWHGQ PGOZFLQ CTPGDGP ETGQ / QUESTION _INUTES _E__INS _O_E_E_ _OES
- Code block: LTH ZQUQ CTTV CFDG FQ SMT CTP ZQU MG Z / NOT _S_S _OO_ _I_E IS __O _O_ _S_ _E _


### After

- Title: Cryptogram Solver
- Tagline: A backtracking program that cracks cryptogram puzzles word by word
- Summary: My program that solves cryptogram puzzles. It started in February 2022, when I grabbed an extra puzzle from an optional cryptography lesson in computer science class and my dad challenged me to solve it with him. Instead, I spent the school break at my whiteboard building a backtracking algorithm before I even knew what one was.

**Cryptogram Examples**

- Media `example_quote_0.webp`: (no caption)
- Media `example_quote_1.webp`: (no caption)
- Media `example_quote_2.webp`: (no caption)
- Media `example_quote_3.webp`: (no caption)

**The Backstory**

> First, let me explain how this all started. It was just before February school break 2022 and I had just finished my first big project, a Wordle solver, and had learned a lot in the process (this is another one of my projects that will soon be displayed on the home page). The day before school break, my computer science teacher had an optional fun lesson about cryptography; I already knew about cryptograms from my dad and wanted to do some more work on my other projects, but, as class ended I grabbed an unsolved puzzle on my way out, because I knew my dad likes doing them.

> After I got home I showed it to my dad and he challenged me to solve it with him. So I made another copy and we began. My dad was flying through it; I started to solve it, only to get lost in the idea of creating a computer algorithm to solve one. So during the school break I spent most of my time in front of my white board creating a backtracking algorithm without even knowing what one was!

> I got really far and almost had it working. I showed what I had to my dad and he suggested that I try a very simple puzzle with only one long word to see if it would work. I used the encrypted version of the word “BEGINNING”… AND IT WORKED! I was so happy, it was already late at night but I was willing to stay up until I got it to work. The next day I got a rough version to solve all sorts of puzzles. From there I only continued to improve and optimize the program.


**Teacher's Original Handout**

> The photo to the left is the exact cryptogram that started this. The solved puzzle to the left in the photo is my dad's work, and the other one is mine. I'm very happy that I had my dad to encourage me, though he was pretty skeptical after he saw what looked like hieroglyphics on my white board. After school break when I went back to school I was excited to show my computer science teacher the completed program and tell her that she inspired me to make it.

- Media `original_quote.webp`: The original handout, solved independently by my dad and me.

**Solved Quote**

> The snapshot of my program on the right is the solved cryptogram puzzle from above. It was solved by my computer program rather than a human (my dad). If you would like to know more on how this works check out the epilogue at the bottom of this page which goes into the overall functionality.

- Media `solved_original_quote.webp`: The same handout solved by the program.

**My Whiteboard**

> I don't know what I would do without my whiteboard! The whiteboard in the photo was on its way to the curb before I saved it. Now it's in my room in an unobtrusive spot. It is a crucial part of my planning process, I often write my quick thoughts on it before I finalize them on paper.

- Media `whiteboard.webp`: The whiteboard I used to work out the search process.

**Videos**

- Media `compressed_splitscreen_cryptogram.mp4`: This shows a modified version of my code solving cryptograms on a puzzle website I found.

**Epilogue**

> My program uses what some would call a brute force approach and consists of a few main parts. First we have the organizer; this organizes the words in a way to make more efficient guesses. It usually starts with the largest words of the puzzle first, contrary to a typical human’s strategy.

> My code has access to 22 word lists organized by word length. The lists are optimized in order of common to uncommon words; this is one of my optimization strategies. For example the beginning of word_list2 would have AS, AT, BE, BY, DO, GO…

> My code starts with an encrypted word like BWGQHFTL, and then tries every 8 letter word to see if their letters match up. For example, QUESTION would work. Then it would move onto the next word like OFLWHGQ and find that MINUTES works with QUESTION because their letters line up. The more we progress through the puzzle, the less likely a word will work because our vocabulary expands. For example right now we have (QUESTION = BWGQHFTL and MINUTES = OFLWHGQ) F=I, H=T, L=N, Q=S, G=E, W=U in both words.

> The issue is when there are no more possibilities. At some point there were 2 or more possibilities and the algorithm just chose the first one it came across. We would then have to back track to where we made that wrong guess and try to find another one that would work further along in the program. It does this until it makes it to the end, where in some cases there might be a wrong word or two. For example, FP could be either IF or ID (my program doesn't take apostrophes into account). My program handles this by allowing the user to say which word they would like to try again, and then it usually fixes it.


**Worked Example**

> Just by guessing QUESTION for the first encoded word (BWGQHFTL), it partially fills in a bunch of the other encrypted words.

- Code block: BWGQHFTL OFLWHGQ PGOZFLQ CTPGDGP ETGQ / QUESTION _INUTES _E__INS _O_E_E_ _OES
- Code block: LTH ZQUQ CTTV CFDG FQ SMT CTP ZQU MG Z / NOT _S_S _OO_ _I_E IS __O _O_ _S_ _E _


## RMF Checklist Automation (`cyber-ttm`)

### Before

- Title: RMF Checklist Automation
- Tagline: A review-first Python toolchain for safely updating DISA STIG checklist files
- Summary: I built this desktop toolchain for TTM Technologies to turn a slow, error-prone cybersecurity reporting task into a reviewable workflow. It cross-references DISA STIG findings with the controls required by a system's NIST Risk Management Framework, generates an editable answer sheet, converts approved answers to XML, and applies them to a CKL checklist only when its safety checks pass. I developed the matching and XML-editing logic from scratch with Python's standard library, wrapped each stage in a custom Tkinter interface, and iterated on the design with the people who would use it for quarterly reporting.
- Hero caption: The project connects NIST RMF control decisions with the DISA STIG checklist format used for technical findings.

**The reporting problem**

> Defense programs use the NIST Risk Management Framework to decide which security controls apply to a system. DISA STIG benchmarks then translate many of those requirements into concrete technical checks. Automated SCAP scans can evaluate part of a benchmark, but the remaining findings still need evidence, analysis, or a documented reason that a control does not apply.

> For this project, that information arrived in more than one place: a CKL checklist held the scan results, while additional decisions were collected in spreadsheets. The final CKL still had to remain structurally valid so it could be reopened and reviewed in DISA's checklist tooling. TTM asked for a faster way to reconcile those sources without turning a bulk update into a blind overwrite.


**Learning the workflow before automating it**

> I started by learning the process on my own computer. I downloaded the Chrome STIG, ran a DISA SCAP scan, opened the resulting CKL, and traced how vulnerability IDs, statuses, controls, comments, and supporting evidence moved through the reporting workflow.

> After conversations with the client, I whiteboarded a post-scan toolchain modeled around Answer Files: first identify the findings that need human review, then let a reviewer correct or approve the proposed answers, and only then update the checklist. That separation became the most important design decision in the project.

- Media `rmf_workflow.webp`: The workflow keeps review between source analysis and checklist modification instead of treating the update as one opaque batch operation.

**Stage 1 — build the review queue**

> The first application reads a STIG CSV export, a list of required RMF controls, an optional list of controls that were explicitly ruled out, and the current CKL. For each vulnerability it extracts the NIST control references from the CCI text and compares them with both control lists.

> I represented those comparisons as two small vectors: one records which referenced controls are required, and the other records which required controls are also in the explicit exclusion list. A finding is proposed for review when the number of required matches minus the number of excluded matches is zero. That catches both useful cases: none of the finding's controls apply, or every applicable match was deliberately excluded.

> The generated CSV does not hide its reasoning. Every row carries the vulnerability ID, the current CKL status as an expected-status guard, the proposed new status, a generated comment, and an explanation of why the row was selected. The reviewer can inspect and edit that file before anything touches the checklist.

- Code block: include when: /     sum(required_matches) - sum(explicit_exclusions) == 0 /  / Type 0: no referenced controls are required / Type 1: all required matches were explicitly excluded
- Media `screen_0.webp`: The first Tkinter application exposes the four input sources and separate templates for the two matching outcomes.

**Stage 2 — convert approved rows into an Answer File**

> The second application turns the reviewed CSV into a structured XML Answer File. Each vulnerability receives an answer-key entry containing its expected status, destination status, and reviewer-approved comment. Keeping this conversion separate made the spreadsheet a deliberate checkpoint instead of an invisible intermediate file.

> I wrote reusable XML navigation helpers for this project rather than depending on a large external package. They describe a location as a path of tag, attribute, and value selectors, then handle searching, reading, inserting, and saving the matching XML elements. The runtime code uses only Python's standard library, which also kept the deployment footprint small for a security-sensitive environment.

- Code block: <Vuln ID="V-DEMO-002"> /   <AnswerKey Name="DEMO"> /     <ExpectedStatus>Not_Reviewed</ExpectedStatus> /     <ValidTrueStatus>Not_Applicable</ValidTrueStatus> /     <ValidTrueComment>Reviewed explanation</ValidTrueComment> /   </AnswerKey> / </Vuln>
- Media `screen_1.webp`: The converter deliberately stays small: choose the reviewed answer sheet, name the STIG and select the answer key.

**Stage 3 — update the CKL safely**

> The final application walks the checklist, looks up each vulnerability and answer key, validates the status names, and compares the current CKL status with the expected status stored in the Answer File. It applies the change only when those statuses match. A Manual expected status exists as an explicit override, but a Manual destination is rejected.

> That expected-status check protects against stale assumptions. If a scan result changed after the answer sheet was prepared, the program leaves the finding untouched and reports Not as Expected instead of silently replacing newer data. It also reports skipped findings, invalid status values, manual overrides, Answer File entries missing from the CKL, and every successful change.

> The GUI lets the reviewer filter those categories while keeping the full operation log. Comments can use placeholders for the answer key, old and new status, approved answer text, and run date, so each automated change still leaves an audit-friendly explanation.

- Code block: if statuses_are_valid and (current == expected or expected == "Manual"): /     apply_status_and_comment() / else: /     log("Not as Expected")
- Media `screen_2.webp`: The CKL Modifier pairs the transformation controls with a filterable log of changed, skipped, mismatched, missing, manual and invalid records.

**Keeping the file valid**

> A CKL is more than a table with an XML extension. The editor has to preserve repeated STIG_DATA fields, the original document header, leading comments, the checklist hierarchy, and valid XML encoding. My parser stores repeated vulnerability attributes as lists, rebuilds only the vulnerability records after editing, preserves XML comments while reading, and formats the saved document before it returns to the checklist viewer.

> I also expanded the original request beyond bulk replacement. Input validation, expected-status gating, automatic format checks, templated comments, and the categorized result log all came from working backward from the ways a quarterly report could fail.


**Verification with synthetic data**

> For this portfolio rebuild I ran the original processing modules end to end against a completely synthetic four-vulnerability checklist. The first stage correctly selected one finding with no required control and one whose only required control was explicitly excluded. The converter produced a valid Answer File, and the CKL modifier applied the matching change while refusing a deliberately stale expected status and reporting an Answer File record that did not exist in the checklist.

> The test used fictional IDs and comments and did not open or modify any contractor data. It also confirmed that the original source compiles under its Python 3.11 environment and that the saved result can be parsed again as XML.

- Code block: SYNTHETIC END-TO-END TEST PASSED / Review rows generated: 2 / Guardrails observed: Changed, Not as Expected, Not Found

**From prototype to a working reporting tool**

> The project grew through several versions: early XML experiments, a single-pass Answer File modifier, and finally the three-application review pipeline. I moved from command-line experiments to purpose-built Tkinter interfaces after feedback from the client, and I added checks that were not part of the initial request because the people using the tool needed to know why a record changed or did not change.

> The finished program was used for five quarterly reporting cycles and helped deliver the results on time each quarter. Just as important, the project taught me how to learn an unfamiliar compliance domain, translate a customer's process into explicit rules, and design automation that remains reviewable when the file it edits is part of an audit trail.


**What I would improve next**

> The original tools are intentionally direct, but the source also shows where I would take a production revision. The XML helper classes should become one tested module instead of three evolving copies; the Answer File index should be built once rather than searched repeatedly; long transformations should run outside Tkinter's UI thread; and the file schemas deserve automated fixture tests and clearer in-window error messages.

> Those improvements would preserve the review-first architecture while making the system easier to maintain, faster on large benchmarks, and safer to extend to new STIG exports.



### After

- Title: RMF Checklist Automation
- Tagline: Python tools that made a defense contractor's quarterly security reports faster and safer
- Summary: My first internship was at TTM Technologies, a defense contractor, in the summer of 2024. Their cybersecurity team had to update big checklist files by hand every quarter for compliance reports. I built three small Python apps that do most of that work, with a review step in the middle so nothing changes without a person seeing it first.
- Hero caption: The two standards the project connects: NIST RMF and DISA STIGs.

**The problem**

> Defense systems have to follow a set of security rules called the NIST Risk Management Framework, and DISA publishes checklists, called STIGs, that turn those rules into specific checks. A scan fills in part of the checklist, but the rest needs a person to mark each finding with a reason, and those decisions were spread across spreadsheets. Doing it by hand every quarter was slow and easy to mess up.


**Learning it first**

> I didn't know any of this going in, so I started by running a scan on my own computer and following how everything moved through the checklist file. After talking with the team, I sketched the whole thing out on a whiteboard. The big decision was to split it into three steps, with a person reviewing in the middle.

- Media `rmf_workflow.webp`: The three steps, with a review in the middle.

**Three small apps**

> The first app compares the scan results with the controls the system actually needs, and makes a spreadsheet of findings that probably don't apply, with the reason for each one. Someone reviews and edits that spreadsheet. The second app turns the approved spreadsheet into an answer file, and the third applies those answers to the checklist.

- Media `screen_0.webp`: Step 1: build the review spreadsheet.
- Media `screen_1.webp`: Step 2: turn the approved answers into an answer file.
- Media `screen_2.webp`: Step 3: update the checklist and log every change.

**Never overwrite something newer**

> The part I'm happiest with is a safety check. Each answer remembers what the finding's status was when it was reviewed. If the checklist says something different by the time the answer is applied, the app leaves it alone and reports it instead of overwriting newer data. It also logs every change, every skip, and anything that looked wrong.


**How it went**

> I wrote everything with Python's standard library and Tkinter, since fewer outside packages is easier in a security-focused place. It started as command-line experiments and turned into these apps after feedback from the team. They used it for five quarterly reports. If I did it again, I'd clean up the code so the three apps share one XML helper instead of each having its own copy.



## Document Management System (`document-management-system`)

### Before

- Title: Document Management System
- Tagline: A human-in-the-loop system for turning decades of paper records into searchable files
- Summary: I proactively built an internal document-processing system for a digitization effort covering roughly 300,000 pages of traffic-signal records dating back to the 1970s. It combined two OCR paths, three independent document-classification methods, evidence-backed field extraction, and a fast review interface that helped a person name and file each scan without working across File Explorer, Adobe, and a spreadsheet. I used AI-assisted development heavily to prototype the system, test ideas against already-filed documents, and turn a manual process into one controlled workflow.
- Status: Internal internship prototype
- Hero caption: The dashboard kept incoming scans, background processing, and the review queue visible in one place.

**Seeing the bottleneck early**

> The county had signal plans, timing sheets, work reports, work orders, and other records stored across about 50 filing cabinets. Some documents dated back to 1972, and the full collection was estimated at roughly 300,000 pages. One team was responsible for carefully scanning the paper into PDFs. The next challenge was turning those scans into consistently named, organized, and searchable files.

> That second step could easily become another large manual project. A reviewer would need to open a PDF, identify its type, locate the date and signal number, copy any type-specific identifiers, rename the file, update a tracking sheet, and repeat. I saw that bottleneck before the full workflow had been settled and began building a prototype that could do the searching first, then hand a reviewable answer to a person.

- Media `workflow_comparison.webp`: The prototype replaced a repeated trip through File Explorer, a PDF viewer, manual renaming, and a spreadsheet with one review flow.

**Designing around a person, not around the model**

> The guiding rule was simple: the software could propose, but a person had to decide. It never silently filed a document. For every predicted value, it kept the page, bounding box, original OCR text, confidence, and reason behind the score. A reviewer could click a candidate and jump directly to the exact place it came from on the scan.

> That changed the goal from making AI perfectly understand every old document to making the remaining human decision fast. If the system was uncertain, it showed the disagreement. If it could not read a handwritten date, it said so and let the reviewer type it. A wrong prediction stayed a visible suggestion instead of becoming a misplaced record.

- Media `classification_pipeline.webp`: Three separate readings contributed evidence, but only a person approved the final name and location.

**Getting useful text from difficult scans**

> I benchmarked OCR approaches and settled on a two-route pipeline using Docling and RapidOCR. Docling worked well when a document had readable text and tables. Plan drawings and large image-based sheets could appear successful while returning almost nothing, so the system detected those cases and ran RapidOCR on high-resolution crops of the full sheet and its corners, where title blocks usually live.

> Both routes returned the same structure: extracted text plus segments that mapped character ranges back to a page and rectangle. That common format powered the evidence viewer. OCR results were cached by the file's content hash, so renaming a scan did not force the expensive recognition step to run again.

> The OCR could recover some surprisingly difficult printed and handwritten material, but handwriting was not consistently solved. Handwritten dates on inventory cards and plans remained a major weak point, and the interface was designed to make those gaps quick for a person to fill.

- Media `document-review.webp`: The review workspace placed the proposed metadata, classifier evidence, OCR text, and original scan on the same screen.

**Learning from documents people had already filed**

> I built a labeled corpus from roughly 140 documents that had already been categorized by the county. Each document was evaluated with itself removed from the comparison set, so it could not earn a perfect result by matching its own text. That leave-one-out setup became the repeatable test harness for changes to classification, extraction, prompts, and model choices.

> I tested multiple embedding models because semantic similarity had helped on my other local-AI projects. On this particular collection, embeddings were slower and slightly less accurate. These forms often describe the same intersection even when they are different document types, while their repeated labels and layout-specific wording are highly distinctive. I kept the embedding path available for future testing, but disabled it in the measured configuration instead of using it just because it sounded more advanced.


**A deliberate learning loop**

> The system did not stop learning after the initial corpus was built. Every approved document became a new labeled example containing its corrected type and OCR text, keyed by the file's content hash so it could not be learned twice. Flagged and skipped documents were excluded because nobody had confirmed their classification.

> Retraining was an explicit expert action rather than something that happened silently after every click. When started, the system combined the original corpus with the newly approved examples, re-mined the phrases that distinguished each category, and refit the TF-IDF similarity index. Future scans then benefited from the office's own reviewed decisions while the behavior stayed stable during a review session.

> The feedback loop also worked in reverse. If an approved filing was undone or an expert reopened it, that example was removed from the learning data. I also used leave-one-out evaluation throughout the pipeline after discovering that an early perfect result came from test documents matching themselves. That mistake became a permanent exclusion rule instead of a misleading benchmark.

- Media `learning_loop.webp`: Approved work improved future predictions, while corrected or reopened decisions were removed from the learning set.

**Combining three different opinions**

> The first classifier automatically mined distinctive words and phrases from the labeled corpus. It used frequency thresholds and weighted log-odds to find language that appeared often in one type and rarely elsewhere, including separate cues for pairs of document types that were commonly confused. Location names were excluded so the system did not accidentally learn that one street meant one form type.

> The second classifier compared a scan with the already-filed documents using TF-IDF over character and word n-grams. Character fragments were especially useful because they still overlapped when OCR damaged a word. I corrected the nearest-neighbor scoring for the heavily unbalanced corpus so the most common document type did not win by default.

> The third vote came from a local Qwen model running through Ollama. It received the mined cue sheet, extracted candidates, and similarity results, then returned a schema-constrained JSON decision at temperature zero. The three scores were fused using their agreement and the margin over the runner-up. When a method had no evidence it abstained, and when the methods disagreed the document was held for review rather than forcing a confident answer.


**Extracting the details that make a document searchable**

> Classification was only the first half of the problem. The file name also needed fields such as the document date, signal number, contract number, work order number, or another identifier depending on the document type. I built tolerant patterns that accepted common OCR substitutions, normalized a value only when its surrounding characters supported the correction, and returned every plausible match instead of throwing the alternatives away.

> Signal detection combined numbers printed on the page with intersection names and a lookup against the signal inventory. Repetition raised a candidate's score, while contradictory location evidence lowered it. This mattered for corridor documents that legitimately named several signals and for scans where one signal number was unreadable but its two cross streets were clear.

> The result was a ranked set of candidates with provenance, not one opaque answer. The reviewer chose which values belonged in the final name, could edit anything missing or incorrect, and saw the proposed file name update immediately.


**Handling multipart and large-format scans**

> The physical scanning process created another problem: one document could arrive as several PDFs or images, and large-format plan sheets were scanned separately before being added back later. The source names were not consistent enough for a simple sort. I built a parser around the naming patterns that actually appeared, grouped related pieces, noticed gaps that could indicate a missing large-format sheet, and surfaced anything it could not interpret instead of guessing.

> A staging workspace let reviewers drag pieces into order, rotate or crop individual pages, add late-arriving scans, preview the complete document, and merge it before OCR and classification. Edits were stored separately from the original scans, and the individual parts stayed intact until an approved merged copy existed. The combined document also retained the hashes of every source part so uploading one of those pages later would still be detected as a duplicate.

- Code block: separate scanner files /   Document 22A.pdf /   Document 22_C.pdf /   scan22B.pdf  ← large-format page arrives later /           ↓ /   group → reorder → rotate/crop → preview /           ↓ /        one merged document /           ↓ /      OCR and human review
- Media `scan-staging.webp`: The staging screen let a reviewer order separate scans, preview the combined document, and approve the merge before processing.

**Replacing a scattered manual workflow**

> I brought upload, background processing, review, naming, filing, flags, comments, and history into one web interface. Reviewers could see each classifier's vote, inspect all candidates, use keyboard shortcuts to approve or flag, and move directly to the next item. Duplicate checks used SHA-256 hashes across the inbox, processing queue, staging area, finished records, and the individual files inside a merged document.

> The queue survived restarts and processed one document at a time because OCR and the local model both wanted the available GPU. Atomic JSON writes, backup recovery, and rebuilding state from the working folders protected the review history if the app stopped unexpectedly. Page images were generated only when needed and treated as a rebuildable cache, which kept storage from growing with every review.

- Media `processing-queue.webp`: Long scan batches could continue processing while completed documents accumulated in the human review queue.

**Building it for a real team**

> The application ran locally and could be shared with coworkers over the office network. I added password accounts, revocable magic sign-in links, expiring HttpOnly sessions, and three roles. Helpers could process their own queue, experts could review everyone's decisions and undo filings, and administrators could manage accounts, storage, settings, and the full activity log.

> Review itself had two stages. A helper could approve, flag, or skip a document with a reason. An expert then checked those decisions, prioritized the uncertain ones, and either signed off or reopened the document with a note. Advisory locks warned when another person had an item open, while the actual filing action used a stronger per-document lock so two approvals could not create two copies.


**Measuring what worked and what did not**

> The rules-and-similarity evaluation classified about 81% of the labeled corpus correctly overall. More importantly, when its confidence cleared the filing threshold, it matched the existing category about 97% of the time and held the uncertain cases back for review. A separate blind test of 26 renamed documents reached the correct category on all 26 when the local model acted as the third voter.

> The harder fields kept the results grounded. Signal placement was useful but weaker on documents covering several intersections, and dates were the main bottleneck because some were absent from the OCR or several real dates appeared on one page. Exact file names were therefore much less accurate than document types. Those results reinforced the system's purpose: reduce how much a reviewer has to inspect, while making the remaining uncertainty obvious.


**Learning the workflow from the people doing it**

> A large part of the project happened away from the code. I talked with the people scanning the cabinets, the people who would review and file the results, and teammates working on the larger signal-management system. Each group saw a different piece of the process, and those conversations exposed details that were easy to miss from a sample PDF alone.

> The scanning team explained why large-format sheets arrived later and why one paper packet could become several inconsistently named files. Reviewers helped shape the candidate list, highlights, shortcuts, comments, flags, and second-check workflow. The broader programming and data teams helped connect the final naming and folder structure with the system that would consume the digitized records. Building around those handoffs turned the prototype from an OCR experiment into a view of the complete operation.


**How I built it**

> This was a fast, AI-assisted prototype for internal use. I used AI heavily to generate and refactor code, explore algorithms, diagnose failures, and turn ideas into testable versions quickly. My role was to define the workflow, provide real examples, decide what could safely be automated, build the evaluation loops, and keep testing the system against the documents and mistakes that actually mattered.

> The project pulled together lessons from my other internship work: local model constraints, retrieval and similarity methods, structured output, test harnesses, and human review around uncertain AI. The biggest lesson was that useful document AI was not one model call. It was the OCR routing, measurable classifiers, provenance, failure handling, permissions, interface, and careful point where a person stayed in control.



### After

- Title: Document Management System
- Tagline: A tool that reads old scanned records and suggests how to file them, with a person approving each one
- Summary: At my 2026 internship, the county was scanning about 300,000 pages of traffic signal records, some going back to 1972. After scanning, someone still had to open every PDF, figure out what it was, find the date and signal number, rename it and log it in a spreadsheet. I built a prototype that does the reading first and hands a person a suggestion to approve.
- Status: Internal internship prototype
- Hero caption: Scans waiting for a person to review.

**Seeing the bottleneck**

> The records filled about 50 filing cabinets: signal plans, timing sheets, work orders and more. One team was scanning everything into PDFs, and I could see the next step turning into another huge manual job. So I started building something before the process was even settled.

- Media `workflow_comparison.webp`: The old five-step routine next to the new review flow.

**The software suggests, a person decides**

> The main rule was that it never files anything on its own. For every value it suggests, it remembers exactly where on the page it found it, so you can click a suggestion and jump straight to that spot on the scan. If it can't read a handwritten date, it says so and you type it in.

- Media `document-review.webp`: Suggested fields, the evidence for them, and the scan, all on one screen.

**Reading 50-year-old paper**

> Getting text out of old scans was its own challenge. I used two OCR tools: one for normal typed pages, and another for big plan drawings, where I zoomed in on the corners because that's where the title blocks usually are. Handwriting was still the weak spot.

> To figure out what kind of document each scan was, I used three separate methods: key phrases that only show up on one kind of form, a comparison against about 140 documents the county had already filed, and a small local AI. When they agree, it's confident. When they don't, it waits for a person.

- Media `classification_pipeline.webp`: Three separate guesses, and a person approves the final name.

**It gets better as you use it**

> Every document someone approves becomes a new example. When an expert chooses to retrain, it learns from the office's own decisions, and if an approval gets undone, that example comes back out.

- Media `learning_loop.webp`: Approved documents teach it, and undone ones get taken back out.

**Built for the team**

> One paper packet could show up as several scans, and big plan sheets were scanned separately and added later. So I added a staging screen to put the pieces in order, rotate them and merge them before processing. I also added accounts, roles and a second check, so helpers could do a first pass and an expert could sign off. A lot of this came from talking with the people doing the scanning and filing.

- Media `scan-staging.webp`: Putting separate scans in order before merging them.
- Media `processing-queue.webp`: A big batch processing while finished documents wait for review.

**How well it worked**

> When it was confident enough to suggest filing, it matched the county's existing category about 97% of the time, and in a blind test of 26 documents it got every type right. Dates and exact file names were much harder, which is why a person still checks every one.

> I built it fast with a lot of help from AI. My job was mostly deciding what was safe to automate and testing it against real documents.



## Duolingo Hack (`duolingo-hack`)

### Before

- Title: Duolingo Hack
- Tagline: A Duolingo bot that turned speaking practice into an XP machine
- Summary: I got tired of doing the same Duolingo exercises every day, so I built a bot to do them for me. It started by running several story sessions in parallel, then changed tactics after that stopped earning XP. The final version recorded each speaking prompt through a virtual audio cable and played it back to Duolingo for a perfect answer.
- Status: Archived

**The first version**

> My first approach used Duolingo stories. I ran several browser sessions at once, completing multiple stories every thirty seconds and stacking up XP until Duolingo stopped awarding it.


**The audio trick**

> For speaking practice, Duolingo first played the phrase it wanted me to repeat. My bot recorded that audio, trimmed the silence, and sent the exact same phrase back through a virtual microphone. That version helped me rack up thousands of XP and win the Diamond League.


**What happened next**

> I retired the bot because I actually use Duolingo to learn now, but I am still keeping the streak alive. This page will be much funnier once the old screen recordings, leaderboard screenshots, and current streak screenshot are added.



### After

- Title: Duolingo Hack
- Tagline: A Duolingo bot that turned speaking practice into an XP machine
- Summary: I got tired of doing the same Duolingo exercises every day, so I built a bot to do them for me. It started by running several story sessions in parallel, then changed tactics after that stopped earning XP. The final version recorded each speaking prompt through a virtual audio cable and played it back to Duolingo for a perfect answer.
- Status: Archived

**The first version**

> My first approach used Duolingo stories. I ran several browser sessions at once, completing multiple stories every thirty seconds and stacking up XP until Duolingo stopped awarding it.


**The audio trick**

> For speaking practice, Duolingo first played the phrase it wanted me to repeat. My bot recorded that audio, trimmed the silence, and sent the exact same phrase back through a virtual microphone. That version helped me rack up thousands of XP and win the Diamond League.


**What happened next**

> I retired the bot because I actually use Duolingo to learn now, but I'm still keeping the streak alive.



## Engine Miles (`engine-miles`)

New page.

### After

- Title: Engine Miles
- Tagline: An iPhone app that estimates how far a hybrid's gas engine has actually gone
- Summary: Engine Miles is an iPhone app for hybrid and plug-in hybrid owners. You log your fill-ups, and it estimates how many miles the gas engine has run, so you can track oil changes by engine miles instead of the odometer. It's been on the App Store since October 2026.
- Status: On the App Store

**Why I built it**

> My dad bought a 2022 RAV4 Prime, which is a plug-in hybrid. Since the day he got it, he's kept a paper logbook to work out how many of his miles were electric and how many were on the gas engine, because the car doesn't really tell you. The odometer counts every mile, but a lot of those miles never touch the engine, and that matters for things like oil changes.

> So I wanted to turn his notebook into an app. Something quick enough to use at the pump, that does the math for you.

- Media `engine_miles_home.webp`: The home screen, with example data.

**How it works**

> Every time you fill up, you type in the gallons, and the app multiplies them by your car's gas-only MPG. That's an estimate of how far the engine went on that tank, and adding up the tanks gives you engine miles. It's an estimate, not a reading from the car. There's no car connection at all, and your owner's manual still has the final say on maintenance.

> The oil change tracker counts down on those engine miles instead of the odometer. Once a month the app also asks you for an odometer check-in, which keeps the estimate on track.

- Media `engine_miles_oil.webp`: The oil change countdown.

**Building it with my dad**

> I built it in Swift and SwiftUI, and everything stays on your phone. There's no account and no server, so your log never leaves your iPhone. The free version covers one car, unlimited fill-ups, the estimate, the oil countdown and the monthly check-in. Pro adds insights, reminders and more cars for $1.99 a month, $9.99 a year or $29.99 once.

> My dad tested every build on TestFlight before it went out, and he's a great tester because he says exactly what he thinks. One screen used to say "whole car", and he asked what that was even supposed to mean, so now it says "car's lifetime".

- Media `engine_miles_log.webp`: Every fill-up, by month.
- Media `engine_miles_insights.webp`: Insights, part of Pro.

**Where it's at**

> Engine Miles went live on the App Store in October 2026. It's still early, so right now I'm mostly working on getting it in front of more hybrid owners. There's a lot more I want to add, and my dad keeps finding things for the list.



## Automated Foosball Goalie (`foosball`)

### Before

- Title: Automated Foosball Goalie
- Tagline: KURT (Killer.Ultimate.Robot.Teammate), a camera-tracked robotic foosball goalie
- Summary: A build log for KURT (Killer.Ultimate.Robot.Teammate), an automated foosball goalie built onto a $50 secondhand foosball table. A Raspberry Pi and an overhead camera track the ball with an OpenCV color tracker and a Kalman filter predicts where it is heading, while a stepper motor and driver move the goalie back and forth. The page is a dated timeline of seven videos from hauling the table upstairs in October 2022 to a working goalie on December 25, 2022, followed by a click-to-fullscreen photo gallery of the same milestones.
- Status: Working version by the end of December 2022

**Making an Automated Foosball Goalie!**

> Below are some videos and descriptions detailing the process of constructing my automated foosball goalie KURT (Killer.Ultimate.Robot.Teammate). I started the project after being inspired by a similar project that I saw on a college tour. It was a long journey from obtaining the foosball table in October to me creating a working version towards the end of December. So please feel free to jump around and check out the project below.


**Bringing the Table Home (October 18, 2022)**

> So this was the day where we picked up the foosball table from Facebook Marketplace for $50. After that we had the fun time of hauling it all the way up the stairs so I could start putting it back together.

- Media `bringing_it.mp4`: October 18, 2022

**First Setup: Raspberry Pi and a Janky Camera Mount (December 3, 2022)**

> After setting up the foosball table, Raspberry Pi (the brains of this thing), and a very janky camera mount made out of dowels and a Chinese food container, I was able to focus on the software that would be used to track the ball across the foosball table. This was kind of a big deal because it would be the decider if this whole project was actually possible.

- Media `first_setup.mp4`: December 3, 2022

**Ball Tracking with OpenCV and a Kalman Filter (December 9, 2022)**

> I did plenty of research on all sorts of object tracking software, even testing out some AI object recognition software. I ended up settling on a simple color tracker (OpenCV) mainly because it could quickly display the ball's coordinates (red circle, and red text), which were derived from the live camera feed. Finally, I used the Kalman Filter to predict the future estimated position of the ball (the white circle in the video that's leading the ball).

- Media `ball_tracking.mp4`: December 9, 2022

**Stepper Motor, Motor Driver, and a Jingle Bells Melody (December 19, 2022)**

> Happy with the state of the object tracking software, I started to play around with the stepper motor and motor driver. It was a complex system, but utilizing resources found on the internet and with some guidance from my dad, an electrical engineer, I was able to construct the circuit that made the motor function. Having this isn't everything though, I need to write the software that would control the motor which includes direction, activation, and the speed. I would go on to make a few versions of the motor controller software, and finally got one to work well enough for testing.

> Throughout this I was fascinated by the sound it made as I increased the speed. It sounded just like a musical scale, which makes sense because to change the speed you set it to a different frequency, or in musical terms a different note. Knowing this I was able to create the jingle bells melody. In the video you are able to hear the melody and also see the frequencies used, which are displayed on the monitor.

- Media `stepper_motor.mp4`: December 19, 2022

**Designing and Building the Rig (December 22, 2022)**

> As a part of the planning process, I designed multiple prototypes of the contraption that would attach to the side of the table and move the goalie back and forth. Some were made out of Legos, and some cardboard. Once I was happy with the design, I added the parts to my Amazon cart and placed the order, praying that they would all work together. On receiving the parts I was thrilled to start putting the contraption (or KURT) together. After assembling and disassembling KURT many times, and a few runs to Home Depot, I was able to mount it and get almost everything setup and ready for the goalie to be moving!

- Media `t_slot_setup.mp4`: December 22, 2022

**First Movement (December 22, 2022)**

> Working motor controller connected to the table.

- Media `first_movement.mp4`: December 22, 2022

**Final Setup: A Functional Foosball Goalie (December 25, 2022)**

> Finally, I was able to combine the ball tracking software with the motor controller to create a functional foosball goalie. A lot of tweaking and tinkering went into getting the optimal positioning strategy down, but in the end he makes more saves than I would.

- Media `final_setup.mp4`: December 25, 2022

**Thanks for having a visit with KURT, my Automated Foosball Goalie!**

> There are still plenty of flaws, and many improvements to be made. But in the end, I'm happy that I took on this challenge, and even more so, I'm thrilled about all the knowledge that I gained.


**Photo Gallery**

> Select any image to open the gallery, then use the arrow keys or on-screen controls to move through the build.

- Media `backyard.webp`: October 18, 2022
- Media `first_setup.webp`: December 3, 2022
- Media `whiteboard.webp`: December 3, 2022
- Media `models.webp`: December 5, 2022
- Media `new_mount.webp`: December 9, 2022
- Media `image_tracking.webp`: December 9, 2022
- Media `stepper_motor.webp`: December 19, 2022
- Media `messy_desk.webp`: December 19, 2022
- Media `t_slot_parts.webp`: December 21, 2022
- Media `t_slot_bulit.webp`: December 21, 2022
- Media `cart.webp`: December 22, 2022
- Media `wires.webp`: December 22, 2022
- Media `kurt_cool.webp`: December 22, 2022
- Media `final_view.webp`: December 25, 2022


### After

- Title: Automated Foosball Goalie
- Tagline: KURT (Killer.Ultimate.Robot.Teammate), a camera-tracked robotic foosball goalie
- Summary: KURT (Killer.Ultimate.Robot.Teammate) is the automated foosball goalie I built on a $50 table from Facebook Marketplace. A Raspberry Pi and an overhead camera track the ball, a Kalman filter guesses where it's going, and a stepper motor slides the goalie over to block it. I worked on it from October 2022 until I got it working on Christmas Day.
- Status: Working version by the end of December 2022

**Making an Automated Foosball Goalie!**

> Below are some videos and descriptions detailing the process of constructing my automated foosball goalie KURT (Killer.Ultimate.Robot.Teammate). I started the project after being inspired by a similar project that I saw on a college tour. It was a long journey from obtaining the foosball table in October to me creating a working version towards the end of December. So please feel free to jump around and check out the project below.


**Bringing the Table Home (October 18, 2022)**

> So this was the day where we picked up the foosball table from Facebook Marketplace for $50. After that we had the fun time of hauling it all the way up the stairs so I could start putting it back together.

- Media `bringing_it.mp4`: October 18, 2022

**First Setup: Raspberry Pi and a Janky Camera Mount (December 3, 2022)**

> After setting up the foosball table, Raspberry Pi (the brains of this thing), and a very janky camera mount made out of dowels and a Chinese food container, I was able to focus on the software that would be used to track the ball across the foosball table. This was kind of a big deal because it would be the decider if this whole project was actually possible.

- Media `first_setup.mp4`: December 3, 2022

**Ball Tracking with OpenCV and a Kalman Filter (December 9, 2022)**

> I did plenty of research on all sorts of object tracking software, even testing out some AI object recognition software. I ended up settling on a simple color tracker (OpenCV) mainly because it could quickly display the ball's coordinates (red circle, and red text), which were derived from the live camera feed. Finally, I used the Kalman Filter to predict the future estimated position of the ball (the white circle in the video that's leading the ball).

- Media `ball_tracking.mp4`: December 9, 2022

**Stepper Motor, Motor Driver, and a Jingle Bells Melody (December 19, 2022)**

> Happy with the state of the object tracking software, I started to play around with the stepper motor and motor driver. It was a complex system, but utilizing resources found on the internet and with some guidance from my dad, an electrical engineer, I was able to construct the circuit that made the motor function. Having this isn't everything though, I need to write the software that would control the motor which includes direction, activation, and the speed. I would go on to make a few versions of the motor controller software, and finally got one to work well enough for testing.

> Throughout this I was fascinated by the sound it made as I increased the speed. It sounded just like a musical scale, which makes sense because to change the speed you set it to a different frequency, or in musical terms a different note. Knowing this I was able to create the jingle bells melody. In the video you are able to hear the melody and also see the frequencies used, which are displayed on the monitor.

- Media `stepper_motor.mp4`: December 19, 2022

**Designing and Building the Rig (December 22, 2022)**

> As a part of the planning process, I designed multiple prototypes of the contraption that would attach to the side of the table and move the goalie back and forth. Some were made out of Legos, and some cardboard. Once I was happy with the design, I added the parts to my Amazon cart and placed the order, praying that they would all work together. On receiving the parts I was thrilled to start putting the contraption (or KURT) together. After assembling and disassembling KURT many times, and a few runs to Home Depot, I was able to mount it and get almost everything setup and ready for the goalie to be moving!

- Media `t_slot_setup.mp4`: December 22, 2022

**First Movement (December 22, 2022)**

> Working motor controller connected to the table.

- Media `first_movement.mp4`: December 22, 2022

**Final Setup: A Functional Foosball Goalie (December 25, 2022)**

> Finally, I was able to combine the ball tracking software with the motor controller to create a functional foosball goalie. A lot of tweaking and tinkering went into getting the optimal positioning strategy down, but in the end he makes more saves than I would.

- Media `final_setup.mp4`: December 25, 2022

**Thanks for having a visit with KURT, my Automated Foosball Goalie!**

> There are still plenty of flaws, and many improvements to be made. But in the end, I'm happy that I took on this challenge, and even more so, I'm thrilled about all the knowledge that I gained.


**Photo Gallery**

> Select any image to open the gallery, then use the arrow keys or on-screen controls to move through the build.

- Media `backyard.webp`: October 18, 2022
- Media `first_setup.webp`: December 3, 2022
- Media `whiteboard.webp`: December 3, 2022
- Media `models.webp`: December 5, 2022
- Media `new_mount.webp`: December 9, 2022
- Media `image_tracking.webp`: December 9, 2022
- Media `stepper_motor.webp`: December 19, 2022
- Media `messy_desk.webp`: December 19, 2022
- Media `t_slot_parts.webp`: December 21, 2022
- Media `t_slot_bulit.webp`: December 21, 2022
- Media `cart.webp`: December 22, 2022
- Media `wires.webp`: December 22, 2022
- Media `kurt_cool.webp`: December 22, 2022
- Media `final_view.webp`: December 25, 2022


## Legacy Data Cleanup (`legacy-data-cleanup`)

### Before

- Title: Legacy Data Cleanup
- Tagline: An AI-assisted review pipeline for untangling decades of inconsistent records
- Summary: I built a collection of tools for finding and repairing data-quality problems left by the conversion of a legacy DOS system into a modern web application. The workflow profiled the data, packaged difficult cases for AI analysis, traced every suggestion back to its original cells, and gave a person the final decision through a review interface. For mechanical corrections, I also created a deliberately conservative bulk-fix path with invariants, dry runs, backups, and transactional updates.
- Status: Internship project

**Why the records were difficult**

> The project was replacing a DOS-era system with a web application, and the old data did not map cleanly into the new structure. Free text had been entered into narrow fixed-width fields and continued across neighboring rows or columns. When some of those records were imported, line boundaries disappeared, words were joined together, comments were split into fragments, and values ended up in places where they did not belong.

> The challenge was not only finding unusual values. Some rare values were real, and some strange-looking fragments only made sense when read beside the surrounding cells. A cleanup system needed enough context to reconstruct the intended information without confidently rewriting valid historical records.


**Profiling before changing anything**

> I started with scripts that scanned columns, counted distinct values, sampled suspicious patterns, and identified likely corruption. This made the rules reflect the actual data instead of assumptions about what bad data should look like. Mostly unique fields were treated differently from categorical fields, where one rare value among thousands of repeated values was much more likely to be a typo or misplaced note.

> The profiling output became structured JSON containing the original values, surrounding rows, likely issue types, and enough context for the next stage. The source database remained read-only during discovery.


**Using AI in controlled batches**

> There was too much material to review in one prompt, so I divided the findings into independent JSON batches. Each batch explained the table layout, reading order, relevant rules, original values, and the exact response format. The AI could then propose reconstructed comments, spelling corrections, values to move, or cases that still needed a person.

> The output contract mattered as much as the prompt. Import scripts rejected incomplete batches, malformed JSON, unknown categories, missing record identifiers, and findings that referred to data outside the supplied batch. That turned AI output into a checked intermediate artifact rather than something that could flow directly into the database.

- Code block: LEGACY RECORDS /       ↓ / PROFILE + DETECT  →  suspicious cells and fragments /       ↓ / JSON BATCHES      →  AI reconstruction and review /       ↓ / HUMAN REVIEW      →  approve · edit · flag · dismiss /       ↓ / STAGED CHANGES    →  verify · back up · apply

**Keeping a person in the loop**

> I built a local review application that grouped every related table for one asset onto the same screen. Suggested comments appeared beside the source table, with the exact contributing cells highlighted. Reviewers could approve a suggestion, edit its wording, mark it for more review, dismiss it, or inspect the raw fragments before deciding.

> Each approved comment kept its category, final text, source table, column, record identifier, and captured original value. Decisions and edits were saved as work progressed, so a long review could be paused and resumed without losing its place.


**Automating only the safe cases**

> Some corruption had a consistent mechanical cause: a missing space where one fixed-width line had wrapped into the next. I created a separate deterministic fixer for those cases. It only split tokens from an explicitly reviewed list and only inserted or removed spaces or collapsed doubled punctuation. It was not allowed to add, delete, or reorder any letter or number.

> The tool rechecked that invariant for every proposed change and aborted the entire run if even one row failed. It was dry-run by default, produced a complete before-and-after audit file, made a backup before applying changes, used a single transaction, and was designed to be idempotent. A full-dataset dry run identified 21,616 corrections with zero invariant violations.


**Creating the implementation with AI**

> I produced this tooling through an AI-generated development process. I gave the coding model representative records, explained where the data came from and what a valid transformation looked like, then used it to generate the profilers, algorithms, batch converters, validation scripts, and review interfaces.

> My role was to define the problem, design the data passed between each stage, supply examples and constraints, inspect the proposed behavior, and keep iterating when the output missed an edge case. Using AI let me test several approaches quickly, but it also made independent verification especially important. The strict schemas, invariants, audit files, and human approval steps were how I made the generated implementation accountable.


**What the workflow changed**

> Instead of asking someone to manually read every table and reconstruct every fragment from scratch, the system brought likely problems and suggested repairs to them with the evidence already attached. Routine issues could be handled consistently, while uncertain cases stayed visible and required a decision.

> The project taught me that automation for messy historical data should not be measured only by how many changes it can produce. The better question is how clearly it can explain each change, how safely it can refuse uncertain work, and how easy it is for a person to recover the original value.



### After

- Title: Legacy Data Cleanup
- Tagline: Tools for finding and fixing decades of messy records, with a person approving the fixes
- Summary: The county was moving from an old DOS system to a new web app, and a lot of the old data came over broken. Notes were split across rows, words were stuck together, and values ended up in the wrong place. At my 2026 internship I built tools that find these problems, suggest fixes, and let a person approve each one.
- Status: Internship project

**Why the data was messy**

> In the old system, people typed long notes into narrow fixed-width fields that wrapped onto the next row. When it was imported, those line breaks disappeared, so words got glued together and comments got chopped into pieces. The tricky part is that some weird-looking values are actually correct, so you can't just fix everything that looks odd.


**Finding the problems**

> First I wrote scripts that scan every column and flag what looks wrong, without changing anything. A rare value in a column full of repeats is probably a typo, while a rare value in a column of IDs is normal.


**Using AI carefully**

> The flagged records went to an AI in small batches, with instructions for how to read the table and exactly what format to answer in. Anything that came back incomplete or didn't match its batch got rejected. Then a review app showed each suggestion next to the original cells, and a person approved, edited or dismissed it.

- Code block: LEGACY RECORDS /       ↓ / PROFILE + DETECT  →  suspicious cells and fragments /       ↓ / JSON BATCHES      →  AI reconstruction and review /       ↓ / HUMAN REVIEW      →  approve · edit · flag · dismiss /       ↓ / STAGED CHANGES    →  verify · back up · apply

**Fixing the easy ones automatically**

> One kind of problem was purely mechanical: a missing space where a line wrapped. For those I made a separate fixer that's only allowed to add or remove spaces, never change a letter or a number. If even one change broke that rule, the whole run stopped. A dry run on all the data found 21,616 fixes and zero rule breaks.


**How I built it**

> Most of this code was written by AI. My part was explaining where the data came from, giving it real examples, deciding what the steps should be, and checking its work. Since the AI wrote so much of it, the strict checks and the human review are what made me trust the results.



## Parcel Web Analyzer (`parcel-web-analyzer`)

### Before

- Title: Parcel Web Analyzer
- Tagline: A geospatial tool for comparing Seattle homes by what matters nearby
- Summary: The Parcel Web Analyzer is a web-based tool that helps users compare residential parcels in the Seattle area using their own proximity-based requirements. It combines King County parcel polygons with live OpenStreetMap amenities, scores each parcel with a custom weighting algorithm, and explains why a parcel scored well.
- Status: IGME 382 final project
- Hero caption: Processed parcels use a light-to-dark gradient to show relative suitability.

**The idea**

> This project was inspired by my sister’s recent home-buying search in Seattle and the criteria she shared: walkability to restaurants, access to parks and trails, and proximity to daily amenities. Her notes directly shaped the suitability factors I analyzed.

> The question I wanted to answer was: which residential parcels in Seattle best match a person's home-buying requirements, and how does that suitability change across the city?

- Media `map-before.webp`: Before processing, parcels are outlines for context.

**How it works**

> Users load parcels, draw an area of interest, fetch nearby amenities from Overpass, build and reorder requirement groups, and then process the scores. Clicking a parcel shows its score and the count from each requirement group, so the result is explainable instead of just being a color on a map.

> For each group, the app filters the included amenity types, buffers each amenity by the chosen distance, spatially joins those buffers to the parcels, and counts the intersections. Priority is handled with triangular weighting, so the first requirement has the most influence and each lower priority contributes less.

> The original King County dataset includes more than 500,000 parcels across many land uses. I used ArcGIS Pro to clip the study area and filter it down to residential parcels before loading it into the web app.

- Media `parcel-score.webp`: Clicking a parcel explains what contributed to its score.

**What the results showed**

> High scores formed clusters in mixed-use areas. Homes near main streets with many restaurants scored higher, showing where businesses and amenities are concentrated.

> The chosen distance made a large difference. Smaller walking distances such as 0.25 to 0.5 miles produced sharper contrast, while larger distances spread high scores more broadly. When food was the top priority, parcels near commercial clusters could score very highly even when that conflicted with a preference for quiet streets.

> The app exports the scored layer as GeoJSON or Shapefile so the output can go back into a GIS workflow.

- Media `food-cluster.webp`: Restaurant-heavy priorities reveal cluster bias near commercial streets.

**What I learned**

> Preprocessing mattered as much as the algorithm. Clipping, filtering, and exporting in ArcGIS Pro were essential to making the interactive analysis usable.

> I also learned how much a good interface changes a GIS tool. Operations that feel complex in ArcGIS can become much easier in a guided workflow. Building it made me think about all the GIS tools we take for granted, such as Google Maps, and how important it is to plan the interface around what someone is trying to do.



### After

- Title: Parcel Web Analyzer
- Tagline: A map tool for comparing Seattle homes by what matters nearby
- Summary: For my GIS class final project, I built a web tool that compares homes in Seattle by what's nearby. You pick what matters to you, like restaurants, parks or trails, and it scores every residential parcel and shows you why each one scored the way it did.
- Status: IGME 382 final project
- Hero caption: Processed parcels use a light-to-dark gradient to show relative suitability.

**The idea**

> This project was inspired by my sister's recent home-buying search in Seattle and the criteria she shared: walkability to restaurants, access to parks and trails, and proximity to daily amenities. Her notes directly shaped the suitability factors I analyzed.

> The question I wanted to answer was: which residential parcels in Seattle best match a person's home-buying requirements, and how does that suitability change across the city?

- Media `map-before.webp`: Before processing, parcels are outlines for context.

**How it works**

> Users load parcels, draw an area of interest, fetch nearby amenities from OpenStreetMap, build and reorder requirement groups, and then process the scores. Clicking a parcel shows its score and the count from each requirement group, so the result is explainable instead of just being a color on a map.

> For each group, the app takes the chosen amenity types, draws a circle of the chosen distance around each one, and counts how many of those circles touch each parcel. The first requirement has the most influence, and each lower priority counts a little less.

> The original King County dataset includes more than 500,000 parcels across many land uses. I used ArcGIS Pro to clip the study area and filter it down to residential parcels before loading it into the web app.

- Media `parcel-score.webp`: Clicking a parcel explains what contributed to its score.

**What the results showed**

> High scores formed clusters in mixed-use areas. Homes near main streets with many restaurants scored higher, showing where businesses and amenities are concentrated.

> The chosen distance made a large difference. Smaller walking distances such as 0.25 to 0.5 miles produced sharper contrast, while larger distances spread high scores more broadly. When food was the top priority, parcels near commercial clusters could score very highly even when that conflicted with a preference for quiet streets.

> The app exports the scored layer as GeoJSON or Shapefile so the output can go back into a GIS workflow.

- Media `food-cluster.webp`: Restaurant-heavy priorities reveal cluster bias near commercial streets.

**Looking back**

> Preprocessing mattered as much as the algorithm. Clipping, filtering, and exporting in ArcGIS Pro were essential to making the interactive analysis usable.

> I also learned how much a good interface changes a GIS tool. Operations that feel complex in ArcGIS can become much easier in a guided workflow. Building it made me think about all the GIS tools we take for granted, such as Google Maps, and how important it is to plan the interface around what someone is trying to do.



## RelayReply (`relayreply`)

New page.

### After

- Title: RelayReply
- Tagline: An AI that makes phone calls for you while you read the captions and decide on cards
- Summary: RelayReply makes phone calls for people who can't, or would rather not, talk on the phone. You type what you need, an AI voice makes a real call to the business, and you read both sides as live captions. When something comes up that only you can decide, you get a card. It's in a private beta right now.
- Status: Private beta
- Hero caption: A question card: the AI asks you before it agrees to anything.

**Why I built it**

> For a lot of people, the phone call is the hardest part of getting something done. That includes people who are Deaf or hard of hearing, people who stutter or can't speak, and anyone who just gets anxious on the phone. Booking an appointment or refilling a prescription still usually means calling.

> So I wanted to see if an AI voice could do the talking for you, while you still stay in control of what gets said.


**How a call works**

> You type who to call and what you want, like refilling a prescription. The server places a real phone call, and an AI voice talks to the business for you. By default it tells them it's an AI assistant and that it's transcribing.

> Everything both sides say shows up on your screen as captions. When the pharmacy asks something only you should answer, like 30 days or 90 days, a card pops up with the options. You tap one or type your own answer, and the AI says it. It's designed to bring money, times and anything personal to you as a card first.


**The system behind it**

> The server owns every call, and the web app is basically a remote control. If you close the tab or lose signal, the call keeps going, and when you come back it catches you up on what you missed.

> Each call really has two AIs working together. One is the voice that does the talking. The other listens along, decides when something needs a card, and handles small jobs on the side. Before building the real product, I worked out how calls should go in a separate test lab (about 8,000 lines of Python), then moved that "call brain" into the production server.

> I started RelayReply as an iPhone app in the spring of 2026. In the fall I started over web first, so it works in any browser, and the iPhone app will come back on top of the same server. The web app is React and TypeScript, the call server is Python and FastAPI, Twilio handles the phone calls, and Supabase handles accounts and the database.


**Where it's at**

> RelayReply is in a private beta. It isn't a relay service, it can't call 911, and it only calls US numbers. Like any AI it can miss a question, which is why you can always see the captions. Next up is getting the beta to more people and then bringing back the iPhone app.



## RIT Dining Notifications (`rit-dining-notifications`)

### Before

- Title: RIT Dining Notifications
- Tagline: A Telegram budget assistant built around my real RIT dining balance
- Summary: I built this project to turn RIT's transaction history into a budget I could actually use every day. A Python host opened TigerSpend through Selenium, parsed new Dining Dollars purchases with Beautiful Soup, kept a local JSON ledger, and used a Telegram bot as the interface. Along with purchase alerts, it calculated daily and weekly spending targets from the remaining balance and time left in the semester.
- Status: Archived
- Hero caption: The project turned TigerSpend purchases into a saved ledger, a recalculated spending budget, and Telegram updates.

**Why I built it**

> Dining Dollars are loaded for a whole semester, but a balance by itself does not answer the question I cared about: how much can I safely spend today? I wanted the answer to update as I used the account, without repeatedly copying purchases into a spreadsheet.

> The assistant turned the latest balance and the semester end date into daily and weekly allowances. Spending less than the target left more money available for later; spending more reduced the next recommendation. That made the budget respond to real purchases instead of relying on a fixed estimate from the first week of class.


**One command, the complete pipeline**

> Telegram was both the remote control and the output. After a one-time connection-code handshake, /refresh asked the Python host for fresh data. The host opened a new Selenium browser, passed through the RIT and Duo sign-in flow, selected the dining account, loaded its statement, and handed the resulting HTML to Beautiful Soup.

> The parser normalized each row into a timestamp, merchant description, amount, and remaining balance. It compared those rows with the local ledger, saved only transactions it had not seen before, and returned the additions to the bot. The bot then sent one purchase message per new row, followed by the recalculated budget; when there was nothing new, it said so instead of repeating old alerts.

- Code block: Telegram /refresh /         ↓ / Python host → Selenium → RIT + Duo → TigerSpend statement /                                       ↓ / Telegram alerts ← budget math ← JSON ledger ← Beautiful Soup

**Scraping the statement**

> The scraper used browser automation for the parts that needed a real session, then parsed the completed statement page rather than driving every table cell through Selenium. This split kept authentication and navigation in the browser while making transaction extraction easier to reason about in Python.

> I revisited the live site in September 2026 and ran the statement workflow again. TigerSpend now labels the account as Dining Dollars (Rollover), uses a different account identifier, and formats some dates differently from the version the project expected. The recording shows the real request completing and returning current transaction descriptions; personal details, balances, and amounts have been removed from the public capture.

- Media `tigerspend_refresh.mp4`: A live, privacy-safe rerun of the core statement-loading step. The pause is TigerSpend fetching the six-month transaction history.

**A small local ledger**

> I stored the known transaction rows in rit_statements.json, keyed by their timestamps. That file was deliberately simple: it gave the scraper something persistent to compare against, prevented duplicate Telegram messages between refreshes, and let /checkfunds calculate a budget without logging into TigerSpend again.

> The budget routine read the most recent balance, counted the days and weeks remaining, and then subtracted spending already recorded for the current day and week. This was a lightweight solution for one user on one computer, not a general database, but it was enough to connect a live account history to a useful day-to-day decision.

- Media `tigerspend_transactions.webp`: The transaction table that the parser turned into JSON records. Identifying information, balances, and purchase amounts are intentionally outside the capture or redacted.

**Telegram was the interface**

> Instead of building another dashboard, I used a Telegram bot so the system was already available on my phone. /checkfunds reported the current daily and weekly amounts from the saved ledger, while /refresh performed the slower live scrape after a purchase. The bot also implemented /start, /status, /disconnect, and /help around a small in-memory connection state.

> The integration was intentionally direct: the program called Telegram's getUpdates and sendMessage endpoints itself with the Requests library. Building that loop made the full path visible, from a command arriving, to Python calling the scraper, to a formatted notification returning to the same chat.

> This original phone recording shows the bot in use in August 2024. I connect to it, open the command list, check the saved budget, and run /refresh. The bot asks me to approve the RIT Duo login, reports each step while the scraper works, and finishes by saying that it found no new transactions.

- Media `telegram_bot_demo_password_blurred_loop.webp`: The Telegram side of the project, recorded in August 2024. My name and historical fund amounts remain visible; only the old four-digit connection password is blurred.

**What the 2026 rerun revealed**

> The project captured the workflow well, but it also showed why web scrapers need maintenance. The original code depended on a hard-coded account option, specific links and date formats, a fixed semester end date, and credentials stored in source configuration. Changes to the live site were enough to break those assumptions even though the overall journey still existed.

> For the rerun, I tested compatibility changes in an isolated copy: account selection now follows the live statement link, configuration can come from environment variables, and the date parser accepts both the older and current formats. The Python files compile and the revised date cases pass, but I did not treat that test copy as a production rewrite or send messages from the bot.

> If I rebuilt it today, I would keep credentials and semester settings outside the code, persist bot authorization instead of keeping it only in memory, reuse a browser session, and add focused parser tests around saved HTML. The original version was still valuable because it joined browser automation, HTML parsing, state, budgeting logic, and a real messaging API into one system built for a problem I actually had.



### After

- Title: RIT Dining Notifications
- Tagline: A Telegram bot that told me how much I could spend on food each day at RIT
- Summary: RIT gives you Dining Dollars for the whole semester, but the balance doesn't tell you how much you can actually spend today. So I built a Telegram bot that logged into my account, grabbed my new purchases, and told me my daily and weekly budget.
- Status: Archived
- Hero caption: New purchases go in, a daily budget comes out on my phone.

**Why I built it**

> I wanted a number that changed as I spent. If I spent less than my target one day, I'd have a little more for the rest of the week, and if I went over, the next day's budget would go down. I didn't want to copy every purchase into a spreadsheet to get that.


**How it worked**

> I'd send /refresh to the bot. My Python program then opened a browser with Selenium, logged into RIT (I still had to approve the Duo prompt on my phone), opened my dining statement, and read the new purchases with Beautiful Soup.

> It saved them to a small JSON file so it never sent the same alert twice, then messaged me each new purchase and my updated budget. /checkfunds just did the math from the saved file without logging in again.

- Media `telegram_bot_demo_password_blurred_loop.webp`: The bot in August 2024. Only the old connection password is blurred.

**Talking to Telegram**

> I talked to Telegram's API directly instead of using a library, which made it really clear how a message gets from my phone to my code and back.

- Media `tigerspend_transactions.webp`: The statement the bot read from, with personal details and amounts cut out.

**Scrapers break**

> The RIT site has changed since 2024, enough to break a few of the things my code expected, like how dates are written. That's the problem with scrapers: the website changes and your code doesn't. If I rebuilt it, I'd keep my login settings out of the code and add tests with saved pages, so I'd know right away when something breaks.

- Media `tigerspend_refresh.mp4`: Loading the dining statement, with personal details removed.


## RIT Dorm Laundry Tracker (`rit-laundry-tracker`)

### Before

- Title: RIT Dorm Laundry Tracker
- Tagline: My first team prototype for checking dorm washers and dryers before walking downstairs
- Summary: This was one of my first team software projects at RIT. We made a prototype where students could choose their residence hall, see which washers and dryers were available, and start a 55-minute laundry timer. It was also where I met my friend Jimmy, who I am still friends with today, and it gave me my first real experience building software with other people.
- Status: RIT SWEN 101 team project
- Hero caption: The washer and dryer availability screen running locally.

**My first team experience**

> The most important part of this project for me was learning how to work on software with a team for the first time. We had to agree on what the app should do, divide the pages and features, share our code, and bring everything back together into one flow.

> It was a great introduction to collaborating instead of building everything alone. I also met my friend Jimmy through the project, and we are still friends today.


**Choosing a dorm**

> The prototype starts with a simple RIT email login and then asks the student to choose one of thirteen residence halls. The selected dorm is saved in localStorage and carried to the machine page.

- Media `dorm-selection.webp`: Students choose their residence hall before viewing its machines.

**Availability and timers**

> The machine screen uses a green outline for available washers and dryers and a red outline for machines that are in use. Choosing an available machine opens a status page with a 55-minute countdown.

> This was a front-end prototype rather than a connected campus system. We designed a JSON structure for thirteen dorms and eight machines per dorm, but the final pages still used hardcoded machine states and the timer reset if the page was refreshed.

- Media `washer-timer.webp`: The washer countdown before it starts.


### After

- Title: RIT Dorm Laundry Tracker
- Tagline: My first team prototype for checking dorm washers and dryers before walking downstairs
- Summary: This was one of my first team software projects at RIT. We made a prototype where students could pick their dorm, see which washers and dryers were free, and start a 55-minute laundry timer. It's also where I met my friend Jimmy, who I'm still friends with today.
- Status: RIT SWEN 101 team project
- Hero caption: The washer and dryer availability screen running locally.

**My first team experience**

> The most important part of this project for me was learning how to work on software with a team for the first time. We had to agree on what the app should do, divide the pages and features, share our code, and bring everything back together into one flow.

> It was a great introduction to collaborating instead of building everything alone. I also met my friend Jimmy through the project, and we are still friends today.


**Choosing a dorm**

> The prototype starts with a simple RIT email login and then asks the student to choose one of thirteen residence halls. The selected dorm is saved in localStorage and carried to the machine page.

- Media `dorm-selection.webp`: Students choose their residence hall before viewing its machines.

**Availability and timers**

> The machine screen uses a green outline for available washers and dryers and a red outline for machines that are in use. Choosing an available machine opens a status page with a 55-minute countdown.

> This was a front-end prototype rather than a connected campus system. We designed a JSON structure for thirteen dorms and eight machines per dorm, but the final pages still used hardcoded machine states and the timer reset if the page was refreshed.

- Media `washer-timer.webp`: The washer countdown before it starts.


## Roman Numeral Converter (`roman-numerals`)

### Before

- Title: Roman Numeral Converter
- Tagline: An early two-way Roman numeral converter with its own validity check
- Summary: I wrote this on a Raspberry Pi before I even knew about while loops. It converts Roman numerals into regular numbers, checks whether the input is valid, and uses a separate conversion routine for the other direction. Looking back at it is a fun snapshot of how I solved problems before I knew the normal tools for solving them.
- Status: Complete
- Hero caption: Adapted from a photograph by Sonse, licensed CC BY 2.0.

**A strange but useful validator**

> The program decodes the Roman numeral, converts the answer back into a canonical Roman numeral, and compares that result with the original input. If the strings do not match, it can reject forms such as IIII and suggest IV instead.


**How the two directions work**

> Reading a Roman numeral goes from left to right. A symbol is added when it is at least as large as the symbol after it, but subtracted when a larger symbol follows it. That is why VI is 5 + 1, while IV is -1 + 5.

> Writing a Roman numeral works in the other direction. The converter repeatedly takes the largest symbol or subtractive pair that fits into the number, appends it, and continues with the remainder. The playable trace above exposes each of those decisions.



### After

- Title: Roman Numeral Converter
- Tagline: An early two-way Roman numeral converter with its own validity check
- Summary: I wrote this on a Raspberry Pi before I even knew about while loops. It converts Roman numerals into regular numbers, checks whether the input is valid, and uses a separate conversion routine for the other direction. Looking back at it is a fun snapshot of how I solved problems before I knew the normal tools for solving them.
- Status: Complete
- Hero caption: Adapted from a photograph by Sonse, licensed CC BY 2.0.

**A strange but useful validator**

> The program decodes the Roman numeral, converts the answer back into a canonical Roman numeral, and compares that result with the original input. If the strings do not match, it can reject forms such as IIII and suggest IV instead.


**How the two directions work**

> Reading a Roman numeral goes from left to right. A symbol is added when it is at least as large as the symbol after it, but subtracted when a larger symbol follows it. That is why VI is 5 + 1, while IV is -1 + 5.

> Writing a Roman numeral works in the other direction. The converter repeatedly takes the largest symbol or subtractive pair that fits into the number, appends it, and continues with the remainder. You can try it yourself in the converter above.



## Sudoku Creator and Solver (`sudoku-creator`)

### Before

- Title: Sudoku Creator and Solver
- Tagline: A Pygame Sudoku app that generates, plays, checks, and solves puzzles
- Summary: After building the Cryptogram Solver, I wanted to use backtracking on another kind of puzzle. This Pygame app can generate Sudoku boards, let you play them, accept a puzzle you enter yourself, and solve the board one step at a time. It mostly works most of the time, which is part of the charm of revisiting it now.
- Status: Complete
- Hero caption: The original Pygame interface for playing, checking, and solving a generated Sudoku.

**One program, several modes**

> The interface includes hints, answer checking, erasing, board entry, and a solver view. The generated puzzle keeps track of which cells are original clues, player guesses, hints, correct answers, wrong answers, or solver moves so each kind can be displayed differently.


**Watching the solver work**

> Instead of solving the whole board instantly, the backtracking routine advances one action per frame. You can watch it try a value, reach a dead end, move backward, and continue until it fills the grid.



### After

- Title: Sudoku Creator and Solver
- Tagline: A Pygame Sudoku app that generates, plays, checks, and solves puzzles
- Summary: After building the Cryptogram Solver, I wanted to use backtracking on another kind of puzzle. This Pygame app can make Sudoku boards, let you play them, take a puzzle you type in yourself, and solve the board one step at a time. It works most of the time, which is honestly part of the charm.
- Status: Complete
- Hero caption: The original Pygame interface for playing, checking, and solving a generated Sudoku.

**One program, several modes**

> The interface includes hints, answer checking, erasing, board entry, and a solver view. The generated puzzle keeps track of which cells are original clues, player guesses, hints, correct answers, wrong answers, or solver moves so each kind can be displayed differently.


**Watching the solver work**

> Instead of solving the whole board instantly, the backtracking routine advances one action per frame. You can watch it try a value, reach a dead end, move backward, and continue until it fills the grid.



## Symposium Notes (`symposium`)

### Before

- Title: Symposium Notes
- Tagline: An AI-powered assistant that records, transcribes, and summarizes lectures
- Summary: Imagine never having to take notes again. Symposium Notes is an AI-powered assistant that records, transcribes, and summarizes lectures and meetings, allowing you to pay full attention. I created the listener logic and the AI interfaces that populated the display during BrickHack 11.
- Status: BrickHack 11 project
- Hero caption: The working hackathon demo with a transcript and generated notes.

**Inspiration**

> I've wanted to create this project since before coming to RIT. Back in high school, I would’ve loved to have a tool like this, especially for English and social studies, where lectures were a big part of learning. I always struggled with juggling note-taking and actively listening, often missing key points because I was too busy writing.

> Originally, I planned to use Glean, a software with similar functionality. However, I discovered that it doesn’t allow data exports. Even after emailing their support team back in October, I never received a response. So, I figured why not build it myself?


**What it does**

> Users can start and stop recording at any time. The system automatically detects speech, breaks recordings into segments based on pauses, and converts the audio to text using OpenAI’s Whisper API.

> It generates AI-powered summaries in bullet points, and users can choose how many bullet points they want. Notes and transcripts are stored locally, with separate views where they can be edited, imported, exported, or cleared.

> A floating chat assistant answers follow-up questions using the transcript as context. Users can also adjust calibration time, silence detection, and segment length in the settings.


**Challenges and accomplishments**

> Limited experience with JavaScript and CSS made certain features tricky. The biggest challenge was dividing tasks efficiently. We had to figure out how to integrate our individual work without stepping on each other’s toes.

> The system was fully functional, and we completed it in time for the hackathon. We built a working AI-powered tool in a short time, and working as a team was a fun and rewarding experience.

- Media `symposium_notes.webp`: The two-pane workspace before recording begins.

**What we learned**

> Don’t leave the Devpost submission for the last minute. Collaborating on a team project can be challenging, but it’s also incredibly rewarding. Helping and teaching each other made the experience even more valuable.


**What’s next**

> The next steps were hosting it so people could use their own OpenAI API key, adding folders to organize notes by subject, and letting users upload PDFs and presentations so the AI could follow along and provide more detailed notes.

- Media `bricky.webp`: Bricky opens the transcript-aware chat assistant.


### After

- Title: Symposium Notes
- Tagline: A hackathon app that records lectures and turns them into notes
- Summary: Symposium Notes was my BrickHack 11 project in February 2025. It records a lecture, transcribes it, and turns it into bullet-point notes, so you can actually listen instead of scrambling to write everything down. I built the listening logic and hooked up the AI that fills in the notes and transcript.
- Status: BrickHack 11 project
- Hero caption: The working hackathon demo with a transcript and generated notes.

**Inspiration**

> I've wanted to create this project since before coming to RIT. Back in high school, I would've loved to have a tool like this, especially for English and social studies, where lectures were a big part of learning. I always struggled with juggling note-taking and actively listening, often missing key points because I was too busy writing.

> Originally, I planned to use Glean, a software with similar functionality. However, I discovered that it doesn't allow data exports. Even after emailing their support team back in October, I never received a response. So, I figured why not build it myself?


**What it does**

> You can start and stop recording at any time. It detects speech on its own, breaks the recording into pieces wherever there's a pause, and turns the audio into text using OpenAI's Whisper API.

> Then it writes a summary in bullet points, and you choose how many bullet points you want. Notes and transcripts are saved in the browser, and you can edit, import, export or clear them.

> There's also a little chat assistant, Bricky, that answers questions about the lecture using the transcript. In settings you can adjust how long it calibrates, how much silence counts as a pause, and how long each piece is.


**Challenges and accomplishments**

> Limited experience with JavaScript and CSS made certain features tricky. The biggest challenge was dividing tasks efficiently. We had to figure out how to integrate our individual work without stepping on each other's toes.

> The system was fully functional, and we completed it in time for the hackathon. We built a working AI-powered tool in a short time, and working as a team was a fun and rewarding experience.

- Media `symposium_notes.webp`: The two-pane workspace before recording begins.

**What we learned**

> Don't leave the Devpost submission for the last minute. Collaborating on a team project can be challenging, but it's also incredibly rewarding. Helping and teaching each other made the experience even more valuable.


**What's next**

> The next steps were hosting it so people could use their own OpenAI API key, adding folders to organize notes by subject, and letting users upload PDFs and presentations so the AI could follow along and provide more detailed notes.

- Media `bricky.webp`: Bricky opens the transcript-aware chat assistant.


## Tic-Tac-Toe (`tic-tac-toe`)

### Before

- Title: Tic-Tac-Toe
- Tagline: My first Pygame project, with three levels of computer opponent
- Summary: I made this in April 2022 as my first graphical game, starting from a tutorial and then turning it into a complete Tic-Tac-Toe program of my own. I added a home screen, scorekeeping, local two-player play, three computer difficulties, forfeits, and custom end screens. The project was a fun way to learn Pygame before I used it for the much larger Blackjack game that followed.
- Status: Complete
- Hero caption: A match in progress. The interface, marks, grid, and controls are all drawn directly with Pygame.

**From a tutorial to a complete game**

> This started as a small tutorial project and became an excuse to keep experimenting. I built a home screen where the player can choose who moves first, switch between playing a friend and the computer, cycle through difficulty levels, reset the scores, and start another round without restarting the program.

> The scoreboard stays active for the whole session and records wins for X and O as well as ties. During a match, either player can forfeit, and the game draws a line through the winning row, column, or diagonal before showing the result screen.

- Media `tic_tac_toe_menu.webp`: The home screen combines the scoreboard with controls for the first player, game mode, score reset, and starting a match.

**A hand-built computer player**

> The hard opponent does not use minimax or search a full game tree. It first tries every empty square to find an immediate winning move, then repeats the scan to block an immediate win by the player. If neither applies, it scores each open square by counting how many still-possible winning routes pass through it and randomly chooses among the best-scoring options.

> I also added a special defense for the classic opposite-corners fork: when the player owns two opposite corners and the computer owns the center, the computer chooses an edge rather than another corner. Medium difficulty still takes wins and blocks losses, but mixes heuristic and random moves during open play. Easy chooses randomly from the remaining squares.


**Drawing the interface with Pygame**

> There are no image assets in the project. The grid is made from lines, X marks from pairs of diagonal strokes, O marks from outlined circles, and every button or panel from rectangles and rendered text. Their positions and sizes are calculated from the window width, height, and one derived line-width value, so the whole interface comes from the same small set of dimensions.

> The board is a 3-by-3 NumPy array containing zero for an empty square, one for X, and two for O. Win detection returns both the winning player and the endpoints of the winning route, allowing the same result to drive the game logic and the line drawn across the board.

- Media `tic_tac_toe_winner.webp`: The result panel uses the same line-drawn X and proportional layout helpers as the game board.


### After

- Title: Tic-Tac-Toe
- Tagline: My first Pygame project, with three levels of computer opponent
- Summary: I made this in April 2022 as my first game with graphics. It started from a tutorial, and then I kept adding to it: a home screen, scorekeeping, two-player mode, three computer difficulties and custom end screens. It was how I learned Pygame before I used it for the much bigger Blackjack game.
- Status: Complete
- Hero caption: A match in progress. Everything is drawn with Pygame, no images.

**From a tutorial to a real game**

> I kept experimenting past the tutorial. The home screen lets you choose who goes first, play a friend or the computer, change the difficulty, and reset the score. The score sticks around for the whole session, and the game draws a line through the winning row before showing who won.

- Media `tic_tac_toe_menu.webp`: The home screen and scoreboard.

**The computer player**

> The hard computer first checks if it can win right now, then if it needs to block you. If neither, it picks the square that's part of the most possible wins. I also taught it the classic trick where you take two opposite corners: it answers with an edge instead of falling for it. Medium mixes in random moves, and easy is all random.


**Drawing it all**

> There aren't any images in the project. The grid is lines, the X's are two diagonal strokes, the O's are circles, and the buttons are rectangles with text. Everything is sized from the window, so it all scales together.

- Media `tic_tac_toe_winner.webp`: The winner screen.


## Trip Planner (`trip-planner`)

### Before

- Title: Trip Planner
- Tagline: A shared itinerary where friends propose plans, vote on conflicts, and pack together
- Summary: I built Trip Planner as a shared home base for organizing a group trip without losing decisions across a long message thread. The Flask application combines a day-by-day itinerary, competing plans at the same time, participant voting, a collaborative packing list, and account administration in one responsive interface. Underneath the simple UI, hand-built Server-Sent Events keep every open browser current while locked JSON writes protect the shared data.
- Hero caption: The itinerary turns a group trip into a shared sequence of days, events, links, locations, and decisions.

**Planning outside the group chat**

> Trip Planner gives everyone on a trip the same source of truth. After signing in, a participant can browse the schedule by day, add an event with a time, title, description, location, or reference link, and see changes made by the rest of the group without refreshing the page.

> The interface is intentionally compact: itinerary cards surface the information needed while traveling, and a small participant count shows how many people can weigh in. I kept the client in plain HTML, CSS, and JavaScript so the application could stay focused on the group workflow instead of a large front-end stack.


**Conflicts become choices**

> Two ideas scheduled for the same time are grouped into an explicit set of options instead of silently overlapping. Each signed-in participant can vote an option up or down, change that vote later, and immediately see the totals. That turns a scheduling conflict into a small, visible decision the group can resolve together.

> Ownership rules prevent one participant from casually erasing someone else's suggestion. An event can be removed by its creator or an administrator, and the server also permits deletion after every other participant has downvoted it. The rule joins the account system, vote records, and event lifecycle rather than treating voting as decoration.

- Media `trip_planner_voting.webp`: Plans at the same time become alternatives the whole group can evaluate; the 8 AM coffee run was added and upvoted during the live test.

**Real-time updates without a front-end framework**

> I implemented the live layer with Server-Sent Events. Every connected browser receives a bounded queue, and the Flask server publishes an update after itinerary, voting, packing, or account data changes. A keepalive is sent during quiet periods so intermediaries do not mistake an idle trip for a dead connection.

> This is a deliberately small real-time design: the browser listens to one event stream, then requests fresh data and re-renders the relevant view. Bounded queues keep a slow or abandoned client from growing memory forever. The implementation is process-local, which is appropriate for the original single-process deployment but would need Redis or another shared message broker before scaling to multiple workers.

- Code block: browser action -> Flask route -> locked JSON write /               | /               +-> publish update -> bounded client queues -> EventSource -> refresh view

**A safe write path for simple storage**

> The project stores its itinerary, votes, packing items, and users in JSON rather than a database. To make that choice safer under concurrent requests, every update follows a locked read-modify-write sequence using Portalocker. The server rewinds the file, writes the complete new document, flushes and fsyncs it, and truncates any stale bytes left by a previously longer version.

> That approach kept deployment and inspection simple while teaching the boundary between a convenient file format and a storage system. For a larger or internet-facing version, I would move the records to a database with stable identifiers and transactions, then keep the same API and interface concepts.


**Packing is part of the plan**

> A separate shared packing view covers the other half of group travel. Participants can add an item, quantity, and category; give useful suggestions a heart; and remove their own entries. Items are organized into Items, Snacks, and Other so equipment, food, and general preparation remain easy to scan.

> The heart state is recorded per user, just like itinerary voting, so reopening the application preserves who has reacted instead of storing only an anonymous total.

- Media `trip_planner_packing.webp`: The collaborative checklist records quantities, categories, creators, and per-user hearts.

**Accounts, roles, and ownership**

> Users authenticate with hashed passwords, and the current account becomes the owner of anything it creates. Administrators get a dedicated account screen for adding participants, resetting passwords, deleting accounts, and changing roles. Those roles are checked again on the server for protected actions rather than relying on whether a button is visible.

> The event editor uses the same compact approach as the rest of the application. Only a title is required; time, description, location, and link can be added when they help the group.

- Media `trip_planner_admin.webp`: Administrators can invite the group and manage access from inside the application.
- Media `trip_planner_event_editor.webp`: The event editor supports quick ideas as well as fully described reservations or activities.

**Running the original project again**

> I returned to the August 2025 code in September 2026 and ran it locally with a completely synthetic Finger Lakes trip. I verified login, the itinerary and packing APIs, the administrator page, and the rendered browser interface. I then added a new coffee run through the real dialog and upvoted it; the itinerary updated through the live event stream without a manual refresh.

> That run also made the next engineering steps concrete. Event routes currently address positions in an array, so stable record IDs would make edits resilient to sorting. A production revision should also add CSRF protection, environment-only secrets and debug settings, database migrations, automated tests, and shared pub/sub for multiple server workers. The current version remains a compact demonstration of how authentication, collaborative state, voting rules, file locking, and live browser updates fit together in one application.



### After

- Title: Trip Planner
- Tagline: A shared trip plan where friends add ideas, vote on conflicts and pack together
- Summary: I built Trip Planner in August 2025 so a group trip didn't have to live in a giant group chat. Everyone signs in, adds plans to a day-by-day itinerary, votes when two plans clash, and adds to a shared packing list. Changes show up for everyone right away.
- Hero caption: A weekend trip, one card per day.

**Planning outside the group chat**

> Anyone on the trip can add an event with a time, place, notes or a link, and everyone else sees it without refreshing. I kept the front end to plain HTML, CSS and JavaScript so it stayed small and simple.


**Voting on conflicts**

> If two plans land at the same time, they turn into options and everyone votes them up or down. You can only delete your own plans, unless you're an admin, or everyone else has voted it down.

- Media `trip_planner_voting.webp`: Two 11 AM plans, turned into a vote.

**Packing together**

> There's also a shared packing list, split into items, snacks and other stuff. You can heart the good ideas, and it remembers who hearted what.

- Media `trip_planner_packing.webp`: The shared packing list.

**Under the hood**

> Live updates use Server-Sent Events: when anything changes, the server tells every open browser to refresh that part of the page. Everything is saved in JSON files with a lock, so two people saving at the same time can't wipe each other out. A real database would be the next step if more than a few friends used it.

- Media `trip_planner_admin.webp`: Admins can add people and reset passwords.
- Media `trip_planner_event_editor.webp`: Adding an event. Only the title is required.


## U-Fund: A New Page (`u-fund`)

### Before

- Title: U-Fund: A New Page
- Tagline: A team-built platform for requesting, approving, and funding books for incarcerated people
- Summary: U-Fund: A New Page was my SWEN 261 team project. We built a full-stack system where incarcerated people could request books, prison administrators could approve or deny them, and outside helpers could fund approved requests. It was one of my first chances to work on a fairly complex application with several roles and workflows shared across a team.
- Status: RIT SWEN 261 team project
- Hero caption: An inmate could submit book requests and keep track of the books attached to their account.

**Working as a team**

> This was a very fun project to work on because the four of us had to collaborate on both sides of a large system. The team was Michael Lizzio, Liam Pennino, Nina Sagawa, and Selene Shen. We divided features between the Angular interface and Spring Boot API, then had to make sure all of our work fit together.

> It gave me real experience coordinating responsibilities, working with code written by other people, and building features that depended on another teammate's work. There was no AI involved in the project.


**Three different roles**

> The system had three roles with different permissions and tasks. Inmates created profiles, requested books, and received notifications when a request was approved, denied, or funded. Administrators reviewed the request pool, managed accounts and prisons, and moved approved books into the public cupboard. Helpers searched that cupboard, added books to a funding basket, and completed a simulated checkout.

> The main workflow connected all three roles. An inmate submitted a book request, an administrator reviewed it, and approval moved that book into the collection helpers could fund. Funding it then generated another notification for the inmate.


**The workflow in the final demo**

> The final demo walks through the application from each role's point of view. A user could create an account as an inmate, helper, or administrator. Inmates requested books, administrators reviewed each request with an approval or denial message, and helpers browsed the approved books and added them to a funding basket.

> Notifications connected the steps. The team added them as one of our feature enhancements so an inmate could see when an administrator approved a request and when a helper funded the book.

- Media `account-creation.webp`: The shared entry screen supported login and account creation for each of the application's roles.
- Media `admin-review.webp`: Administrators reviewed each inmate request and could include a message with the decision.
- Media `helper-cupboard.webp`: Approved requests became available to helpers in the book cupboard.
- Media `helper-basket.webp`: The funding basket collected books from different inmates before the simulated checkout.

**How we structured it**

> The backend followed a three-tier design with Spring controllers, DAO interfaces, file-backed DAO implementations, and model classes. Seven REST resources handled accounts, books, requests, funding baskets, notifications, prisons, and profiles. The Angular app had matching services and route guards for each user's role.

> The backend stored its data in JSON files and rewrote those files when records changed. The project also included JUnit tests and separate JaCoCo coverage reports for the controller, model, and persistence tiers.

- Media `architecture.webp`: The project's view, controller, model, persistence, and storage layers.

**One complete interaction**

> This sequence diagram follows a helper searching for a book and adding it to a funding basket. The request travels from the Angular client through the Spring controller and service layer, then into the basket and book data objects before the result returns to the browser.

- Media `helper-basket-sequence.webp`: Helper book search and funding-basket sequence.

**Testing and review**

> We used JUnit, manual browser testing, and curl requests while building the application. In the final presentation, the team reported at least 91 percent coverage in every backend tier and 100 percent branch coverage in the model tier.

> We also ran SonarQube and discussed the issues it found instead of treating the report as a score. The presentation called out static fields changed from instance methods, unnecessary verbosity where Java's diamond operator could be used, and avoidable string concatenation as examples we would clean up next.



### After

- Title: U-Fund: A New Page
- Tagline: A team project for requesting, approving and funding books for people in prison
- Summary: U-Fund: A New Page was my SWEN 261 team project. We built a full-stack app where incarcerated people could request books, prison staff could approve or deny them, and people outside could pay for the approved ones. It was one of my first times working on a big app with several kinds of users across a whole team.
- Status: RIT SWEN 261 team project
- Hero caption: An inmate could submit book requests and keep track of the books attached to their account.

**Working as a team**

> This was a really fun project because the four of us had to work on both sides of a big system together. I worked with Liam Pennino, Nina Sagawa and Selene Shen. We split features between the Angular front end and the Spring Boot back end, and then had to make sure everything fit together.

> It was real practice at dividing up work, reading other people's code, and building features that depended on a teammate's part. We didn't use any AI on it.


**Three kinds of users**

> Inmates request books. Admins review those requests and approve or deny them with a message. Helpers browse the approved books, add them to a basket and check out (the payment was simulated). Each step sends the inmate a notification, which was one of the features we added on top of the requirements.

- Media `account-creation.webp`: Logging in or making an account.
- Media `admin-review.webp`: An admin reviewing book requests.
- Media `helper-cupboard.webp`: Approved books, ready for helpers.
- Media `helper-basket.webp`: A helper's basket before checkout.

**How we built it**

> The back end is Java and Spring Boot, split into controllers, data access and models, and it saves everything to JSON files. The front end is Angular, with a page and a set of routes for each kind of user.

- Media `architecture.webp`: How the layers fit together.

**One request, start to finish**

> This diagram follows a helper searching for a book and adding it to their basket, from the Angular app, through the Spring controller and services, to the saved data and back.

- Media `helper-basket-sequence.webp`: A helper's search and add-to-basket request.

**Testing**

> We tested with JUnit, in the browser, and with curl. By the final presentation every part of the back end had at least 91% test coverage. We also ran SonarQube and went through what it found, and we listed the issues we'd clean up next.



## Warm Cold Square (`warm-cold-square`)

### Before

- Title: Warm Cold Square
- Tagline: A two-day Pygame challenge about finding a hidden square without hitting a bomb
- Summary: I made this with my cousin Justin in June 2022 as a small two-day, hackathon-style challenge. A green square is hidden somewhere on the screen, and the only guidance is a changing temperature clue based on how close the mouse is to it. The challenge is to reach the target quickly while threading through a field of red bombs that can end the round immediately.
- Status: Complete
- Hero caption: An easy round in progress. The hidden target is not drawn until the player reaches it or touches a bomb.

**A two-day challenge**

> My cousin Justin and I treated this as a quick build challenge: take a simple hot-and-cold search idea, turn it into a playable game, and finish it in two days. The result is deliberately spare—one menu, one screen of hazards, and a rule that can be understood as soon as the temperature word starts changing.

> The menu has Play, difficulty, and Quit controls. Clicking the middle button cycles through easy, medium, and hard, then Play generates a new target and a completely new field of bombs for that round.

- Media `warm_cold_menu.webp`: The fullscreen menu keeps the challenge immediate: play, select a difficulty, or quit.

**Turning distance into temperature**

> Each frame, the game calculates Manhattan distance: the horizontal difference between the cursor and target plus the vertical difference. That number is converted into six bands—Burning, Hot, Warm, Cold, Very Cold, and Fridge—and each label has its own color. It gives direction indirectly, so the player has to move, watch the clue change, and narrow down the target's location.

> The target remains invisible during the search. Reaching it reveals the square in green and displays a time and score based on the starting distance and how quickly it was found. Touching any red bomb also reveals the target, but ends the round as a loss.

- Media `warm_cold_won.webp`: Reaching the hidden square reveals it in green and produces the round's time and score.

**Difficulty through density**

> Difficulty changes two variables at once. Easy hides a 50-by-50-pixel target among 100 bombs; medium reduces it to 25 by 25 and places 450 bombs; hard leaves only a 10-by-10 target among 750 bombs. Every bomb is also 10 by 10 pixels, so hard mode makes the goal no larger than one hazard.

> Bombs are placed randomly with rejection checks intended to keep them away from the target, the cursor's starting position, and each other. That makes every round a different navigation problem instead of a fixed maze.

- Media `warm_cold_lost.webp`: A hard round ends after the cursor touches one of 750 hazards; the hidden target is revealed in green.

**Built for the screen it runs on**

> The desktop version opens at the display's native resolution and derives its margins, button sizes, font sizes, and spacing from the screen dimensions. The visuals are made entirely from Pygame rectangles and text rather than image assets.

> I later made a browser-oriented copy using an asynchronous menu loop and packaged it with Pygbag. The preserved web build identifies itself as Pygbag 0.6.6, while the version tested for this page is the original desktop project.



### After

- Title: Warm Cold Square
- Tagline: A two-day Pygame game: find the hidden square without hitting a bomb
- Summary: I made this with my cousin Justin in June 2022 as a quick two-day challenge. A green square is hidden somewhere on the screen, and the only hint is a word like Warm or Cold that changes as your mouse gets closer. You have to find it fast without touching any of the red bombs.
- Status: Complete
- Hero caption: An easy round. The target stays hidden until you find it or hit a bomb.

**A two-day challenge**

> Justin and I treated it like a mini hackathon: take a simple hot-and-cold idea, make it playable, and finish in two days. So it's pretty simple: one menu, one screen of bombs, and a rule you get as soon as the word starts changing.

> The middle button on the menu switches between easy, medium and hard, and every round makes a new target and a new field of bombs.

- Media `warm_cold_menu.webp`: The menu: play, pick a difficulty, or quit.

**Turning distance into temperature**

> Every frame, the game works out how far the mouse is from the target, counting across and up and down separately. That distance turns into one of six words, from Burning down to Fridge, each in its own color. Find the square and it shows up green with your time and score. Touch a bomb and you lose.

- Media `warm_cold_won.webp`: Found it. The target turns green and you get a time and score.

**Harder means more bombs**

> Easy hides a big target among 100 bombs. Hard shrinks the target to the same size as a single bomb and puts 750 of them on screen. The bombs are placed randomly but kept away from the target and from where your mouse starts, so every round is a different maze.

- Media `warm_cold_lost.webp`: A hard round, lost on one of 750 bombs.

**Built for any screen**

> Everything is drawn with plain Pygame rectangles and text, sized from the screen's resolution, so it fills whatever display it runs on. Later I made a version that runs in the browser too.



## WastedAsphalt (`wasted-asphalt`)

### Before

- Title: WastedAsphalt
- Tagline: Scores how much of a county's parking asphalt is sitting visibly empty, from satellite imagery
- Summary: A local web app that measures how much parking surface a New York county is carrying and how much of it is visibly in use. It loads county boundaries from a TIGER/Line shapefile, pulls every amenity=parking polygon from OpenStreetMap through Overpass, downloads a Mapbox satellite chip for each lot, and runs a classical image pipeline that samples the lot's own asphalt color and measures how much of the surface deviates from it. Monroe County resolves to 3,726 lots, 3,697 of them analyzed, at a 26% county average. Jobs are pausable and resumable, and results export as GeoPackage, GeoJSON, or CSV for ArcGIS.
- Hero caption: A completed Monroe County run with county totals and the processed parking lots visible together.

**(no heading)**

> I wanted to know how much of a city is paved over for parking that nobody is using. The pieces to answer that are all public: county boundaries ship in the Census TIGER/Line shapefiles, OpenStreetMap already has parking lots mapped as polygons, and satellite imagery is a tile request away. WastedAsphalt wires those three together and puts a number on every lot in a county.

> Running it against Monroe County produced 3,726 parking polygons. 3,697 of them were analyzable, 29 were skipped, and the county came out at a 26% average score. That run finished 3,698 of 3,698 tasks with zero failures in about eleven minutes.

- Media `county-picker.webp`: The app starts with every New York county and its current processing status.

**Every lot in the county, scored**

> Once a county finishes processing, each lot is drawn on the map colored by its score: green for lots reading as mostly empty, through yellow and orange to red. Downtown Rochester is where it gets interesting, because the pattern is legible at a glance rather than as a spreadsheet.

> The right-hand panel carries the county totals and the three export buttons. The exports were the actual point of the project: GeoPackage and GeoJSON both open directly in ArcGIS, so the output can be joined against other municipal layers instead of living only inside this app.

- Media `rochester_lots.webp`: Downtown Rochester after processing. Each polygon is one OpenStreetMap parking lot, colored by its score.
- Media `monroe-complete.webp`: The completed county-wide run and its processing totals.

**How a single lot is scored**

> For each lot the pipeline rasterizes the OpenStreetMap polygon into the image, samples the median color of the asphalt inside it, and then measures the area whose color deviates from that sample. The score is that anomaly area divided by the usable paved area. One lot in the run had 789 square meters of anomaly inside 3,843 square meters of pavement, which is where its 0.21 came from.

> The pair below is one lot's raw Mapbox chip next to the overlay the pipeline produced for it. Teal is the OpenStreetMap polygon boundary, the red wash is the paved area being considered, and the lighter patches are the pixels counted as anomalies.

> This lot is also a good illustration of where the method stops being a car counter. It scored 0.91, but the photograph shows a lot that is perhaps a third full. The dense white parking stripes deviate from the sampled asphalt just as strongly as a vehicle does, so they are counted too. The number is best read as visible non-asphalt occupancy inside the lot mask. Painted markings, shadows, islands, and pavement repairs all land in it. It is a classical color baseline, not a trained vehicle detector.

- Media `lot_10676_before_after.webp`: Left: the raw Mapbox chip. Right: the pipeline's overlay. This example shows how painted stripes can raise the score.
- Media `analysis-examples.webp`: Additional satellite images and the analysis overlays produced for them.

**Running a county without babysitting it**

> A county is thousands of separate image requests, so the job runner had to survive being interrupted. Work is queued in SQLite with per-task state, which makes a run pausable, resumable, and restartable after the process dies without losing the chips it already fetched. Mapbox responses are cached on disk for the same reason, so rerunning a county does not download the same imagery again.

> Completed county results export as GeoPackage, GeoJSON, or CSV. GeoPackage is the best option for ArcGIS Pro, while CSV includes WKT geometry for spreadsheet review or GIS import. The nine tests in the repository cover the geometry and analysis helpers rather than the network paths.

- Media `monroe-exports.webp`: Completed results can be exported for ArcGIS and other GIS workflows.


### After

- Title: WastedAsphalt
- Tagline: Scores how empty every parking lot in a county is, using satellite images
- Summary: I wanted to know how much of a city is paved over for parking that nobody is using. WastedAsphalt takes every parking lot in a New York county from OpenStreetMap, grabs a satellite image of each one, and scores how much of it looks empty. Monroe County came out to 3,726 lots with a 26% average score.
- Hero caption: A finished Monroe County run.

**The idea**

> Everything you need to answer that question is public. The Census has county boundaries, OpenStreetMap already has parking lots drawn as shapes, and satellite images are one request away. WastedAsphalt connects those three and puts a number on every lot. For Monroe County it analyzed 3,697 lots (29 were skipped) in about eleven minutes.

- Media `county-picker.webp`: Picking a county.

**Every lot, colored**

> When a county finishes, every lot shows up on the map colored by its score, from green to red. Downtown Rochester is where it gets interesting. The results export straight into ArcGIS, so they can be compared with other city data.

- Media `rochester_lots.webp`: Downtown Rochester, one colored shape per lot.
- Media `monroe-complete.webp`: The whole county, finished.

**How a lot gets scored**

> For each lot, the program finds the usual color of its asphalt and then measures how much of the lot is a different color. That's the score. The catch is that it isn't really counting cars. Painted lines, shadows and patches count too, so the lot below scored 0.91 even though it's maybe a third full. It's a simple color trick, not a trained car detector.

- Media `lot_10676_before_after.webp`: The satellite image, and what the program counted. The painted stripes push the score up.
- Media `analysis-examples.webp`: A few more lots and their overlays.

**Running a whole county**

> A county is thousands of image downloads, so the job can be paused and resumed, and it picks up where it left off even if the program crashes. Images are saved too, so running a county again doesn't download them twice.

- Media `monroe-exports.webp`: Exporting results for ArcGIS.


## Web Browser MCP (`web-browser-mcp`)

### Before

- Title: Web Browser MCP
- Tagline: A visual Chrome control layer that gives AI agents reliable hands on the web
- Summary: I built a local browser-control system that lets Claude Code and other MCP clients operate a real Chrome session instead of relying on raw HTTP requests. It combines persistent browser identities, human-like interaction, visual element snapshots, screenshots, page extraction, live observability, and a FastMCP adapter over one shared session API. I originally developed it as reusable infrastructure inside larger automation projects, then separated it into its own standalone repository so the browser engine, REST API, and agent tools could be used independently.
- Status: Local automation toolkit
- Hero caption: A local browser-control layer shared by Claude Code, MCP clients, and automation scripts.

**Why I built it**

> Several of my automation projects needed to work with real, JavaScript-heavy websites while keeping an authorized signed-in session. A normal scraper could download HTML, but it could not always see what a person saw, interact with controls that appeared after the page loaded, or let an AI reason from a screenshot. I kept rebuilding pieces of that browser layer, so I turned them into one reusable system.

> The goal was to give an agent reliable hands without hiding what it was doing. The browser runs locally, every session has an ID, and the same session can be controlled through Python, a REST API, a command line, Anthropic's computer-use action format, or native MCP tools in Claude Code.


**Two layers, one browser session**

> The lower layer is a FastAPI browser-session service. It owns Chrome profiles, launches undetected-chromedriver, keeps track of sessions and tabs, performs browser actions, captures pages, and exposes live activity. The upper layer is a thin FastMCP server that turns the most useful operations into tools such as browser_navigate, browser_snapshot, browser_click, browser_type, browser_read, and browser_screenshot.

> Keeping the MCP adapter separate from the browser process solved an important practical problem: Chrome locks a profile to one process. Scripts and Claude can now share the same HTTP-managed session instead of starting competing browser instances or losing an authenticated profile between tools. The MCP server checks the service health, starts it when necessary, and reuses an existing session on the configured profile.

- Media `architecture.webp`: The MCP adapter translates agent tools into calls against the session service that owns Chrome.

**Giving an AI both vision and structure**

> The most agent-focused feature is the set-of-marks snapshot. The server discovers interactive elements, assigns each one a short reference, records its role, accessible name, position, and visibility, and can draw numbered red boxes over a screenshot. Claude receives both the structured list and the image, so it can reason visually and then click a specific reference instead of guessing a brittle CSS selector or screen coordinate.

> The normal control loop is open, navigate, snapshot, act, and verify. Navigation can wait until the document is loaded and the DOM has stopped changing, which helps with single-page applications that report themselves ready before their useful interface appears. After an action, the agent can read clean visible text, take another screenshot, wait for text or a selector, or inspect the updated snapshot.

- Media `agent-loop.webp`: A screenshot supplies visual context while element references keep actions precise and repeatable.

**A complete browser-control surface**

> The system supports clicks by element reference, selector, or screenshot coordinate; human-paced typing; key chords; scrolling; mouse movement and drag actions; file uploads; select menus; JavaScript execution; visible-text extraction; raw HTML; PNG screenshots; and opening, switching, and closing tabs. The lower-level computer endpoint accepts the same general action vocabulary as Anthropic's computer-use tool and returns a fresh screenshot after each visual action.

> Sessions are addressable by generated IDs and can run with different profiles, viewport sizes, headless settings, and human-behavior options. That makes the server usable as a one-browser MCP tool or as shared infrastructure for several automation jobs.


**Persistent identities and cautious stealth**

> Each browser identity is a persistent Chrome profile stored in an isolated managed directory. Cookies and authorized logins survive between runs, while friendly labels, notes, creation time, and last-used time are kept in a small JSON registry. The launcher detects the installed Chrome version, selects the matching driver, clears a stale profile lock only when its owning process is dead, and avoids interfering with my normal daily browser by default.

> The stealth layer uses undetected-chromedriver, removes common automation signals, keeps language settings consistent, and applies human-like mouse paths, typing delays, reading pauses, and scrolling. It deliberately does not fabricate a different hardware fingerprint because mismatched GPU, font, screen, locale, and network signals can be more suspicious than the real machine. Headless mode is available but treated as the more detectable option.


**Watching and debugging an agent live**

> Every browser action is recorded with its sequence, time, duration, success state, and a short safe description. Typed values are represented only by their length so a password or private message does not leak into the activity feed. A Server-Sent Events stream publishes those records live for one session or across all sessions.

> The server also exposes an MJPEG page stream and a ready-made viewer that places the live browser beside the action feed. This made it much easier to understand why an automation was stuck, supervise a long task, and build a control interface without screen-sharing the entire desktop.


**Where it is useful**

> I designed the toolkit for authorized workflows where a plain request library is not enough: extracting information from rendered applications, testing an interface from a user's point of view, operating an internal dashboard, uploading content, collecting screenshots, or letting an agent complete a repeatable multi-step browser task. Persistent profiles are especially useful when a workflow requires a legitimate account and would otherwise stop at every login.

> It can also act as a debugging bridge between scripted automation and visual computer use. A workflow can use reliable selectors and element references for routine steps, fall back to screenshot coordinates when the page offers no useful structure, and leave a visible event trail for a person to review.


**Boundaries and next steps**

> This is a local toolkit, not a hosted browser service, and it should only be used on websites and accounts where automation or testing is authorized. The current code does not provide proxy routing. It has a timezone override that can be aligned with a proxy supplied somewhere else, but describing that as built-in proxy support would be inaccurate.

> The next portfolio step is a short side-by-side demonstration using a clean browser profile and a safe test page. The recording will show Claude asking for a snapshot, receiving the numbered controls and screenshot, choosing an element reference, completing a small form or navigation task, and verifying the result while the live viewer displays the browser stream and action log. No personal accounts, tokens, notifications, or private page data will appear in the recording.



### After

- Title: Web Browser MCP
- Tagline: A tool that lets AI agents like Claude use a real Chrome browser
- Summary: I built a tool that lets Claude Code and other AI agents control a real Chrome browser on my computer, instead of just downloading raw web pages. It keeps logins between runs, shows the AI numbered boxes over everything it can click, and lets me watch what it's doing live.
- Status: Local tool

**Why I built it**

> A lot of my automation projects kept needing the same thing: a browser that could handle modern, JavaScript-heavy websites and stay signed in. I kept rebuilding that piece, so I pulled it out into its own project that anything can use.


**How the AI sees a page**

> The most useful part is the snapshot. It finds everything on the page you can click or type into, gives each one a number, and draws numbered boxes on a screenshot. The AI gets both the picture and the list, so it can say "click 12" instead of guessing where to click. Then it looks at the page again to make sure it worked.

- Media `agent-loop.webp`: Snapshot, decide, act, check.

**How it's put together**

> There are two layers. The bottom one is a small server that runs Chrome and keeps track of profiles and tabs. The top one is an MCP server, which is the standard way to give Claude new tools, with tools like navigate, snapshot, click and type.

> Chrome only lets one program use a profile at a time, so splitting it this way lets my scripts and Claude share the same signed-in browser instead of fighting over it.

- Media `architecture.webp`: Claude talks to the MCP layer, which talks to the server that runs Chrome.

**Watching it work**

> Every action gets logged with how long it took and whether it worked. Anything typed only shows up as its length, so passwords never end up in the log. There's also a live viewer that shows the browser next to the action log, which made it way easier to see why an agent was stuck.


**What's next**

> It runs on my own computer, and I only use it on sites and accounts where that's allowed. Next I want to record a short demo of Claude filling out a test form while the live viewer shows every step.



## Projects with no visible copy change

`blackjack`, `one-line-rock-paper-scissors`, `wordle-solver`


(Their internal `notes` may have had em dashes replaced.)
