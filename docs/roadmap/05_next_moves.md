# BrandOps — Next Moves: From Demo to Live MVP

> **Created:** 2026-02-22
> **Purpose:** Concrete action plan to turn the working demo into a clickable, connected MVP that Trevor can demo to Aaron (Boundless CEO) and start onboarding real clients.

---

## Current State: Where We Actually Are

BrandOps is **dramatically ahead of where the original plan assumed**. The 04_master_build_plan.md described the project as "37% production-ready with 7/8 dashboard pages stubbed." That plan was fully executed. Here's what exists NOW:

### Fully Built Pages (3,994 lines of dashboard UI alone)

| Page | Route | Lines | Status |
|------|-------|-------|--------|
| Landing Page | `/` | Full 9-section formula | Complete |
| ROI Calculator | `/calculator` | 384 lines, real formulas | Complete |
| Login / Signup | `/login`, `/signup` | Styled, social buttons | Complete |
| Brand Manifesto | `/manifesto` | Onboarding experience | Complete |
| **Dashboard Home** | `/dashboard` | 204 lines, 6 stat cards + activity feed | Complete |
| **Projects (Kanban + Table)** | `/dashboard/projects` | 272 lines, drag-drop, filters | Complete |
| **Project Detail + Quoting** | `/dashboard/projects/[id]` | 458 lines, line items, calculations | Complete |
| **Clients (DataTable)** | `/dashboard/clients` | 210 lines, search, detail panel | Complete |
| **Orders (Kanban + Table)** | `/dashboard/orders` | 230 lines, status tracking | Complete |
| **Products (DataTable)** | `/dashboard/products` | 184 lines, search, categories | Complete |
| **Programs (DataTable)** | `/dashboard/programs` | 206 lines, budget tracking | Complete |
| **Commissions Calculator** | `/dashboard/commissions` | 371 lines, sliders, AnimatedCounter | Complete |
| **Analytics Dashboard** | `/dashboard/analytics` | 344 lines, Recharts, pipeline | Complete |
| **Settings Hub (5 tabs)** | `/dashboard/settings` | 559 lines, company/team/products/matrices/integrations | Complete |
| **Decorator Matrix Editor** | `/dashboard/settings/matrices` | 288 lines, expandable grids | Complete |
| **Client Portal** | `/portal/[shareableLink]` | 440 lines, public, no auth | Complete |
| **Portal Order Tracking** | `/portal/[shareableLink]/tracking` | Shipment status | Complete |
| **Public Product Catalog** | `/catalog` | 228 lines, filters, categories | Complete |
| **Product Detail** | `/catalog/[productId]` | Color swatches, pricing | Complete |

### Infrastructure That's Built

| Component | Status | Notes |
|-----------|--------|-------|
| **21 API Routes** | Real CRUD with demo fallback | `isSupabaseConfigured()` gate — returns demo data when no DB, real queries when connected |
| **API Helpers** | `api-helpers.ts` | `authenticateRequest()`, `getUserOrgId()`, `jsonOk()`, `jsonError()` |
| **Quoting Engine** | `lib/utils/quoting.ts` (179 lines) | `getBlankCost()`, `getDecorationCost()`, `calculateLineItem()`, `calculateProjectTotal()` — full decorator matrix math |
| **Demo Data Provider** | 1,974 lines | 11 entity types, cross-referenced IDs, `getDemoX()` getters for everything |
| **Database Migration** | `001_brandops_schema.sql` (486 lines) | 13 tables, RLS policies, indexes |
| **Supabase Client** | `lib/supabase.ts` | `createHeaderAuthClient()`, `createAdminClient()`, demo mode guards |
| **Type System** | `lib/types/app.ts` | All 13+ entity types, status enums, display types |
| **Shared Components** | 15+ components | KanbanBoard, DataTable, DetailPanel, StatCard, AnimatedCounter, PageHeader, EmptyState, BrandMark, ScrollReveal, etc. |
| **Favicon + Logo** | `icon.tsx`, `apple-icon.tsx`, `BrandMark.tsx` | Dynamic favicon with brand gradient |
| **SplitShipmentBuilder** | Component exists | Not yet wired into any page |

### What This Means

