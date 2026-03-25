# Master Plan -- Round 3 (THE ARCHITECT)

> **Created:** 2026-02-25
> **Author:** PB-2 THE ARCHITECT
> **Source:** Call 4 extraction (108 min, Feb 24 2026) + 32 gold-standard screenshots + R1/R2 codebase audit + Surgeon gap analysis
> **Previous state:** Round 1 complete (20 steps, 6 phases), Round 2 complete (7 elite features)
> **Round:** 3 -- Quality Round
> **Goal:** Pixel-perfect parity with Trevor's Lovable reference app ("MerchPortal") on the critical gaps the Surgeon identified. QUALITY over quantity.

---

## Round Philosophy

This is NOT a feature round. This is a **precision-matching round**.

Trevor built a reference app over a weekend in Lovable. He brought 32 screenshots. His #1 stated priority: "My objective one is to achieve what I have in my current app." The business deal is now real (Aaron approved 60/40 revenue split). The demo is no longer speculative -- it is the foundation for a revenue-generating platform.

**Rules for this round:**
1. If Trevor's screenshot shows it, we match it. Pixel-level.
2. If Trevor's screenshot does NOT show it, we do NOT add it.
3. No public website e-commerce. No HIT API. No Stripe. No Salesforce. Too big, needs real credentials, needs its own round.
4. This is demo-only. No Supabase, no real auth, no real data persistence.
5. Every change must make the side-by-side comparison with Trevor's Lovable app pass.

---

## Phase A -- Foundation Fixes

Data-level and logic-level corrections. No new UI features -- just making the existing build match the gold standard.

---

### A1. Fix PricingGrid Quantity Breaks (5 columns --> 7 columns)

