# Agent 4 (Pages) — Accumulated Learnings

> **Read this file BEFORE starting work.** These lessons are extracted from past builds to prevent recurring mistakes.

## FAST PATH
1. Read `docs/CREATIVE_BRIEF.md` — your north star for styles, animations, and the Signature Element
2. Build the **Signature Element** — this is your #1 job (see section below)
3. Import ALL data from `@/lib/demo` — NEVER define inline mock arrays
4. Also read `.claude/skills/performance-optimizer/memory/learnings.md` for table/list performance patterns

---

## YOUR #1 JOB: Build the Signature Element (Revenue Engine)

The Creative Brief ALWAYS specifies a **Signature Element** — the ONE interactive feature that turns this build into a **conversion engine**, not just an app.

**The big picture:** We're not building cute SaaS widgets. We're building revenue engines — systems that fix a client's operational bottleneck (broken conversions, understaffing, manual ops, slow proposals) and we take a percentage of the revenue that flows through. The Signature Element is what makes the client say "holy shit, I need this fixed NOW."

- **YOU are responsible for building it** as a full page component using types/mock data from Agent 1
- Place it where the Creative Brief says (landing page section, dedicated page, or dashboard feature)
- This is NOT optional — the Signature Element is what converts a $250 tripwire into a $10K+ revenue engine installation
- **Make the problem UNDENIABLE**: If it's an ROI calculator, show a big scary number. If it's a diagnostic, show a score that makes them uncomfortable. If it's a cost-of-inaction tool, show money bleeding per month.
- The element should make the client's conversion/ops problem visceral — numbers on screen, not abstract theory

---

## Dashboard Pages
- Every page is a SEPARATE file: `web/app/dashboard/[feature-name]/page.tsx`
- **NEVER define inline mock data arrays** (`const MOCK_*` or `const DEMO_*`) in page files
- **ALL data imports from `@/lib/demo`** — Agent 1 creates the demo provider, you consume it
- Import pattern: `import { getSessionsOrDemo, LABEL_MAP, type DemoSession } from '@/lib/demo'`
- Usage: `const ALL_SESSIONS = getSessionsOrDemo()` at the top of the file (outside the component)
- Use exported types for state: `useState<DemoSession | null>(null)` instead of `typeof MOCK_SESSIONS[0]`
- Import label maps from demo provider: `CEILING_LABELS`, `STATUS_STYLES`, etc. — don't redefine them
- Settings page: use Tabs component from `web/components/ui/tabs.tsx` for sections

### Battle-Test Lesson (Neo build, 2026-02-13)
Neo's original pages had hardcoded arrays (MOCK_SESSIONS, MOCK_LEADS, CEILING_LABELS) duplicated across 4 files. The leads page had 8 ceiling labels while sessions had 10 — inconsistency from copy-paste. Importing from a single demo provider eliminates this class of bugs entirely.

## "Show Everything" Principle
- Include ALL buttons/actions that would exist in the real app, even if non-functional
- "Export CSV", "Invite Member", "Upgrade Plan" — show them, use `onClick={() => {}}` or toast
- 3-dot action menus on table rows: show Edit, Delete, View options
- Filter/search bars: render the UI even if non-functional
- Empty states: never show a blank page — always icon + message + CTA

## Component Patterns
- **Tables: Use `DataTable` from `@/components/shared`** — enforces `table-fixed` + `<colgroup>` for column alignment. Row click → `DetailPanel` for details.
- If you need a raw `<table>`, always add `table-fixed` class + `<colgroup>` with explicit `<col>` widths
- Status badges: use color-coded Badge component with `STATUS_STYLES` map from `@/lib/demo`
- Stat cards: arrange in 4-column grid desktop, 2-column tablet, 1-column mobile. Use `AnimatedCounter` on values.
- Activity feeds: relative timestamps ("2 hours ago"), avatar circles, action descriptions

## Common Mistakes
- **CRITICAL: Do NOT wrap page content in `<DashboardLayout>`** — The `dashboard/layout.tsx` already wraps all children in `<DashboardLayout>`. If individual pages also wrap in `<DashboardLayout>`, it causes double sidebar, double header, massive spacing. Pages should return bare content (e.g., `<div className="space-y-6">...</div>`), NOT `<DashboardLayout><div>...</div></DashboardLayout>`.
- Using wrong import paths for types (should be `@/lib/types/app` — check what Agent 1 actually created)
- Creating duplicate UI components that already exist in `web/components/ui/`
- Forgetting `"use client"` on pages with onClick handlers or useState
- Using `<style jsx>` without `"use client"` — styled-jsx is client-only, add the directive or use Tailwind instead
- Using `className={`bg-${status}-500`}` — NEVER dynamic Tailwind. Use class maps.
- Installing packages — DO NOT modify package.json

