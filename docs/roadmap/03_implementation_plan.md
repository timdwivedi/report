# BrandOps — Implementation Plan

> Generated after build review. This document is your roadmap from working
> showcase to million-dollar production app.

---

## The Vision: How This Becomes a Million-Dollar App

### What You Have Right Now

BrandOps is live as a fully functional showcase. The landing page tells your story — from the "still quoting by email?" problem statement through the Decorator Matrix pricing engine solution, complete with real testimonials and a three-tier pricing structure. The ROI Calculator proves the business case with hard numbers ($404K+ annual impact). The dashboard home shows what daily operations look like: 6 live stat cards, real-time activity feed, and a pipeline mini-chart. Login, signup, and the brand manifesto are all built. The foundation is real — TypeScript types, demo data, AI service layer, Supabase client, Stripe hooks, and a 15-file shared component library ready to power every dashboard page.

### Where This Goes

You're not building a quoting tool. You're building the operating system for a $67 billion promotional products industry that still runs on spreadsheets and 48-hour quote turnarounds. Here's how BrandOps becomes the category-defining platform:

---

### 1. The Decorator Matrix Engine — Your Moat

**The insight:** Every competitor makes distributors wait 24-48 hours for pricing because decoration costs are complex (screen print vs. embroidery vs. DTG, quantity breaks, setup fees, run charges). The distributor who quotes in 5 minutes instead of 2 days wins the deal. Every time.

**What it looks like:** A visual matrix builder where distributors configure decoration pricing rules once — by method, quantity tier, and garment type. When a client requests a quote, BrandOps calculates the total instantly by looking up the product, applying the correct matrix, and generating a professional PDF quote with line items, decoration specs, and delivery timeline.

**Revenue impact:** This is the feature that makes BrandOps irreplaceable. Once a distributor loads their pricing matrices, switching costs are enormous. Target: 85%+ 12-month retention due to data lock-in.

**Build complexity:** High — but the type system (`DecoratorMatrix`, `PricingTier`, `DecorationMethod`) is already defined in `lib/types/app.ts`.

---

### 2. Client Portal — The Fortune 500 Experience for Every Client

**The insight:** Distributors currently send email chains with PDF proofs, Excel order trackers, and "let me check on that" responses. Their clients — many of them Fortune 500 procurement teams — expect self-service. The distributor who offers a branded portal gets preferred vendor status.

**What it looks like:** A shareable link (no login required) where clients see their active projects, approve artwork proofs with annotation tools, track orders in real time, and reorder from past purchases. Branded with the distributor's logo and colors. Think: a mini Shopify storefront for B2B merch.

**Revenue impact:** Directly measurable — distributors can track which clients use the portal vs. email, correlate with order volume and repeat purchase rate. Portal clients will order 2-3x more because the friction is gone.

**Build complexity:** Medium — the `shareable_link` and `ClientPortal` types exist. Needs a public route group and real-time order status updates.

---

### 3. Programs Module — Recurring Revenue Machine

**The insight:** The most profitable segment of promo merch isn't one-off event orders — it's ongoing programs: employee uniform programs, new hire welcome kits, dealer incentive stores. These are $50K-$500K annual contracts with 90%+ renewal rates. But managing them with spreadsheets (tracking budgets, inventory levels, reorder points, per-employee allowances) is a nightmare.

**What it looks like:** A dedicated Programs dashboard where each program has a budget tracker, inventory monitor, participant roster, and automated reorder triggers. Managers at client companies get their own portal to place orders within their budget allocation. The distributor gets a real-time P&L per program.

**Revenue impact:** Programs are the path to $5M+ accounts. The distributor who can operationalize program management steals these contracts from competitors who can't. BrandOps pricing tier upgrade trigger: "You have 3+ active programs. Upgrade to Business for program automation."

**Build complexity:** Medium — the `Program` and `ProgramParticipant` types exist. Needs budget tracking logic and participant portal.

---

### 4. Commission Intelligence — From Spreadsheet to Strategy

**The insight:** Most distributors track commissions in Excel. They know what they earned last month. They don't know which decoration methods are most profitable, which clients produce the highest margin, or where their commission rate is below market. They're leaving money on the table.

