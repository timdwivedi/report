# Project Spec Master Template

> **This is the STRUCTURAL TEMPLATE for `01_project_spec.md`.**
> The Spec Agent MUST follow this exact structure. Every section is mandatory.
> Placeholder markers `{...}` show what kind of content goes there — replace with specifics.
> The MINIMUM quality bar is 800 lines. Premium specs are 1000-1500 lines.
> **Battle-tested against 5+ real builds (Wisee AI, Caruso Martech, Neo, HomeServices Capital, Angela EliteFlame). Every section format below produced working apps.**
>
> **FLEXIBILITY NOTE:** This structure is a GUIDE, not a straitjacket. If the client's app doesn't fit a section (e.g., no competitors listed, no pricing tiers), skip it or adapt it. Prioritize specificity over completeness — 6 detailed sections beat 11 vague ones. The Spec Agent should think like a founder, not a template filler.

---

## 1. Overview

**App Name:** {Exact app name from submission}
**Tagline:** {One sentence — outcome-focused, creates curiosity}
**Domain:** {Industry vertical — e.g., "commercial real estate lead generation"}
**Business Model:** {e.g., "B2B SaaS — $99/$299/$899 monthly tiers" or "Freemium diagnostic tool with upsell"}

### What This App Does (3 sentences max)
{Sentence 1: What the user gets. Sentence 2: How it works differently. Sentence 3: The measurable outcome.}

### Target User Persona

> Write ONE specific person, not a demographic range. Give them a name, age, and context.

- **Name & Context:** {e.g., "Marcus Rivera, 34, runs a 6-person commercial real estate brokerage in Austin"}
- **Role:** {Job title}
- **Demographics:** {Age range, income bracket ($X-$Y), location type, team size}
- **Tech Profile:** {Tools they use — Notion, Slack, LinkedIn, etc. How tech-savvy?}
- **Pain Points:**
  1. {SPECIFIC pain — NOT "wastes time" but "spends 3 hours/day manually copying lead data between LinkedIn and spreadsheets"}
  2. {SPECIFIC pain — with numbers: "60%+ of time on X that yields only Y% results"}
  3. {SPECIFIC pain — emotional: "two team members quit last year from burnout"}
- **Goals:**
  1. {SPECIFIC goal with metric — NOT "grow business" but "close 5 more deals/month without hiring another setter"}
  2. {SPECIFIC goal}
  3. {SPECIFIC goal}
- **Objections:**
  1. {Real objection — e.g., "I've tried 3 CRMs already and none stuck because onboarding took too long"}
  2. {Real objection — skepticism: "Can an AI really understand my specific situation?"}
  3. {Real objection — financial: "I've already invested $X in solutions that didn't work"}
- **Buying Triggers:** {Events that make them search for a solution — e.g., "quarterly hiring surges, recruiter turnover, hiring manager complaints"}

### Value Proposition
- **Core Promise:** {One sentence transformation — specific, measurable}
- **Unique Mechanism:** {What makes this approach fundamentally different from competitors}
- **Before → After:** {Life without → life with — be vivid}

---

## 2. Core Features

> List 4-8 features. Each feature MUST map to a dashboard page.

| # | Feature Name | Description | Primary Page | Display Type |
|---|---|---|---|---|
| 1 | {Feature Name} | {2-sentence description — user-facing} | `/dashboard/{slug}` | {table / card-grid / kanban / chart / split-view / form} |
| 2 | {Feature Name} | {description} | `/dashboard/{slug}` | {display type} |
| 3 | {Feature Name} | {description} | `/dashboard/{slug}` | {display type} |
| 4 | {Feature Name} | {description} | `/dashboard/{slug}` | {display type} |
| {5-8} | {additional features if needed} | | | |

### Page Map

```
/                              → Landing page (public)
/login                         → Login
/signup                        → Signup
/dashboard                     → Dashboard home (stats + activity)
/dashboard/{feature-1-slug}    → {Feature 1 name}
/dashboard/{feature-2-slug}    → {Feature 2 name}
/dashboard/{feature-3-slug}    → {Feature 3 name}
/dashboard/{feature-4-slug}    → {Feature 4 name}
/dashboard/settings            → Profile, Team, Billing, Notifications
{/quiz or /tool if applicable} → {Special public tool or wizard}
```

---

## 3. Competitive Intelligence

> This section informs the landing page copy and positioning. Skip ONLY if no competitor data exists.

### Competitor Analysis

| Competitor | Positioning | Pricing | Key Strength | Key Weakness — Gap We Exploit |
|---|---|---|---|---|
| {Competitor 1} | {Their tagline/position} | {$/month} | {What they do well} | {Specific gap — e.g., "No client portal — clients have to ask for results"} |
| {Competitor 2} | {Their tagline/position} | {$/month} | {What they do well} | {Specific gap} |
| {Competitor 3} | {Their tagline/position} | {$/month} | {What they do well} | {Specific gap} |

### How We Differentiate
1. {SPECIFIC differentiator — NOT "better UX" but "instant onboarding via LinkedIn import — competitors require 2-week manual setup"}
2. {SPECIFIC differentiator — technology moat}
3. {SPECIFIC differentiator — business model advantage}

---

## 4. Design Direction

### Theme Declaration

> **CRITICAL: State the theme explicitly.** Agents must not guess.

**Dashboard Theme:** {`LIGHT` or `DARK`} — {e.g., "Light — white sidebar, white cards, secondary-50 page backgrounds" or "Dark — #0A0619 backgrounds, dark-800 cards, light text"}

This single decision cascades into every agent's color choices. If not declared, agents will produce inconsistent light/dark mixes.

### Color Palette

> MINIMUM: 3 palette scales (primary, secondary, accent) × 11 shades each + 4 semantic colors = 37+ hex codes.