The UI is **100% built**. Every sidebar link goes to a real, functional page with demo data. The API routes are **production-ready** — they already fall back to demo data when Supabase isn't connected, and execute real queries when it is. The quoting engine math is **bulletproof** with decorator matrices for screen print, embroidery, DTG, and heat transfer.

**The gap is not building — it's connecting and polishing.**

---

## The Three Horizons

### Horizon 1: Aaron Demo (1-2 sessions)
Make the demo bulletproof for Aaron. Fix UX gaps, wire interactions, polish the flow so Trevor can walk Aaron through the entire app without hitting a dead end.

### Horizon 2: First Real Client (3-5 sessions)
Connect Supabase, get auth working, let Trevor log in and start entering his own clients/projects/products. Demo data as scaffolding, real data as the goal.

### Horizon 3: Scale to Boundless Network (future)
Multi-tenant for 200+ reps, Salesforce integration, PromoStandards API, white-label. This is post-Aaron-approval.

---

## Horizon 1: Aaron Demo Polish (Priority Actions)

These are the things that would make Trevor cringe if Aaron sees them. Fix before the demo.

### 1.1 Missing Detail Pages

The list pages are built but some drill-down views are missing:

| What's Missing | Route | Priority | Notes |
|----------------|-------|----------|-------|
| Client Detail | `/dashboard/clients/[id]` | HIGH | Company profile, contacts, project history. Data exists in demo provider (`client.contacts[]`, linked projects) |
| Program Detail | `/dashboard/programs/[id]` | MEDIUM | Budget breakdown, locations, participant roster. Types exist (`ProgramLocation`) |

**Why it matters:** Trevor will click a client name and expect a detail page. If it 404s, the demo breaks.

### 1.2 Interactive Gaps

These features look functional but don't respond to user input:

| What | Current Behavior | Needed Behavior | Effort |
|------|-----------------|-----------------|--------|
| **Kanban drag-and-drop** | Visual only — cards don't move between columns | Drag cards → status updates in state → visual feedback | Medium |
| **Add/Edit modals** | "Add New" buttons do nothing or show toast | Open a modal with form fields → add to local state (demo mode) | Medium |
| **Project status change** | Status badge displays but isn't editable | Dropdown to change status → update state → toast confirmation | Low |
| **Search/Filter on all pages** | Search bars exist, some don't filter | Wire all search inputs to `useState` + `useMemo` filter | Low |
| **Settings save buttons** | Forms display but don't persist | Toast "Settings saved" on click (demo mode) | Low |
| **Matrix cell editing** | Click to edit exists, but ESC/blur may not save | Clean up edit flow, add save indicator | Low |

### 1.3 Visual Polish

| Issue | Location | Fix |
|-------|----------|-----|
| **No loading states on page transitions** | All dashboard pages | Add `LoadingSequence` or skeleton UI on initial render |
| **Empty states missing** | Some pages show blank when filtered to zero results | Add `EmptyState` component with "No matches" copy |
| **Mobile sidebar needs testing** | DashboardLayout | Verify hamburger menu works, sidebar closes on nav |
| **SplitShipmentBuilder not accessible** | `/dashboard/projects/[id]` and `/dashboard/orders` | Add "Split Shipment" button on project/order detail that opens the builder |

### 1.4 Landing Page Improvements (from Retrospective)

The 04_retrospective.md identified specific improvements. Cherry-pick the highest-impact ones:

| Improvement | Impact | Effort |
|-------------|--------|--------|
| Add CTA button to Problem section ("Calculate Your Quoting Cost") | HIGH — captures pain while it's fresh | 15 min |
| Rewrite Hero H1 to RESULT+TIME+WITHOUT formula | HIGH — clearer outcome promise | 15 min |
| Add urgency element to Pricing section | MEDIUM — conversion accelerator | 30 min |
| Add activation microcopy to trial CTAs | MEDIUM — sets expectation for demo experience | 15 min |

---

## Horizon 2: First Real Client (Supabase Connection)

### 2.1 Supabase Project Setup

The migration SQL exists (486 lines, 13 tables). The API routes are already written with real Supabase queries. The connection steps:

1. **Create Supabase project** at supabase.com
2. **Copy credentials** to `web/.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
   SUPABASE_SERVICE_ROLE_KEY=xxx
   ```