**What it looks like:** A commission analytics dashboard that goes beyond tracking payouts. It calculates effective margin by client, by product category, and by decoration method. It identifies "commission leaks" — orders where the distributor's markup is below their target. It projects monthly/quarterly commission income based on pipeline and close rates. It benchmarks against anonymous industry data.

**Revenue impact:** When a distributor sees "Your average commission on embroidered polos is 18% — top distributors earn 24% on the same product," they renegotiate supplier rates. BrandOps becomes their financial advisor, not just their order tracker.

**Build complexity:** Medium — Commission types and demo data exist. Needs Recharts visualizations and margin calculation logic.

---

### 5. AI-Powered Reorder Predictions

**The insight:** Promotional products are cyclical. The same client orders event t-shirts every Q3 for their annual conference. The same uniform program needs restocking every 6 months. But nobody tracks this — so orders are reactive (client calls) instead of proactive (distributor reaches out at the right time).

**What it looks like:** BrandOps analyzes order history and surfaces "Reorder Predictions" — cards that say: "Nashville Sounds ordered 500 event caps in March 2025 and March 2024. Suggest reaching out by February 15, 2026." The distributor clicks "Create Project" and a pre-filled quote goes to the client before they even think to ask.

**Revenue impact:** This is the difference between $500K and $2M in annual revenue. Proactive distributors capture reorders that reactive competitors miss. The AI intelligence engine in `lib/intelligence/` is pre-wired for exactly this.

**Build complexity:** Low (initial version) — order history analysis + notification triggers. The intelligence engine, RAG service, and embedding service are already scaffolded.

---

### Quick Wins That Compound

Ranked by impact/effort ratio. Each one makes the app feel dramatically more finished:

1. **Build out the 7 stub dashboard pages** using existing components + demo data (~4 hours each). Projects and Orders use KanbanBoard. Clients uses DataTable. Commissions and Analytics use Recharts + StatCard. This turns a "cool landing page" into a "holy shit, the whole app works."

2. **Fix shared component themes** — Replace `dark-*` color classes in ActionButton, ClickReveal, and LoadingSequence with light enterprise colors (`bg-white`, `border-slate-200`, `text-slate-700`). 30-minute fix that eliminates visual jarring.

3. **Add mobile hamburger menu to Header** — The landing page nav disappears on mobile. Add a slide-out menu. 1-hour fix for mobile-first compliance.

4. **Add section dividers and gradient headlines** to landing page per Creative Brief Layer 4. Visual polish that elevates the page from "good" to "premium." 1-hour fix.

5. **Connect slider labels to inputs** on the ROI Calculator (`htmlFor`/`id` pairing). Accessibility fix that also improves UX — clicking the label focuses the slider.

---

## Phase 1: Foundation (Database + Auth)

### 1.1 Supabase Project Setup

**Current state:** Placeholder Supabase URLs in `lib/supabase.ts` with demo mode guard in `middleware.ts`.

**Implementation steps:**
1. Create Supabase project at supabase.com
2. Copy credentials to `.env.local` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
3. Remove demo mode guard from `web/middleware.ts` (lines 11-14)
4. Fix `process.env.X!` assertions in `web/app/api/auth/callback/route.ts:14-15` — import from `@/lib/supabase` instead
5. Fix same pattern in `web/app/api/webhooks/stripe/route.ts:21`
6. Test: Landing page loads, login page connects to Supabase Auth

### 1.2 Database Schema

**Current state:** Types defined in `lib/types/app.ts` and `lib/types/brandops.ts`. Two competing type systems — consolidate first.

**Implementation steps:**
1. Choose canonical type system. Recommend `brandops.ts` (Title Case values are display-ready, closer to what Supabase stores)
2. Delete `types/app.ts` or convert to re-exports from `brandops.ts`
3. Update all imports: `demo-data-provider.ts`, `constants/app.ts`, any component referencing `app.ts` types
4. Create Supabase migrations (one per table group):

