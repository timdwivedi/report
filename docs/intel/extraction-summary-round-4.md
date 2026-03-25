# Extraction Summary -- Round 4
> **Source:** Call 5 transcript (82 min, Mar 3 2026) + 11 old-app reference files (Trevor's Lovable "MerchPortal")
> **Surgeon:** PB-1 (Round 4)
> **Participants:** Trevor Sarver (85 Supply / Boundless), Vitaliy S., Jeremy Kreutzer
> **Date:** 2026-03-03

---

## 1. Intel Cross-Check Result

**CONFIRMED -- BrandOps (decorated promotional products / merch agencies).**

Industry-specific terms found in Call 5 transcript and EXTRACT:
- blanks, blank costs, decoration, decoration locations, screen print, embroidery
- S&S Activewear, SanMar, HitPromo (supplier names)
- projects, orders, enhanced date, spoilage, run charges, setup charges
- 85supply, Boundless, Kristen, Trevor Sarver
- contract vs all-in products, product catalog, ASI price codes

No foreign industry terms detected. Cross-check PASSED.

---

## 2. New Entities Required

### 2A. `ProductAddOn` (Product-Level Add-On)

**Source:** EXTRACT Gap #3 (Dual-Level Add-On System), Call 5 discussion

Add-ons that apply to the whole product/line item, NOT tied to any decoration location. Example: "fold each shirt", "polybag", "individual packing".

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID |
| `name` | string | "Folding & Polybag", "Individual Packing" |
| `cost_per_unit` | number | Internal cost per unit |
| `sale_price_per_unit` | number | Client-facing sale price per unit |

**Note:** The existing `LineItemAddOn` interface has `name` and `cost_per_unit` but is missing `sale_price_per_unit`. It also does not distinguish product-level vs location-level add-ons. This needs restructuring.

### 2B. `LocationAddOn` (Location-Level Add-On)

**Source:** EXTRACT Gap #3 -- NEW from Call 5, not in old app

Add-ons tied to a specific decoration location. Example: "puff ink on front chest logo", "metallic ink on back print".

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID |
| `decoration_id` | string | Links to `LineItemDecoration.id` |
| `name` | string | "Puff Ink", "Metallic Ink" |
| `cost_per_unit` | number | Internal cost per unit |
| `sale_price_per_unit` | number | Client-facing sale price per unit |

### 2C. `ScrapedProductData` (AI Product Scrape Result)

**Source:** EXTRACT Gap #4 (AI Product Assistant)

Intermediate data structure returned by the URL scraper before the user reviews and publishes to catalog.

| Field | Type | Description |
|-------|------|-------------|
| `source_url` | string | The supplier URL that was scraped |
| `product_name` | string | Extracted product name |
| `description` | string | AI-humanized description |
| `original_description` | string | Raw description from supplier |
| `images` | string[] | Extracted image URLs |
| `colors` | `{ name: string; hex?: string; swatch_url?: string }[]` | Extracted color options |
| `sizes` | string[] | Extracted available sizes |
| `specs` | `Record<string, string>` | Key-value specs (material, weight, etc.) |
| `supplier_name` | string | "S&S Activewear", "SanMar", etc. |
| `supplier_sku` | string | Supplier's product number/SKU |
| `msrp` | number? | Suggested retail if found |

---

## 3. Modifications to Existing Entities

### 3A. `LineItemAddOn` -- Restructure to Dual-Level

**Current state:**
```typescript
interface LineItemAddOn {
  name: string;
  cost_per_unit: number;
}
```

**Required state:**
```typescript
interface LineItemAddOn {
  id: string;                    // NEW -- needed for CRUD
  name: string;
  cost_per_unit: number;
  sale_price_per_unit: number;   // NEW -- client-facing price
  level: 'product' | 'location'; // NEW -- which type of add-on
  decoration_id?: string;        // NEW -- only for location-level, links to LineItemDecoration.id
}
```

### 3B. `ProjectLineItem` -- Add `quantities_received` Checkbox

**Current state:** Has `art_received: boolean` but no `quantities_received` field.

**Required addition:**
```typescript
quantities_received: boolean;   // NEW -- Admin confirms they have qty breakdown
```

**Business rule:** When both `art_received` AND `quantities_received` are true, the line item status becomes `ready_for_client_input`. When either is unchecked, status = `draft`. On the client portal, unchecked checkboxes show the corresponding input sections (artwork upload or quantity matrix).

### 3C. `Product` -- Add `images_by_color` Support

**Current state:** `available_colors: ProductColor[]` where `ProductColor` has `{ name, hex, swatch_url? }`.

The old app's `ProductVariantsForm` stores multiple images per color (with `is_primary` flag). BrandOps `ProductColor` currently only supports `swatch_url` (a single URL).

**Required change to `ProductColor`:**
```typescript
interface ProductColor {
  name: string;
  hex: string;
  swatch_url?: string;
  images?: { url: string; is_primary: boolean }[];  // NEW -- multiple images per color
}
```

### 3D. `Product` -- Add `decoration_locations` (Template Locations)

**Current state:** Products do not store template decoration locations. The old app has `product_decoration_locations` as a separate table.

**Required addition to Product:**
```typescript
decoration_locations?: ProductDecorationLocation[];  // NEW
```
```typescript
interface ProductDecorationLocation {
  id: string;
  location_name: string;           // "Front Chest", "Full Back", "Left Sleeve"
  placeholder_run_charge?: number;  // Placeholder cost for quoting estimates
  placeholder_setup_charge?: number;
}
```

When adding a product to a project from the catalog, these template locations pre-populate the line item's decoration locations.

---

## 4. Feature Requirements (Prioritized)

### P0 -- Must Have This Round

#### F1. Products Page 4-Tab Form Overhaul
**Source:** EXTRACT Gap #1, old-app `ProductsPage.tsx.ref`

The current `ProductEditModal` already has the 4-tab structure (Basics, Blank Costs, Variants, Decorations) built in R3. However, comparing against Trevor's old app reveals gaps:

**Basics tab enhancements:**
- Primary image URL field (exists)
- Active/Inactive toggle (exists)
- `show_on_website` toggle (added in R3)

**Blank Costs tab:**
- Size tier inputs (S-XL, 2XL, 3XL, 4XL) -- MATCH, already built

**Variants tab enhancements needed:**
- Size selection checkboxes (exists but verify XS through 4XL range)
- Color entries with: color name, hex picker, **multiple images per color** (current: only swatch_url)
- Each color should have an image gallery with primary image designation

**Decorations tab enhancements needed:**
- Named decoration locations (Front Chest, Full Back, Left Sleeve, etc.) with placeholder run/setup charges
- Currently has locations but verify against old app's `ProductDecorationLocationsForm` pattern
- Warning banner about placeholder values (already exists per R3 notes)

**Products table enhancements:**
- Columns: Name, SKU, Type, Sizes, Status -- matches old app
- Click row to edit (already exists)

**Priority:** P0 -- Trevor's core data entry workflow

---

#### F2. Project -> Product Catalog Linking (Dual Add Mode)
**Source:** EXTRACT Gap #2, old-app `ProjectDetailPage.tsx.ref` (lines 240-260)

When clicking "Add Product" in a project, offer two modes:
1. **From Catalog** -- Search/browse existing products, select one, auto-populate: name, image, blank costs, available sizes, available colors, template decoration locations
2. **Quick Entry** -- Manual entry for custom/one-off products (current behavior)

**UX pattern from old app:**
- "Add Product" opens a Sheet (slide-out panel, 75vw) -- NOT a modal
- Sheet contains `ProjectProductForm` component
- The form has a product search dropdown that, when selected, auto-fills fields

**Current state in BrandOps:** `ProductDetailPanel` is a nested slide panel inside `ProjectDetailPanel`. It has a `ProductSearchDropdown` that was built in R3. Verify it actually populates fields on selection.

**Gap:** Need the "From Catalog" vs "Quick Entry" mode toggle at the top of the add-product flow.

**Priority:** P0 -- Links the product catalog to the quoting workflow

---

#### F3. Dual-Level Add-On System
**Source:** EXTRACT Gap #3 -- NEW from Call 5

Two types of add-ons per line item:

**Product-level add-ons** (already partially exists as `LineItemAddOn`):
- Fixed per-unit charge not tied to any decoration location
- Example: "Folding & Polybag" at $0.35/unit cost, $0.55/unit sale
- Current `LineItemAddOn` has `name` + `cost_per_unit` -- needs `sale_price_per_unit` and `id`

**Location-level add-ons** (NEW):
- Upcharge tied to a specific decoration location
- Example: "Puff Ink on Front Chest" at $0.75/unit cost, $1.25/unit sale
- Links to a `LineItemDecoration` by `decoration_id`

**UX in ProductDetailPanel:**
- Per-Unit Add-Ons section (already exists) gets split into two sub-sections:
  - "Product Add-Ons" -- name, cost, sale price
  - "Location Add-Ons" -- select location dropdown, name, cost, sale price
- Both types contribute to the pricing grid totals

**Priority:** P0 -- Core pricing accuracy

---

#### F4. AI Product Assistant (URL Scraper)
**Source:** EXTRACT Gap #4 -- Trevor's #1 most excited feature

**Trevor's exact quote:** "Paste the URL, it extracts all the data I need, I enter my own pricing and click save and I'm done. Holy living shit, dude."

**Implementation:**

1. Add a third mode to "Add Product": **AI Entry** (alongside "From Catalog" and "Quick Entry")
2. User pastes a supplier product URL (S&S Activewear, SanMar, HitPromo, etc.)
3. Frontend calls `POST /api/products/scrape`:
   - Fetches the URL server-side (to bypass CORS)
   - Extracts HTML content using cheerio or JSDOM
   - Passes extracted content to Claude (Haiku for cost) with structured JSON prompt
   - Returns `ScrapedProductData` (see Section 2C)
4. Frontend shows a review form pre-filled with scraped data:
   - Product name (editable)
   - AI-humanized description (editable)
   - Extracted images (selectable primary)
   - Colors and sizes (checkboxes to include/exclude)
   - Specs (read-only reference)
   - **User enters their own pricing** (blank costs per tier or vendor cost)
5. Click "Publish to Catalog" -- saves as a new `Product` in the catalog

**Supplier sites to target:**
- S&S Activewear (ssactivewear.com) -- "This is everyone's supplier. $5 billion company."
- SanMar (sanmar.com)
- HitPromo (hitpromo.net)
- Any distributor product page (generic fallback)

**Cost consideration:** Trevor wants shoestring budget. Use Haiku for the AI extraction call. The HTML-to-structured-data prompt is straightforward and doesn't need Opus.

**Note:** This is demo mode only for now. The API route can return mock data if no API key is configured. Build the full UI flow with the scrape-review-publish pipeline even if scraping returns demo data.

**Priority:** P0 -- Trevor's competitive differentiator. He said this feature alone replaces the need for PromoStandards integration.

---

### P1 -- Should Have If Time Allows

#### F5. Art Received / Quantities Received Checkboxes
**Source:** EXTRACT Gap #5, old-app `plan.md` Section 3

Replace the line-item status concept with two boolean checkboxes:
- **Art Received** -- already exists on `ProjectLineItem` (`art_received: boolean`)
- **Quantities Received** -- needs to be added to `ProjectLineItem`

**Derived logic:**
- Both checked: status = `ready_for_client_input`
- Either unchecked: status = `draft`

**Client portal behavior (inverse):**
- Art NOT received: show per-location artwork upload zone
- Quantities NOT received: show quantity input matrix per color/size
- Both received: read-only summary

**Current state:** `art_received` exists in the type and in `ProductDetailPanel`. `quantities_received` does not exist yet. The `ProductDetailPanel` already has a "Quantities Received" toggle section with a color x size matrix -- need to verify it's wired to state correctly and add the new field.

**Priority:** P1 -- Enables the admin-to-client handoff workflow

---

#### F6. Creative Requests Standalone Page
**Source:** EXTRACT Gap #9, old-app `CreativePage.tsx.ref`

BrandOps currently has creative requests embedded in the `ProjectDetailPanel` (added in R3 via `CreativeRequestDetailPanel`). There is NO standalone `/dashboard/creative` route.

The old app has a standalone Creative page with:
- Search filter (by title)
- Status filter dropdown (all statuses)
- Type filter dropdown (all creative types)
- Designer/assigned filter
- Each row links to project + client (breadcrumb: Client > Project > Request)
- Status + due date badges per row

**What needs to happen:**
1. Create `/dashboard/creative/page.tsx` as a standalone listing page
2. Each row opens `CreativeRequestDetailPanel` (already built in R3)
3. The creative page aggregates ALL creative requests across ALL projects

**Current sidebar:** Check if "Creative" already appears in sidebar. The R3 extraction notes say it does.

**Priority:** P1 -- Trevor's team (Kristen) needs a cross-project view of all creative work

---

#### F7. Per-Location Artwork Upload (Client Portal)
**Source:** EXTRACT Gap #7, old-app `plan.md` Section 4

When artwork is NOT received, the client portal should show one upload zone PER decoration location:
- Location name + thumbnail
- File dropzone per location
- Attached files list with remove buttons
- Files organized: "Client Provided - {ProductName} - {LocationName}"

**Current state:** The client portal (`web/app/portal/[shareableLink]/page.tsx`) exists but artwork upload is not implemented as per-location zones.

**Priority:** P1 -- Key part of the client handoff workflow

---

#### F8. Shipping Address From Project
**Source:** EXTRACT Gap #8

Inside project detail, the Shipping card should have an "Add New Address" option that:
1. Opens inline form (the old app uses `AddressInlineForm` -- see `ProjectDetailPage.tsx.ref` line 746)
2. Saves the address to the client's address book
3. Associates it with this project

**Current state:** The `ProjectDetailPanel` has a shipping card with an address dropdown. It currently selects from existing addresses but does NOT have an inline "Add New" flow.

**Reference:** The old app's `ShippingCard` component (lines 637-744 of `ProjectDetailPage.tsx.ref`) shows the exact pattern: `<Button>New</Button>` that opens an `AddressInlineForm` with label, address fields, city/state/zip, and "Set as default" checkbox.

**Priority:** P1 -- Eliminates context-switching (currently must go to Client page to add address)

---

### P2 -- Nice to Have, Next Round

#### F9. Decorations Page Enhancement
**Source:** EXTRACT Gap #6, old-app `DecorationsPage.tsx.ref`

The old app's decorations page has a sophisticated system:
- Price break matrix: rows = qty ranges, columns = color/stitch counts, cells = unit prices
- Run charges with nested quantity breaks (min/max/cost/sale_price per qty range)
- Setup charges with "free above qty" thresholds
- Run charges can have their OWN setup charges (nested hierarchy)

**Current BrandOps state:** The decorations page (`web/app/dashboard/decorations/page.tsx`) was built in R1/R2 with cards and a 3-tab modal (Basics, Price Breaks, Run Charges & Setups). Compare the detail level against the old app's `DecorationForm` to identify specific gaps.

**Key gap:** The old app has run-charge-level setup charges (a setup charge nested under a specific run charge, like "Puff Ink Setup" under the "Puff Ink" run charge). BrandOps may not support this nested hierarchy -- verify and add if missing.

**Priority:** P2 -- The current implementation is functional for Trevor's testing. Enhancements are refinements.

---

#### F10. Front-Facing Catalog Enhancement
**Source:** EXTRACT "Front-Facing Catalog (Future)" section

BrandOps already has `/catalog` and `/catalog/[productId]` routes. Trevor wants:
- Filter by brand, category, type
- Grid layout with images
- "Add to Project" or "Request Quote" flow
- Eventually connected to Stripe checkout

**Priority:** P2 -- The admin-side product experience (F1-F4) must be solid before the public catalog matters.

---

### P3 -- Future

#### F11. Order Lifecycle Automation
**Source:** EXTRACT "Order Lifecycle Automation (Phase 3 -- Backend)"

Email-triggered order status updates:
1. Order confirmed -> email to client
2. Entered into Salesforce -> email with SO PDF
3. Partially/fully shipped -> email with tracking
4. Invoice ready -> email with PDF + Stripe pay link

Requires: email inbound parsing, AI extraction, order record matching. Save for after V1 frontend is solid.

#### F12. Matt's Email Flow (AI Inbox)
**Source:** EXTRACT, carried from R3

Matt (employee) forwards email with SO number + tracking -> AI agent parses -> updates order -> triggers client notification. Backend automation, not this round.

---

## 5. Business Rules

### BR1. Dual Add-On Pricing
**Product-level add-ons** contribute to the per-unit cost across ALL quantities:
```
total_addon_cost_per_unit = SUM(product_addons.cost_per_unit)
```

**Location-level add-ons** contribute to the per-unit cost for that specific decoration:
```
total_location_addon_cost = SUM(location_addons.cost_per_unit) per decoration
```

Both feed into the pricing grid:
```
Cost = Blank + Deco + Run Charges + Product Add-Ons + Location Add-Ons
Sale = Cost / (1 - margin%)
Profit = Sale - Cost
```

### BR2. Art Received + Quantities Received State Machine
```
art_received=false, quantities_received=false -> status: draft
art_received=true,  quantities_received=false -> status: draft
art_received=false, quantities_received=true  -> status: draft
art_received=true,  quantities_received=true  -> status: ready_for_client_input
```

On client portal (inverted):
- Art NOT received -> show upload sections per decoration location
- Quantities NOT received -> show quantity input matrix (color x size)
- Both received -> read-only summary, no input needed

### BR3. AI Scrape Data Handling
- User enters THEIR OWN pricing (the scraper extracts product data but NOT cost data)
- AI humanizes the description: e.g., supplier says "100% combed ring-spun cotton, 5.3 oz" -> AI writes "Premium heavyweight cotton tee with a soft, broken-in feel. Built at 5.3 oz for durability without the bulk."
- Images extracted from supplier pages are hotlinked (we don't re-host them in demo mode)
- Supplier SKU stored as `vendor_api_id` on the Product

### BR4. Catalog Link Auto-Population
When selecting a product "From Catalog" in a project:
1. Product name, image, category, type auto-fill
2. Blank costs auto-fill from product defaults (overridable at line-item level)
3. Available sizes and colors auto-fill (user can subset)
4. Template decoration locations pre-populate (user can add/remove/customize)
5. Add-ons do NOT auto-fill (they're per-project decisions)

---

## 6. UX Decisions

### UD1. Three-Mode Add Product Flow
Trevor's old app has "From Catalog" built in. Call 5 introduces "AI Entry" as a third option. The final flow:

```
[Add Product] -> Modal/Sheet with 3 options:
  1. "From Catalog" -> Search/browse existing products -> auto-populate
  2. "Quick Entry" -> Empty form, manual entry
  3. "AI Entry" -> Paste URL -> scrape -> review -> publish to catalog -> auto-populate
```

"AI Entry" is NOT the same as "From Catalog" -- it creates a NEW product in the catalog first, then links it to the project.

### UD2. Sheet Component for Product Editing (75vw)
Trevor's old app uses a `Sheet` (right-side slide panel, 75vw) for editing products within a project -- NOT a dialog/modal. BrandOps already uses `SlidePanel` for the `ProductDetailPanel`. Confirm this matches the `sm:max-w-[75vw]` pattern from the old app.

### UD3. Product Table Columns
Old app table: Name | SKU | Type | Sizes | Status | Edit button
Current BrandOps: Name+Supplier | Category | Supplier | Type | Cost Range | Active | Sell Price

Trevor's old app is simpler. BrandOps has MORE columns which is fine (more info at a glance). No change needed -- the current table is an enhancement.

### UD4. Product Images Per Color
Each color variant should support multiple product images (not just a swatch). Users can browse product images by color. One image per color is marked as `is_primary`. This matches the old app's `product_color_images` table pattern.

### UD5. Add-On Section Split
The current "Per-Unit Add-Ons" section in `ProductDetailPanel` should be restructured into:
- **Product Add-Ons** header with table: Name | Cost | Sale | Delete
- **Location Add-Ons** header with table: Location (dropdown) | Name | Cost | Sale | Delete

Both sections visible in the product detail slide panel.

---

## 7. Integration Requirements

### IR1. URL Scraping API Route
**Route:** `POST /api/products/scrape`
**Input:** `{ url: string }`
**Output:** `ScrapedProductData` (see Section 2C)
**Implementation:** Server-side fetch (SSR to bypass CORS) + HTML parsing (cheerio) + AI extraction (Claude Haiku)

**Target suppliers:**
| Supplier | Domain | Notes |
|----------|--------|-------|
| S&S Activewear | ssactivewear.com | Largest blank supplier, $5B company |
| SanMar | sanmar.com | Major blank supplier |
| HitPromo | hitpromo.net | All-in promo products, CJ/Raj API access confirmed |
| Generic | * | Fallback: extract whatever structured data is available |

**For demo mode:** Return mock `ScrapedProductData` with realistic values. The full scraping pipeline can be wired up when real API keys are available.

### IR2. No Other New Integrations This Round
All other integrations (Salesforce, Stripe, email inbox, S&S API) remain deferred per R3 transition doc. The AI scraper is the only new external integration.

---

## 8. Gap Analysis -- Current Build State vs What's Needed

| Feature | Current State | What's Needed | Effort | Priority |
|---------|--------------|---------------|--------|----------|
| **Products 4-tab form** | Built in R3 (ProductEditModal). Has Basics, Blank Costs, Variants, Decorations tabs | Enhance Variants tab with multi-image-per-color support. Enhance Decorations tab with named locations + placeholder charges | Medium | P0 |
| **Project->Catalog linking** | ProductDetailPanel has ProductSearchDropdown (R3) | Add "From Catalog" vs "Quick Entry" vs "AI Entry" mode selector. Verify auto-populate works on catalog selection | Medium | P0 |
| **Dual-level add-ons** | LineItemAddOn exists (name + cost_per_unit only) | Add sale_price, id, level field. Split UI into product-level and location-level sections. Wire into pricing grid | Medium | P0 |
| **AI Product Assistant** | Does not exist | New API route + scrape/parse/AI pipeline + review form + publish flow | High | P0 |
| **Art/Quantities checkboxes** | `art_received` exists. `quantities_received` does NOT exist | Add field to type. Add checkbox to ProductDetailPanel. Wire client portal conditional sections | Low | P1 |
| **Creative standalone page** | Creative requests only in ProjectDetailPanel (R3) | New `/dashboard/creative/page.tsx` with filters, cross-project aggregation | Medium | P1 |
| **Per-location artwork upload** | Client portal exists, artwork upload is generic | Split upload into per-decoration-location zones | Medium | P1 |
| **Shipping address from project** | Shipping card has address dropdown, NO inline add | Add "New" button + inline address form to shipping card in ProjectDetailPanel | Low | P1 |
| **Decorations page enhancement** | 3-tab modal with matrix, run charges, setup charges | Verify nested run-charge-level setup charges. Compare matrix UI detail | Low | P2 |
| **Front-facing catalog** | `/catalog` route exists | Filter/search/quote flow enhancements | Medium | P2 |

---

## 9. Surgeon's Recommendations

### R1. BUILD ORDER: AI Scraper First, Then Products Overhaul, Then Add-Ons, Then Catalog Linking

**Rationale:** The AI Product Assistant (F4) is Trevor's #1 excitement driver and a competitive differentiator. Building it first creates visible momentum. The products overhaul (F1) is mostly enhancing existing code. Add-ons (F3) are a type system change that flows naturally after products. Catalog linking (F2) ties everything together.

**Proposed build sequence:**
1. F4 (AI Product Assistant) -- new API route + review form + publish flow
2. F1 (Products 4-tab enhancements) -- multi-image per color, decoration locations
3. F3 (Dual-level add-ons) -- type restructure + split UI
4. F2 (Catalog linking) -- mode selector + auto-populate verification
5. F5 (Art/Quantities checkboxes) -- if time allows
6. F6 (Creative standalone page) -- if time allows

### R2. Keep the API Route as a Demo Stub Initially

The scraper API route should work in two modes:
- **Demo mode** (default): Return a hardcoded `ScrapedProductData` response for any URL. This lets us build and test the full UI flow without worrying about CORS, supplier HTML changes, or API costs.
- **Live mode** (when `ANTHROPIC_API_KEY` is configured): Actually fetch the URL, parse HTML, call Claude Haiku for structured extraction.

This follows Trevor's own pattern: demo data first, real backend later. Build the UX, validate with Trevor, wire up the real backend in a future round.

### R3. Type Changes Should Be Surgical

The `LineItemAddOn` restructure (adding `id`, `sale_price_per_unit`, `level`, `decoration_id`) must be done carefully:
- Update the type in `app.ts`
- Update all places that CREATE add-ons (ProductDetailPanel)
- Update all places that READ add-ons (PricingGrid, quoting engine)
- Update demo data to include the new fields
- Do NOT break existing add-on rendering

### R4. Defer Database Migrations

Everything is still demo/frontend data. No Supabase schema exists. All new fields go into the TypeScript types and the demo data provider. Database migrations come in a future round when the frontend is validated.

### R5. The `quantities_received` Field Is Almost Free

`art_received` already exists and is wired up. Adding `quantities_received` is a copy-paste of the same pattern. Do it in this round -- it's low effort and completes the admin workflow Trevor described in plan.md Section 3.

### R6. Creative Standalone Page Uses Existing Components

The `CreativeRequestDetailPanel` component was built in R3. The standalone Creative page just needs a list view that aggregates across projects and opens the existing detail panel on click. No new complex components needed.

### R7. Do NOT Touch the Pricing Grid Quantity Breaks

R3 already fixed the PricingGrid to 7 columns (24-35, 36-49, 50-99, 100-199, 200-499, 500-999, 1000+). Leave it alone.

### R8. Watch for Demo Data Provider Size

The demo data provider is already ~2000 lines. Adding demo data for scraped products, location add-ons, and creative requests will grow it further. Keep demo data additions minimal -- just enough to demonstrate the feature, not exhaustive.

---

## Files to Reference

| File | What It Shows |
|------|--------------|
| `old-app-reference/ProductsPage.tsx.ref` | 4-tab product form with Basics, Blank Costs, Variants (multi-image per color), Decoration Locations |
| `old-app-reference/ProjectDetailPage.tsx.ref` | Sheet-based product editing (75vw), inline address form, shipping card with "New" button |
| `old-app-reference/CreativePage.tsx.ref` | Standalone creative request listing with search, status/type/designer filters |
| `old-app-reference/CreativeDetailPage.tsx.ref` | Full creative detail: status, assigned to, due date, attachments, version history, edit requests, time tracking |
| `old-app-reference/DecorationsPage.tsx.ref` | Decoration matrix with nested run-charge setup charges |
| `old-app-reference/plan.md` | Art Received / Quantities Received checkboxes, per-location artwork upload |

---

## Key Quotes from Call 5

> "If we built this [AI product assistant], we don't need a PromoStandards integration. Any distributor can now just copy, paste, review, and publish." -- Trevor on the competitive moat

> "Paste the URL, it extracts all the data I need, I enter my own pricing and click save and I'm done. Holy living shit, dude." -- Trevor on the AI scraper

> "I'm going to compile one final heavy push. Let's get this app to a decent V1 where it makes logical sense to me." -- Trevor on R4 expectations

> "The true test is passing it to somebody like Kristen or my other team members and just giving it to them. Does it make sense to you? Could you write up an order?" -- Usability bar

> "My app that I have in Lovable, man -- I'm just so bummed that I spent all that time in Lovable and now I can't access the code." -- Why the old-app reference files matter
