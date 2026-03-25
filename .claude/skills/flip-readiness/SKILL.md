# Flip Readiness — Demo-to-Production Assessment

> **Trigger:** "flip readiness", "how close to production", "ready to flip?", "production readiness"
>
> Generates a comprehensive report evaluating how close the app is to switching
> from demo data (`getDemoX()` calls) to real Supabase-connected production.

---

## What This Skill Does

Scans the entire codebase to build a truth table:

| Layer | Question |
|-------|----------|
| **Types** | Does `app.ts` define the entity type? |
| **Demo Data** | Does `demo-data-provider.ts` have a `getDemoX()` for it? |
| **SQL Table** | Does a migration create the table? |
| **API Route** | Does `app/api/{entity}/route.ts` exist? |
| **Page Uses API** | Does the dashboard page call the API route (not `getDemoX()` directly)? |
| **Wrapper** | Is `getDemoOrReal()` used for this entity? |

---

## Execution

### STEP 1 — INVENTORY ENTITIES

Read `web/lib/types/app.ts` and extract every exported interface/type that represents
a domain entity (Client, Project, Order, Vendor, Product, Program, Ticket, Commission, etc.).

Build a checklist row for each entity.

### STEP 2 — CHECK DEMO DATA LAYER

Read `web/lib/demo/demo-data-provider.ts`:
- List every `getDemoX()` function
- Map each to its entity type
- Note the return type and approximate record count

### STEP 3 — CHECK SQL SCHEMA

Read all files in `web/supabase/migrations/`:
- List every `CREATE TABLE` statement
- Map each table to its entity type
- Note any missing columns vs the TypeScript type (compare field names)
- Flag entities that have types + demo data but NO table

### STEP 4 — CHECK API ROUTES

Glob `web/app/api/**/route.ts`:
- List every API route
- Map each to its entity type
- Check if the route returns real Supabase data or falls back to demo:
  - `isSupabaseConfigured()` check = has real path
  - Direct `getDemoX()` call = demo only
  - No API route at all = missing

### STEP 5 — CHECK PAGE DATA SOURCE

For each page in `web/app/dashboard/*/page.tsx`:
- Grep for `getDemoX()` direct imports = still on demo data
- Grep for `fetch('/api/...)` or `useSWR` or API calls = using API
- Grep for `getDemoOrReal()` = using wrapper (partially flipped)

### STEP 6 — CHECK WRAPPER USAGE

Read `web/lib/demo/demo-data-wrapper.ts`:
- List which entities have wrapper functions
- Check if any page actually imports from the wrapper vs directly from `demo-data-provider`

### STEP 7 — GENERATE REPORT

Write output to: `docs/roadmap/flip-readiness-report.md`

Use this structure:

```markdown
# Flip Readiness Report

> Generated: {timestamp}
> App: {project name from package.json}

## Overall Score: XX% ready for production

{calculated as: entities with all 5 layers / total entities * 100}

---

## Entity Readiness Matrix

| Entity | Types | Demo Data | SQL Table | API Route | Page Uses API | Wrapper | Status |
|--------|-------|-----------|-----------|-----------|---------------|---------|--------|
| Clients | ... | ... | ... | ... | ... | ... | ... |

Status key:
- READY = all layers complete, page uses API
- PARTIAL = has API route but page still uses getDemoX()
- DEMO ONLY = no SQL table or no API route
- MISSING = no demo data, no API, no table

---

## Missing SQL Tables

Tables that need migrations (entity has types + demo data but no table):

| Entity | Suggested Table Name | Key Columns Needed |
|--------|---------------------|--------------------|

---

## Missing SQL Columns

Existing tables that are missing columns present in the TypeScript types:

| Table | Missing Column | TypeScript Source |
|-------|---------------|-------------------|

---

## Pages Still on Direct Demo Data

Pages importing directly from `demo-data-provider` instead of using API routes:

| Page | Imports | Should Use |
|------|---------|------------|
| dashboard/page.tsx | getDemoDashboardStats() | /api/dashboard/stats |
| dashboard/clients/page.tsx | getDemoClients() | /api/clients |
| ... | ... | ... |

---

## getDemoOrReal() Wrapper Status

The wrapper exists at `lib/demo/demo-data-wrapper.ts` but may not be used by pages.

| Wrapper Function | Used By Pages? | Notes |
|-----------------|----------------|-------|

---

## Flip Checklist (in order)

1. [ ] Generate missing table migrations (Plumber agent)
2. [ ] Add missing columns to existing tables (Plumber agent)
3. [ ] Create missing API routes for entities without them
4. [ ] Update pages from `getDemoX()` direct calls to API route calls (Mechanic/Tailor)
5. [ ] Wire `getDemoOrReal()` wrapper for graceful fallback during transition
6. [ ] Configure Supabase connection (env vars)
7. [ ] Seed production database with initial data
8. [ ] Test with real Supabase connection
9. [ ] Deploy with `NEXT_PUBLIC_DEMO_MODE=false`
10. [ ] Remove or archive demo data functions

---

## Environment Check

- [ ] `NEXT_PUBLIC_SUPABASE_URL` configured
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configured (for API routes)
- [ ] `isSupabaseConfigured()` returns true
- [ ] RLS policies created for all tables

---

## Recommended Next Round Priorities

{Based on the analysis, list the 3-5 most impactful things to flip first,
prioritizing entities that are closest to ready (have the most layers complete).}
```

### STEP 8 — SUMMARIZE

Print a one-line summary:
> Flip Readiness: XX% — Y entities ready, Z need work. Report: docs/roadmap/flip-readiness-report.md

---

## Lane

- **READS:** `web/lib/types/app.ts`, `web/lib/demo/demo-data-provider.ts`, `web/lib/demo/demo-data-wrapper.ts`, `web/supabase/migrations/*.sql`, `web/app/api/**/route.ts`, `web/app/dashboard/**/page.tsx`, `package.json`
- **WRITES:** `docs/roadmap/flip-readiness-report.md`
- **NEVER TOUCHES:** Application code (this is a read-only audit)

---

## Notes

- This skill is designed to run at any point during development
- The report is a snapshot — re-run after each build round to track progress
- The Gap Agent (PB-8) covers requirement coverage; this skill covers infrastructure readiness
- Once score hits 80%+, the `--prepare-flip` flag on post-build.sh can be used to prioritize the remaining work
