# BrandOps Master Build Plan

## Context

BrandOps was built by the Bloom agentic pipeline. The landing page, calculator, auth, and dashboard home are complete. However, **7 of 8 dashboard pages are stubbed** with "coming soon" placeholders. Components like KanbanBoard and DataTable exist but aren't wired.

This plan turns the showcase into a functional MVP that Trevor can demo to Aaron (Boundless CEO) to unlock budget + Salesforce API access.

**Current state:** 37% production-ready (5 public pages done, 1/8 dashboard pages done, 7 stubbed)
**Target state:** Phase 1 MVP — all core dashboard features functional with demo data, ready for Aaron demo

---

## Build Location

```
~/Desktop/bloom-builds/brandops/
```

---

## Architecture Decisions (Up Front)

1. **Type system:** Consolidate to `types/app.ts` (kebab-case) — it's more complete and matches Supabase conventions
2. **Demo data:** Use `demo-data-provider.ts` as the single source. Remove `demo-data.ts` redundancy
3. **Label maps:** Single source in `constants/app.ts`. Remove duplicates from demo-data-provider and label-maps
4. **Data layer:** All pages use `getDemoOrReal<T>()` wrapper — demo data now, Supabase later
5. **Styling:** Fix dark-theme components (ActionButton, ClickReveal, LoadingSequence) to light theme
6. **API routes:** Real CRUD routes with Supabase + demo fallback for each entity

---

## Build Order (16 Steps)

### Phase A: Foundation Fixes (Steps 1-3)

**Step 1: Consolidate Types & Demo Data**
- Remove `types/brandops.ts` (keep `types/app.ts`)
- Remove `demo/demo-data.ts` and `demo/label-maps.ts` (keep `demo-data-provider.ts`)
- Update all imports to point to single sources
- Fix dark-theme components → light theme (ActionButton, ClickReveal, LoadingSequence)
- **Files:** `lib/types/app.ts`, `lib/demo/demo-data-provider.ts`, `lib/constants/app.ts`, shared components

**Step 2: Database Schema (Supabase Migration)**
- Write full migration SQL for all 13 tables:
  - `clients`, `client_contacts`, `products`, `decorator_matrices`
  - `projects`, `project_line_items`, `orders`, `split_shipments`
  - `programs`, `program_locations`, `commission_records`
  - Extend existing: `organizations`, `organization_members`
- RLS policies: org_id based isolation
- **File:** `web/supabase/migrations/XXX_brandops_schema.sql`

**Step 3: API Route Scaffold**
- CRUD routes for each entity:
  - `/api/projects` (GET, POST)
  - `/api/projects/[id]` (GET, PATCH, DELETE)
  - `/api/projects/[id]/line-items` (GET, POST, PATCH, DELETE)
  - `/api/projects/[id]/confirm` (POST — generates orders)
  - `/api/clients` (GET, POST)
  - `/api/clients/[id]` (GET, PATCH, DELETE)
  - `/api/orders` (GET, POST, PATCH)
  - `/api/products` (GET, POST, PATCH, DELETE)
  - `/api/decorator-matrices` (GET, POST, PATCH, DELETE)
  - `/api/programs` (GET, POST, PATCH, DELETE)
  - `/api/commissions` (GET — calculated report)
  - `/api/portal/[shareableLink]` (GET — public, no auth)
- All routes: Supabase service role + demo fallback
- **Files:** `web/app/api/` directory

### Phase B: Core Admin Features (Steps 4-8)

**Step 4: Product Catalog (Admin)**
- Route: `/dashboard/settings/products` (or `/dashboard/products`)
- DataTable with: name, SKU, category, supplier, blank cost range, active toggle
- Add/Edit modal: name, SKU, category, images, colors (hex picker), sizes, blank_costs (tier editor), applicable decoration methods
- Delete with confirmation
- **Files:** `web/app/dashboard/products/page.tsx`, `web/components/dashboard/ProductForm.tsx`

