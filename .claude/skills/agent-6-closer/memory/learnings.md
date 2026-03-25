# Agent 6 (Closer) — Accumulated Learnings

> **Read this file BEFORE starting work.** These lessons are extracted from past builds to prevent recurring mistakes.

## Quality Review
- Start by reading the spec (`docs/roadmap/01_project_spec.md`) to know what SHOULD exist
- Check every page listed in Page Architecture actually has a file in `web/app/dashboard/`
- Verify sidebar navigation links match actual page routes — mismatches = broken nav
- Run `npm run build` BEFORE claiming QC is complete — evidence before assertions

## Implementation Plan (Highest Value Deliverable)

### Revenue Engine Framing (CRITICAL — This Is How We Make Real Money)
We are NOT building apps for subscription revenue. We are building **conversion engines** — systems that fix the client's operational bottleneck (broken sales process, manual ops, lead leakage, slow proposals) and we take a percentage of revenue that flows through. The implementation plan must frame EVERY build through this lens:
- **Phase 1 (Quick Wins):** Fix the most visible conversion leak — the thing costing them money RIGHT NOW
- **Phase 2 (Full Engine):** Build the complete conversion/ops infrastructure — lead capture → qualification → conversion → tracking
- **Phase 3 (Revenue Share Territory):** The features that make this a rev-share play — performance dashboards, attribution tracking, ROI reporting. When the client sees "$47K recovered this month" on their dashboard, they'll happily pay 10-20% of that.
- The Vision section must quantify the **revenue impact** of each phase — not "add a CRM" but "recover the $12K/month you're losing from unqualified leads reaching your sales team"

### Standard Implementation Plan Rules
- The Vision section (million-dollar moves) must come FIRST — sell the client before diving into databases
- Write like a strategist, not a developer — use the client's language and industry terms
- "Quick Wins That Compound" section should list 3-5 improvements doable in one coding session
- Each Phase 2 feature needs a "Bug Projection" — realistic scenarios where things could break

## Common QC Findings
- Missing `"use client"` — Agent 5 should have caught this, but double-check
- Heading hierarchy: landing pages should have exactly ONE `<h1>`, then `<h2>` for sections
- All form inputs need associated `<label>` elements — not just placeholder text
- Touch targets: interactive elements must be at least 44x44px
- Images: every `<img>` needs a meaningful `alt` text, not `alt="image"`

### Table Column Alignment Audit (NEW — From HC + Angela builds, 2026-02-21)
**Grep all dashboard pages for `ClickReveal` wrapping `<tr>` elements.** This causes invalid HTML (`<tbody>` → `<div>` → `<tr>`) and visually breaks table column alignment — header widths don't match body widths.

**Fix:** Replace ClickReveal on tables with:
1. Direct `onClick` handler on `<tr>` that sets selected state
2. Standalone `DetailPanel` component rendered outside the `<table>`
3. Or use `DataTable` from `@/components/shared` which handles this correctly

**Also check:** Tables should use `table-fixed` class + `<colgroup>` with explicit `<col>` widths. Without these, columns auto-size inconsistently.

### Landing Page Visual Quality Audit (NEW — From HC build, 2026-02-21)
**Check the Solution/How It Works section.** If it uses bland icon-in-circle placeholders (just numbers or generic icons with text), flag it. The scaffold ships `FeatureVisual` from `@/components/shared` with 6 rich SVG illustration variants (dashboard, chart, form, report, speed, funnel) that should be used instead.

## Build Summary
- List ALL pages created (with line counts) — gives client a sense of scope
- List ALL components created — organized by directory
- Note any known issues or TODOs left in the codebase
- Rate each agent 1-5 on output quality — this feeds into cross-build learning

## Verification Protocol
- Evidence before claims: "Build passes" requires showing `npm run build` output with zero errors
- "Tests pass" requires showing test command output
- Never claim something works without running the verification command in this session
- If something fails, state what failed and what needs fixing — don't claim partial success