**Primary — {Color Name} ({why this color — brand emotion})**

| Shade | Hex | Usage |
|---|---|---|
| 50 | `{#hex}` | Light backgrounds, hover states |
| 100 | `{#hex}` | Badge backgrounds, subtle fills |
| 200 | `{#hex}` | Borders, dividers |
| 300 | `{#hex}` | Inactive states |
| 400 | `{#hex}` | Secondary elements |
| 500 | `{#hex}` | **Primary brand color** |
| 600 | `{#hex}` | Hover states |
| 700 | `{#hex}` | Active/pressed states |
| 800 | `{#hex}` | Heavy text on light |
| 900 | `{#hex}` | Near-black |
| 950 | `{#hex}` | Darkest shade |

**Secondary — {Color Name} ({neutral, background, text})**

| Shade | Hex | Usage |
|---|---|---|
| 50 | `{#hex}` | Page backgrounds |
| 100 | `{#hex}` | Card backgrounds |
| 200 | `{#hex}` | Borders, dividers |
| 300 | `{#hex}` | Placeholder text |
| 400 | `{#hex}` | Muted icons |
| 500 | `{#hex}` | Secondary text |
| 600 | `{#hex}` | Body text |
| 700 | `{#hex}` | Headings |
| 800 | `{#hex}` | Dark headings |
| 900 | `{#hex}` | Near-black text |
| 950 | `{#hex}` | Darkest |

**Accent — {Color Name} ({action, CTA, success})**

| Shade | Hex | Usage |
|---|---|---|
| 50-950 | `{#hex each}` | {Same structure as above} |

**Semantic Colors**

| Token | Hex | Usage |
|---|---|---|
| Success | `{#hex}` | Positive states, completed |
| Warning | `{#hex}` | Pending, attention |
| Danger/Error | `{#hex}` | Failed, rejected, errors |
| Info | `{#hex}` | Informational badges |

### Typography

| Element | Font (Google Fonts) | Weight | Size (desktop) | Size (mobile) |
|---|---|---|---|---|
| H1 | {Font Name} | 700 | {px} / {tailwind} | {px} / {tailwind} |
| H2 | {Font Name} | 700 | {px} / {tailwind} | {px} / {tailwind} |
| H3 | {Font Name} | 600 | {px} / {tailwind} | {px} / {tailwind} |
| Body | {Font Name} | 400 | {px} / {tailwind} | {px} / {tailwind} |
| Body Small | {Font Name} | 400 | {px} / {tailwind} | {px} / {tailwind} |
| Mono / Data | {Font Name} | 400-500 | {px} / {tailwind} | {px} / {tailwind} |

**Font Usage Rules (Agent 2 & 4 reference):**

| Context | Tailwind Classes |
|---|---|
| Page titles | `{e.g., text-2xl font-bold text-secondary-900}` |
| Section headings | `{e.g., text-lg font-semibold text-secondary-800}` |
| Body text | `{e.g., text-sm font-normal text-secondary-600}` |
| Labels | `{e.g., text-xs font-medium text-secondary-500 uppercase tracking-wide}` |
| KPI values | `{e.g., font-mono text-3xl font-bold text-secondary-900}` |
| Small data | `{e.g., font-mono text-sm text-secondary-700}` |

### Component Style

| Property | Value |
|---|---|
| Border Radius (cards) | {e.g., 12px / `rounded-xl`} |
| Border Radius (buttons) | {e.g., 8px / `rounded-lg`} |
| Border Radius (inputs) | {e.g., 8px / `rounded-lg`} |
| Border Radius (badges) | {e.g., 9999px / `rounded-full`} |
| Card Shadow | {e.g., `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)`} |
| Card Shadow (hover) | {e.g., `0 10px 25px rgba(X,X,X,0.1), 0 4px 10px rgba(0,0,0,0.05)`} |
| Card Border | {e.g., `1px solid {secondary-200}`} |
| Card Padding | {e.g., 24px / `p-6`} |
| Section Padding (desktop) | {e.g., 80px vertical / `py-20`} |
| Section Padding (mobile) | {e.g., 48px vertical / `py-12`} |
| Container Max Width | {e.g., 1200px or 1280px} |
| Sidebar Width (expanded) | {e.g., 260px} |
| Sidebar Width (collapsed) | {e.g., 72px} |
| Top Bar Height | {e.g., 64px} |
| Base Transition | {e.g., `all 200ms ease`} |

**Status Badge Color Map:**

> CRITICAL: Define the exact Tailwind classes for every status in the app.

| Status | Background | Text |
|---|---|---|
| {active/completed} | `{e.g., bg-emerald-50}` | `{e.g., text-emerald-700}` |
| {in_progress/screening} | `{e.g., bg-blue-50}` | `{e.g., text-blue-700}` |
| {scheduled/new/pending} | `{e.g., bg-amber-50}` | `{e.g., text-amber-700}` |
| {cancelled/rejected} | `{e.g., bg-red-50}` | `{e.g., text-red-700}` |
| {draft/paused} | `{e.g., bg-slate-100}` | `{e.g., text-slate-600}` |

### Design References

Study these 2-3 apps for UI inspiration (DO NOT copy — extract principles):
1. **{App name}** — {SPECIFIC lesson: e.g., "Clean data tables with inline editing, excellent use of status badges"}
2. **{App name}** — {SPECIFIC lesson: e.g., "Subtle shadows, tight spacing, beautiful empty states, smooth micro-interactions"}
3. **{App name}** — {SPECIFIC lesson: e.g., "Dark mode dashboard, data-dense but readable, excellent card layout"}

### Available Shared Components (Pre-Built in Scaffold)

> These components ship with every Bloom build. Agents should USE them, not recreate them.
> All imports: `import { ComponentName } from '@/components/shared'`