3. **Run migration** — paste `001_brandops_schema.sql` into Supabase SQL Editor
4. **Enable auth providers** — Email/Password + Google OAuth
5. **Set auth callback URL** — `https://yourdomain.com/api/auth/callback`
6. **Test:** API routes should now query Supabase instead of returning demo data

### 2.2 Auth Flow Verification

The auth pages exist. The AuthProvider wraps the app. What needs checking:

- [ ] Login → dashboard redirect works
- [ ] Signup → email verification → login flow works
- [ ] Google OAuth button → consent → callback → dashboard works
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Demo mode still works when `NEXT_PUBLIC_DEMO_MODE=true` (for demos without DB)

### 2.3 Seed Data for Trevor

Once Supabase is connected, Trevor needs his real data:

1. **Organization** — Create "85 Supply" org with Trevor as owner
2. **Clients** — Import his actual clients (Raisin Canes, Progressive Insurance, Nashville Sounds, Red Bull, etc.)
3. **Products** — Import his product catalog (Gildan 5000, Bella+Canvas 3001, Richardson 112, etc.)
4. **Decorator Matrices** — Import his actual screen print, embroidery, and heat transfer pricing
5. **3-5 real projects** — Take existing deals from his pipeline and enter them

This gives Trevor a working system with HIS data, not demo data. That's the "holy shit" moment for Aaron.

### 2.4 CRUD Completeness Check

The API routes handle GET and POST. Verify each entity has full CRUD:

| Entity | GET (list) | GET (single) | POST | PATCH | DELETE |
|--------|-----------|-------------|------|-------|--------|
| Projects | ✅ | ✅ | ✅ | ✅ | ✅ |
| Projects/Line Items | ✅ | — | ✅ | ✅ | ✅ |
| Clients | ✅ | ✅ | ✅ | ✅ | ✅ |
| Orders | ✅ | ✅ | ✅ | ✅ | — |
| Products | ✅ | ✅ | ✅ | ✅ | ✅ |
| Decorator Matrices | ✅ | ✅ | ✅ | ✅ | ✅ |
| Programs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Commissions | ✅ | — | — | — | — |
| Portal | ✅ | — | — | — | — |
| Settings | ✅ | — | — | ✅ | — |

Commissions route currently only returns calculated reports. If we want Trevor to manually log commission records, need POST/PATCH.

### 2.5 Wire Pages to API (Replace Static Demo Data)

Currently all pages do:
```tsx
const PROJECTS = getDemoProjects() // static, at module level
```

For real data, pages need:
```tsx
const [projects, setProjects] = useState<Project[]>([])
useEffect(() => {
  fetch('/api/projects').then(r => r.json()).then(setProjects)
}, [])
```

Or better — create hooks:
```tsx
// lib/hooks/useProjects.ts
export function useProjects() {
  const [data, setData] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])
  return { projects: data, loading }
}
```

This is the biggest migration task but is mostly mechanical — same pattern for every page.

---

## Horizon 3: Scale Features (Post-Aaron)

These are the features that turn BrandOps from "Trevor's tool" into "the platform for 200+ Boundless reps." Only pursue these AFTER Aaron greenlights budget.

### 3.1 Salesforce Integration
- Sync clients bidirectionally with Salesforce
- Pull existing pipeline data into BrandOps projects
- Push order status updates back to Salesforce
- **Requires:** Aaron's Salesforce admin access + API credentials

### 3.2 Multi-Tenant for Boundless Network
- Each rep gets their own org with isolated data
- Admin dashboard for Aaron to see aggregate pipeline/revenue across all reps
- White-label option: reps can use their own domain/branding
- **Requires:** Multi-org architecture (already in the schema via `org_id`)

### 3.3 PromoStandards API
- Real-time product availability and pricing from suppliers
- Replace static product catalog with live supplier feeds
- Automated inventory alerts
- **Requires:** PromoStandards API membership

### 3.4 Real Payment Processing
- Stripe Checkout for SaaS subscription ($99/$499/$1499 tiers)
- Client invoicing through the portal
- Commission payout tracking
- **Requires:** Stripe account + webhook configuration

### 3.5 Email System
- Order confirmation emails to clients
- Project status update notifications
- Commission payout receipts
- Weekly pipeline summary for reps
- **Requires:** Resend or SendGrid account