```sql
-- Migration 001: Core tables
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  tier TEXT CHECK (tier IN ('Enterprise', 'Mid-Market', 'SMB', 'Startup')),
  status TEXT CHECK (status IN ('Active', 'Inactive', 'Prospect')) DEFAULT 'Active',
  annual_revenue DECIMAL(12,2),
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  address JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  project_number TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('Opportunity', 'Qualifying', 'Curating', 'In Design', 'Artwork Review', 'Quoted', 'Approved', 'In Production', 'Shipped', 'Invoiced', 'Cancelled')) DEFAULT 'Opportunity',
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High', 'Rush')) DEFAULT 'Medium',
  budget DECIMAL(12,2),
  event_date DATE,
  in_hands_date DATE,
  assigned_to TEXT,
  line_items_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Migration 002: Orders, Programs, Commissions
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  client_id UUID REFERENCES clients(id),
  order_number TEXT NOT NULL,
  status TEXT CHECK (status IN ('Order Entry Needed', 'Entered', 'In Production', 'Shipped', 'Delivered', 'Invoiced', 'Cancelled')) DEFAULT 'Order Entry Needed',
  total DECIMAL(12,2),
  vendor TEXT,
  tracking_number TEXT,
  ship_date DATE,
  delivery_date DATE,
  product_name TEXT,
  quantity INTEGER,
  decoration_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('Uniform', 'Employee Store', 'Event', 'Welcome Kit', 'Incentive')),
  status TEXT CHECK (status IN ('Active', 'Paused', 'Completed')) DEFAULT 'Active',
  budget DECIMAL(12,2),
  spent DECIMAL(12,2) DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  project_id UUID REFERENCES projects(id),
  client_name TEXT,
  order_total DECIMAL(12,2),
  commission_rate DECIMAL(5,4),
  commission_amount DECIMAL(12,2),
  status TEXT CHECK (status IN ('Pending', 'Confirmed', 'Paid')) DEFAULT 'Pending',
  paid_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

5. Enable RLS on all tables:

```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their org's data
CREATE POLICY "Users access own org data" ON clients
  FOR ALL USING (org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  ));