| Component | What It Does | Used By |
|-----------|-------------|---------|
| `ScrollReveal` | Scroll-triggered fade/slide-in animation wrapper | Agent 2 (landing page sections) |
| `AnimatedCounter` | Counts up to a number on scroll (stat cards, metrics bars) | Agents 2, 3, 4 |
| `StaggerContainer` + `StaggerItem` | Staggers children animations (feature grids, card lists) | Agent 2 (landing page) |
| `FeatureVisual` | Rich inline SVG illustrations — 6 variants: `dashboard`, `chart`, `form`, `report`, `speed`, `funnel`. Pure CSS/SVG, no images needed. | Agent 2 (Solution/How It Works section) |
| `DataTable` | Table with enforced `table-fixed` + `<colgroup>` column alignment. Type-safe Column definitions. | Agent 4 (all table-based dashboard pages) |
| `DetailPanel` | Standalone slide-in panel for table row details. Controlled via `isOpen`/`onClose` props. | Agent 4 (table row click → detail view) |
| `MockDetail` | Pre-built detail content layout with fields list, status badge, action buttons | Agent 4 (inside DetailPanel) |
| `ClickReveal` | Click-to-reveal wrapper with slide-in panel. **DO NOT use on `<tr>` elements** — the `<div>` wrapper breaks table column alignment. Use only on cards/non-table items. | Agent 4 (card grids only) |
| `ActionButton` | Button with click → success state animation ("Export CSV" → "✓ Exported!") | Agents 2, 4 |
| `DemoToastProvider` + `useToast` | Toast notification system for demo interactions | Agent 4 |
| `DemoNotifications` | Notification bell with dropdown panel | Agent 3, 4 |
| `LoadingSequence` | Animated loading screen with step-by-step progress messages | Agent 3 |

**FeatureVisual Usage (Agent 2 — Solution/How It Works):**
The Solution section should use FeatureVisual for step illustrations instead of bland icon-in-circle placeholders:
```tsx
import { FeatureVisual } from '@/components/shared'

// Pick the variant that matches each step:
<FeatureVisual variant="form" />      // Step: "Fill out assessment/quiz"
<FeatureVisual variant="dashboard" /> // Step: "View your dashboard/results"
<FeatureVisual variant="chart" />     // Step: "Track progress/growth"
<FeatureVisual variant="report" />    // Step: "Get your score/report"
<FeatureVisual variant="speed" />     // Step: "Instant response/speed"
<FeatureVisual variant="funnel" />    // Step: "Conversion funnel/pipeline"
```

**DataTable + DetailPanel Usage (Agent 4 — Dashboard Tables):**
```tsx
import { DataTable, DetailPanel, MockDetail } from '@/components/shared'

const [selected, setSelected] = useState<Entity | null>(null)

<DataTable columns={columns} data={items} onRowClick={setSelected} />

<DetailPanel isOpen={!!selected} onClose={() => setSelected(null)} title="Details">
  {selected && <MockDetail fields={[...]} status={{...}} actions={[...]} />}
</DetailPanel>
```
This pattern prevents the ClickReveal `<div>` wrapper bug that breaks table column alignment.

---

## 5. Page Architecture

### All Routes

| Route | Type | Layout | Description |
|---|---|---|---|
| `/` | Public | Landing | 9-section conversion page |
| `/login` | Auth | Centered card | Email + social login |
| `/signup` | Auth | Centered card | Registration |
| `/dashboard` | Protected | Dashboard | Home — stats + activity |
| `/dashboard/{feature-1}` | Protected | Dashboard | {Feature 1 name} |
| `/dashboard/{feature-2}` | Protected | Dashboard | {Feature 2 name} |
| `/dashboard/{feature-3}` | Protected | Dashboard | {Feature 3 name} |
| `/dashboard/settings` | Protected | Dashboard | Profile, billing, team |
| {/tool or /quiz} | {Public/Protected} | {Custom layout} | {If applicable — e.g., "/mirror" for Neo} |

### Non-Dashboard Custom Layouts (if applicable)

> If the app has pages that DON'T use the standard dashboard layout (e.g., a public diagnostic tool, onboarding wizard, assessment quiz), describe the custom layout here. Agent 3 creates these layouts.

**{Custom Layout Name} (e.g., "Mirror Layout"):**
- **Used by routes:** {e.g., `/mirror`, `/mirror/session`, `/mirror/reveal`}
- **Visual:** {e.g., "Full-screen immersive, no sidebar, no top bar. Background: #0A0619. Content centered max-width 800px."}
- **Navigation:** {e.g., "Back arrow top-left, exit link top-right. No sidebar."}
- **Priority:** {PRIMARY or SECONDARY — which pages are the core product?}

---

## 6. AGENT 1 DIRECTIVES

> Agent 1 creates: TypeScript types, constants, database schema, demo data provider.

### Task 1: TypeScript Interfaces (`web/lib/types/app.ts`)

> Write the COMPLETE interfaces — not just field names. Agent 1 copies these verbatim.

```typescript
// ===== ENUMS / UNION TYPES =====

export type {EntityStatus} = '{status1}' | '{status2}' | '{status3}';
export type {EntityCategory} = '{cat1}' | '{cat2}' | '{cat3}';
// ... list ALL union types

// ===== CORE ENTITIES =====

export interface {Entity1Name} {
  id: string;                    // UUID
  org_id: string;                // Multi-tenant FK
  {field_name}: string;          // {Description}
  {field_name}: number;          // {Description — e.g., "0-100 score"}
  {field_name}: string | null;   // {Optional field}
  status: {EntityStatus};
  created_at: string;            // ISO date
  updated_at: string;            // ISO date
}

export interface {Entity2Name} {
  id: string;
  org_id: string;
  {entity1_id}: string;          // FK → {entity1_table}
  // ... all fields
}

// Repeat for ALL entities (minimum 3-5 interfaces)

// ===== COMPONENT PROP TYPES =====

export interface StatCardData {
  label: string;
  value: string;
  change: string;                // e.g., "+12.5%"
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
}
```

