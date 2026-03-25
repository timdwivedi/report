# Spec Quality Learnings — Accumulated Build Intelligence

> **This file is READ by the Spec Agent and Spec Self-Review BEFORE generating or reviewing a spec.**
> It contains lessons learned from past builds about what spec patterns lead to good builds
> and what spec gaps cause downstream failures.
> **DO NOT hardcode project-specific data here.** Only abstract, reusable patterns.

---

## How This File Gets Updated

After every build, Agent 7 (Debrief) evaluates the spec that was used and appends new learnings here.
The `apply_spec_learnings()` function in `agentic-build.sh` writes new entries automatically.
Each entry includes: the build date, what worked, what was missing, and the downstream impact.

---

## Baseline Learnings (from 3 battle-tested builds)

### What Makes a Spec Work (Patterns That Produced Clean Builds)

1. **Complete TypeScript interface code blocks** — When the spec contains full `export interface` blocks with every field typed and commented, Agent 1 copies them verbatim and Agent 4 has zero type errors. Listing just field names without types leads to Agent 1 guessing, which causes type mismatches downstream.

2. **Mock data in table format with 5-10 items** — Specs that provide a complete table (Name | Field2 | Field3 | Status | Metric | Date) for each entity produce realistic demos. Specs that say "create realistic mock data" produce 3 items with "John Doe" names.

3. **Status badge color mapping** — Every spec that explicitly maps each status value to Tailwind bg/text classes (e.g., `active → bg-emerald-50 text-emerald-700`) eliminates one of the most common Agent 4 inconsistencies (each page using different colors for the same status).

4. **Atomic task lists per agent** — When Agent 2 gets 12 numbered tasks with exact file paths, it produces 12 files. When it gets "create the landing page sections", it produces 3-4 sections and misses the rest.

5. **Font usage rules mapped to Tailwind classes** — "Page titles: `text-2xl font-bold text-secondary-900`" is specific enough. "Use Inter for headings" is not.

6. **Per-page demo import statements** — When Agent 4 Directives say `Import from @/lib/demo: getSessionsOrDemo(), STATUS_LABELS, type DemoSession`, Agent 4 gets it right. When they say "use the demo data", Agent 4 creates inline arrays.

7. **Cross-agent integration table** — Specs that explicitly list "Agent 1 creates X → Agent 4 imports it" prevent the #1 build error (import path mismatches).

### What Causes Downstream Failures (Anti-Patterns)

1. **"Create appropriate types"** — This phrase in the spec means Agent 1 guesses the fields, Agent 4 uses different field names, and Agent 5 spends half its time fixing type mismatches. The spec MUST list every field.

2. **Missing color palette shades** — If the spec only provides primary-500, Agent 2 invents the 50-950 scale, and the invented shades may not harmonize. Always provide at minimum the full 50-950 scale for primary + secondary.

3. **Vague page wireframes** — "Create a table showing the data" causes Agent 4 to guess column names, widths, and formats. Every page needs a column-by-column wireframe with width percentages and content descriptions.

4. **No empty state descriptions** — Without empty state specs, Agent 4 either skips them entirely (blank page when no data) or invents inconsistent ones. Every table/list page needs: icon + title + description + CTA.

5. **Testimonials not written** — When the spec says "add testimonials", Agent 2 writes generic quotes. When the spec provides 3 complete testimonials with names, titles, companies, and metrics, the landing page feels real.

6. **No competitive intelligence** — Without competitor analysis, the Problem section on the landing page is generic. The spec should include 2-3 competitor weaknesses that inform the copy.

7. **Dashboard layout not specified as dark/light** — If the spec doesn't say "this is a DARK dashboard" or "light theme with white sidebar", agents make inconsistent choices. Some pages end up light, some dark.

---

## Build-Specific Learnings (Appended Automatically)

> New entries are appended below by the debrief learning loop.
> Format: ### Build: {Company} ({Date}) → {Lesson}

### Build: HomeServices Capital (2026-02-21) → ClickReveal breaks tables, FeatureVisual prevents bland visuals

**What worked:**
- Blueprint-first approach: Agent 1 created 35+ types, full demo provider with getXOrDemo() wrappers. Zero import errors downstream.
- Calculator formula matched spec character-for-character (£873K default gap).
- West Michigan-specific demo data (Polish/Dutch/Hispanic names, realistic revenue ranges).
- Agent 6 caught 14 systematic QC issues (12 single-quote "use client", 2 directive placement errors, 3 undefined Tailwind classes).
- Score: 26,490 total lines, verify.sh passes with 0 errors.

**What caused rework:**
- **ClickReveal on `<tr>` broke table column alignment** — campaigns and reports tables had misaligned headers because ClickReveal wraps children in a `<div>`, creating invalid HTML. Fixed by adding `DataTable` and `DetailPanel` shared components to the scaffold.
- **Solution section had bland icon-in-circle placeholders** — just "01", "02", "03" number circles with text. Added `FeatureVisual` shared component with 6 SVG illustration variants.
- **Agent 6.5 retrospective never generated** — the agentic-build.sh wasn't passing the Agent 6.5 skill instructions to Claude, so it got zero context about file creation. Fixed by loading the skill file from `.claude/skills/agent-6.5-mentor/instructions.md`.
- **dark-* Tailwind classes in light-mode app** — some shared scaffold components had dark-mode defaults that don't exist in light builds. Agent 6 had to convert to secondary-* tokens.

**New scaffold additions from this build:**
- `FeatureVisual` component (6 variants: dashboard, chart, form, report, speed, funnel)
- `DataTable` component (enforced `table-fixed` + `<colgroup>` column alignment)
- `DetailPanel` component (standalone slide-in panel — replaces ClickReveal for tables)
- `ClickReveal` updated with warning about `<tr>` elements
- `SPEC_TEMPLATE.md` updated with shared components inventory + theme declaration
- Agent 6.5 now receives full skill instructions in agentic-build.sh

### Build: Angela EliteFlame Coaching (2026-02-21) → Same ClickReveal + FeatureVisual issues

**Same patterns as HomeServices Capital confirmed:**
- Clients table had misaligned columns from ClickReveal wrapping `<tr>`
- HowItWorks section used number-in-circle placeholders instead of FeatureVisual
- Both fixed using the same patterns (DataTable/DetailPanel for tables, FeatureVisual for step illustrations)
