# The Post-Build Squad — How It Actually Works

**The big picture:** You built an app with the scaffold (that's the house frame). Now the client has talked to you — sent transcripts, feedback, brand assets. The post-build takes that real intel and rewires the generic app into THEIR app.

The pipeline has 9 phases. It can run multiple times on the same project — each round builds on previous work. Drop new intel files, run it again, and it refines further. We call this the Relay Ring.

---

## Before Anything Runs: Pre-Flight

Think of this as the pilot doing the checklist before takeoff.

1. **Round detection** — Checks if you've run this before (reads `.post-build-state.json`). If yes, it knows this is Round 2, 3, etc. If no, it's Round 1.
2. **File numbering** — Scans `docs/roadmap/` to figure out what number to give the new files. If your last file was `09_something.md`, the next outputs start at 10.
3. **Branch creation** — Creates a git branch (`agent/post-build` for Round 1, `agent/post-build-r2` for Round 2, etc.) so nothing touches your main code until you approve.
4. **Safety check** — Makes sure it won't overwrite any files from a previous round.
5. **Memory load** — Reads `memory/learnings.md` — the battle log from every previous build. Known traps, proven patterns, things that broke before. The pipeline gets smarter every time it runs.
6. **Shows you the plan** — Prints a summary: "Here's what I'm about to do, here's what files I'll create." You confirm, then it starts.

**You speak here:** "Go" or "focus on the dashboard" or "skip migrations."

---

## Phase 0: The Scout — Competitive Research

**What it does:** Goes online and researches the client's competitors. Finds conversion patterns, UX trends, design intelligence, and differentiation opportunities in the client's niche.

**How it works:**

- Reads the intel files to understand the client's niche, app type, and target audience
- Checks if previous competitive briefs exist (Round 2+ doesn't re-research the same competitors)
- Runs 3-5 targeted web searches: best apps in the niche, competitor features/pricing, landing page examples, UX patterns
- Extracts specific patterns: layout, copy structure, social proof placement, CTA design, pricing presentation, onboarding flows
- Identifies differentiation opportunities — where the competition is WEAK

**Output:** One file — `competitive-brief-round-N.md`. Includes competitor analysis table, conversion patterns, UX patterns worth adopting, design intelligence, and specific recommendations for the Architect.

**Why it matters:** Without this, you're building in a vacuum. The Scout tells the Architect "every coaching app in this niche has a diagnostic quiz" or "competitors are using dark themes with gradient CTAs" — and that shapes the plan.

**Handoff note:** Leaves a 5-line reasoning note in `.handoff-notes-r{N}.md` explaining key decisions and what the Surgeon should watch for.

**Time:** ~2-3 minutes.

---

## Phase 1: The Surgeon — Reads Everything

**What it does:** Reads every file in `docs/intel/` (your transcripts, notes, brand docs). Reads every existing roadmap file. Reads the codebase structure. Reads the Scout's competitive brief.

**How it works:**

- **Intel targeting** — Figures out which files are NEW (untracked in git, recently modified, or user-specified). New files get the deep extraction. Old files are background context only.
- **Intel quality gate** — Checks if the intel is thin (< 200 words, no quotes, no specifics). If it's thin, warns you: "The pipeline will produce thin results from thin input." You can continue or pause to add more.
- **First pass** — Goes through each intel file and pulls out: what the client wants, what's broken for them, their brand preferences, technical needs, red flags, exact quotes, implicit assumptions
- **Second pass (mandatory)** — Re-reads everything again. This catches 15-20% of stuff the first pass missed. Throwaway comments, implicit assumptions, contradictions between different files
- **Gap analysis** — Compares what the client said vs what the current build assumes. Flags where they disagree
- **501 stub scan** — Greps the codebase for placeholder API routes that were never actually built
- **Copy bank update** — Creates or updates `docs/intel/copy-bank.md` — a cumulative file of ALL the client's exact language, brand terms, approved headlines, and tone notes. This file only grows across rounds, never shrinks. The Tailor reads this ONE file instead of hunting through multiple extraction summaries.

**Output:** Two files — `extraction-summary-round-N.md` (the single source of truth for everything that follows) and `copy-bank.md` (cumulative client voice reference).

**Handoff note:** Explains what was surprising, what contradictions were found, what the Architect should pay special attention to.

**Time:** ~2-3 minutes. No code is touched. Just reading and writing docs.

---

## Phase 2: The Architect — Makes the Plan

**What it does:** Takes the Surgeon's extraction and the Scout's competitive brief, and builds the battle plan.

**How it works:**

- Reads the extraction summary, competitive brief, existing roadmap, and codebase structure
- Creates a **master plan** — every feature, prioritized (Must Have / Nice to Have / Stretch), with specific instructions for the Mechanic and Tailor
- Classifies features as **"Working" vs "Decorative/Mock"** — honest about what actually functions vs what just looks pretty. "Beautiful UI, zero working backend" is a valid assessment
- Flags every CTA button that needs a real URL (Calendly, Stripe, Skool, etc.)
- Tags features from the Scout's research as `[SCOUT]` — competitive patterns worth implementing
- Tags features from previous Provocateur recommendations as `[PROVOCATEUR-R{N-1}]` — elite ideas carried forward from last round
- Creates/updates the **ELI5 doc** — plain English summary of the entire app, written so the client can understand it. No "API routes" or "RLS policies." This becomes the script for your client walkthrough video. Round 2+ UPDATES the existing ELI5 (living document), doesn't recreate it
- Creates the **build journey** — timeline of what was built and when
- **Smart skip logic (Round 2+ only)** — Not every round needs every agent. If the client's feedback is "change the headline on pricing," the Architect says "skip Mechanic and Plumber, this is a Tailor-only change." Writes a phase routing recommendation in the plan. You can override with "run all phases"

**Output:** 3 files — master plan, ELI5, build journey. Still no code touched.

**Handoff note:** Explains WHY features were prioritized the way they were, what tradeoffs were made, and which phases are recommended to skip.

**Time:** ~3-5 minutes.

### Plan Mode Gate (you speak here)

After Phase 2, the pipeline pauses automatically. The Surgeon extracted intel, the Architect made the plan. Now you review before any code gets written.

You see the master plan summary — key features, priorities, what's changing. You approve, ask questions, or adjust priorities. Then it proceeds to code.

**This is the second time you speak.** First was confirming pre-flight. Now you're approving the plan.

---

## Phase 3: The Mechanic — Builds the Engine

**What it does:** Writes the backend code. Types, API routes, AI modules, constants, demo data.

**How it works:**

1. **Reads the plan** — Plus the handoff notes from Scout, Surgeon, and Architect. Pays attention to "Watch out" warnings
2. **Dependency audit (before installing ANYTHING)** — Checks `package.json` for what's already installed. If `date-fns` exists, doesn't install `moment`. If a function only needs `debounce`, writes it inline (5 lines) instead of adding a whole library. Prevents bloat across rounds
3. **Types first** — Creates TypeScript interfaces for every data model. This is the contract that everyone else imports
4. **Constants** — Creates the app's configuration: scoring systems, prompt packs, level definitions. Can be 400+ lines. That's fine — single source of truth
5. **Demo data provider** — Creates `demo-data-provider.ts` as the single source of all mock data. Realistic, typed arrays matching the TypeScript interfaces. This file can be 1000-2000 lines — it IS the data contract. The Tailor imports from here, never writes inline mock arrays. For BrandOps, this was 1,974 lines covering clients, projects, products, orders, line items, commissions, programs, and analytics
6. **API helpers** — For CRUD-heavy apps (5+ entities), creates shared `api-helpers.ts` with auth, org lookup, demo fallback, and response utilities. Every route follows the same pattern
7. **AI modules (if the app uses AI)** — System prompts in dedicated files, conversation managers, pattern detectors. Every system prompt gets the 12-point anti-AI ruleset baked in (no em dashes, no "delve", no "Great question!", etc.)
8. **API routes** — Creates the actual endpoints. Every route gets dual auth (cookie + header), error categorization, prompt caching. **For 5+ routes:** dispatch parallel agents to build independent routes simultaneously (BrandOps built 13 route files via 4 parallel agents)
9. **Self-annealing** — Runs `npm run build`. If errors, fixes them. Runs again. Up to 3 cycles. Fixes its own mess before handing off
10. **Mechanic Manifest (mandatory handoff)** — Writes a structured contract listing EXACT export names, import paths, API routes, and wiring status. The Tailor reads this FIRST before touching any code. This single addition killed 70% of the import mismatch errors that used to plague builds

**Output:** Code files in `web/lib/` and `web/app/api/`. Backend is done. Manifest written.

**Handoff note:** What was wired, what wasn't, what tradeoffs were made, what the Tailor should watch for.

**Time:** ~5-10 minutes depending on scope.

---

## Phase 4: The Tailor — Builds the UI

**What it does:** Rewrites pages to match the client's actual vision. Design, layout, components, animations.

**How it works:**

1. **Reads the plan + the Mechanic's Manifest** — Imports EXACTLY from the paths listed in the manifest. No guessing filenames or export names. The manifest is the contract
2. **Reads the handoff notes** — Knows what tradeoffs the Mechanic made and what the Architect was thinking
3. **Reads the Scout's competitive brief** — Specifically the Design Intelligence and UX Patterns sections. What do the best apps in this niche look like?
4. **Content pass (before writing any code)** — Reads the Copy Bank (`copy-bank.md`) — all client language in one place. For every H1, H2, CTA, and body paragraph, asks: "Is this the CLIENT's voice or generic SaaS copy?" Plans replacements before touching code. "Welcome to your dashboard" becomes "Your Pipeline Command Center." "Get Started" becomes "Start My Free Diagnostic"
5. **Page rewrites** — Takes generic scaffold pages and rewrites them with the client's brand, content, and flow. Full rewrites are normal — the scaffold was a starting point, not sacred. **For 5+ pages:** dispatch parallel agents for simpler pages while building the most complex page directly (BrandOps built 6 pages via parallel agents while operator built the quoting engine)
6. **Component creation** — Feature-specific components, marketing pages, shared UI pieces
7. **Design enforcement** — Colors from Tailwind config, consistent typography, responsive breakpoints, animations that serve the story. Use static `Record<string, {...}>` maps for status/category/role styling — never dynamic Tailwind class interpolation
8. **Quality rules** — Double-quoted `"use client"`, no dynamic Tailwind classes, `type="search"` on non-login inputs (blocks LastPass), pre-allocated height for typewriter effects, error recovery UI on every API call, no dead `href="#"` links. **Library-specific type safety:** no explicit types on Recharts callback params, `as const` on motion/react variant objects
9. **Self-annealing** — Same as Mechanic. Runs `npm run build`, fixes errors, repeat up to 3 times. After parallel agent dispatch, always run a CONSOLIDATED build and budget 2-3 type fix cycles
10. **Tailor exit report** — Structured handoff for the Plumber and Inspector: pages created, components created, client copy used, database tables referenced, build status, known issues

**Output:** Rewritten pages in `web/app/`, new components in `web/components/`.

**Handoff note:** What pages were hardest, what copy decisions were made, what the Plumber needs to know about expected database tables.

**Time:** ~5-15 minutes (this is usually the longest phase).

---

## Phase 5: The Plumber — Database Setup

**What it does:** Creates Supabase migrations — tables, columns, RLS policies, indexes.

**How it works:**

1. **Reads all existing migrations** to understand what's already built
2. **Reads the plan + the Mechanic's types + the Tailor's exit report** — knows which tables the frontend is expecting
3. **Gap analysis** — What tables/columns does the code expect that don't exist yet?
4. **Writes migrations** — New SQL files, numbered sequentially. Every table gets comments explaining WHY it exists. RLS policies follow existing patterns exactly
5. **Type sync** — If new tables need new TypeScript types, adds them
6. **Migration notes** — Plain English doc explaining what was created and how to run it
7. **SQL validation (mandatory)** — Before moving on, validates every migration: table names are valid Postgres identifiers, column types are correct, foreign keys point to real tables, RLS policies reference correct tables, `ON CONFLICT` clauses have matching UNIQUE constraints, column names match the TypeScript interfaces. Catches errors before you discover them in the Supabase Dashboard at 2am
8. **Plumber exit report** — Structured handoff: migrations created, tables with purposes and RLS policies, type sync status, SQL validation results

**Output:** SQL migration files + migration notes doc.

**Important:** Migrations don't auto-run. You push them to Supabase manually (or say "push migrations" and the pipeline will try `npx supabase db push`).

**Handoff note:** What tables were created, what RLS decisions were made, anything the Inspector should verify.

**Time:** ~3-5 minutes.

---

## Phase 6: The Inspector — Finds & Fixes Everything

**What it does:** The quality gate. Runs the build, finds every error from all previous phases, fixes them. Then captures screenshots, checks for runtime errors, measures performance, and guards against regressions.

**How it works:**

1. **Build check** — Runs `npm run build`. Reads FULL error output
2. **Fix all errors** — Import mismatches (Mechanic named it X, Tailor imported Y), missing `"use client"`, type errors, syntax issues
3. **Cross-phase consistency** — Even if build passes, checks: types match migrations? Dual auth on all routes? ELI5 has no jargon? Demo data imported properly?
4. **Grep sweep (5 mandatory checks):**
   - `href="#"` — dead CTA links (revenue killers)
   - `501` in route files — stub routes never built
   - `localStorage` — verify DB persistence exists alongside
   - `'use client'` (single quotes) — wrong quote style
   - `console.log` — debug artifacts in production
5. **Annealing gauntlet** — Build-fix-build-fix up to 5 attempts until ZERO errors. If 5 attempts fail, something is architecturally wrong. Writes a detailed report of what's still broken and WHY
6. **Screenshot capture** — Starts a dev server, captures full-page screenshots of every page using Playwright. These go into `docs/screenshots-r{N}/` so you can compare across rounds. The Provocateur reads these images for visual review
7. **Runtime error check** — Reads the screenshot manifest for console errors. Build passing doesn't mean the app works — `window is not defined`, hydration mismatches, missing env vars, and API 500s only show up at runtime. Fixes root causes and re-captures screenshots
8. **Performance check** — Reads the Next.js build output for bundle sizes. Flags any page over 200KB First Load JS. Not a blocker — just visibility. Prevents shipping a 4MB page without anyone noticing
9. **Regression guard (Round 2+ only)** — The biggest risk on round 2 isn't new bugs — it's BREAKING things that were perfect in round 1. Compares current screenshots against previous round's screenshots side by side. If the landing page hero that looked elite is now missing, or testimonials disappeared, or a CTA got buried — flags it immediately. High-impact regressions get fixed before continuing
10. **Post-build report** — Documents everything: what was built, what broke, what was fixed, runtime errors, performance notes, regressions found, what needs human review

**Output:** Clean build + screenshots + post-build report.

**Handoff note:** What was broken and how it was fixed, what runtime issues persist, what the Provocateur should focus on.

**Time:** ~5-10 minutes.

---

## Phase 6.5: The Provocateur — UX Teardown & Elite Ideas

**What it does:** Everything the squad built works. It passes the build. It matches the plan. But does it make someone FEEL something? Does it convert? Does it compete with the best in the world? That's the Provocateur's job.

**This is the "free will" phase.** Every other agent executes what was asked for. The Provocateur thinks about what SHOULD have been asked for.

**How it works:**

1. **User journey walkthrough** — Walks every page in the order a real user would: landing → public pages → auth → onboarding → core features → conversion endpoints. Reads BOTH the code AND the actual screenshots (Claude can see images). For each page asks: first impression? Emotional response? Friction points? Missing psychology? CTA clarity? Mobile experience?
2. **Competitive comparison** — Reads the Scout's brief. For each competitor pattern: does the current build match or exceed it? Where does it fall short?
3. **The elite checklist** — Runs through a comprehensive checklist. Every "NO" is a recommendation:
   - **Conversion psychology** — Social proof before CTA? Price anchoring? Risk reversal? Urgency signals? Authority signals? Objection handling?
   - **UX quality** — Instant page load? Helpful empty states? Human error messages? Celebration on success? 2-click navigation? Quick time-to-value?
   - **Design polish** — Consistent spacing? Clear typography hierarchy? Brand-aligned colors? Purposeful animations? Premium dark/light theme? Mobile-first targets?
   - **Content quality** — Specific headlines (not generic)? Scannable copy? Action-oriented CTAs? No placeholder text? Client's voice comes through?
   - **Invisible accessibility** — Color contrast 4.5:1 (15% of visitors can't read low-contrast text)? Keyboard navigation works (Tab, Enter, Escape)? Images have alt text (Google reads this for SEO)? Form inputs have labels (not just placeholders)? Focus indicators visible? Error states use text, not just color (8% of men are colorblind)?
4. **Elite recommendations** — Generates a ranked list:
   - **Tier 1: Quick wins** — Can be done THIS round in a micro-iteration (copy, design tweaks, CTAs, social proof)
   - **Tier 2: High-impact features** — Next round's priority (new pages, backend features)
   - **Tier 3: Moonshots** — Would make this top 0.1% (ambitious differentiators)

**Output:** One file — `elite_recommendations_r{N}.md` with the full teardown results, checklist scores, and tiered recommendations.

**Time:** ~3-5 minutes.

---

## Phase 7: The Overseer Loop — Final Sweep

**What it does:** Steps back from individual phases and checks the WHOLE thing.

**How it works:**

1. **Plan vs reality** — Every requirement from the extraction: is it in the plan? Is it in the code? Or did it get dropped?
2. **ELI5 accuracy** — Does the plain English doc match what's actually built? Rewrites sections if they drifted
3. **Cross-file integrity** — Dead types, missing dual auth, migration numbering gaps
4. **Provocateur alignment** — Are the Tier 1 quick wins actually quick? Do Tier 2/3 align with the client's vision? Flags conflicts
5. **Memory update** — Writes new learnings to `memory/learnings.md`. Every issue found becomes a trap that future builds avoid. Entries tagged `Cross-Project: YES` propagate back to the global scaffold — so ALL future client projects inherit the lesson
6. **Final build** — One last `npm run build` to make sure the sweep didn't break anything

**Output:** Updated report, updated learnings, clean build.

---

## After Everything: Wrap-Up

1. **Updates `.post-build-state.json`** — The pipeline's memory file. Tracks every round: timestamp, branch, files created, focus area
2. **Writes a session log** — What was done this round, notes for next round
3. **Commits everything** to the git branch
4. **Asks you: "Want me to push? This triggers Vercel preview."**

**You speak here:** "Push it" or "let me review first."

### Auto-Iteration Check (The Drive)

Before asking about push, the pipeline checks the Provocateur's Tier 1 quick wins. If there are 3+ quick wins that don't need new intel, don't need database changes, and can be done with just Tailor + Inspector (copy changes, design tweaks, CTA improvements, social proof) — it proposes a micro-round:

> "The Provocateur identified 5 quick wins I can implement right now: [list]. These are copy, design, and UX improvements — no backend or database changes. Run micro-round? Skip? Cherry-pick?"

If you approve, it runs a quick Tailor + Inspector loop, commits the improvements to the same branch, and THEN asks about push.

This is what makes the pipeline autonomous. You drop intel. It builds. It thinks. It implements what it can. You come back to a better app than you planned.

---

## The Relay Ring — Running It Again

When the client sends new feedback:

1. Merge the current branch to main
2. Drop new intel files in `docs/intel/`
3. Run `/post-build` again
4. The pipeline auto-detects Round 2 (or 3, 4, 5...)
5. The Architect reads the previous Provocateur's recommendations — Tier 2+3 carry forward automatically
6. The Copy Bank grows with new client language
7. The Regression Guard compares against last round's screenshots
8. Smart Skip Logic routes only to the agents that need to run

Each round builds on the last. The ELI5 doc grows. The battle log grows. The Copy Bank grows. The pipeline gets smarter.

---

## The Whole Flow in One Line

```
You drop intel → Confirm → Scout researches → Surgeon reads → Architect plans →
[You approve the plan] → Mechanic builds backend → Tailor builds frontend →
Plumber writes DB → Inspector fixes everything → Provocateur thinks →
Overseer verifies → [Auto-iteration if quick wins] → Commit → You decide to push
```

**You speak exactly three times:** Confirm at start. Approve the plan. Push decision at end. Everything in between is autonomous.

---

## What Makes This Different

- **9 specialized agents**, each with a clear lane. The Mechanic never touches UI. The Tailor never touches the database. No agent steps on another's work.
- **The Mechanic Manifest** — structured handoff contract that killed 70% of import mismatch errors.
- **The Demo Data Provider** — 1000-2000 line file of realistic, typed mock data that IS the contract. The Tailor imports from it, types are enforced at build time, and the client sees real data patterns in the demo. Proved in BrandOps (1,974 lines, zero data mismatch errors).
- **Parallel Agent Dispatch** — Mechanic dispatches parallel agents for independent API routes (4 agents built 13 routes simultaneously in BrandOps). Tailor dispatches parallel agents for independent pages (analytics, settings, portal built in parallel while operator built the quoting engine). 40-60% build time savings. Inspector absorbs the 2-3 type fixes post-merge.
- **The Copy Bank** — cumulative client voice file. Round 3 doesn't lose Round 1's quotes.
- **The Provocateur** — the "free will" phase that thinks beyond the plan. Generates ideas the client never asked for.
- **The Regression Guard** — Round 2 doesn't break Round 1's perfect landing page.
- **Smart Skip Logic** — "Change the headline" doesn't trigger the full Mechanic + Plumber pipeline.
- **Hot Handoff Notes** — agents share REASONING, not just files. "I chose X because the client said Y."
- **Cross-project learning** — every build makes the pipeline smarter for ALL future builds. By project 10, it already knows the common traps.
- **Auto-iteration** — the pipeline doesn't just build what you asked for. It finds what you SHOULD have asked for and offers to build that too.
