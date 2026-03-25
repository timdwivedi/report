# Agent 5 (Welder) — Accumulated Learnings

> **Read this file BEFORE starting work.** These lessons are extracted from past builds to prevent recurring mistakes.

## The #1 Build Breaker: Missing "use client"
- FIRST THING: grep all .tsx files for hooks/events and verify `"use client"` is present
- Search for: `onClick`, `onChange`, `onSubmit`, `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`, `usePathname`, `useRouter`, `useSearchParams`
- ANY file using ANY of these MUST have `"use client"` as the absolute first line (before imports)
- This is the single most common build failure across all Bloom builds

## Double Layout Nesting (Silent Build Breaker)
- If `dashboard/layout.tsx` wraps children in `<DashboardLayout>` AND individual page.tsx files ALSO wrap in `<DashboardLayout>`, the build passes but the UI is broken (double sidebar, double header, squished content)
- Grep for `DashboardLayout` in both `dashboard/layout.tsx` and all `dashboard/*/page.tsx` — if layout.tsx already wraps, remove from all pages
- This won't cause a build error so `npm run build` won't catch it — you must explicitly check

## Import Errors (Second Most Common)
- Agent 4 frequently uses component paths that don't match what Agent 3 created
- Run `ls web/components/` to see actual structure BEFORE trying to fix imports
- Cross-agent imports: Agent 3 creates shared components, Agent 4 uses them — paths may not match
- If a component is imported but doesn't exist, create a minimal stub rather than deleting the import

## Type Errors
- Agent 1 types may not match Agent 4's usage — `npx tsc --noEmit` shows all errors
- Common: Agent 4 uses `item.id` as number but Agent 1 defined it as string (UUID)
- Fix at usage site, don't change Agent 1's type definitions (other agents depend on them)

## Third-Party API Versions
- If `web/lib/stripe/stripe.ts` exists, verify `apiVersion` matches the installed Stripe SDK — mismatch causes type errors
- The scaffold has the correct version — if the file was recreated by another agent, compare against the scaffold copy

## Build Process
- Always run `npm run build` as the FINAL verification, not just `npx tsc --noEmit`
- TypeScript passes but Next.js build fails? Common causes: missing metadata exports, server/client boundary issues
- If build fails with "Module not found": check `web/tsconfig.json` has `"paths": { "@/*": ["./*"] }`
- Supabase env vars: scaffold has demo-mode fallbacks in `web/lib/supabase.ts` — don't create .env.local