**Priority:** CRITICAL (Surgeon Rec #1)
**Why this matters:** The pricing grid is what Trevor calls "the money shot." He will hard-code decoration matrices and validate the math against this grid. If the columns do not match, validation fails. The grid is the single most important component for demonstrating that BrandOps understands pricing.

**Files:**

| File | Change |
|------|--------|
| `web/components/shared/PricingGrid.tsx` | Replace `DEFAULT_QUANTITY_BREAKS` array (lines 45-51) |
| `web/lib/utils/quoting.ts` | Extend `DEFAULT_BLANK_TIERS`, `SCREEN_PRINT_TIERS`, `EMBROIDERY_TIERS` to cover 7 ranges |

**Exact changes in `PricingGrid.tsx`:**
Replace the current 5-entry `DEFAULT_QUANTITY_BREAKS` with:
```typescript
const DEFAULT_QUANTITY_BREAKS: QuantityBreak[] = [
  { label: '24-35',    min: 24,   max: 35,   midpoint: 30 },
  { label: '36-49',    min: 36,   max: 49,   midpoint: 42 },
  { label: '50-99',    min: 50,   max: 99,   midpoint: 72 },
  { label: '100-199',  min: 100,  max: 199,  midpoint: 150 },
  { label: '200-499',  min: 200,  max: 499,  midpoint: 350 },
  { label: '500-999',  min: 500,  max: 999,  midpoint: 750 },
  { label: '1000+',    min: 1000, max: 9999, midpoint: 1500 },
]
```

**Exact changes in `quoting.ts`:**
Extend all tier arrays to cover the 7 ranges. The current tiers use 25-49 as the lowest. We need:
- Split 25-49 into 24-35 and 36-49
- Split 500+ into 500-999 and 1000+
- Adjust 100-249 to 100-199 and add 200-499

For `DEFAULT_BLANK_TIERS`:
```typescript
const DEFAULT_BLANK_TIERS: BlankCostTier[] = [
  { min: 1,    max: 23,   cost: 5.50 },
  { min: 24,   max: 35,   cost: 4.75 },
  { min: 36,   max: 49,   cost: 4.25 },
  { min: 50,   max: 99,   cost: 3.75 },
  { min: 100,  max: 199,  cost: 3.25 },
  { min: 200,  max: 499,  cost: 2.85 },
  { min: 500,  max: 999,  cost: 2.50 },
  { min: 1000, max: 9999, cost: 2.25 },
]
```

Same pattern for `SCREEN_PRINT_TIERS` and `EMBROIDERY_TIERS` -- split into 7 tiers with progressively lower costs per unit as volume increases. Interpolate costs between existing adjacent tiers for new breakpoints.

**Verification:** After this change, the PricingGrid in ProductDetailPanel should show exactly 7 columns with headers matching Trevor's screenshot: 24-35, 36-49, 50-99, 100-199, 200-499, 500-999, 1000+.

---

### A2. Add `pricing_override` to ProjectLineItem (Hybrid Product Support)

**Priority:** HIGH (Surgeon Rec #4)
**Why this matters:** Trevor said: "An apparel piece can be both. I do have vendors that say, Trevor, don't even worry about ordering the blank t-shirts... We will do that. And here is an all-in price." Without this, mixed-vendor quoting is impossible.

**Files:**

| File | Change |
|------|--------|
| `web/lib/types/app.ts` | Add `pricing_override` field to `ProjectLineItem` |
| `web/components/projects/ProductDetailPanel.tsx` | Add pricing mode dropdown, conditionally render sections |
| `web/components/projects/ProjectDetailPanel.tsx` | Update product list badges for override display |

**Exact type change in `app.ts`:**
Add to the `ProjectLineItem` interface after `product_type`:
```typescript
pricing_override?: 'contract' | 'all-in' | null  // null = use product default
```

**UI in `ProductDetailPanel.tsx`:**
Add a "Pricing Mode" dropdown in the product header, between colors and blank costs:
- Options: "Contract (Blank + Deco)" | "All-In (Vendor Price)"
- Default: matches the product's `product_type`
- When "All-In" is selected on a contract product:
  - HIDE blank cost inputs and decoration locations section
  - SHOW a single vendor cost input
  - PricingGrid receives `productType='all-in'` instead of `'contract'`

**UI in `ProjectDetailPanel.tsx`:**
When a line item has `pricing_override === 'all-in'` but `product_type === 'contract'`, show badge:
```
"All-In (Override)" in orange-100/orange-700 instead of the usual contract violet badge
```

---

### A3. Simplify Production Time (5 options --> 2)

**Priority:** HIGH (Surgeon Rec #5)
**Why this matters:** Trevor's Lovable app shows exactly 2 options in the dropdown: "Standard" and "Rush" (screenshot `22.05.38.png`). Our 5-option dropdown is wrong.

**Files:**

| File | Change |
|------|--------|
| `web/lib/types/app.ts` | Simplify `ProductionTime` union type |
| `web/components/projects/ProjectDetailPanel.tsx` | Replace `PRODUCTION_TIME_OPTIONS` array (line 72-78) |
| `web/lib/demo/demo-data-provider.ts` | Update any demo projects with old production time values |

**Exact type change in `app.ts`:**
Replace:
```typescript
export type ProductionTime = '5-7 days' | '7-10 days' | '10-14 days' | '15-20 days' | 'rush'
```
With:
```typescript
export type ProductionTime = 'standard' | 'rush'
```

**Exact change in `ProjectDetailPanel.tsx`:**
Replace `PRODUCTION_TIME_OPTIONS` (lines 72-78):
```typescript
const PRODUCTION_TIME_OPTIONS: { value: ProductionTime; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'rush', label: 'Rush' },
]
```

**Demo data migration:** Map old values:
- `'5-7 days'` --> `'rush'`
- `'7-10 days'` --> `'standard'`
- `'10-14 days'` --> `'standard'`
- `'15-20 days'` --> `'standard'`
- `'rush'` --> `'rush'`

---

### A4. Verify 7-Stage Status Stepper (NO CODE CHANGE)

**Priority:** HIGH (Surgeon Rec #2)
**Why this matters:** R1 said merge "Presenting" into "Client Review." But Trevor's Lovable app still shows 7 stages. The Surgeon flagged this as a discrepancy.

**Resolution: VERIFIED -- No change needed.**

The current `ProjectStatusStepper.tsx` already has 7 STEPS:
```
Opportunity > Qualifying > Curating > In Design > Presenting > Client Review > Ordered
```

"Presenting" has `value: null` (visual-only, not a workflow status). The kanban in `projects/page.tsx` correctly omits "presenting" from `KANBAN_STATUSES`. This is the right design: the stepper is for visual progress communication, the kanban is for workflow management.

**Action:** Zero code changes. Document this decision in handoff notes so future rounds do not re-open this discussion.

---

### A5. Add ASI Price Code and Vendor Source Fields

**Priority:** MEDIUM (Surgeon Rec #6)
**Why this matters:** Prepares the data model for HIT API integration. Trevor explained the ASI code system (C = 40%, G = 20%). Having the field now means we are ready when API access arrives.

**Files:**

| File | Change |
|------|--------|
| `web/lib/types/app.ts` | Add `price_code`, `vendor_source`, `vendor_api_id` to `Product` |
| `web/components/products/ProductEditModal.tsx` | Add price code field on Basics tab (all-in only) |

**Exact type change in `app.ts`:**
Add to `Product` interface after `supplier_name`:
```typescript
price_code?: string              // ASI price code (e.g., "C" = 40%, "G" = 20%)
vendor_source?: string           // "Hit Promo", "Manual", etc.
vendor_api_id?: string           // For API-sourced products, links back to vendor catalog
```

**Constants to add (in `PricingGrid.tsx` or a new constants section):**
```typescript
const ASI_PRICE_CODES: Record<string, number> = {
  'C': 40, 'D': 35, 'E': 30, 'G': 20, 'L': 50, 'P': 45, 'R': 25,
}
```

**UI in `ProductEditModal.tsx`:**
In the Basics tab, after the product type badge, add a "Price Code" input:
- Only visible when `product_type === 'all-in'`
- Single-character text input with label "ASI Price Code"
- Helper text: "C = 40%, G = 20% margin. Used for vendor catalog pricing."

---

## Phase B -- UI Refinements

Pixel-level UI corrections and the one missing view that blocks demo quality.

---

### B1. Build Creative Request Detail View (NEW COMPONENT)

**Priority:** HIGH (Surgeon Rec #3)
**Why this matters:** Screenshot `22.04.32.png` shows a full creative request detail page. Our current build only has a flat list in ProjectDetailPanel. This is the third most important view after project detail and product detail. Trevor's daily workflow involves managing creative requests.

**Files:**

| File | Change |
|------|--------|
| `web/components/projects/CreativeRequestDetailPanel.tsx` | **NEW FILE** -- Full creative request detail slide panel |
| `web/components/projects/ProjectDetailPanel.tsx` | Add click handler on creative request rows |
| `web/app/dashboard/projects/page.tsx` | Wire up CreativeRequestDetailPanel rendering |

**Component structure for `CreativeRequestDetailPanel.tsx`:**
- Portal-based slide panel (same pattern as `ProductDetailPanel`)
- Width: 60vw (matches product detail)
- Escape to close, backdrop click to close

**Layout from screenshot `22.04.32.png`:**

```
HEADER
  [ArrowLeft]  Creative Request Details
               {project.name} -- {project.project_number}

BREADCRUMB
  {client_name} > {project_name} > {request_title}
  [Branding Deck badge]  [Completed badge]

DETAILS CARD (2-column grid)
  Status:      [Dropdown: Pending/In Progress/Review/Approved/Cancelled]
  Assigned To: [Text input]
  Due Date:    [Date display]
  Time Tracked: [Display: "0h 0m"]

ATTACHMENTS SECTION
  [Upload button]
  File list (same FileIcon pattern as project files)
  Notes textarea

VERSION HISTORY SECTION
  Timeline of versions, each with:
    - Version number + timestamp + uploader
    - [Request Edits] button
    - [Upload & Complete] button

EDIT REQUESTS SECTION
  List of edit request items with status badges
```

**Click wiring in `ProjectDetailPanel.tsx`:**
Add `onSelectCreativeRequest?.(req.id)` to each creative request row.

**State management in `projects/page.tsx`:**
Add `selectedCreativeRequestId` state and render `CreativeRequestDetailPanel` when set.

---

### B2. Add `show_on_website` Toggle to Product Edit Modal

**Priority:** P0 (Surgeon extraction, confirmed on Call 4)
**Why this matters:** The `Product` type already has `show_on_website: boolean` (added in R1). The Product Edit Modal does not expose it. Trevor: "I as a user can go, yes, show on website, yes, no."

**Files:**

| File | Change |
|------|--------|
| `web/components/products/ProductEditModal.tsx` | Add toggle in Basics tab |

**Exact UI change:**
After the "Active Status" toggle in the Basics tab, add:
```tsx
<div className="flex items-center justify-between">
  <div>
    <label className="text-sm font-medium text-slate-700">Show on Website</label>
    <p className="text-xs text-slate-400">When enabled, this product appears in the public catalog</p>
  </div>
  <ToggleSwitch checked={showOnWebsite} onChange={setShowOnWebsite} />
</div>
```

Single-line addition. The field already exists on the type. This is just exposing it.

---

### B3. Responsive Grid Sizing for 7-Column PricingGrid

**Priority:** MEDIUM
**Why this matters:** Going from 5 to 7 columns makes the grid wider. The ProductDetailPanel is 60vw. On a 1440px viewport, 60vw = 864px. With 7 columns at 90px + 112px label = 742px, it barely fits. Need some breathing room.

**Files:**

| File | Change |
|------|--------|
| `web/components/shared/PricingGrid.tsx` | Adjust column min-width, font size, padding |

**Exact changes:**
1. Column header `min-w-[90px]` --> `min-w-[80px]`
2. Column header font remains `text-xs` (already fine)
3. Cell horizontal padding `px-3` --> `px-2`
4. Margin input width `w-11` --> `w-10`
5. Label column width `w-28` --> `w-24`
6. The `overflow-x-auto` wrapper already exists -- it will catch any overflow on narrow screens

**Verification:** All 7 columns visible without horizontal scroll at 60vw on 1440px viewport.

---

### B4. Add Project Source Badge to Project Detail

**Priority:** MEDIUM
**Why this matters:** Aaron requires clear attribution. "He wants to make absolutely unequivocally sure that an existing client, when they go to the website, that is not... he goes, I want to see new revenue."

**Files:**

| File | Change |
|------|--------|
| `web/components/projects/ProjectDetailPanel.tsx` | Add source badge next to project number |

**Exact change:**
In the top section, after the project number span, add:
```tsx
<span className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
  project.source === 'website' ? 'bg-emerald-100 text-emerald-700' :
  project.source === 'referral' ? 'bg-purple-100 text-purple-700' :
  project.source === 'program' ? 'bg-blue-100 text-blue-700' :
  'bg-slate-100 text-slate-600'
}`}>
  {project.source}
</span>
```

---

## Phase C -- New Features

Only items required to complete the UI stories opened in Phase A and B. No scope creep.

---

### C1. Wire Up Pricing Override Toggle in ProductDetailPanel

**Priority:** HIGH (paired with A2)
**Why this matters:** A2 added the type field. This step adds the UI toggle and conditional rendering logic.

**Files:**

| File | Change |
|------|--------|
| `web/components/projects/ProductDetailPanel.tsx` | Add state, dropdown, conditional section rendering |

**State addition:**
```typescript
const [pricingOverride, setPricingOverride] = useState<'contract' | 'all-in' | null>(
  lineItem.pricing_override ?? null
)
const effectivePricingType = pricingOverride ?? lineItem.product_type
```

**Dropdown (in header section, between Colors and Blank Costs):**
```tsx
<div className="w-48">
  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
    Pricing Mode
  </label>
  <select
    value={effectivePricingType}
    onChange={(e) => setPricingOverride(e.target.value as 'contract' | 'all-in')}
    className="w-full h-8 px-3 text-sm border border-slate-200 rounded-lg bg-white"
  >
    <option value="contract">Contract (Blank + Deco)</option>
    <option value="all-in">All-In (Vendor Price)</option>
  </select>
</div>
```

**Conditional rendering:**
- When `effectivePricingType === 'contract'`: Show blank costs, decoration locations, full PricingGrid
- When `effectivePricingType === 'all-in'`: Show vendor cost input, simplified PricingGrid, hide decoration locations
- Pass `effectivePricingType` to `PricingGrid` instead of `productType`

---

### C2. Extend CreativeRequest Type System

**Priority:** MEDIUM (supports B1)
**Why this matters:** The Creative Request Detail view (B1) needs additional fields that do not exist on the current `CreativeRequest` interface.

**Files:**

| File | Change |
|------|--------|
| `web/lib/types/app.ts` | Expand `CreativeRequest`, add `CreativeRequestVersion`, `EditRequest` |

**Exact type additions:**

Add to `CreativeRequest` interface:
```typescript
project_name?: string               // Denormalized for breadcrumb
client_name?: string                 // Denormalized for breadcrumb
title?: string                       // "Homepage Banner Design"
time_tracked_minutes?: number        // Time tracking (display as Xh Ym)
versions?: CreativeRequestVersion[]  // Version history
edit_requests?: EditRequest[]        // Client edit requests
```

Add new interfaces:
```typescript
export interface CreativeRequestVersion {
  id: string
  version_number: number
  file_url?: string
  notes?: string
  uploaded_by?: string
  created_at: string
}

export interface EditRequest {
  id: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  requested_by?: string
  created_at: string
}
```

Add `'branding-deck'` to `CreativeRequestType`:
```typescript
export type CreativeRequestType = 're-vector' | 'mockup' | 'full-deck' | 'color-separation' | 'branding-deck' | 'other'
```

---

### C3. Update Demo Data for All New Fields

**Priority:** MEDIUM
**Why this matters:** Demo data is what Trevor sees. If new fields are empty, he does not know they exist.

**Files:**

| File | Change |
|------|--------|
| `web/lib/demo/demo-data-provider.ts` | Add demo data for all new fields |

**Required demo data additions:**
1. At least one project line item with `pricing_override: 'all-in'` on a contract product
2. At least one all-in product with `price_code: 'C'` and `vendor_source: 'Hit Promo'`
3. All demo projects using old `ProductionTime` values mapped to `'standard'` or `'rush'`
4. At least two creative requests with populated `versions` arrays (2-3 versions each)
5. At least one creative request with populated `edit_requests` array
6. One creative request of type `'branding-deck'` with status `'approved'`

---

## NOT in This Round

These are explicitly deferred. Do NOT build them. Do NOT start them. Do NOT add "placeholder" UI for them.

| Feature | Why Deferred | Earliest Target |
|---------|-------------|-----------------|
| **Public Website E-Commerce Flow** | P1 but massive scope: 3-step wizard, product grid, Stripe card capture, existing client detection. Needs its own dedicated round. | Round 4 |
| **HIT Promotional Products API** | Needs real API credentials from Raj (CTO of HIT). Connection made but no access yet. | Round 4 |
| **Stripe Payment Processing** | Dependent on website e-commerce. No Stripe keys. No Boundless merchant account details. | Round 4 |
| **Referral Code System** | Dependent on website orders being live. No referrals without a website to refer to. | Round 4-5 |
| **Boundless Order Entry Bridge** | Requires Salesforce API access and Kristen's workflow documentation. | Round 4 |
| **AI Email Inbox** | P2. Requires real email infrastructure, parsing logic, order matching. | Round 5+ |
| **Client Portal Refinement** | P2. Current portal is functional. Real refinement needs real data. | Round 5 |
| **Boundless Co-Brand Toggle** | P2. Business model still being finalized between Trevor and Aaron. | Round 5 |
| **Revenue Reporting (Aaron/Kevin)** | Needs real order data. Demo data reporting adds zero value. | Round 4 |
| **Real Database (Supabase)** | Demo-only build. Database comes when core UX is approved by Trevor. | Round 4 |
| **Real Auth / Login** | Demo-only build. No auth until database is connected. | Round 4 |
| **Salesforce Integration** | Still waiting on Trevor's Loom videos and documentation. | Round 4 |
| **PromoStandards API** | Trevor explicitly rejected: "It's API slop." Going direct to suppliers. | NEVER |
| **Floor Stock / Warehouse** | P3. Far future. | Round 6+ |
| **SaaS Multi-Tenant** | Far future. Beta with $10M+ companies not relevant until product is live. | Round 7+ |
| **Chat/Message Bubble on Client** | Low priority cosmetic (red chat icon on company name in screenshot). | Round 5+ |

---

## Files Modified Summary

### Modified Files

| File | Phase(s) | Change Type | Description |
|------|----------|-------------|-------------|
| `web/components/shared/PricingGrid.tsx` | A1, B3 | Modify | 7 qty columns, tighter spacing for responsive fit |
| `web/lib/utils/quoting.ts` | A1 | Modify | Extend all tier arrays (blank, screen print, embroidery) to 7 ranges |
| `web/lib/types/app.ts` | A2, A3, A5, C2 | Modify | Add `pricing_override`, simplify `ProductionTime`, add `price_code`/`vendor_source`/`vendor_api_id`, expand `CreativeRequest` type system |
| `web/components/projects/ProductDetailPanel.tsx` | A2, C1 | Modify | Pricing mode dropdown, conditional section rendering based on effective pricing type |
| `web/components/projects/ProjectDetailPanel.tsx` | A3, B1, B4 | Modify | Simplified 2-option production dropdown, creative request click handler, project source badge |
| `web/components/shared/ProjectStatusStepper.tsx` | A4 | **Verify only** | Already correct -- 7 stages, "Presenting" as visual-only step |
| `web/components/products/ProductEditModal.tsx` | A5, B2 | Modify | Price code field (all-in only), show_on_website toggle |
| `web/lib/demo/demo-data-provider.ts` | A3, C3 | Modify | New field demo data, production time migration |
| `web/app/dashboard/projects/page.tsx` | B1 | Modify | Wire CreativeRequestDetailPanel rendering + state |

### New Files

| File | Phase | Description |
|------|-------|-------------|
| `web/components/projects/CreativeRequestDetailPanel.tsx` | B1 | Full creative request detail slide panel with breadcrumbs, status, versions, edit requests |

---

## Execution Order

### Session 1: Foundation (Phase A)
Steps A1 through A5. Fix the data model and pricing engine first. Everything in Phases B and C depends on these type/logic changes being correct.

**Estimated effort:** 1 focused session
**Risk:** A1 (quoting tier extension) has the most lines of code. A3 (ProductionTime) may cause type errors in demo data that need chasing.

### Session 2: UI Matching (Phase B)
Steps B1 through B4. Build the Creative Request Detail panel, add show_on_website toggle, responsive grid, source badge.

**Estimated effort:** 1 focused session
**Risk:** B1 (new component) is the largest piece of work in this round. Follow the ProductDetailPanel pattern exactly.

### Session 3: Integration (Phase C)
Steps C1 through C3. Wire up pricing override toggle, extend types, update demo data.

**Estimated effort:** 0.5-1 session
**Risk:** Low. This connects work already done in A and B.

### Session 4: Verification
Run `verify.sh`. Visual walkthrough. Side-by-side screenshot comparison. Pricing math spot-check at all 7 break points.

**Estimated effort:** 0.5 session

---

## Definition of Done

This round is complete when ALL of the following are true:

1. PricingGrid shows **7 quantity columns** matching Trevor's exact ranges: 24-35, 36-49, 50-99, 100-199, 200-499, 500-999, 1000+
2. Pricing math is **correct at all 7 break points** for both contract and all-in products
3. Production Time dropdown shows **exactly 2 options**: Standard and Rush
4. Product pricing can be **overridden at the line-item level** (contract product quoted as all-in)
5. **Creative Request Detail panel exists** with status, assignee, due date, time tracking, versions, and edit requests
6. Product Edit Modal has **show_on_website toggle** in the Basics tab
7. **ASI Price Code field** appears on all-in products in the Product Edit Modal
8. **Project source badge** displays in the Project Detail Panel header
9. ProjectStatusStepper **remains 7 stages** (verified, not changed)
10. Demo data includes: **at least one hybrid pricing override, one ASI price code, one creative request with version history**
11. `npm run build` **passes with zero errors**
12. **No horizontal scroll** required on PricingGrid at 60vw panel width on 1440px viewport