### Task 2: Constants & Navigation (`web/lib/constants/app.ts`)

Navigation items (MUST match page routes exactly):
```typescript
export const SIDEBAR_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: '{icon}' },
  { label: '{Feature 1}', href: '/dashboard/{feature-1}', icon: '{icon}' },
  { label: '{Feature 2}', href: '/dashboard/{feature-2}', icon: '{icon}' },
  { label: '{Feature 3}', href: '/dashboard/{feature-3}', icon: '{icon}' },
  { label: 'Settings', href: '/dashboard/settings', icon: '{icon}' },
];
```

Status/category label maps:
```typescript
export const STATUS_LABELS: Record<{EntityStatus}, string> = {
  '{status1}': '{Display Label}',
  '{status2}': '{Display Label}',
  // ...
};

export const STATUS_STYLES: Record<{EntityStatus}, { bg: string; text: string }> = {
  '{status1}': { bg: '{bg-emerald-50}', text: '{text-emerald-700}' },
  '{status2}': { bg: '{bg-blue-50}', text: '{text-blue-700}' },
  // ...
};
```

### Task 3: Database Schema (`supabase/migrations/003_app_schema.sql`)

> Full SQL — not pseudocode. Include CREATE TABLE, constraints, RLS, indexes.

| Table | Key Columns | Relationships |
|---|---|---|
| `{table_name}` | id (UUID PK), org_id (FK), {col} ({type}), status (text CHECK), created_at, updated_at | org_id → organizations |
| `{table_name}` | id (UUID PK), org_id (FK), {parent}_id (FK), {col} ({type}), created_at, updated_at | {parent}_id → {parent_table} |

RLS policies: Enable on ALL tables. SELECT/INSERT/UPDATE/DELETE where `org_id = auth.jwt()->>'org_id'`.
Indexes: All `org_id` columns + all foreign keys + all `status` columns.

### Task 4: Demo Data Provider (`web/lib/demo/`)

> CRITICAL: All mock data lives HERE, not in page files or constants.

Create 3 files following the Bloom demo pattern:

**`demo-data-provider.ts`:**
- `isDemoMode()` — checks `NEXT_PUBLIC_DEMO_MODE` env var + `?demo=true` URL param
- Mock data arrays:
  - `DEMO_STATS`: {N} stat cards — {describe each with label, value, change}
  - `DEMO_{ENTITY_1}S`: {N} items per this table format:

  | {Name} | {Field 2} | {Field 3} | {Status} | {Metric} | {Date} |
  |---|---|---|---|---|---|
  | {Realistic Name 1} | {value} | {value} | {status} | {number} | {recent date} |
  | {Realistic Name 2} | {value} | {value} | {status} | {number} | {date} |
  | ... (5-10 items) | | | | | |

  - `DEMO_{ENTITY_2}S`: {N} items — same table format
  - `DEMO_RECENT_ACTIVITY`: 6-8 items — realistic actions with relative timestamps
  - `DEMO_QUICK_ACTIONS`: 3-4 items — common tasks

- Label/style maps: `STATUS_LABELS`, `STATUS_STYLES`, `CATEGORY_LABELS`
- Export types: `Demo{Entity1}`, `Demo{Entity2}`
- Getter functions: `getDemoStats()`, `getDemo{Entity1}s(filters?)`, `getDemo{Entity1}(id)`, etc.

**`demo-data-wrapper.ts`:**
- `getDemoOrReal<T>(demoFn, realFn)` — async routing based on `isDemoMode()`
- `getDemoOrRealSync<T>(demoFn, realFn)` — sync version
- Pre-wired wrappers: `getStatsOrDemo()`, `get{Entity1}sOrDemo(filters?)`, `get{Entity2}sOrDemo()`, `getRecentActivityOrDemo()`, `getQuickActionsOrDemo()`

**`index.ts`:**
- Barrel exports: isDemoMode, all wrappers, all label maps, all types

**Mock data realism requirements:**
- Names: Use realistic names appropriate to the target market (NOT "John Doe" or "Test User")
- Numbers: Use realistic amounts — revenue $10K-$500K, percentages 15-95%, scores that cluster around 65-85
- Dates: Within the last 30-90 days, distributed unevenly (more recent = more entries)
- Status distribution: ~60% primary state, ~25% secondary, ~15% tertiary — NOT uniform
- IDs: Simple strings ('1', '2', '3') — demo-only
- Emails: Realistic domains matching names (sarah@okonkwodigital.com, not test@test.com)

---

## 7. AGENT 2 DIRECTIVES

> Agent 2 creates: Landing page, Tailwind config, marketing sections, global CSS.

### Color Implementation (Tailwind Config)

> Provide the LITERAL code block for `tailwind.config.ts` colors:

```javascript
// tailwind.config.ts — extend colors
colors: {
  primary: {
    50: '{#hex}',
    100: '{#hex}',
    // ... all shades 50-950
    500: '{#hex}', // PRIMARY — {usage note}
    // ...
  },
  secondary: {
    50: '{#hex}',
    // ... all shades
  },
  accent: {
    50: '{#hex}',
    // ... all shades
  },
}
```

### Font Implementation

```
Google Fonts to load:
{Font Name 1} (weights: 600, 700) — for headings
{Font Name 2} (weights: 400, 500, 600) — for body
{Font Name 3} (weights: 400) — for mono/data (if applicable)

fontFamily in tailwind.config:
  sans: ['{Font Name}', 'system-ui', 'sans-serif'],
  heading: ['{Font Name}', 'system-ui', 'sans-serif'], // only if different from body
  mono: ['{Font Name}', 'monospace'],
```

