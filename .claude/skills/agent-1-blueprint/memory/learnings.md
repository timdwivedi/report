# Agent 1 (Blueprint) — Accumulated Learnings

> **Read this file BEFORE starting work.** These lessons are extracted from past builds to prevent recurring mistakes.

## FAST PATH
1. Read `docs/CREATIVE_BRIEF.md` — contains the Signature Element you must create types/data for
2. Create demo provider in `web/lib/demo/` FIRST (3 files: provider, wrapper, barrel)
3. If spec has "Intelligence Directives" section, also read `.claude/skills/intelligence-engine/SKILL.md` for required types

---

## TypeScript Types
- Always use `string` for IDs (UUID format), never `number` — Supabase uses UUIDs
- Status fields should be union types (`"active" | "inactive" | "pending"`), not plain `string`
- Date fields: use `string` (ISO format) in types — do NOT use `Date` objects in mock data
- Always export interfaces from a single `web/lib/types/app.ts` — agents 3 and 4 import from here

## Demo Data Provider (MANDATORY — replaces inline mock data)
- **ALL mock data lives in `web/lib/demo/`** — NEVER in `constants/app.ts` or page files
- Create 3 files: `demo-data-provider.ts` (data + getters), `demo-data-wrapper.ts` (getDemoOrReal routing), `index.ts` (barrel)
- `isDemoMode()` checks `NEXT_PUBLIC_DEMO_MODE=true` env var OR `?demo=true` URL param
- Each entity gets a getter function: `getDemoStats()`, `getDemoSessions()`, `getDemoLeads()`, etc.
- Each getter gets a wrapper: `getStatsOrDemo(realFn?)`, `getSessionsOrDemo(filters?, realFn?)`, etc.
- Export label maps (e.g., `CEILING_LABELS`, `STATUS_STYLES`) from the provider — pages import these too
- Export types from the provider: `DemoSession`, `DemoLead`, etc. — pages use these for type annotations
- Mock data must look REAL: realistic names (not "John Doe"), realistic dollar amounts, dates within last 90 days
- Keep mock data arrays at 5-10 items — enough to populate a table, not bloated
- IDs in mock data should be simple strings ('1', '2', '3') — these are demo-only
- Status distributions should feel realistic: 60% active, 25% pending, 15% inactive

### Battle-Test Lesson (Neo build, 2026-02-13)
When we built Neo's demo layer AFTER the pages were already hardcoded, we had to retroactively extract data from 4 pages into a centralized provider. Building the provider FIRST would have saved all that work. The provider → wrapper → barrel → pages flow is the correct order. Pages should never define their own mock arrays.

## Database Schema
- Every table needs: `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`, `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ DEFAULT now()`
- Multi-tenant: every table needs `org_id UUID REFERENCES organizations(id)` (except users/auth tables)
- Always add indexes on foreign key columns and any column used in WHERE clauses
- RLS policies: write all 4 (SELECT, INSERT, UPDATE, DELETE) — missing DELETE policy = security hole

## Third-Party Integrations
- Stripe `apiVersion` in `web/lib/stripe/stripe.ts` MUST match the installed Stripe SDK version — check the scaffold file, do NOT hardcode outdated versions like `'2024-12-18.acacia'`
- The scaffold already has the correct version (`'2026-01-28.clover'`) — if you recreate the Stripe config, copy the version from the scaffold

## Navigation
- Navigation config should be a single array in `web/lib/constants/navigation.ts`
- Each item: `{ label, href, icon }` — href must match actual page routes in `web/app/dashboard/`
- Always include: Dashboard (home), one per core feature, Settings

## Creative Brief (MANDATORY)
- **Read `docs/CREATIVE_BRIEF.md` BEFORE starting work** — Agent 2.5 (Creative Director) creates this before you run. It contains the visual identity, animation directives, and a **Signature Element** unique to this build.
- The Creative Brief ALWAYS specifies a **Signature Element** (interactive calculator, assessment quiz, timeline, before/after comparison, real-time feed, etc.) — you MUST create types and mock data for it
- Example: If the brief specifies an "ROI Calculator", create types like `CalculatorInput`, `CalculatorResult` and mock data for default values, input ranges, and sample outputs
- Example: If the brief specifies an "Assessment Quiz", create types like `QuizQuestion`, `QuizResult` and mock data for questions, answer options, and result profiles
- Your types and mock data feed Agents 3 and 4 — without your data structures, they can't build the signature element

## Cross-Build Learnings (auto-pulled from Supabase)
> These were extracted from past builds. Apply them proactively.

- **[pattern]** Explicit TypeScript interfaces in the spec translate directly to quality code generation → _Prevention: Continue providing full interface definitions in project specs_ _(source: Rocksolideleadgeneration OÜ)_
- **[error]** Blueprint agent creates files ALL other agents depend on — if it fails, the entire pipeline is at risk → _Prevention: Run Blueprint first with guaranteed capacity, or pre-generate its outputs from the spec_ _(source: Rocksolideleadgeneration OÜ)_
