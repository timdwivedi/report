# Demo-to-Production Strategy

> Design document for transitioning BrandOps from demo data to live Supabase.
> This is a FUTURE feature spec — no code changes in this round.

---

## Current Architecture

```
Page Component
  └── getDemoClients()  ← direct import from demo-data-provider.ts
      └── returns hardcoded array of demo entities
```

**Target Architecture:**

```
Page Component
  └── fetch('/api/clients')  ← API route call
      └── isSupabaseConfigured()?
          ├── YES → query Supabase (real data)
          └── NO  → return getDemoClients() (fallback)
```

The `getDemoOrReal()` wrapper already exists at `lib/demo/demo-data-wrapper.ts`
but is currently unused by dashboard pages.

---

## The Problem

Every dashboard page imports `getDemoX()` directly from `demo-data-provider.ts`.
This means:

1. Pages render instantly (no loading states needed)
2. Zero Supabase dependency (works on any Vercel deploy)
3. But there's no path to real data without touching every page

The demo data serves two purposes:
- **Development/Sales:** Makes the app look alive for demos and client pitches
- **Onboarding:** New clients see a populated app instead of empty screens

We want to preserve BOTH purposes while adding a path to production.

---

## Flip Strategy: Three Phases

### Phase 1: Wire the Plumbing (Build Rounds)

**Goal:** Every entity has Types + Demo Data + SQL Table + API Route.

Steps:
1. Generate missing SQL migrations (vendors, tickets, address_books, etc.)
2. Add missing columns to existing tables
3. Create API routes for entities that don't have them
4. API routes use the pattern: `isSupabaseConfigured() ? querySupabase() : getDemoX()`

**Result:** API routes exist for everything. They return demo data by default,
real data when Supabase is connected.

### Phase 2: Rewire Pages (Build Rounds)

**Goal:** Every page calls API routes instead of `getDemoX()` directly.

Steps:
1. Replace direct `getDemoX()` imports with `fetch('/api/{entity}')` calls
2. Add loading states (skeleton screens) for the async fetch
3. Add error states with retry buttons
4. Pages now work with EITHER demo or real data transparently

**Result:** Pages are data-source agnostic. The API route decides what to return.

### Phase 3: Client Onboarding Flow (Future Feature)

**Goal:** New clients transition from demo data to their own data naturally.

#### Onboarding Cards Concept

When a new client signs up, the app is pre-populated with demo data.
An onboarding checklist appears in the dashboard:

```
Welcome to BrandOps!

Your account is set up with sample data so you can explore.
Complete these steps to set up your own workspace:

[ ] Add your first client          → replaces demo client
[ ] Create your first project      → replaces demo project
[ ] Upload your first product      → replaces demo product
[ ] Invite a team member           → unlocks collaboration
[ ] Connect your first vendor      → replaces demo vendor

Progress: 1/5 complete
```

Each completed step:
1. Creates a REAL entity in Supabase
2. Marks the corresponding demo entity as hidden (soft-delete)
3. Updates the progress indicator
4. Shows a success animation

#### Demo Data Lifecycle

```
New Signup
  └── App pre-seeded with demo data (flagged: is_demo = true)
      └── User creates real entities
          └── Demo entities become hidden (not deleted)
              └── User hits 3+ real entities
                  └── "Clear demo data" button appears
                      └── Demo data soft-deleted (restorable)
```

- Demo data rows have `is_demo: true` column
- Query filter: `WHERE is_demo = false OR is_demo IS NULL`
- "Show demo data" toggle in settings for training purposes
- Demo data is NEVER hard-deleted (can always be restored)

---

## Environment Variables

```env
# When false (or missing), API routes return demo data
NEXT_PUBLIC_DEMO_MODE=true

# When true + Supabase configured, API routes query real data
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Decision logic in API routes:**

```typescript
function shouldUseDemoData(): boolean {
  // Explicit demo mode override
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return true
  // No Supabase = demo mode
  if (!isSupabaseConfigured()) return true
  // Supabase configured = real data
  return false
}
```

---

## Migration Path for Existing Builds

For apps already deployed with demo data:

1. Run flip-readiness skill to assess current state
2. Use `--prepare-flip` flag on next post-build round
3. Pipeline agents prioritize: missing migrations → API routes → page rewiring
4. Deploy with Supabase env vars
5. Seed database OR let client add data via onboarding flow
6. Set `NEXT_PUBLIC_DEMO_MODE=false`

---

## What This Does NOT Cover

- Authentication system (separate concern, handled by AuthProvider)
- Multi-tenancy / RLS policies (handled by Plumber agent during migrations)
- Payment/billing integration
- Data import from external systems (CSV, Salesforce, etc.)

---

## Timeline Estimate

| Phase | Effort | When |
|-------|--------|------|
| Phase 1: Wire Plumbing | 1-2 build rounds | Next 1-2 rounds |
| Phase 2: Rewire Pages | 1 build round | After Phase 1 |
| Phase 3: Onboarding | 2-3 build rounds | After auth is connected |

The `--prepare-flip` flag on post-build.sh accelerates Phase 1 + 2 by telling
the pipeline agents to prioritize production readiness over new features.