### Landing Page Specification

**Tone:**
- Voice: {e.g., "Confident expertise wrapped in approachable warmth. Like a trusted advisor who's been in the trenches."}
- Perspective: {e.g., "Always 'you/your' — speak TO the user, not about them"}
- Energy: {e.g., "Empowering, not preachy. Acknowledge real pain without being cynical."}
- Avoid: {List 5+ things to avoid — e.g., "corporate jargon, 'leverage', 'synergy', generic 'AI is the future' hype"}

**Hero:**
- Headline: "{Exact headline text}"
- Subheadline: "{Exact subheadline — 2-3 sentences}"
- CTA: "{Exact button text}" ({color} button)
- Secondary CTA: "{Exact text}" (ghost/outlined button)
- Right side visual: {e.g., "Product dashboard screenshot mockup" or "Abstract neural network animation (CSS only)" or "Illustration"}
- Micro-proof: {e.g., '"847+ founders diagnosed" counter below CTA'}

**Alternative Headlines (for Agent 2 to choose from):**
- "{Alt 1}"
- "{Alt 2}"
- "{Alt 3}"

**Landing Page Sections (in order):**
1. **Hero** — {Brief spec: layout, CTAs, visual treatment}
2. **Social Proof / Metrics Bar** — {e.g., "4 animated counters: '€2.4M+ Revenue Generated', '45+ Clients Served', '4.2x Average ROAS', '98% Client Retention'"}
3. **Problem** — {Problem setup with specific pain bullets:}
   - Pain 1: "{Exact copy — e.g., 'Your recruiters spend 25+ hours per week on repetitive screening calls'}"
   - Pain 2: "{Exact copy}"
   - Pain 3: "{Exact copy}"
   - Cost callout: "{Financial impact statement — e.g., 'A single bad hire costs $50K-$250K'}"
   - Competitor critique: "{What current solutions get wrong — 1-2 bullets}"
4. **Solution / How It Works** — 3-step mechanism with alternating layout. Use `FeatureVisual` from `@/components/shared` for step illustrations (pick variants: `form`, `dashboard`, `chart`, `report`, `speed`, `funnel`). Example: "Step 1: Fill out assessment (variant=form) → Step 2: Get your dashboard (variant=dashboard) → Step 3: Track your growth (variant=chart)"
5. **Features / Benefits** — {4-6 benefit cards with titles and descriptions}
6. **Social Proof / Case Studies** — {2-3 case study cards with client name, industry, key metric, short quote}
7. **Testimonials** — {3 testimonial cards — write the FULL testimonials:}
   - Testimonial 1: **{Name}** — {Title, Company} — "{Full quote with metrics}"
   - Testimonial 2: **{Name}** — {Title, Company} — "{Full quote}"
   - Testimonial 3: **{Name}** — {Title, Company} — "{Full quote}"
8. **Free Resources / Lead Magnet** — {Optional: downloadable resource cards}
9. **Final CTA** — {Closing headline, CTA button, reassurance text}
10. **Footer** — {Logo, nav links, social icons, copyright}

### Component Specs (Agent 2 builds these in Tailwind)

**Cards:**
```
{e.g., bg-white rounded-xl border border-secondary-200 shadow-sm p-6}
hover: {e.g., shadow-md transition-shadow duration-200}
```

**Primary Buttons:**
```
{e.g., bg-accent-500 text-white px-7 py-3 rounded-lg font-semibold text-base}
shadow: {e.g., 0 4px 14px rgba(X,X,X,0.3)}
hover: {e.g., bg-accent-600 translateY(-1px)}
```

**Secondary Buttons:**
```
{e.g., bg-transparent border-1.5 border-primary-500 text-primary-500 px-7 py-3 rounded-lg}
hover: {e.g., bg-primary-50}
```

**Inputs:**
```
{e.g., h-11 border border-secondary-200 rounded-lg px-4 text-base}
focus: {e.g., ring-2 ring-primary-500 border-primary-500}
```

**Status Badges:**
```
{e.g., rounded-full px-3 py-1 text-xs font-medium}
{Repeat the status badge color map from Design Direction}
```

### Agent 2 Atomic Tasks

> Number each deliverable so Agent 2 knows exactly what to create.

**Task 1:** Edit `web/tailwind.config.ts` — implement the full color palette. Map to primary/secondary/accent keys. Add font families.
**Task 2:** Edit `web/app/globals.css` — set root CSS variables for the theme. Add any custom animations.
**Task 3:** Create `web/components/public/Header.tsx` — {sticky header spec: logo, nav links, CTA button, background, height}
**Task 4:** Create `web/components/public/Hero.tsx` — {layout, copy, CTA, visual treatment}
**Task 5:** Create `web/components/public/SocialProof.tsx` — {metrics bar spec}
**Task 6:** Create `web/components/public/Problem.tsx` — {pain points, cost callout, competitor critique}
**Task 7:** Create `web/components/public/Solution.tsx` — {how it works steps}
**Task 8:** Create `web/components/public/Benefits.tsx` — {benefit cards}
**Task 9:** Create `web/components/public/Testimonials.tsx` — {testimonial cards}
**Task 10:** Create `web/components/public/FinalCTA.tsx` — {closing CTA section}
**Task 11:** Create `web/components/public/Footer.tsx` — {footer spec}
**Task 12:** Rewrite `web/app/page.tsx` — import and render all sections in order
{Add tasks 13+ for any additional public pages/components}

---

## 8. AGENT 3 DIRECTIVES

> Agent 3 creates: Dashboard layout, sidebar, top bar, auth pages, shared components.

### Sidebar Navigation