### From Build: Rocksolideleadgeneration OÜ (2026-02-12)
When earlier agents fail, request the full project spec, not just error logs. You may need to create files from scratch, not just fix them.

## Creative Brief Compliance Check (MANDATORY)
- **Read `docs/CREATIVE_BRIEF.md`** — Agent 2.5 always creates this. Verify builder agents followed it.
- Check that the **Signature Element** was built — this is the ONE unique interactive feature. If it's missing, BUILD IT. This is the highest-value piece of the entire app.
- **Signature Element Scoring Audit**: If it's an assessment/quiz, verify EVERY detail against the Creative Brief:
  - Correct number of options per question (if brief says 4, verify 4 — not 3)
  - Score labels match brief exactly (not generic "Low/Medium/High")
  - Per-question diagnostics use individual question answers (not just total score)
  - Output formulas match brief exactly (e.g., "Q6 maps to months lost" means Q6, not total score)
  - Cost/projection formulas use exact arithmetic from brief (e.g., `12 × €70 = €840`, not `score × 1.5`)
- Check that `ScrollReveal` is used on landing page sections (not static sections)
- Check that `AnimatedCounter` is used on dashboard stat cards (not static numbers)
- Check that `DemoToastProvider` wraps the dashboard layout — **messages MUST be domain-specific** (not generic "Lead submitted" CRM messages)
- Check that `DemoNotifications` is in the dashboard top bar — **messages MUST be domain-specific**
- Check that `ClickReveal` is on table rows (at least the main data table)
- Check that `ActionButton` is on key action buttons (Export, Save, etc.)
- **Check Hero has secondary CTA to Signature Element** — if Creative Brief specifies `/assessment` or `/calculator`, the Hero MUST have a ghost/outline button linking to it
- **Check dot-grid variant matches background** — `dot-grid` on dark backgrounds, `dot-grid-light` on light/white backgrounds (white dots on white = invisible)
- **Check for non-dashboard pages** — verify `/onboarding`, `/assessment`, and any other non-dashboard routes from the spec actually exist as `web/app/[route]/page.tsx` (NOT under `/dashboard/`)
- If any of these are missing, add them — they're the difference between "static printout" and "alive app"

### From Build: EliteFlame Coaching (2026-02-17)
Agent 6 found and fixed 11 issues: `dark-*` undefined Tailwind tokens (5 components), assessment scoring (5 spec violations), DemoToast/DemoNotification generic messages, missing `/onboarding` page, transformation cards missing `card-depth`. Key lesson: **non-dashboard routes and Signature Element scoring are the two most frequently missed areas.** Always audit these explicitly.

### Design Intelligence Compliance (NEW — Verify These)
The Creative Brief now contains a **Design Intelligence** section. Verify Agent 2 followed it:
- [ ] **UI Style applied**: Does the landing page match the chosen style (glassmorphism, minimalism, dark premium, etc.)? Check card treatments, shadows, backgrounds.
- [ ] **Typography correct**: Are the exact fonts from the Creative Brief used? If you see Inter/Roboto/system fonts and the brief specified something else, flag it.
- [ ] **Anti-patterns avoided**: Check the brief's anti-patterns list. If it says "no flat borders" and Agent 2 used flat borders, fix it.
- [ ] **4-layer depth applied**: Landing page must have noise overlay, dot grid in hero, glow blobs at 0.08-0.15 opacity, card-depth on cards, text-gradient-headline on section h2s.
- [ ] **No AI-slop**: Check for generic purple-on-white, cookie-cutter 3-column grids, lifeless flat backgrounds. The page should look like a human with a strong vision designed it.

### Shared Component Import
All from `@/components/shared`:
`ScrollReveal`, `AnimatedCounter`, `StaggerContainer`, `StaggerItem`, `DemoToastProvider`, `ClickReveal`, `MockDetail`, `ActionButton`, `DemoNotifications`, `LoadingSequence`

## Performance Audit (MANDATORY — Lightweight Check)