### From Build: Rocksolideleadgeneration OÜ (2026-02-12)
Settings page is frequently the last page created and first dropped under capacity pressure. Always verify against spec page list before completing.

### From Build: Rocksolideleadgeneration OÜ (2026-02-12)
Sub-agents should be staggered, not parallel, to avoid compounding rate limits. 3 simultaneous sub-agents = 4x the rate limit risk.

### From Build: MT Promo B2B Merchandise Platform (2026-02-16)
**Rate limit caused 5 missing quiz step components + 9 missing API route stubs.** Agent 4 was split into 3 parallel sub-agents that all hit rate limits simultaneously. Agent 5 had to create the quiz components from scratch (wasted an entire Welder pass), and Agent 6 had to create all 9 API route stubs. Stagger sub-agent launches by 10-15 seconds minimum.

Also: **27 "use client" directives used single quotes** (`'use client'`) instead of double quotes (`"use client"`). Next.js requires double quotes. Agent 5 had to bulk-convert all 27 files. ALWAYS use `"use client"` with double quotes — never single quotes.

**ROI Calculator formula was wrong** — produced ~£2.2M instead of spec's ~£627K because the gap calculation was missing. When building the Signature Element, read the spec's formula carefully. Don't invent math — follow the exact formula provided in the Creative Brief or spec.

### From Build: EliteFlame Coaching (2026-02-17)
**Missing `/onboarding` page** — Agent 4 built all `/dashboard/*` pages but missed `/onboarding` because it's NOT under `/dashboard/`. Agent 6 had to create it from scratch. **ALWAYS check for non-dashboard routes** in the spec: `/assessment`, `/onboarding`, `/pricing`, `/demo`, `/invite`. These are top-level routes under `web/app/`, NOT under `web/app/dashboard/`.

**Assessment scoring had 5 spec violations** — Agent 4 built the assessment with 3 options per question (spec required 4), wrong score labels, used total score instead of per-question diagnostics, wrong field for months-lost calculation, and wrong cost formula. The Creative Brief had all this information but it was in prose. **When the Creative Brief provides scoring logic, implement it CHARACTER FOR CHARACTER.** If it says "Q6 answer maps to months lost" — use Q6's answer, not the total score. If it says "4 options per question" — use 4, not 3.

**Used inline mock data despite demo provider existing** — Agent 4 created inline mock arrays in page files even though Agent 1 created a full demo provider at `@/lib/demo`. After writing each page, search your code for `const MOCK_`, `const DEMO_`, or any hardcoded arrays. If found, refactor to use `@/lib/demo` imports.

## Creative Brief & Interactive Page Components (MANDATORY)
- **Read `docs/CREATIVE_BRIEF.md` BEFORE starting work** — Agent 2.5 (Creative Director) creates this with per-page animation/interactive directives and a unique Signature Element
- Follow the Creative Brief's directives for which pages get which interactive treatments exactly

### Available Components (import from `@/components/shared`):

**`AnimatedCounter`** — Numbers that count up from 0 when scrolled into view
```tsx
import { AnimatedCounter } from '@/components/shared'

// On stat cards — replace static numbers with animated counters
<AnimatedCounter value={847} suffix="+" className="text-3xl font-bold" />
<AnimatedCounter value={78.4} suffix="%" decimals={1} className="text-3xl font-bold" />
<AnimatedCounter value={12500} prefix="$" className="text-3xl font-bold" />
```
- Use on: Dashboard stat cards, analytics numbers, any impactful metric
- Props: `value` (number), `prefix`, `suffix`, `decimals`, `duration`, `className`

**`DataTable` + `DetailPanel` + `MockDetail`** — Tables with enforced column alignment + slide-in detail panel

⚠️ **NEVER use ClickReveal on `<tr>` elements.** ClickReveal wraps children in a `<div>`, creating invalid HTML (`<tbody>` → `<div>` → `<tr>`) which breaks the table layout engine's column alignment. Tables MUST use `DataTable` + `DetailPanel` instead.