```
Icon  | Label           | Path                    | Badge
──────|─────────────────|─────────────────────────|──────
📊    | Dashboard       | /dashboard              |
{📋}  | {Feature 1}     | /dashboard/{feature-1}  | {optional count}
{👥}  | {Feature 2}     | /dashboard/{feature-2}  |
{📈}  | {Feature 3}     | /dashboard/{feature-3}  |
⚙️    | Settings        | /dashboard/settings     |
```

### Layout Specifications

| Property | Value |
|---|---|
| Sidebar width (expanded) | {e.g., 260px / `w-[260px]`} |
| Sidebar width (collapsed) | {e.g., 72px / `w-[72px]`} |
| Top bar height | {e.g., 64px / `h-16`} |
| Content padding | {e.g., 24px / `p-6`} |
| Sidebar item height | {e.g., 40px} |
| Sidebar item padding | {e.g., `px-3 py-2`} |
| Sidebar item radius | {e.g., `rounded-lg`} |
| Sidebar active bg | {e.g., `primary-50`} |
| Sidebar active text | {e.g., `primary-500`} |
| Sidebar active indicator | {e.g., "left border 3px primary-500" or "full bg tint"} |
| Sidebar inactive text | {e.g., `secondary-500`} |
| Sidebar hover bg | {e.g., `secondary-100`} |
| Sidebar divider | {e.g., `secondary-200`} |
| Mobile sidebar | {e.g., "Full overlay with backdrop blur, slide-in from left"} |
| Theme | {e.g., "Light — white sidebar, white top bar" or "Dark — #120E24 sidebar, #0A0619 top bar"} |

### Stat Card KPIs (Dashboard Home)

> Agent 3 creates the `StatCard` component. These are the exact values it displays:

| Label | Mock Value | Change | Change Type | Icon |
|---|---|---|---|---|
| {e.g., "Total Revenue"} | {e.g., "€42,820"} | {e.g., "+18.2%"} | positive | {e.g., TrendingUp or 📊} |
| {KPI 2} | {value} | {change} | {type} | {icon} |
| {KPI 3} | {value} | {change} | {type} | {icon} |
| {KPI 4} | {value} | {change} | {type} | {icon} |
| {KPI 5} | {value} | {change} | {type} | {icon} |
| {KPI 6} | {value} | {change} | {type} | {icon} |

### Auth Page Specs

**Login (`/login`):**
- Background: {e.g., "Split layout — left: gradient primary-600→900 with testimonial; right: white card" or "Full dark #0A0619"}
- Card: {e.g., "max-width 420px, centered" with bg/border spec}
- Logo: {Placement and style}
- Fields: Email, Password (with show/hide toggle)
- Extras: "Remember me" checkbox, "Forgot password?" link
- CTA: "{Button text}" (full-width, {color})
- Social logins: {e.g., "Continue with Google" + "Continue with Microsoft"} or {none}
- Bottom link: "Don't have an account? Sign up"

**Signup (`/signup`):**
- Same layout as login
- Fields: Full Name, Email, Password, Confirm Password
- Extras: "I agree to Terms" checkbox, password strength indicator (optional)
- CTA: "{Button text}" (full-width, {color})
- Bottom link: "Already have an account? Log in"

### Agent 3 Atomic Tasks

**Task 1:** Rewrite `web/components/layout/DashboardLayout.tsx` — {sidebar + top bar + responsive}
**Task 2:** Create `web/components/shared/StatCard.tsx` — {card component spec}
**Task 3:** Create `web/components/shared/PageHeader.tsx` — {title + subtitle + action button}
**Task 4:** Create `web/components/shared/EmptyState.tsx` — {icon + title + description + CTA}
**Task 5:** Rewrite `web/app/(auth)/login/page.tsx` — {auth page spec}
**Task 6:** Rewrite `web/app/(auth)/signup/page.tsx` — {auth page spec}
{Add Task 7+ for custom layouts like MirrorLayout, OnboardingLayout, etc.}

---

## 9. AGENT 4 DIRECTIVES

> Agent 4 creates: All dashboard feature pages + the Signature Element.
> **CRITICAL: Agent 4 imports ALL data from `@/lib/demo` — zero inline mock arrays.**
> **TABLES: Use `DataTable` from `@/components/shared` for all table pages. Use `DetailPanel` for row-click detail views. DO NOT use `ClickReveal` around `<tr>` elements — it wraps in a `<div>` which breaks table column alignment.**

### Page 1: Dashboard Home (`/dashboard`)

**Imports from `@/lib/demo`:** `getStatsOrDemo()`, `getRecentActivityOrDemo()`, `getQuickActionsOrDemo()`

**Layout:**
- Welcome: "Good {time of day}, {User}" (use time-based greeting)
- {N} stat cards in responsive grid ({N}-col desktop, 2-col tablet, 1-col mobile)
  - Use `AnimatedCounter` from `@/components/shared` on the values
- Recent activity feed ({N} items): avatar circle + action text + relative timestamp
- Quick actions grid ({N} cards): icon + label + description + arrow link

### Page 2: {Feature 1 Name} (`/dashboard/{feature-1}`)

**Imports from `@/lib/demo`:** `get{Entity1}sOrDemo(filters?)`, `STATUS_LABELS`, `STATUS_STYLES`, `type Demo{Entity1}`

**Page Header:** "{Feature 1 Name}" + subtitle "{description}" + "{Add New}" action button (primary)

**Filters:** {Search input} + {Filter 1: dropdown with options: All, X, Y, Z} + {Filter 2: dropdown}

**Display Type:** {table / card-grid / kanban / split-view}

**Data Table Columns** (use `DataTable` from `@/components/shared`):