**Before signing off**, run a quick performance scan. You don't need to FIX everything — flag issues for the implementation plan.

### Pre-Flight
1. Read `.claude/skills/performance-optimizer/SKILL.md` — the full audit workflow
2. Read `.claude/skills/performance-optimizer/memory/learnings.md` — battle-tested lessons
3. Reference `.claude/skills/vercel-react-best-practices/SKILL.md` — the 57-rule React/Next.js performance bible

### Quick Scan (Agent 6 Edition — Flag, Don't Fix)
Run these checks and note findings in the Build Summary:

- [ ] **Waterfall Detection**: Grep for sequential `await` in API routes — flag any independent queries not using `Promise.all`
- [ ] **Modal Bundle Bloat**: Grep for `import.*Modal` in page files — flag any that aren't using `next/dynamic`
- [ ] **Filter Chain Anti-Pattern**: Grep for `.filter(` in component files — flag any calling `.filter()` 3+ times on the same array
- [ ] **Default Prop Traps**: Grep for `= []` or `= {}` in component destructuring — flag non-hoisted defaults
- [ ] **transition-all Anti-Pattern**: Grep for `transition-all` — should be `transition-[specific-properties]` (spec: `transition-[border-color,background-color,box-shadow]`)
- [ ] **"use client" Ratio**: Count `"use client"` pages vs total pages — if >80% are client, note as architectural concern

### What to Do With Findings
- Add a **"Performance Notes"** section to `02_build_summary.md` listing flagged issues
- Add the TOP 3 performance improvements to `03_implementation_plan.md` under Phase 1 Quick Wins
- Do NOT fix performance issues during QC — only flag them. Performance changes go in a dedicated pass.

## Context Window Management (CRITICAL)

Agent 6 has the MOST work: QC audit, build summary, AND implementation plan. You MUST be efficient with context or you'll hit capacity before finishing the deliverables.

### From Build: MT Promo B2B Merchandise Platform (2026-02-16)
Agent 6 first attempt ran 18 minutes and capacity-exceeded WITHOUT producing either deliverable (02_build_summary.md or 03_implementation_plan.md). The build system retried after 60-second cooldown and succeeded in 6 minutes on the second attempt.

**What went wrong:** Agent 6 spent too much context on QC fixes (70+ individual fixes to dark mode classes, stat card values, ROI formula, quiz animations, API route stubs) and ran out before writing the summary and plan.

**Prevention rules:**
1. **Prioritize deliverables over fixes.** If you're past 60% of your context budget and haven't started writing deliverables, STOP fixing and START writing. Agent 5 can do another pass for remaining fixes.
2. **Batch similar fixes.** Don't fix 5 dark-mode components one at a time. Grep for the pattern, make a plan, fix all at once.
3. **Theme audit FIRST.** Check if the root layout's `defaultTheme` matches the spec BEFORE auditing individual components. If it's wrong, fix that ONE file and note which shared components need updating. This is faster than discovering it piecemeal.
4. **"use client" quote check EARLY.** Grep for `'use client'` (single quotes) across all files. If found, note the count and move on — the Welder should have caught this. Don't spend context on quote fixes.

## Cross-Build Learnings (auto-pulled from Supabase)
> These were extracted from past builds. Apply them proactively.

- **[optimization]** Common text replacements (quote style normalization) could be automated as a pre-verify script → _Prevention: Add auto-fix step to verify.sh for known patterns like quote style_ _(source: Rocksolideleadgeneration OÜ)_
- **[pattern]** The verify.sh → fix → npm run build loop is an effective self-healing pattern → _Prevention: Always run this loop at least twice in Closer agent_ _(source: Rocksolideleadgeneration OÜ)_
- **[pattern]** Closer agent is the most critical in the pipeline — must have guaranteed capacity and full spec access → _Prevention: Treat Closer as guaranteed executor with reserved capacity_ _(source: Rocksolideleadgeneration OÜ)_