**Step 5: Decorator Matrix Engine (Admin Config)**
- Route: `/dashboard/settings/matrices`
- List of matrices by decoration method
- Matrix editor: qty tier rows × color count columns → price per cell
- Pre-loaded templates: Screen Print, Embroidery, Heat Transfer, DTG
- Duplicate/delete matrix
- **THIS IS THE CORE FEATURE** — pricing accuracy depends on this
- **Files:** `web/app/dashboard/settings/matrices/page.tsx`, `web/components/dashboard/MatrixEditor.tsx`

**Step 6: Client Management (CRM)**
- Route: `/dashboard/clients`
- Wire existing DataTable component to client data
- Client list: company name, primary contact, email, phone, annual volume, last project
- Client detail view (`/dashboard/clients/[id]`): company profile, contacts (add/edit/delete), addresses, project history
- **Files:** `web/app/dashboard/clients/page.tsx`, `web/app/dashboard/clients/[id]/page.tsx`

**Step 7: Project Pipeline (Kanban)**
- Route: `/dashboard/projects`
- Wire existing KanbanBoard component to project data
- 8 columns: Opportunity → Qualifying → Curating → InDesign → Presenting → Client Review → Confirmed → Cancelled
- Card: project name, client, estimated total, in-hands date, assignee
- Drag-and-drop to change status
- Toggle: Kanban ↔ Table view
- **Files:** `web/app/dashboard/projects/page.tsx`

**Step 8: Project Detail & Quoting Engine**
- Route: `/dashboard/projects/[id]`
- **Left:** Client info, project metadata, internal notes
- **Center:** Line items with full quoting:
  - Product selector → color/size qty → decoration config (location + method + color count)
  - Real-time price calculation: `blank_cost + decoration_costs + add_ons = unit_cost → / (1 - margin%) = unit_price`
  - Margin slider per line item (default 35%)
  - Artwork upload per line item
- **Right:** Project summary, total, shareable link, status controls
- **THIS IS THE MOST COMPLEX PAGE** — quoting math must be bulletproof
- **Files:** `web/app/dashboard/projects/[id]/page.tsx`, `web/components/dashboard/QuotingEngine.tsx`, `web/components/dashboard/LineItemEditor.tsx`, `web/lib/utils/quoting.ts`

### Phase C: Client-Facing Features (Steps 9-10)

**Step 9: Client Portal**
- Route: `/portal/[shareableLink]` (public, no auth, UUID access)
- Project header with client branding
- Line items display (unit_price only, NO cost/margin)
- Artwork upload zone
- Quantity confirmation (editable)
- "Approve & Confirm Order" button
- Order tracking sub-page (`/portal/[shareableLink]/tracking`)
- **Files:** `web/app/portal/[shareableLink]/page.tsx`, `web/app/portal/[shareableLink]/tracking/page.tsx`

**Step 10: Public Product Catalog**
- Route: `/catalog`, `/catalog/[productId]`
- Browse products with category/color/search filters
- Product detail: color swatches, sizes, decoration method selector
- Instant pricing: select qty → system calculates from decorator matrix → shows unit_price
- "Start a Project" button → flows to project request form
- **Files:** `web/app/catalog/page.tsx`, `web/app/catalog/[productId]/page.tsx`

### Phase D: Order & Fulfillment (Steps 11-12)

**Step 11: Order Tracking (Kanban)**
- Route: `/dashboard/orders`
- Wire KanbanBoard to order data
- 7 columns: Order Entry Needed → Entered → In Production → Shipped → Ready for Invoicing → Invoiced → Cancelled
- Card: order number, product, qty, total, in-hands date, tracking
- Order detail panel: tracking number, carrier, ship date, invoice link
- **Files:** `web/app/dashboard/orders/page.tsx`

**Step 12: Split Shipment Builder**
- Accessible from project detail or order detail
- Add locations with: name, qty, address
- Drag-to-reorder, real-time qty sum validation
- Save generates split_shipments records
- **Files:** `web/components/dashboard/SplitShipmentBuilder.tsx`

### Phase E: Revenue & Intelligence (Steps 13-15)

**Step 13: Commission Dashboard**
- Route: `/dashboard/commissions`
- **THE "WOW" FEATURE** for Aaron
- Left panel (inputs): period selector, gross revenue slider, margin slider, commission rate slider
- Right panel (outputs): AnimatedCounter for each metric:
  - Gross Revenue → Gross Profit (35%) → Boundless Share (50%) → Owner Share (50%) → Partner Commission (7%) → Net to Owner
  - Annual Projection (monthly × 12) with animation