| Column | Type | Width | Content | Responsive |
|---|---|---|---|---|
| {Name/Title} | text | 22% | Bold, with avatar initials or icon | always visible |
| {Field 2} | text | 18% | {Description} | hidden md:table-cell |
| {Status} | badge | 12% | Color-coded from `STATUS_STYLES` | always visible |
| {Metric} | number | 12% | {Format: "$X,XXX" or "XX%" or "X.X days"} | hidden lg:table-cell |
| {Field 4} | text | 15% | {Description} | hidden lg:table-cell |
| {Date} | date | 13% | "{Mon DD, YYYY}" format | hidden xl:table-cell |
| Actions | menu | 8% | 3-dot → View, Edit, Delete | always visible |

**State:** `useState<Demo{Entity1} | null>(null)` for selected item
**Row interaction:** Row click → `setSelected(item)` → opens `DetailPanel` (slide-in from right)

**Detail Panel** (use `DetailPanel` + `MockDetail` from `@/components/shared`):
- Fields to display: {list each field: label → value}
- Status indicator: {colored dot + label}
- Actions: {list buttons — e.g., "Message", "Edit", "Archive"}

**Pagination:** "Showing 1-{N} of {total}" with prev/next buttons

**Empty State:** {Icon} + "{No items yet}" + "{Description}" + CTA: "{Add first item}"

### Page 3: {Feature 2 Name} (`/dashboard/{feature-2}`)

> Same level of detail as Page 2 — specify EVERY column, EVERY filter, EVERY action.

{... complete wireframe ...}

### Page 4: {Feature 3 Name} (`/dashboard/{feature-3}`)

{... complete wireframe ...}

### Page 5: Analytics (`/dashboard/analytics`) — if applicable

**Imports from `@/lib/demo`:** `getAnalyticsOrDemo()`, `get{Distribution}OrDemo()`

**Sections:**
1. {e.g., "Distribution Chart"} — {CSS-only horizontal bar chart: N bars, each labeled, proportional widths, colors}
   - Data: {List each bar with label, count, percentage}
2. {e.g., "Funnel Visualization"} — {Horizontal funnel: Stage1 (N) → Stage2 (N) → Stage3 (N) → StageN (N)}
3. {e.g., "Key Metrics Card"} — {2-3 large numbers side by side}
4. {e.g., "Top Performers Table"} — {Mini table: columns and data}

### Page 6: Settings (`/dashboard/settings`)

**Tabs:** Profile | Notifications | Billing | Team

- **Profile tab:** Avatar upload area (initials circle: "{XX}"), name input (pre-filled: "{Name}"), email input (pre-filled: "{email}", disabled/greyed), role display, "Save Changes" button
- **Team tab:** Team members table:
  | Name | Email | Role | Status | Actions |
  |---|---|---|---|---|
  | {Owner Name} | {email} | Owner | Active | — |
  | {Member 2} | {email} | {role} | Active | Edit, Remove |
  | {Member 3} | {email} | {role} | Invited | Resend |
  - "Invite Team Member" button
- **Billing tab:** Current plan card ("{Plan} — ${price}/mo"), usage stats (progress bars), plan comparison, "Upgrade Plan" button, payment method display
- **Notifications tab:** Toggle switches (visual only):
  - "{Notification 1}" — ON
  - "{Notification 2}" — ON
  - "{Notification 3}" — OFF
  - "{Notification 4}" — ON

### Signature Element: {Name}

> The Creative Brief ALWAYS specifies a Signature Element — the ONE unique interactive feature that makes this build unforgettable. Agent 4 builds it.

- **Type:** {e.g., "Interactive ROI calculator" | "Assessment quiz" | "Before/after slider" | "Real-time activity feed" | "Diagnostic tool"}
- **Location:** {e.g., "/dashboard/calculator" or a landing page section or "/mirror"}
- **Data source:** Import types and mock data from `@/lib/demo` — Agent 1 creates these
- **Interactions:** {Step-by-step what happens — e.g., "User enters 3 inputs → clicks Calculate → animated result appears with pulse"}
- **Visual treatment:** {Colors, animations, layout — be specific}

### Agent 4 Atomic Tasks