```tsx
import { DataTable, DetailPanel, MockDetail, type Column } from '@/components/shared'

// Define columns with enforced widths
const columns: Column<DemoLead>[] = [
  { key: 'name', label: 'Name', width: '22%' },
  { key: 'status', label: 'Status', width: '12%', render: (v) => <Badge>{v}</Badge> },
  { key: 'score', label: 'Score', width: '10%', render: (v) => `${v}%` },
  { key: 'date', label: 'Date', width: '12%' },
]

// State for selected row
const [selected, setSelected] = useState<DemoLead | null>(null)

// Table with row click handler (no ClickReveal wrapper)
<DataTable columns={columns} data={leads} onRowClick={setSelected} />

// Standalone detail panel (rendered OUTSIDE the table)
<DetailPanel isOpen={!!selected} onClose={() => setSelected(null)} title="Lead Details">
  {selected && <MockDetail fields={[
    { label: 'Name', value: selected.name },
    { label: 'Email', value: selected.email },
    { label: 'Score', value: `${selected.score}%`, highlight: true },
  ]} status={{ label: selected.status, color: 'bg-emerald-500' }}
  actions={[{ label: 'Message', icon: '💬' }, { label: 'Edit', icon: '✏️' }]} />}
</DetailPanel>
```
- DataTable enforces `table-fixed` + `<colgroup>` for bulletproof column widths
- DetailPanel slides in from right with spring animation (same UX as ClickReveal)
- Use on: ALL table-based dashboard pages

**`ClickReveal`** — Click-to-reveal wrapper for NON-TABLE elements ONLY
```tsx
import { ClickReveal, MockDetail } from '@/components/shared'

// ONLY use on cards, list items, non-table elements
<ClickReveal title="Client Details" detail={<MockDetail fields={[...]} />}>
  <Card>...</Card>
</ClickReveal>
```
- ⚠️ NEVER wrap `<tr>` elements — use DataTable + DetailPanel for tables

### From Build: HomeServices Capital + Angela EliteFlame (2026-02-21)
**ClickReveal on `<tr>` caused table column misalignment in both builds.** Campaigns table (HC) and Clients table (Angela) had columns that didn't line up between header and body because ClickReveal's `<div>` wrapper broke `<tbody>` → `<tr>` relationships. Fixed by replacing with direct `onClick` on `<tr>` + standalone `DetailPanel`. The scaffold now ships `DataTable` and `DetailPanel` as shared components — use them for ALL table pages.

**`ActionButton`** — Buttons that show loading → success feedback
```tsx
import { ActionButton } from '@/components/shared'

<ActionButton variant="primary" successMessage="Exported successfully!">
  Export CSV
</ActionButton>
<ActionButton variant="secondary" successMessage="Invitation sent!">
  Invite Member
</ActionButton>
```
- Use on: "Export", "Save", "Send", "Generate" — any action button
- Shows spinner + progress bar, then checkmark + success message
- Variants: 'primary', 'secondary', 'ghost'

**`LoadingSequence`** — Multi-stage dramatic loading animation
```tsx
import { LoadingSequence } from '@/components/shared'

// Great for feature pages that "process" data
<LoadingSequence
  stages={[
    { label: 'Analyzing data...', duration: 1500 },
    { label: 'Generating insights...', duration: 2000 },
    { label: 'Preparing dashboard...', duration: 1000 },
  ]}
  trigger="mount"
>
  <div>Your actual page content here</div>
</LoadingSequence>
```
- Use on: Analytics pages, report generators, any "processing" feature
- Trigger: 'mount' (auto-play on page load) or 'click' (button-triggered)

### Signature Element
- See **"YOUR #1 JOB"** section at top of this file — that's where the full instructions live

## Cross-Build Learnings (auto-pulled from Supabase)
> These were extracted from past builds. Apply them proactively.

- **[pattern]** Specifying page-to-page navigation links in the spec produces correct inter-page linking → _Prevention: Continue specifying navigation flows explicitly in specs_ _(source: Rocksolideleadgeneration OÜ)_
- **[error]** Settings pages are commonly the last created and first dropped under capacity pressure → _Prevention: Explicitly track page completion against spec checklist_ _(source: Rocksolideleadgeneration OÜ)_
- **[error]** Parallel sub-agent execution multiplies rate limit risk — 4x API call rate from one agent → _Prevention: Stagger sub-agents instead of parallel execution; implement rate-limit-aware scheduling_ _(source: Rocksolideleadgeneration OÜ)_