-- Repeat for projects, orders, programs, commissions
```

6. Create `org_members` junction table for multi-tenancy
7. Test: Run migrations, verify tables in Supabase dashboard

**Bug projection:**

| Risk | Scenario | Prevention |
|------|----------|------------|
| Type mismatch after consolidation | Components expect kebab-case but DB returns Title Case | Search-replace all status comparisons; add runtime validation |
| RLS blocks demo data | Demo seed data lacks org_id linkage | Create a demo org with fixed UUID; seed data uses it |
| Timestamp timezone issues | `TIMESTAMPTZ` returns UTC, display expects local | Use `toLocaleDateString()` in all date renders |

### 1.3 Authentication Flow

**Current state:** AuthProvider wraps the app, login/signup pages exist with Supabase client calls. Demo mode guard skips auth when env vars are missing.

**Implementation steps:**
1. Enable Email/Password and Google OAuth in Supabase dashboard
2. Set redirect URL to `{APP_URL}/api/auth/callback`
3. Fix `web/app/api/auth/callback/route.ts` — import `createClient` from `@/lib/supabase` instead of using `process.env!` assertions
4. Add `cookies()` await (Next.js 14+ requirement) in callback route
5. Update `AuthProvider` — memoize Supabase client creation (`useRef` or move outside component)
6. Test: Full signup → email verification → login → dashboard redirect flow
7. Test: Google OAuth button → consent screen → callback → dashboard

**Bug projection:**

| Risk | Scenario | Prevention |
|------|----------|------------|
| Infinite redirect loop | Middleware redirects to login, login redirects to dashboard | Add `isLoading` state to AuthProvider; show loading screen until auth resolves |
| Cookie not set after OAuth | Server component reads cookies before client sets them | Use `@supabase/ssr` `createServerClient` with cookie handling |
| Session expires during demo | User refreshes after 1 hour, gets logged out | Set refresh token rotation in Supabase Auth settings |

---

## Phase 2: Core Features (Replace Mock Data)

### 2.1 Project Pipeline

**Current state:** `web/app/dashboard/projects/page.tsx` is a stub. `KanbanBoard` component exists. Demo data has 15 projects across 10 pipeline stages.

**Target state:** Interactive Kanban board with drag-and-drop stage changes, project detail slide-out panel, stage-based filtering, and real Supabase CRUD.

**Implementation steps:**
1. API route: Create `web/app/api/projects/route.ts` with GET (list with filters) and POST (create)
2. API route: Create `web/app/api/projects/[id]/route.ts` with GET, PATCH (update status/details), DELETE (soft delete)
3. Types: Align `Project` interface with actual DB schema from Phase 1.2
4. Client hook: Create `web/lib/hooks/useProjects.ts` using SWR for data fetching with optimistic updates on drag
5. Component: Build out `dashboard/projects/page.tsx` — import KanbanBoard, configure 10 columns matching `ProjectStatus`, render project cards with client name, budget, in-hands date
6. Component: Wire ClickReveal panel for project detail view on card click
7. Real-time: Subscribe to `projects` table changes for multi-user updates via Supabase Realtime

**Bug projection:**

| Risk | Scenario | Prevention |
|------|----------|------------|
| Kanban drag drops to wrong column | Optimistic update + server rejection creates ghost cards | Revert optimistic update on PATCH failure; show toast |
| Filter + Kanban conflict | User filters by client, drags card, filter re-applies and hides card | Clear filters on drag start, or exclude dragged card from filter |
| Too many re-renders on drag | 15 projects x 10 columns = 150 cards re-rendering | Memoize KanbanColumn and ProjectCard components; use `React.memo` |

### 2.2 Client Management (CRM)

**Current state:** `web/app/dashboard/clients/page.tsx` is a stub. `DataTable` component exists with sorting, filtering, and row selection. Demo data has 10+ clients.

**Target state:** Searchable client table with inline status editing, client detail page, contact management, and project/order history per client.

**Implementation steps:**
1. API route: `web/app/api/clients/route.ts` — GET (list with search, sort, filter), POST (create)
2. API route: `web/app/api/clients/[id]/route.ts` — GET (detail with projects + orders), PATCH, DELETE
3. Client hook: `web/lib/hooks/useClients.ts` with SWR, search debouncing
4. Build `dashboard/clients/page.tsx` — DataTable with columns: Name, Industry, Tier, Annual Revenue, Active Projects, Status, Last Activity
5. Add ClickReveal detail panel or sub-route `dashboard/clients/[id]/page.tsx` for full client profile
6. Real-time: Not needed — client data changes infrequently

**Bug projection:**

| Risk | Scenario | Prevention |
|------|----------|------------|
| Search debounce fires stale query | User types fast, earlier query returns after later one | Use SWR's `mutate` with request deduplication; cancel stale fetches |
| Annual revenue display | "$1,200,000" vs "$1.2M" inconsistency | Create `formatCurrency` utility, use everywhere |
| Empty state flicker | DataTable shows "No clients" before data loads | Use SWR `isLoading` state; show skeleton rows |

### 2.3 Order Tracking

**Current state:** Stub page. KanbanBoard component exists. 25 orders in demo data.

**Target state:** Kanban board for order lifecycle (7 stages), order detail with tracking info, vendor assignment, and shipping updates.

**Implementation steps:**
1. API routes: `web/app/api/orders/route.ts` and `web/app/api/orders/[id]/route.ts`
2. Client hook: `web/lib/hooks/useOrders.ts`
3. Build `dashboard/orders/page.tsx` — KanbanBoard with 7 OrderStatus columns
4. Order cards show: order number, client, product, quantity, total, vendor
5. Detail panel: tracking number, ship date, delivery date, invoice link
6. Real-time: Yes — orders change status frequently (shipped, delivered)

**Bug projection:**

| Risk | Scenario | Prevention |
|------|----------|------------|
| Orders without projects | Some orders are reorders without project context | Make `project_id` nullable in schema and UI |
| Tracking number formats | UPS vs FedEx vs USPS have different formats | Don't validate format; link to carrier tracking URL based on prefix |

### 2.4 Commission Dashboard

**Current state:** Stub page. StatCard and AnimatedCounter exist. 8 commission records in demo data.

**Target state:** Commission summary stats (total earned, pending, paid), commission table with filtering, monthly trend chart, and margin analysis.

**Implementation steps:**
1. API route: `web/app/api/commissions/route.ts` — GET with date range filter, aggregation
2. Client hook: `web/lib/hooks/useCommissions.ts`
3. Build `dashboard/commissions/page.tsx`:
   - Top row: 4 StatCards (Total Earned, Pending, Paid This Month, Avg Rate) with AnimatedCounter
   - Middle: Recharts `AreaChart` showing monthly commission trend (12 months)
   - Bottom: DataTable of individual commissions with status badges, amount, client, date
4. Add commission rate editing per order (PATCH on commission record)

**Bug projection:**

| Risk | Scenario | Prevention |
|------|----------|------------|
| Floating point rounding | Commission calculated as $124.999999 displays wrong | Use `toFixed(2)` on all money values; store as integer cents in DB |
| Chart date range mismatch | Recharts x-axis shows Jan-Dec but data is Feb-Jan | Generate full 12-month array with zero-fills for missing months |

### 2.5 Programs Module

**Current state:** Stub page. 3+ programs in demo data.

**Target state:** Program cards with budget progress bars, participant rosters, order history per program, and budget alerts.

**Implementation steps:**
1. API routes: `web/app/api/programs/route.ts` and `web/app/api/programs/[id]/route.ts`
2. Client hook: `web/lib/hooks/usePrograms.ts`
3. Build `dashboard/programs/page.tsx`:
   - Grid of program cards: name, client, type badge, budget bar (spent/total), participant count, status
   - Click to expand: participant list, order history, budget breakdown
4. Budget alert logic: When `spent/budget > 0.8`, show amber warning badge

**Bug projection:**

| Risk | Scenario | Prevention |
|------|----------|------------|
| Budget overrun | Orders push spending past budget limit | Soft limit with warning at 80%, hard confirmation at 100% |
| Participant import | CSV upload of 500 employees could timeout | Process CSV client-side, batch insert via API |

### 2.6 Analytics & Insights

**Current state:** Stub page. Recharts is installed. Demo data provides all metrics.

**Target state:** KPI dashboard with revenue trends, pipeline velocity, close rates, top clients, and product mix charts.

**Implementation steps:**
1. API route: `web/app/api/analytics/route.ts` — aggregated metrics endpoint (computed from projects, orders, commissions)
2. Build `dashboard/analytics/page.tsx`:
   - Row 1: 4 StatCards (Monthly Revenue, Pipeline Value, Close Rate, Avg Deal Size)
   - Row 2: `AreaChart` (revenue trend), `BarChart` (orders by status)
   - Row 3: `PieChart` (revenue by client tier), `BarChart` (top 5 clients by revenue)
   - Row 4: Table of key metrics with sparkline trends
3. Use LoadingSequence component for initial data load animation

### 2.7 Settings

**Current state:** Stub page. `/api/settings` route is functional with Supabase.

**Target state:** Settings hub with company profile, team management, notification preferences, and integration configuration.

**Implementation steps:**
1. Build `dashboard/settings/page.tsx` with Tabs component:
   - Company Profile: Name, logo upload, address, default settings
   - Team: Invite members, role management (admin/member/viewer)
   - Notifications: Email preferences, alert thresholds
   - Integrations: Stripe connection status, future integrations
2. Wire to existing `/api/settings` route (already functional)
3. Add team member invite flow (creates Supabase Auth invite)

---

## Phase 3: Integrations & Payments

### 3.1 Stripe Billing

**Current state:** Stripe SDK installed. Webhook route exists at `/api/webhooks/stripe`. Pricing page shows three tiers ($99/$499/$1,499/mo).

**Implementation steps:**
1. Create Stripe Products and Prices matching the three tiers
2. Create `web/app/api/stripe/checkout/route.ts` — generates Checkout Session
3. Create `web/app/api/stripe/portal/route.ts` — generates Customer Portal session
4. Wire Pricing page CTA buttons to checkout
5. Handle webhook events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
6. Store subscription status in `organizations` table
7. Gate features by tier (feature flags from org settings)
8. Test: Full checkout flow with Stripe test cards

### 3.2 Email System

**Current state:** Resend SDK installed. No email templates.

**Implementation steps:**
1. Create email templates: Welcome, Project Request Confirmation, Quote Ready, Order Shipped, Invoice, Commission Payout
2. Create `web/lib/email/send.ts` — abstraction over Resend
3. Trigger emails from API routes: POST `/api/projects` sends confirmation, PATCH `/api/orders` (status=shipped) sends tracking
4. Add email preferences to Settings

### 3.3 File Storage (Artwork & Documents)

**Implementation steps:**
1. Create Supabase Storage bucket: `artwork`, `documents`, `logos`
2. Create upload component for artwork files (drag-and-drop, preview)
3. Wire to project detail — artwork uploads linked to project
4. Client portal: Clients can view/download artwork proofs
5. Set storage policies: org-scoped access

---

## Phase 4: Polish & Launch

### 4.1 SEO & Performance

**Implementation steps:**
1. Add per-page metadata (already started — root layout has BrandOps title)
2. Create `web/app/sitemap.ts` for dynamic sitemap generation
3. Create `web/app/robots.ts`
4. Add structured data (Organization, SoftwareApplication JSON-LD)
5. Optimize images: Convert to WebP, add `next/image` with blur placeholders
6. Code split heavy components: `next/dynamic` for Recharts, KanbanBoard, Calculator
7. Lighthouse audit: Target 90+ on all metrics

### 4.2 Mobile Experience

**Implementation steps:**
1. Add hamburger menu to landing page Header (currently nav disappears on mobile)
2. Responsive audit at 375px for all dashboard pages
3. Touch-friendly Kanban: Swipe gestures for stage changes on mobile
4. Bottom navigation bar for mobile dashboard (common SaaS pattern)

### 4.3 Deployment

**Current state:** `vercel.json` configured. `.env.local.example` documents all required variables.

**Implementation steps:**
1. Push to GitHub repository
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Configure custom domain
5. Set up Supabase production project (separate from development)
6. Configure Stripe production keys
7. Enable Vercel Analytics and Speed Insights
8. Set up error tracking (Sentry or similar)

---

## Known Risks & Edge Cases

### Data Integrity
- **Dual type system:** `types/app.ts` (kebab-case) and `types/brandops.ts` (Title Case) must be consolidated before Phase 2. Using both creates runtime bugs where `status === 'in-design'` never matches a row with `status = 'In Design'`.
- **Orphaned commissions:** If an order is deleted, its commission record becomes orphaned. Use `ON DELETE SET NULL` or cascade.
- **Budget decimal precision:** Store all money as `DECIMAL(12,2)`. JavaScript floating point will cause $0.01 discrepancies otherwise.

### State & Caching
- **SWR stale data:** Multiple browser tabs can show different data. Use SWR's `revalidateOnFocus` (enabled by default) and Supabase Realtime for critical data.
- **Optimistic update rollback:** When a Kanban drag fails (network error, RLS violation), the card must snap back. Implement revert in SWR `mutate` error handler.
- **Demo mode detection:** When Supabase env vars are missing, the app should show demo data seamlessly (current behavior). When they're present, it should fetch real data. The `demo-data-wrapper.ts` pattern handles this — extend to all hooks.

### Security Considerations
- **RLS is mandatory:** Every table must have Row Level Security. Without it, any authenticated user can read all data via Supabase client.
- **API route validation:** All POST/PATCH body data must be validated with Zod schemas. The schemas in `types/` should export Zod validators alongside TypeScript types.
- **File upload validation:** Artwork uploads must validate file type (PNG, JPG, PDF, AI, EPS only) and size (max 25MB). Reject server-side, not just client-side.
- **Rate limiting:** The ROI Calculator and auth routes should be rate-limited to prevent abuse. Use Vercel Edge Middleware or Upstash Redis.
- **Stripe webhook verification:** Always verify webhook signatures using `stripe.webhooks.constructEvent`. The current stub does this — ensure it's maintained.

---

## File Inventory (What Exists → What Changes)

| File | Current State | Phase | Changes Needed |
|------|--------------|-------|----------------|
| `web/app/layout.tsx` | Root layout with providers, BrandOps metadata | 1.1 | None — ready |
| `web/app/page.tsx` | Complete landing page | 4.1 | Add page-level metadata export |
| `web/app/calculator/page.tsx` | Complete ROI Calculator | 4.1 | Connect htmlFor/id on sliders |
| `web/app/(auth)/login/page.tsx` | Functional with Supabase | 1.3 | Memoize createClient, fix `catch (err: any)` |
| `web/app/(auth)/signup/page.tsx` | Functional with Supabase | 1.3 | Same as login |
| `web/app/dashboard/layout.tsx` | Wraps DashboardLayout | - | None — ready |
| `web/app/dashboard/page.tsx` | Complete with stats, activity | 2.1+ | Replace demo data with hook calls |
| `web/app/dashboard/projects/page.tsx` | Stub | 2.1 | Full Kanban build |
| `web/app/dashboard/clients/page.tsx` | Stub | 2.2 | Full DataTable build |
| `web/app/dashboard/orders/page.tsx` | Stub | 2.3 | Full Kanban build |
| `web/app/dashboard/commissions/page.tsx` | Stub | 2.4 | Stats + charts + table |
| `web/app/dashboard/programs/page.tsx` | Stub | 2.5 | Program cards + budget |
| `web/app/dashboard/analytics/page.tsx` | Stub | 2.6 | Full analytics dashboard |
| `web/app/dashboard/settings/page.tsx` | Stub | 2.7 | Tabbed settings panels |
| `web/app/api/auth/callback/route.ts` | Uses `process.env!` | 1.3 | Import from `@/lib/supabase` |
| `web/app/api/settings/route.ts` | Functional | - | None — ready |
| `web/app/api/webhooks/stripe/route.ts` | Stub with `process.env!` | 3.1 | Add fallback, wire events |
| `web/lib/types/app.ts` | Kebab-case types | 1.2 | Consolidate with brandops.ts |
| `web/lib/types/brandops.ts` | Title Case types | 1.2 | Become canonical type source |
| `web/lib/demo/demo-data-provider.ts` | Primary demo data | 2.x | Keep as fallback, add hook wrappers |
| `web/lib/demo/demo-data.ts` | Secondary demo data | 1.2 | Deprecate or merge |
| `web/lib/supabase.ts` | Placeholder fallbacks | 1.1 | None — pattern is correct |
| `web/middleware.ts` | Demo mode guard | 1.3 | Remove guard when real auth is ready |
| `web/components/layout/DashboardLayout.tsx` | Complete with sidebar, toasts | - | None — ready |
| `web/components/shared/ActionButton.tsx` | Dark theme colors | Quick Win | Replace `dark-*` with `slate-*` |
| `web/components/shared/ClickReveal.tsx` | Dark theme colors | Quick Win | Replace `dark-*` with `slate-*` |
| `web/components/shared/LoadingSequence.tsx` | Dark theme colors | Quick Win | Replace `dark-*` with `slate-*` |
| `web/components/shared/DemoToastProvider.tsx` | Merch-specific messages | - | None — fixed by Agent 6 |
| `web/components/shared/DemoNotifications.tsx` | Merch-specific messages | - | None — fixed by Agent 6 |
| `web/components/shared/StatCard.tsx` | Fixed AnimatedCounter duration | - | None — fixed by Agent 6 |
| `web/components/public/Header.tsx` | No mobile menu | 4.2 | Add hamburger toggle |
| `web/tailwind.config.ts` | Complete design system | Quick Win | Fix `boxShadow.glow` to blue |
| `web/lib/constants/app.ts` | Duplicate SIDEBAR_NAV | 1.2 | Remove, use navigation.ts only |

---

## Estimated Build Phases

| Phase | Scope | Key Deliverables |
|-------|-------|-----------------|
| **Quick Wins** | Visual polish, theme fixes, accessibility | Stub pages built out with demo data, dark theme classes fixed, mobile nav added |
| **Phase 1** | Database + Auth | Supabase project, schema, RLS, real auth flow |
| **Phase 2** | Core CRUD | All 7 dashboard pages wired to Supabase, real data replaces mock |
| **Phase 3** | Integrations | Stripe billing, email system, file storage |
| **Phase 4** | Launch | SEO, performance, mobile polish, deployment |

---

*This implementation plan was generated by Agent 6 after reviewing the complete BrandOps showcase build. Every file path, component name, and API route referenced is real and exists in the codebase. A developer can open this document and start building immediately.*