**Task 1:** Create `web/app/dashboard/page.tsx` — {Dashboard home with stats, activity, quick actions}
**Task 2:** Create `web/app/dashboard/{feature-1}/page.tsx` — {Feature 1 page with table/cards}
**Task 3:** Create `web/app/dashboard/{feature-2}/page.tsx` — {Feature 2 page}
**Task 4:** Create `web/app/dashboard/{feature-3}/page.tsx` — {Feature 3 page}
**Task 5:** Create `web/app/dashboard/settings/page.tsx` — {Settings with tabs}
{Task 6+: Analytics page, Signature Element page, non-dashboard pages like /mirror/*}

---

## 10. AGENT 5 DIRECTIVES

> Agent 5 wires everything together. Build MUST pass with zero errors.

### Expected API Routes

| Method | Route | Purpose | Stub Response |
|---|---|---|---|
| GET | `/api/{feature-1}` | List {entities} | `{ data: [], message: "API stub" }` |
| POST | `/api/{feature-1}` | Create {entity} | `{ success: true }` |
| GET | `/api/{feature-2}` | List {entities} | `{ data: [] }` |
| {etc.} | | | |

### Integration Points (Cross-Agent Dependencies)

> This table prevents the most common build errors.

| Agent Creates → | File | Used By |
|---|---|---|
| Agent 1 | `web/lib/types/app.ts` | Agents 3, 4 (type annotations) |
| Agent 1 | `web/lib/demo/index.ts` | Agent 4 (all `*OrDemo()` data imports) |
| Agent 1 | `web/lib/constants/app.ts` | Agent 3 (navigation), Agent 4 (label maps) |
| Agent 2 | `tailwind.config.ts` colors | Agents 3, 4 (Tailwind classes) |
| Agent 2 | `web/app/globals.css` | All agents (CSS variables) |
| Agent 2 | `web/components/public/*` | Landing page only |
| Agent 3 | `web/components/layout/DashboardLayout.tsx` | Agent 4 (all `/dashboard/*` pages) |
| Agent 3 | `web/components/shared/StatCard.tsx` | Agent 4 (dashboard home) |
| Agent 3 | `web/components/shared/PageHeader.tsx` | Agent 4 (all feature pages) |
| Agent 3 | `web/components/shared/EmptyState.tsx` | Agent 4 (empty state in tables) |

### File Ownership Boundaries

> Prevents agents from stepping on each other's files.

```
Agent 1: web/lib/types/*, web/lib/demo/*, web/lib/constants/*, supabase/migrations/*
Agent 2: web/app/page.tsx, web/components/public/*, tailwind.config.ts (colors), web/app/globals.css
Agent 3: web/components/layout/*, web/components/shared/*, web/app/(auth)/*
Agent 4: web/app/dashboard/*/page.tsx, web/app/{custom-routes}/*
Agent 5: web/app/api/*, verification, integration fixes
```

### Common Import Issues to Watch For

- Agent 4 imports `StatCard` from `@/components/shared/StatCard` — verify Agent 3 created this
- Agent 4 imports types from `@/lib/types/app` — verify Agent 1 created all needed interfaces
- Agent 4 imports `get{X}OrDemo()` from `@/lib/demo` — verify Agent 1 exported these wrappers
- Agent 3 sidebar nav paths must match Agent 4's actual page file structure
- Agent 2's tailwind color tokens must match what Agents 3/4 use in class names
- If Agent 1 exports `STATUS_LABELS`, Agent 4 must import with that exact name

### Verification Checklist

Run these in order:

- [ ] Every `.tsx` with hooks/events has `"use client"` at line 1
- [ ] `tsconfig.json` has `"paths": { "@/*": ["./*"] }`
- [ ] All sidebar nav links have matching page files in `web/app/dashboard/`
- [ ] All `@/lib/demo` imports resolve correctly
- [ ] No page has inline `const MOCK_*` or `const DEMO_*` arrays
- [ ] No page redefines label/style maps that exist in `@/lib/demo`
- [ ] `DashboardLayout` is NOT double-wrapped (layout.tsx wraps, pages don't)
- [ ] Fonts are loaded (check layout.tsx or globals.css for Google Fonts)
- [ ] `NEXT_PUBLIC_DEMO_MODE=true` is in `.env.local.example`
- [ ] Mobile responsive: no horizontal overflow at 375px (check for fixed-width elements)
- [ ] No dynamic Tailwind classes (`bg-${var}-500` — must be static)
- [ ] `npm run build` passes with zero errors

### Quality Priority Order (if time is limited)
1. Build errors (won't compile)
2. Missing pages (broken nav links)
3. Import mismatches (wrong paths or export names)
4. Type errors (wrong prop types)
5. Visual issues (broken layouts, missing responsive classes)
6. Accessibility (missing labels, alt text)
7. Polish (consistent spacing, shadows)

---

## Domain Mapping (if intelligence modules apply)

> See `bloom/.claude/skills/intelligence-engine/SKILL.md` Phase 0.5 for the full template.
> Include this section ONLY if the app uses AI/intelligence features.

{Domain Mapping Template — Subject Terminology, Archetype Mapping, Routing/Tier Mapping, Conversation Stage Mapping, Module Inclusion Manifest, NOT APPLICABLE exclusions}

---

## Self-Review Checklist (Spec Agent — verify before saving)

Before writing this file, the Spec Agent MUST verify ALL of these:

**Structure:**
- [ ] **800+ lines** — Premium specs are 1000-1500. Below 800 means sections are too thin.
- [ ] **Every feature has a page** — Count features (Section 2). Count pages (Section 9). They must match.
- [ ] **Every page has a wireframe** — Agent 4 Directives has per-column table specs for EACH page.
- [ ] **Every page lists its demo imports** — Agent 4 knows exactly which `*OrDemo()` to call.

**Design Specificity:**
- [ ] **37+ hex codes** — 3 palette scales × 11 shades + 4 semantic = 37 minimum.
- [ ] **Font names specified** — Not "sans-serif" but "Inter" or "DM Sans" with weights.
- [ ] **Font usage rules** — Each text context (page title, section heading, body, label, KPI) mapped to Tailwind classes.
- [ ] **Status badge colors defined** — Every status in the app has explicit bg + text Tailwind classes.
- [ ] **Component specs with exact values** — Buttons, cards, inputs, badges all have Tailwind classes or CSS values.

**Content Quality:**
- [ ] **Zero vague words** — Search for: appropriate, suitable, relevant, nice, clean, modern, professional, elegant, sleek. Replace ALL with specifics.
- [ ] **Persona has numbers** — Age, income, team size, specific pain metrics ("3 hours/day", "60% of time").
- [ ] **Testimonials written** — 3 complete testimonials with name, title, company, and specific metrics.
- [ ] **Problem section has exact copy** — Not "describe pain" but the actual sentences for the landing page.

**Agent Isolation:**
- [ ] **Agent isolation** — Each agent section is self-contained. No "use whatever Agent 1 creates."
- [ ] **Atomic tasks numbered** — Each agent has a numbered task list with exact file paths.
- [ ] **File ownership defined** — Section 10 has explicit ownership boundaries.
- [ ] **Navigation matches routes** — Sidebar items (Agent 3) match pages (Agent 4) match routes (Section 5).

**Demo Layer:**
- [ ] **Mock data tables provided** — Agent 1 gets tables with 5-10 items, every column filled with realistic values.
- [ ] **Mock data uses realistic names** — No "John Doe", no "test@test.com". Real-sounding names and emails.
- [ ] **Status/category maps are defined** — Label names, colors, and display styles are explicit.
- [ ] **Signature Element is specified** — Type, location, data source, interactions, visual treatment.