- Default: start at $131K (Trevor's actual first 9 days)
- Slider to $250K+ shows the scaling story
- Export to PDF
- **Files:** `web/app/dashboard/commissions/page.tsx`, `web/components/dashboard/CommissionCalculator.tsx`

**Step 14: Programs Module**
- Route: `/dashboard/programs`
- Program list: name, type, client, budget total/spent/remaining, status
- Program detail (`/dashboard/programs/[id]`):
  - Left: config (type, budget, approval settings, auto-reorder)
  - Center: locations list (name, address, budget allocation, contact)
  - Right: portal URL, allowed products
- 5 types: employee-store, uniform-program, event-merch, drop-ship, budget-managed
- **Files:** `web/app/dashboard/programs/page.tsx`, `web/app/dashboard/programs/[id]/page.tsx`

**Step 15: Analytics Dashboard**
- Route: `/dashboard/analytics`
- Charts (Recharts — already installed):
  - Pipeline value by stage (stacked bar)
  - Conversion funnel (Opportunity → Confirmed, with drop-off %)
  - Deal velocity (line chart, rolling 30-day)
  - Average deal size (KPI card)
  - Client segment breakdown (pie)
  - Revenue forecast (projection line)
- **Files:** `web/app/dashboard/analytics/page.tsx`

### Phase F: Configuration (Step 16)

**Step 16: Settings Hub**
- Route: `/dashboard/settings` (tabbed)
- Tab 1: Company Profile (name, logo, primary color, currency, default margin)
- Tab 2: Decorator Matrices (link to Step 5 page)
- Tab 3: Products (link to Step 4 page)
- Tab 4: Team Management (members list, invite by email, roles: owner/admin/sales/production/viewer)
- Tab 5: Integrations (Salesforce config placeholder, Stripe config, future PromoStandards)
- **Files:** `web/app/dashboard/settings/page.tsx`, `web/app/dashboard/settings/team/page.tsx`

---

## Key Technical Details

### Quoting Engine Logic (`lib/utils/quoting.ts`)
```
unit_cost = blank_cost(qty) + Σ decoration_cost(method, qty, colors) + Σ add_on_cost
unit_price = unit_cost / (1 - margin_percent / 100)
line_total = unit_price × total_quantity
project_total = Σ line_totals
```

### Demo Data Requirements
Each page needs realistic demo data matching Trevor's world:
- 10 clients (Raisin Canes, Progressive Insurance, Nashville Sounds, Red Bull, etc.)
- 20 products (Gildan 5000, Bella+Canvas 3001, Richardson 112, Stanley 40oz, etc.)
- 3 decorator matrices (Screen Print, Embroidery, Heat Transfer) with full pricing tiers
- 15 projects across all pipeline stages
- 25 orders across all statuses
- 3 programs (Progressive Insurance employee store, Raisin Canes uniform, Nashville Sounds event)

### Existing Components to Wire (NOT rebuild)
- `KanbanBoard` → Projects page + Orders page
- `DataTable` → Clients page + Products page
- `StatCard` + `AnimatedCounter` → Commission dashboard + Analytics
- `Portal` → All modals
- `PageHeader` → All dashboard pages
- `EmptyState` → All pages when no data

---

## Verification

After each step:
1. `npm run build` passes (zero errors)
2. Visual check: page renders correctly in browser
3. Demo data displays properly
4. Interactive elements work (drag-and-drop, forms, sliders)

After all steps:
1. Full navigation test: every sidebar link → functional page
2. Quoting engine: manually verify calculation matches expected output
3. Commission calculator: verify math at $131K and $250K inputs
4. Client portal: verify no cost/margin data leaks
5. Mobile responsive: dashboard sidebar collapses, pages stack

---

## What This Plan Does NOT Cover (Phase 2+)
- Salesforce API integration (needs Aaron's approval)
- PromoStandards API (Phase 3)
- BrandOps standalone SaaS ($99/mo version)
- White-label for 200+ Boundless reps
- Real payment processing (Stripe checkout flow)
- Email notifications (Resend/Nodemailer)