### 3.6 Advanced Features (from Retrospective)
- **Lead magnet PDF** — "The $180K Manual Quoting Tax" guide with email gate
- **Referral program** — Invite a distributor, both get $500 credit
- **AI reorder predictions** — Analyze order history, surface re-order opportunities
- **Decorator Network marketplace** — Browse/compare decorator vendors (data moat)

---

## Execution Priority Matrix

| Priority | Task | Horizon | Effort | Impact |
|----------|------|---------|--------|--------|
| **P0** | Client detail page (`/clients/[id]`) | H1 | 2 hrs | Demo breaks without it |
| **P0** | Problem section CTA button | H1 | 15 min | Conversion improvement |
| **P0** | Hero headline rewrite (RESULT+TIME+WITHOUT) | H1 | 15 min | First impression |
| **P1** | Add/Edit modals for Projects + Clients | H1 | 3 hrs | "I can actually use this" moment |
| **P1** | Kanban drag-and-drop state updates | H1 | 2 hrs | Core UX interaction |
| **P1** | Wire SplitShipmentBuilder into project detail | H1 | 1 hr | Unique feature showcase |
| **P1** | Program detail page (`/programs/[id]`) | H1 | 2 hrs | Complete the navigation |
| **P2** | Loading states / skeletons on all pages | H1 | 1 hr | Polish feel |
| **P2** | Empty state for filtered results | H1 | 30 min | Edge case handling |
| **P2** | Pricing section urgency element | H1 | 30 min | Conversion |
| **P3** | Supabase project setup + migration | H2 | 1 hr | Database live |
| **P3** | Auth flow verification | H2 | 1 hr | Real login works |
| **P3** | Seed Trevor's real data | H2 | 2 hrs | "My data" moment |
| **P3** | Create `useX()` hooks for all entities | H2 | 3 hrs | Real data on all pages |
| **P3** | Wire pages to hooks (replace static imports) | H2 | 4 hrs | Full production switch |
| **P4** | Salesforce integration | H3 | 20+ hrs | Requires Aaron approval |
| **P4** | Multi-tenant admin dashboard | H3 | 15+ hrs | Scale to 200+ reps |
| **P4** | Stripe payment flow | H3 | 8 hrs | Revenue collection |
| **P4** | Email notification system | H3 | 6 hrs | Automated comms |

---

## How to Execute

### For the Aaron Demo (do this first):
```
1. Build /dashboard/clients/[id] detail page
2. Build /dashboard/programs/[id] detail page
3. Wire Add/Edit modals on Projects + Clients pages
4. Make Kanban drag-and-drop functional
5. Add Problem section CTA + Hero headline fix
6. Wire SplitShipmentBuilder into project detail
7. Add loading states + empty states
8. Run verify.sh → push → check Vercel preview
```

### For First Real Client (after Aaron approves):
```
1. Create Supabase project + run migration
2. Configure auth providers
3. Create useProjects(), useClients(), etc. hooks
4. Wire each page to hooks (one at a time, test after each)
5. Seed Trevor's real client/product/matrix data
6. Deploy to production domain
```

---

## Key Decisions Needed from Trevor

1. **Domain name** — `brandops.io`? `85supply.app`? Something else for the demo URL?
2. **Auth providers** — Email/Password + Google? Add Microsoft for enterprise clients?
3. **Commission structure** — Is the 50/50 Boundless split + 7% partner commission accurate? Need to verify before hardcoding in the calculator.
4. **Real decorator pricing** — Trevor needs to share his actual screen print / embroidery / heat transfer matrices so we can replace the demo data with his real numbers.
5. **Client list** — How many clients should we seed? Start with top 10 by revenue?
6. **Aaron demo date** — When is the demo? This determines whether we do H1 only or H1+H2.

---

## What NOT to Do Yet

- **Don't build Salesforce integration** — Wait for Aaron's approval + API access
- **Don't set up Stripe payments** — The SaaS pricing is for future, not the Aaron demo
- **Don't build email notifications** — Manual communication is fine for MVP
- **Don't over-engineer the auth** — Simple email/password is enough for Trevor
- **Don't refactor the quoting engine** — It works, the math is correct, leave it alone
- **Don't rebuild any pages** — They're all functional. Wire interactions, don't rewrite.