## Shared Interactive Components (Don't Break These)
- Agents 2-4 now use pre-built components from `@/components/shared` (already in scaffold)
- These include: `ScrollReveal`, `AnimatedCounter`, `StaggerContainer`, `StaggerItem`, `DemoToastProvider`, `ClickReveal`, `DetailPanel`, `MockDetail`, `ActionButton`, `DemoNotifications`, `LoadingSequence`, `DataTable`, `FeatureVisual`
- All require `motion/react` (framer-motion, already in scaffold's package.json) — do NOT remove this dependency
- All have `"use client"` — they are client components, this is correct
- If build errors reference these, check the import path: `@/components/shared` (barrel export from `index.ts`)
- Do NOT refactor or simplify these components — they are intentionally designed for demo interactivity

### Shared Component Verification Checklist
After all agents finish, verify these patterns:
- **Tables use DataTable** — grep for raw `<table` in dashboard pages. If found without `table-fixed`, flag it. Prefer `DataTable` from shared.
- **No ClickReveal on `<tr>`** — grep for `ClickReveal` wrapping table rows. This creates invalid HTML (`<tbody>` → `<div>` → `<tr>`) and breaks column alignment. Replace with `DetailPanel`.
- **FeatureVisual in Solution section** — check `web/components/public/Solution.tsx` or `HowItWorks.tsx`. If it uses bland icon-in-circle placeholders instead of `FeatureVisual`, flag it.
- **DetailPanel for table details** — any page with a data table that opens a side panel on row click should use `DetailPanel`, not ClickReveal or custom panel code.

## Demo Layer Verification (NEW — Critical Check)
- **Before fixing imports**, verify `web/lib/demo/` exists with 3 files: provider, wrapper, barrel
- Grep all `web/app/dashboard/**/*.tsx` for inline mock arrays (`const MOCK_`, `const DEMO_`, `const ALL_`) — if any page defines its own data, refactor it to import from `@/lib/demo`
- Common fix: page has `const MOCK_LEADS = [...]` → replace with `import { getLeadsOrDemo } from '@/lib/demo'` + `const ALL_LEADS = getLeadsOrDemo()`
- Common fix: page has `typeof MOCK_LEADS[0]` → replace with `import { type DemoLead } from '@/lib/demo'` + `DemoLead`
- Common fix: page redefines label maps → remove and import from `@/lib/demo`

### Battle-Test Lesson (Neo build, 2026-02-13)
When Agent 4 puts inline mock data in pages and Agent 1 puts it in the demo provider, you get duplicate data and import confusion. The welder should enforce: ALL data flows through `@/lib/demo`, zero exceptions. This also means verifying that `NEXT_PUBLIC_DEMO_MODE=true` is in `.env.local.example`.

## Intelligence Engine Wiring (If Enabled in Spec)

If `docs/roadmap/01_project_spec.md` contains an **"Intelligence Directives"** section, the build has intelligence modules enabled. You MUST wire them.

### Pre-Flight
1. Read `.claude/skills/intelligence-engine/SKILL.md` — full module catalog, file locations, wiring instructions
2. Read the **Intelligence Directives** section in the project spec — it lists which modules are enabled
3. Import `intelligence-registry.ts` → call `getRequiredFiles(enabledIds)` to get the exact file list

### Wiring Checklist (Only for Enabled Modules)
- [ ] **Demo Layer**: Verify `web/lib/demo/` exists with provider, wrapper, barrel. All pages must import from `@/lib/demo`, not inline mock arrays
- [ ] **Intelligence Config**: Generate `web/lib/intelligence/config/intelligence.config.ts` from the spec's config preset + dimensions + archetypes
- [ ] **API Routes**: Wire `web/app/api/intelligence/` routes for enabled modules only
- [ ] **UI Components**: Connect `ScoreCard` and `DNAPanel` to detail views (if DNA/scoring enabled)
- [ ] **Voice DNA**: Wire `voice-analyzer` + `voice-genome-engine` if voice/content generation is enabled
- [ ] **Constitution**: Configure constitution defaults if brand governance is enabled
- [ ] **Prompt System**: Wire `prompt-builder` + `prompt-loader` into content generation flows (if any AI generation)
- [ ] **Output Validator**: Wire before any AI content reaches users
- [ ] **Effectiveness Tracking**: Wire to outcome events if adaptive intelligence is enabled
- [ ] **Variation Arms**: Initialize with default approaches if variation generator is enabled
- [ ] **Demo Mode**: Set `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local.example`

### Key Pattern: Demo-First Wiring
All intelligence UI components use `*OrDemo()` wrappers from `web/lib/intelligence/demo/`. This makes the app work instantly without a database:
```typescript
// GOOD — works in demo mode AND production
import { getSubjectDNAOrDemo } from '@/lib/intelligence/demo'
const dna = await getSubjectDNAOrDemo(subjectId)

// BAD — requires database, breaks demo
import { extractDNA } from '@/lib/intelligence/core/subject-dna-extractor'
const dna = await extractDNA(subjectId)
```

### If Intelligence Is NOT in the Spec
Skip this entire section. Not all builds need intelligence — it depends on what the client's app does.

## Intelligence Module Type Errors (Common Pattern)

The `web/lib/intelligence/core/` files can have subtle TypeScript errors that only surface during build. These were fixed in the scaffold source (2026-02-16) but if any agent recreates or modifies these files, watch for:

1. **Null checks on `extractJourneyEvents()`** — returns `JourneyEvent[] | null`, always guard with `if (!events || events.length === 0)`
2. **Property name mismatches** — `signal_sequence` vs `event_sequence`, `probability` vs `outcome_probability`, `recommended_actions` vs `recommended_next_action`. Always check the type interface before accessing properties.
3. **Regex `/s` flag** — TypeScript targeting ES2015 doesn't support the dotAll (`s`) flag. Use `[\s\S]` instead of `.` with `/s`.
4. **Array vs Record indexing** — `config.scoring?.signals` is a `ScoringSignalConfig[]` (array), not a record. Use `.find(s => s.name === key)` instead of `signals[key]`.
5. **Missing config properties** — `successSignal` and `maxSignalWeight` may not be in the typed interface. Use `(config.scoring as any)?.successSignal || "converted"` as fallback.

### From Build: MT Promo B2B Merchandise Platform (2026-02-16)
13 TypeScript errors across 5 intelligence module files (conversion-predictor, output-validator, prompt-builder, signal-recorder, weight-optimizer). All caused by interface/implementation mismatches. Fixed in scaffold source — these should not recur unless agents modify the intelligence files.

## "use client" Quote Format
- Next.js requires **double quotes**: `"use client"` — NOT single quotes `'use client'`
- If Agent 4 uses single quotes, bulk-convert with: grep for `'use client'` and replace with `"use client"`
- This is a build-blocking error that's easy to miss in 27+ files
- **Also check line position**: `"use client"` must be LINE 1 — not after comments, blank lines, or doc blocks

## Smart/Curly Quote Detection (From EliteFlame Build, 2026-02-17)
- Copy-paste from spec documents introduces curly/smart quotes (`'`, `'`, `"`, `"`) into JSX string literals
- These are INVISIBLE in most fonts but break the parser with cryptic "unterminated string" errors
- **Add to your audit checklist**: grep for curly quotes in all `.tsx`/`.ts` files and replace with ASCII `'` and `"`
- Common source: Problem.tsx, Hero.tsx — sections with copy-heavy content pasted from the spec

## Undefined Tailwind Classes (From EliteFlame Build, 2026-02-17)
- Agent 3 used `dark-bg`, `dark-border` classes not in `tailwind.config.ts` — these silently fail
- **Add to your audit checklist**: grep for `dark-` prefixed classes and verify they exist in the config
- If undefined, either add them to the Tailwind config or replace with standard classes (e.g., `slate-900`)

## Rules
- Make MINIMAL changes — fix what's broken, don't refactor or improve code quality
- Change as few lines as possible per fix
- If you can't resolve a type error after 2 attempts, stub it with `as any` and add `// TODO: fix type`
- Your ONLY job is making `npm run build` pass with zero errors
- Do NOT review design, accessibility, or code quality — that's Agent 6's job

## Cross-Build Learnings (auto-pulled from Supabase)
> These were extracted from past builds. Apply them proactively.

- **[error]** Skipping the verification agent eliminates the quality assurance layer between creation and closure → _Prevention: Always invoke Agent 5 even if earlier agents completed cleanly_ _(source: Rocksolideleadgeneration OÜ)_
