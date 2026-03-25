# Master Plan — Round 5

> **Architect:** Phase 2 of Post-Build Squad
> **Build:** BrandOps — `/Users/vit10081/Desktop/bloom-builds/brandops/`
> **Source:** Extraction Summary Round 5 (Trevor voice dump, 1,023 lines)
> **Scope:** 19 Critical Corrections + 20 P1 Items + 25 P2 Items = 64 total
> **Strategy:** XL items first while context is fresh, then sweep small stuff
> **Date:** 2026-03-05

---

## Table of Contents

1. [Phase A — XL: Price Break Distribution Algorithm + Quoting Rework](#phase-a)
2. [Phase B — XL: Order Lifecycle Rework](#phase-b)
3. [Phase C — XL: Split Shipment Builder](#phase-c)
4. [Phase D — XL: All-In Price Code System](#phase-d)
5. [Phase E — Critical Corrections Sweep](#phase-e)
6. [Phase F — P1 Features](#phase-f)
7. [Phase G — P2 Improvements](#phase-g)
8. [Files Modified Summary](#files-modified-summary)
9. [Type System Changes](#type-system-changes)
10. [New Components](#new-components)
11. [NOT in This Round (P3 Deferred)](#not-in-this-round)
12. [Terminology Rename Map](#terminology-rename-map)
13. [Business Logic Specs](#business-logic-specs)
14. [Demo Data Requirements](#demo-data-requirements)
15. [Known Risks](#known-risks)

---

<a id="phase-a"></a>
## PHASE A — XL: Price Break Distribution Algorithm + Quoting Rework

**Covers:** P1-3 (price break distribution), P1-2 (run/fixed charges per location + product-level fixed charges), P1-18 (decoration location image upload)

This is the single most complex business logic in the system. Must be built first because Phases E-G reference the updated quoting model.

### A1. Type System — New Charge Interfaces + Project Deadline Rename

**Files:** `web/lib/types/app.ts`
**What changes:**
- Rename `enhanced_date` to `project_deadline` on `Project` interface (line 238)
- Rename `enhanced_date` to `project_deadline` on `ProjectLineItem` interface (line 273)
- Add `ship_date?: string` to `Project` interface (new field)
- Add `ship_date?: string` to `ProjectLineItem` interface (new field)
- Add `display_name?: string` to `ProjectLineItem` interface (for catalog override)
- Add `ProductFixedCharge` interface:
  ```typescript
  export interface ProductFixedCharge {
    id: string;
    name: string;           // "Rush Fee", "Freight Surcharge"
    amount: number;         // Flat fee
    sale_amount: number;    // Customer-facing price
  }
  ```
- Add `product_fixed_charges: ProductFixedCharge[]` to `ProjectLineItem` interface
- Add `art_file_url?: string` to `LineItemDecoration` interface (per-location art upload)
- Rename `LineItemAddOn` field `level: AddOnLevel` to keep for backward compat, but add comment that UI will show "Run Charges" / "Fixed Charges"
- Add `estimated_shipping_cost?: number` to `Project` interface
- Add `estimated_shipping_cost?: number` to `ProjectLineItem` interface
- Add `'partially-shipped'` to `OrderStatus` union type (between `'in-production'` and `'shipped'`)
- Remove `'entered'` from `OrderStatus` union type
- Add `Shipment` interface:
  ```typescript
  export interface Shipment {
    id: string;
    order_id: string;
    tracking_number: string;
    carrier: string;
    ship_date: string;
    estimated_arrival?: string;
    status: ShipmentStatus;
    items_shipped?: number;
    notes?: string;
  }
  ```
- Add `shipments: Shipment[]` to `Order` interface
- Add `sales_order_pdf_url?: string` to `Order` interface
- Add `invoice_pdf_url?: string` to `Order` interface
- Add `SplitShipmentDestination` interface:
  ```typescript
  export interface SplitShipmentDestination {
    id: string;
    address_book_entry_id?: string;
    label: string;
    address: Address;
    contact_name?: string;
    contact_phone?: string;
    allocations: SplitShipmentAllocation[];
  }
  ```
- Add `SplitShipmentAllocation` interface:
  ```typescript
  export interface SplitShipmentAllocation {
    line_item_id: string;
    product_name: string;
    quantity: number;
  }
  ```
- Add `split_shipments: SplitShipmentDestination[]` to `Project` interface
- Add `PriceCode` type:
  ```typescript
  export type PriceCode = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'L' | 'M' | 'N' | 'P' | 'R';
  ```
- Add `AllInPriceBreak` interface:
  ```typescript
  export interface AllInPriceBreak {
    min_quantity: number;
    max_quantity: number;
    list_price: number;       // The published/list price
    price_code: PriceCode;    // Discount code letter
    net_cost: number;         // Calculated: list_price * (1 - discount%)
  }
  ```
- Add `all_in_price_breaks: AllInPriceBreak[]` to `Product` interface (for all-in products)
- Add `setup_cost_per_color?: number` to `Product` interface (all-in: setup per color)
- Add `setup_sale_per_color?: number` to `Product` interface (all-in: sale price per color setup)
- Add `ContactType` type: `'order' | 'finance' | 'shipping' | 'billing' | 'general' | 'other'`
- Add `contact_type?: ContactType` to `ClientContact` interface
- Add `VendorContact` interface:
  ```typescript
  export interface VendorContact {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    title?: string;
    notes?: string;
  }
  ```
- Add `contacts: VendorContact[]` to `Vendor` interface
- Add `TicketComment` interface:
  ```typescript
  export interface TicketComment {
    id: string;
    author: string;
    message: string;
    created_at: string;
  }
  ```
- Add `comments: TicketComment[]` to `Ticket` interface
- Add `order_id?: string`, `linked_vendor_id?: string`, `name: string`, `priority: 'low' | 'medium' | 'high' | 'critical'`, `shareable_link?: string` to `Ticket` interface
- Add `ProjectComment` interface:
  ```typescript
  export interface ProjectComment {
    id: string;
    author: string;
    author_avatar?: string;
    message: string;        // Supports @mentions
    created_at: string;
  }
  ```
- Add `comments: ProjectComment[]` to `Project` interface
- Add `client_facing_notes?: string` to `Project` interface (separate from existing `internal_notes`)
- Add `change_request_pending?: boolean` to `Project` interface
- Add `approval_phase?: 'collecting' | 'final-approval' | 'approved'` to `Project` interface
- Add `payment_status?: 'unpaid' | 'paid' | 'partial'` to `Project` interface
- Add `payment_details?: { amount: number; method: string; date: string; reference?: string }` to `Project` interface
- Add `CreativeFileSection` type: `'provided' | 'client-provided' | 'print-files' | 'miscellaneous'`
- Update `CreativeRequestType` to include Trevor's types: `'branding-deck' | 'tier-a-deck' | 'tier-b-deck' | 'tech-pack' | 're-vector' | 'single-mock' | 'other'`

**Estimated lines:** ~120 new/modified
**Dependencies:** None — this is the foundation everything else builds on

### A2. Price Code Constants

**Files:** `web/lib/constants/app.ts`
**What changes:**
- Add `PRICE_CODE_DISCOUNTS` map:
  ```typescript
  export const PRICE_CODE_DISCOUNTS: Record<string, number> = {
    'A': 0.50, 'B': 0.475, 'C': 0.45, 'D': 0.425, 'E': 0.40,
    'F': 0.375, 'G': 0.35, 'H': 0.325, 'L': 0.30, 'M': 0.25,
    'N': 0.20, 'P': 0.15, 'R': 0.10,
  };
  ```
- Add `PRICE_CODE_LABELS` map (letter → "C (45% off)" etc.)
- Add `US_STATES` array for state picker (50 states + DC, as `{ code: string; name: string }[]`)
- Add `CONTACT_TYPE_LABELS` map
- Update `ORDER_STATUS_LABELS`: remove `'entered'` key, add `'partially-shipped': 'Partially Shipped'`
- Update `ORDER_STATUS_STYLES`: remove `'entered'` key, add `'partially-shipped'` style
- Add `CREATIVE_REQUEST_TYPE_LABELS` map with Trevor's types
- Add `TICKET_PRIORITY_STYLES` map

**Estimated lines:** ~80 new
**Dependencies:** A1

### A3. Price Break Distribution Engine

**Files:** `web/lib/utils/quoting.ts`
**What changes:**
- Add `interpolateSecondaryBreaks()` function:
  ```typescript
  /**
   * Given a secondary decoration matrix's native quantity breaks and prices,
   * interpolate costs at the primary matrix's break points.
   *
   * Uses linear interpolation between the two nearest secondary breaks.
   * If the primary break is below/above all secondary breaks, clamp to
   * nearest secondary value.
   *
   * @param primaryBreaks - The quantity break points to interpolate AT (e.g., [24, 36, 50, 100])
   * @param secondaryTiers - The secondary matrix's native tiers with pricesByColors
   * @param colorCount - The color count to look up in the secondary tiers
   * @returns Per-unit costs at each primary break point
   */
  export function interpolateSecondaryBreaks(
    primaryBreaks: number[],
    secondaryTiers: { min: number; max: number; pricesByColors: Record<number, number> }[],
    colorCount: number
  ): number[]
  ```
- Add `distributeDecorationCosts()` function:
  ```typescript
  /**
   * Given a line item with multiple decoration locations, each potentially
   * using a different decorator matrix:
   * 1. Identify the primary location (first decoration, index 0)
   * 2. Use primary location's matrix break points as the unified break points
   * 3. For each secondary location, interpolate its costs at primary break points
   * 4. Return a unified cost-per-unit array at each primary break point
   *
   * The result is what the client sees: one set of quantity breaks with
   * all decoration costs rolled in.
   */
  export function distributeDecorationCosts(
    decorations: LineItemDecoration[],
    totalQuantity: number
  ): { breakPoints: number[]; costPerUnit: number[]; breakdown: { locationLabel: string; costs: number[] }[] }
  ```
- Update `calculateLineItem()` to accept optional `distributedDecorationCost` parameter (when price break distribution is active, the caller passes the pre-distributed per-unit cost instead of summing individual `decoration_cost` fields)
- Add `calculateNetCostFromPriceCode()`:
  ```typescript
  export function calculateNetCostFromPriceCode(listPrice: number, priceCode: string): number {
    const discount = PRICE_CODE_DISCOUNTS[priceCode] ?? 0;
    return listPrice * (1 - discount);
  }
  ```
- Add `calculateAllInLineItem()` function that uses `AllInPriceBreak[]` + quantity to find the right tier and compute cost via price code

**Estimated lines:** ~180 new
**Dependencies:** A1, A2

### A4. Demo Data — Update for New Types

**Files:** `web/lib/demo/demo-data-provider.ts`
**What changes:**
- Rename all `enhanced_date` fields to `project_deadline` in demo projects and line items
- Add `ship_date` to 2-3 demo projects
- Add `product_fixed_charges: []` to all existing line items (empty default)
- Add one demo line item with a product-level fixed charge (rush fee)
- Add `art_file_url` to 2 demo decorations (mock URLs)
- Add `display_name` to 1-2 demo line items (e.g., "Skull T-Shirts" for a Bella+Canvas 3001)
- Add `estimated_shipping_cost` to 2 demo projects
- Add `shipments: []` and `sales_order_pdf_url: undefined` and `invoice_pdf_url: undefined` to all demo orders
- Remove `'entered'` status orders — change to `'in-production'`
- Add one demo order with `status: 'partially-shipped'` and a `shipments` array with 1 entry
- Add `split_shipments: []` to all demo projects, add one project with 2 split shipment destinations
- Add `all_in_price_breaks` to 1-2 demo all-in products with price codes
- Add `setup_cost_per_color` and `setup_sale_per_color` to demo all-in products
- Add `contact_type` to demo client contacts
- Add `contacts: []` to all demo vendors, add actual contacts to 2 vendors
- Add `comments: []` to demo tickets, add comments to 2 tickets
- Add `order_id`, `linked_vendor_id`, `name`, `priority`, `shareable_link` to demo tickets
- Add `comments: []`, `client_facing_notes`, `change_request_pending`, `approval_phase`, `payment_status` to demo projects
- Add `getDemoSplitShipments(projectId)` export
- Update `ORDER_STATUS_LABELS` and `ORDER_STATUS_STYLES` to remove `entered`, add `partially-shipped`
- Add `getDemoShipments(orderId)` export
- Update `CreativeRequestType` values in demo creative requests

**Estimated lines:** ~250 modified/new
**Dependencies:** A1, A2

---

<a id="phase-b"></a>
## PHASE B — XL: Order Lifecycle Rework

**Covers:** P1-4 (order detail 3/4 sidebar), P1-5 (order lifecycle: partially shipped, shipment mgmt, PDF upload, mark-as-entered), CC-18 (remove "Entered Salesforce")

### B1. Order Detail Slide Panel

**Files:** `web/app/dashboard/orders/page.tsx`
**What changes:**
- Replace the current `DetailPanel` (small pop-out) with `SlidePanel` (3/4 sidebar, same pattern as ProjectDetailPanel)
- The new order detail shows:
  - Header: order number, product name, primary image, status badge
  - Key details: total sale amount, profit (unit_price - unit_cost) * quantity, ship date, in-hands date
  - Decoration summary with art files
  - All associated project files (link to project)
  - Shipment management section (see B2)
  - Sales order PDF upload area
  - Invoice PDF upload area
  - Status transition buttons (see B3)
- Remove `'entered'` from `ALL_ORDER_STATUSES` and `ORDER_KANBAN_STATUSES` arrays
- Add `'partially-shipped'` to both arrays (between `in-production` and `shipped`)
- Remove `'entered'` from `STATUS_COLORS`, add `'partially-shipped': 'bg-amber-500'`
- Full rewrite of the detail section (currently ~100 lines of the `DetailPanel` content), expanding to ~350 lines for `SlidePanel` content

**Estimated lines:** ~400 modified (net: ~300 new)
**Dependencies:** A1, A4

### B2. Shipment Management Section

**Files:** `web/app/dashboard/orders/page.tsx` (within the SlidePanel from B1)
**What changes:**
- Add shipment list showing existing shipments with tracking number, carrier, ship date, estimated arrival, status
- "Add Shipment" button opens inline form: carrier dropdown (UPS/FedEx/USPS/DHL), tracking number input, ship date picker
- When tracking number pasted, show a mock "AI Lookup" indicator (future: real tracking API)
- "Send to Client" button per shipment (mock email trigger, shows toast)
- When all items shipped (sum of `items_shipped` >= order quantity), auto-suggest transition to `shipped`
- When some but not all shipped, status = `partially-shipped`

**Estimated lines:** ~150 (within orders page)
**Dependencies:** B1

### B3. Order Status Transition Logic

**Files:** `web/app/dashboard/orders/page.tsx`
**What changes:**
- **Order Entry Needed → In Production:** Button "Mark as Entered". Validation: `sales_order_pdf_url` must be set (show warning if not). On click: set status to `in-production`, show toast "Email sent to client with sales order" (mock).
- **In Production → Partially Shipped:** Automatic when first shipment added.
- **Partially Shipped → Shipped:** Automatic when all items shipped. Manual override button available.
- **Shipped → Ready for Invoicing:** Button "Mark Ready for Invoicing". Available when all shipments have `status: 'delivered'` (or manual override).
- **Ready for Invoicing → Invoiced:** Button "Send Invoice". Validation: `invoice_pdf_url` must be set. On click: set status, toast "Invoice sent to client" (mock).
- State machine enforced: no skipping steps (except cancel which is always available)

**Estimated lines:** ~80
**Dependencies:** B1, B2

---

<a id="phase-c"></a>
## PHASE C — XL: Split Shipment Builder

**Covers:** P1-6 (split shipment admin builder), P2-15 (PNG download), P2-16 (client-side builder)

### C1. Rework SplitShipmentBuilder Component

**Files:** `web/components/dashboard/SplitShipmentBuilder.tsx`
**What changes:**
- Complete rewrite. Current component (133 lines) is a single-product, single-address model. New version is a multi-product, multi-destination allocation matrix.
- Props change:
  ```typescript
  interface SplitShipmentBuilderProps {
    lineItems: { id: string; productName: string; totalQuantity: number }[];
    clientId: string;
    addressBook: AddressBookFolder[];
    existingDestinations?: SplitShipmentDestination[];
    onSave: (destinations: SplitShipmentDestination[]) => void;
    onClose: () => void;
  }
  ```
- UI: Left column = destination cards (address + contact). Right area = allocation matrix grid (rows = destinations, columns = products, cells = quantity inputs).
- "Add Destination" button: dropdown to select from address book folder/entry OR "New Address" inline form (with "Save to Address Book" checkbox)
- Quantity validation: each column total must equal product total quantity. Show remaining count, warning badge if mismatch.
- "Download PNG" button: uses `html2canvas` or DOM-to-image to capture the allocation matrix as a PNG (P2-15)
- Summary footer: total pieces, total destinations, per-product breakdown

**Estimated lines:** ~450 (full rewrite from ~133)
**Dependencies:** A1, A4

### C2. Integrate Split Shipment into ProjectDetailPanel

**Files:** `web/components/projects/ProjectDetailPanel.tsx`
**What changes:**
- Add "Split Shipments" tab in the project detail tabs (alongside Products, Files, Creative Requests, etc.)
- When `project.split_shipments` has entries OR project has split shipment flag, show the SplitShipmentBuilder
- When empty and no split flag, show "Enable Split Shipments" toggle
- Pass project line items and client address book to builder

**Estimated lines:** ~60 new
**Dependencies:** C1

### C3. Client-Side Split Shipment Builder (Portal)

**Files:** `web/app/portal/[shareableLink]/page.tsx`
**What changes:**
- When project has split shipment enabled but no destinations configured, show a client-facing split shipment builder section
- Simplified version of admin builder: step-by-step wizard (Step 1: Add destination address, Step 2: Allocate quantities, Step 3: Review & Submit)
- Client can look up existing address book entries or create new ones (saved to address book)
- On submit: data saved to project's `split_shipments` array

**Estimated lines:** ~200 new
**Dependencies:** C1

---

<a id="phase-d"></a>
## PHASE D — XL: All-In Price Code System

**Covers:** P1-19 (all-in price break matrix with per-column price codes)

### D1. Product Catalog — All-In Price Break Editor

**Files:** `web/components/products/ProductEditModal.tsx`
**What changes:**
- When product type is `all-in`, add a "Price Breaks" tab (new tab alongside existing Variants, Decorations tabs)
- Price break grid: columns = quantity breaks (user adds columns), rows = price per unit
- Each column has: min qty, max qty, list price input, price code dropdown (A-R), calculated net cost (read-only, auto-computed)
- Below the grid: setup cost per color (cost input + sale price input)
- "Add Column" button adds a new quantity break
- Visual: net cost cell shows green/red based on margin vs org default margin

**Estimated lines:** ~200 new
**Dependencies:** A1, A2, A3

### D2. Product on Project — All-In Pricing from Price Codes

**Files:** `web/components/projects/ProductDetailPanel.tsx`
**What changes:**
- When a product with `product_type === 'all-in'` is on a project and has `all_in_price_breaks`, the pricing section shows:
  - The applicable price break tier based on `total_quantity`
  - List price, price code letter, net cost (calculated), margin
  - Setup cost per color (from product catalog) shown as a fixed charge
- Integrate with `calculateAllInLineItem()` from quoting engine
- Replace current simple `vendor_cost` display with price-code-aware display

**Estimated lines:** ~80 modified
**Dependencies:** A3, D1

### D3. PricingGrid Update for All-In Products

**Files:** `web/components/shared/PricingGrid.tsx`
**What changes:**
- Add an "all-in" rendering mode that shows: quantity breaks as columns, list price row, price code row, net cost row, margin row
- Distinct from the current contract product grid (which shows blank + decoration + add-ons)
- Toggle based on `productType` prop

**Estimated lines:** ~100 new
**Dependencies:** D1, D2

---

<a id="phase-e"></a>
## PHASE E — Critical Corrections Sweep

These are terminology fixes, UI corrections, and small-but-important changes Trevor explicitly flagged as wrong. Grouped for efficient find-and-replace.

### E1. "Enhanced Date" → "Project Deadline" (CC-1)

**Files to modify:**
- `web/lib/types/app.ts` — Already done in A1 (rename field)
- `web/lib/demo/demo-data-provider.ts` — Already done in A4 (rename data fields)
- `web/components/projects/ProjectDetailPanel.tsx` — Line 206: rename `deadlineDate` state init from `project.enhanced_date` to `project.project_deadline`. Label "Enhanced Date" → "Project Deadline" everywhere in this file.
- `web/app/dashboard/projects/page.tsx` — Lines 505, 527: change label "Enhanced Date" to "Project Deadline"
- `web/app/dashboard/projects/[id]/page.tsx` — Lines 369-376: change `enhanced_date` references to `project_deadline`, label "Enhanced Date" → "Project Deadline"
- `web/app/dashboard/clients/[id]/page.tsx` — Line 204: column header "Enhanced Date" → "Project Deadline"
- `web/app/dashboard/orders/page.tsx` — Line 289: label "Enhanced Date" → "Project Deadline"
- `web/app/portal/[shareableLink]/page.tsx` — Lines 317-325: change `enhanced_date` to `project_deadline`, label "Enhanced Date" → "Project Deadline"

**Estimated lines:** ~30 modified
**Dependencies:** A1, A4

### E2. "Product Add-Ons" / "Location Add-Ons" → "Run Charges" / "Fixed Charges" (CC-2)

**Files to modify:**
- `web/components/projects/ProductDetailPanel.tsx` — Lines 937-1045:
  - Section title "Product Add-Ons" → "Run Charges" (per-unit surcharges)
  - Button "Add Product Add-On" → "Add Run Charge"
  - Empty state "No product add-ons yet" → "No run charges yet"
  - Section title "Location Add-Ons" → "Fixed Charges" (per-location flat fees)
  - Button "Add Location Add-On" → "Add Fixed Charge"
  - Empty state "No location add-ons yet" → "No fixed charges yet"
- `web/components/shared/PricingGrid.tsx` — Line 346+: rename any "Add-On" labels to "Run Charges" / "Fixed Charges" in the pricing breakdown

**Estimated lines:** ~25 modified
**Dependencies:** None (label changes only)

### E3. Color Selection from Catalog Colors (CC-3)

**Files:** `web/components/projects/ProductDetailPanel.tsx`
**What changes:**
- When adding a product from catalog (not quick entry), the color field becomes a dropdown/multi-select populated from `product.available_colors` instead of a free-text input
- Show color swatches (hex preview) next to each option
- Quick entry mode retains the current text-entry + Enter-to-create behavior
- Need to detect: if `line_item.product_id` matches a catalog product, fetch its `available_colors` via `getDemoProduct(product_id)`

**Estimated lines:** ~60 modified
**Dependencies:** A1

### E4. Client Detail → Full Page (CC-4)

**Files:** `web/app/dashboard/clients/page.tsx`, `web/app/dashboard/clients/[id]/page.tsx`
**What changes:**
- `clients/page.tsx`: Change row click handler from opening a sidebar/modal to navigating to `/dashboard/clients/{id}`
- `clients/[id]/page.tsx`: This already exists as a route. Verify it's a full-page experience (not a small pop-up). If it's using `DetailPanel`, convert to full-page layout with:
  - Header: company name, industry, status badge, primary contact
  - Tabs: Overview, Contacts, Address Book, Projects, Orders, Art Library, CRM
  - Overview tab: billing address, shipping address, payment terms, credit limit, tax exempt status, purchasing status, annual volume
  - Projects tab: table of all projects for this client (clickable to project detail)
  - Orders tab: table of all orders for this client
  - The existing client detail page likely needs expansion, not a full rewrite

**Estimated lines:** ~200 modified
**Dependencies:** A1

### E5. Add Product → 3/4 Sidebar (CC-5)

**Files:** `web/app/dashboard/projects/[id]/page.tsx`, `web/components/projects/ProductDetailPanel.tsx`
**What changes:**
- The current "Add Product" action opens a small form. Replace with a SlidePanel (3/4 width)
- Toggle at top: "From Catalog" | "Quick Entry"
- **From Catalog mode:**
  - Search bar searching demo products by name
  - Product cards with image, name, category, product type badge (contract/all-in)
  - Click selects product, auto-populates: name, category, product_type, available_colors, available_sizes, blank_costs (contract) or all_in_price_breaks (all-in)
  - Display Name field (editable, defaults to product name) — P2-1
- **Quick Entry mode:**
  - Manual entry for all fields: product name, brand, style, blank cost tiers, sizes (add button), colors (type + Enter)
  - All fields editable
- Both modes funnel into the same `ProjectLineItem` creation
- "Add to Project" button at bottom

**Estimated lines:** ~250 new (new component or major expansion of existing flow)
**Dependencies:** A1, E3

### E6. Sizes and Blank Costs Auto-Populate (CC-6)

**Files:** `web/components/projects/ProductDetailPanel.tsx`
**What changes:**
- When a contract product is selected from catalog, auto-populate `selected_sizes` from `product.available_sizes` and `blank_costs` lookup from `product.blank_costs`
- Currently sizes don't populate — wire the `getDemoProduct(product_id)` lookup to fill in `SizeQuantity[]` with quantity=0 for each available size
- Blank cost tier auto-selects based on total quantity

**Estimated lines:** ~40 modified
**Dependencies:** E5

### E7. Notes/Comments Restructure (CC-7)

**Files:** `web/components/projects/ProjectDetailPanel.tsx`
**What changes:**
- Current "Notes" field next to voice note → rename to "Comments" section with @mention support:
  - Comment input with `@` trigger that shows team member dropdown
  - Comment thread (newest first) with author avatar, name, timestamp, message
  - Uses `project.comments` array from new type
- Current "Internal Notes" → rename to "Notes" with two sub-sections:
  - "Client-Facing Notes" (visible on portal) — uses `project.client_facing_notes`
  - "Internal Notes" (admin only) — uses existing `project.internal_notes`
- Reposition: Comments section above client details card, Notes section below comments

**Estimated lines:** ~150 modified
**Dependencies:** A1

### E8. Quick Reorder Removal (CC-8)

**Files:** `web/app/portal/[shareableLink]/page.tsx`
**What changes:**
- Remove the "Quick Reorder" section entirely (around line 521)
- Remove related state/handlers if any

**Estimated lines:** ~20 deleted
**Dependencies:** None

### E9. Track Orders Conditional (CC-9)

**Files:** `web/app/portal/[shareableLink]/page.tsx`
**What changes:**
- Wrap the "Track Orders" button (line 279) in a conditional: only show when project has associated orders
- Check: `getDemoOrders().filter(o => o.project_id === project.id).length > 0`

**Estimated lines:** ~5 modified
**Dependencies:** None

### E10. Decorations Page — Vendor Grouping (CC-10, CC-11)

**Files:** `web/app/dashboard/decorations/page.tsx`
**What changes:**
- Remove the KPI cards section (decoration types, price breaks, setup charges, run charges stats — lines ~414-415 area)
- Add a vendor-level navigation layer:
  - Landing view: list of decorator vendors (from `getDemoVendors().filter(v => v.type === 'decorator' || v.type === 'both')`)
  - Each vendor card shows: name, number of matrices, decoration methods offered
  - Click vendor → shows that vendor's matrices (existing matrix list, filtered by `vendor_id`)
  - Breadcrumb: "Decorations > Culture Studio > Screen Print Matrix"
- The matrix edit modal remains the same, just accessed through vendor → matrix path

**Estimated lines:** ~150 modified
**Dependencies:** A1

### E11. Product Image Drag-and-Drop (CC-12)

**Files:** `web/components/products/ProductEditModal.tsx`
**What changes:**
- Replace URL input fields for product images with drag-and-drop zones
- Use HTML5 drag-and-drop API + file input fallback
- On drop: create object URL for preview (demo mode doesn't upload to storage)
- Primary image: large drop zone with preview
- Color variant images: smaller drop zones per color (R4 already has multi-image per color, but may use URL inputs — convert to drag-and-drop)

**Estimated lines:** ~80 modified
**Dependencies:** None

### E12. Vendor/Supplier Editable Fields (CC-13)

**Files:** `web/app/dashboard/vendors/page.tsx`
**What changes:**
- Currently vendor detail shows read-only fields. Add edit mode:
  - Click "Edit" button on vendor detail → fields become editable inputs
  - Editable: name, type, contact_name, contact_email, contact_phone, city, state, website_url, notes
  - "Save" and "Cancel" buttons
- Add "Contacts" section with multiple contacts (first name, last name, email, phone, title, notes) — P1-12
- "Add Contact" button with inline form
- Remove vendor scorecard for suppliers (keep average lead time for decorators) — P2-10 partial

**Estimated lines:** ~200 modified
**Dependencies:** A1

### E13. Client-Facing Artwork Fix (CC-14)

**Files:** `web/app/portal/[shareableLink]/page.tsx`
**What changes:**
- Current artwork section shows files with arbitrary "approved/pending review" statuses
- Link files to specific products/decoration locations instead
- Files grouped by product name, then by decoration location
- Remove arbitrary status badges, show "linked to [Product Name] > [Location]"

**Estimated lines:** ~60 modified
**Dependencies:** None

### E14. Lead Source Editable (CC-15)

**Files:** `web/components/projects/ProjectDetailPanel.tsx` or `web/app/dashboard/projects/[id]/page.tsx`
**What changes:**
- Find where Lead Source / Project Source is displayed (read-only)
- Make it an editable dropdown with options from `ProjectSource` type: 'website', 'direct', 'referral', 'program'
- Save updates to project state

**Estimated lines:** ~20 modified
**Dependencies:** None

### E15. Settings Page Cleanup (CC-16)

**Files:** `web/app/dashboard/settings/page.tsx`
**What changes:**
- Remove "Products" tab (`id: 'products'`) from TABS array
- Remove "Decorator Matrices" tab (`id: 'matrices'`) from TABS array
- Remove corresponding render sections
- These are now handled by their own left-nav pages

**Estimated lines:** ~100 deleted
**Dependencies:** None

### E16. Portal "Quote Details" → "Products" (CC-17)

**Files:** `web/app/portal/[shareableLink]/page.tsx`
**What changes:**
- Line 353: Change section header "Quote Details" to "Products"

**Estimated lines:** ~2 modified
**Dependencies:** None

### E17. Keep Decoration Types on Product (CC-19)

**Files:** No changes needed — `applicable_decorations` already exists on `Product` interface and was kept through R4. Just confirm it's visible in ProductEditModal. This is a "do nothing" confirmation.

**Estimated lines:** 0
**Dependencies:** None

---

<a id="phase-f"></a>
## PHASE F — P1 Features

### F1. Two-Phase Approval Flow on Portal (P1-1)

**Files:** `web/app/portal/[shareableLink]/page.tsx`
**What changes:**
- Replace single "Approve and Confirm Order" button with two-phase flow:
- **Phase 1 — "Submit Final Details":** Shown when `project.approval_phase === 'collecting'` or info is missing (no shipping address, missing quantities, etc.)
  - Client fills in: quantities per product, artwork uploads, shipping/billing addresses
  - Button: "Submit Final Details"
  - On submit: success message "Thank you, we've got everything. We're reviewing it. If we need anything else, we'll let you know."
  - Sets `project.approval_phase = 'collecting'` → awaiting internal review
- **Phase 2 — "Final Approval":** Shown when `project.approval_phase === 'final-approval'`
  - **Net Terms (net15/30/45/60):** Button says "Approve". Confirmation dialog: "Are you sure? Your project will be moved to production, and you will receive an invoice due within [N] days after it is shipped."
  - **Prepay:** Button says "Approve and Pay". Shows mock Stripe checkout (placeholder card form). On submit: mock payment recorded.
  - After approval: `project.approval_phase = 'approved'`
- Show estimated shipping cost when present
- Show per-product notes (client can add)
- Show "Change Request" button for client to request changes (sets `change_request_pending: true`)

**Estimated lines:** ~250 modified
**Dependencies:** A1, A4

### F2. File Section Restructure (P1-7)

**Files:** `web/components/projects/ProjectDetailPanel.tsx`
**What changes:**
- Current files section has categories from `ProjectFileCategory` type
- Add "Product Files" tab: files linked to specific products or decoration locations. Upload prompt asks which product/location.
- Add "Client Art" tab: linked lookup to client art library (read-only browser, not separate upload)
- Add OK/Problem marking on "Client Submitted" files: each file gets a status toggle (OK checkmark or Problem flag). Show warning if any files have "Problem" status.
- "Decks" tab: on upload, prompt for version notes (P2-24)

**Estimated lines:** ~120 modified
**Dependencies:** A1

### F3. Full Ticketing System (P1-8, CC-14)

**Files:** `web/app/dashboard/tickets/page.tsx`
**What changes:**
- Complete rewrite — remove "Coming in Round 2" banner
- Full CRUD:
  - Create ticket: name, type (reprint/credit/spoilage/refund), fault (vendor/our-fault), priority (low/medium/high/critical), link to project (dropdown), link to order (dropdown, filtered by selected project), link to vendor (dropdown)
  - Ticket detail: SlidePanel (3/4 sidebar) with all fields, comments section, status transition buttons
  - Status lifecycle: open → in-progress → resolved → closed (buttons for each valid transition)
- Table view with: ticket name, type, fault, priority, linked project, linked order, status, created date
- Filter by: status, type, fault, priority
- KPI cards: open count, in-progress count, resolved this month, avg resolution time
- Shareable link for vendor-facing view (P2-11): generate UUID, show "Copy Link" button

**Estimated lines:** ~500 (full rewrite from 143 lines)
**Dependencies:** A1, A4

### F4. Client Contacts with Contact Type (P1-9)

**Files:** `web/app/dashboard/clients/[id]/page.tsx`
**What changes:**
- In the Contacts section, add "Contact Type" field per contact: dropdown with options from `ContactType`
- Display contact type badge next to each contact
- Add ability to add multiple contacts (existing + new contact form inline)

**Estimated lines:** ~40 modified
**Dependencies:** A1

### F5. Address Book with Folders, State Picker, CSV Import (P1-10)

**Files:** `web/app/dashboard/clients/[id]/page.tsx`
**What changes:**
- Address Book section (already partially exists in types):
  - Folder list (e.g., "2026 World Tour", "HQ Locations", "Default")
  - Create folder, rename folder
  - Within folder: address entries with label, full address (street, city, state picker, zip, country), contact info
  - State picker: dropdown of 50 US states + DC (from `US_STATES` constant)
  - "Import CSV" button: file upload, parse CSV columns (label, street, city, state, zip), preview table, confirm import into selected folder
  - International address toggle: when enabled, shows country dropdown, state becomes free text

**Estimated lines:** ~250 new
**Dependencies:** A2 (US_STATES constant)

### F6. Client Art Library (P1-11)

**Files:** `web/app/dashboard/clients/[id]/page.tsx`
**What changes:**
- New "Art Library" tab on client detail page
- Default folders: "Branding", "Logos"
- User can create additional folders
- Within folder: grid of uploaded files (mock drag-and-drop upload in demo)
- Each file: thumbnail, name, upload date
- This same library is accessible from ProjectDetailPanel's "Client Art" file tab (read-only browser linking to client's library)

**Estimated lines:** ~150 new
**Dependencies:** E4

### F7. Creative Request Type Update + Custom Types (P1-13)

**Files:** `web/app/dashboard/creative/page.tsx`, `web/components/projects/CreativeRequestDetailPanel.tsx`
**What changes:**
- Update type dropdown to use Trevor's types: Branding Deck, Tier A Product Deck, Tier B Product Deck, Tech Pack, Re-Vector, Single Mock, Other
- Add "Custom Type" option that shows a text input for user-defined type
- Update `CreativeRequestType` usage to handle custom strings

**Estimated lines:** ~40 modified
**Dependencies:** A1

### F8. Per-Product Deadline and Ship Date Overrides (P1-14)

**Files:** `web/components/projects/ProductDetailPanel.tsx`
**What changes:**
- Add "Timeline" section in product detail:
  - Project Deadline (inherited from project, overridable per product): date picker
  - Ship Date (inherited from project, overridable per product): date picker
  - Visual indicator when product deadline differs from project deadline
- Uses `line_item.project_deadline` and `line_item.ship_date` fields

**Estimated lines:** ~60 new
**Dependencies:** A1

### F9. Estimated Shipping Cost (P1-15)

**Files:** `web/components/projects/ProjectDetailPanel.tsx`, `web/components/projects/ProductDetailPanel.tsx`
**What changes:**
- ProjectDetailPanel: Add "Estimated Shipping" field in the project summary section. Editable number input. Stored in `project.estimated_shipping_cost`.
- ProductDetailPanel: Add "Est. Shipping" field per product. Stored in `line_item.estimated_shipping_cost`.
- Portal: Show estimated shipping cost when present (read-only)

**Estimated lines:** ~40 new
**Dependencies:** A1

### F10. Inline Client Creation from New Project (P1-16)

**Files:** `web/app/dashboard/projects/page.tsx` or `web/app/dashboard/projects/[id]/page.tsx`
**What changes:**
- In the "New Project" flow, the client selector gets a "Create New Client" option
- On click: inline form appears within the project creation flow
  - Fields: company name, main contact name, email, phone, contact type
  - Billing/shipping can be deferred
- On save: creates new client in demo state, auto-selects for project

**Estimated lines:** ~80 new
**Dependencies:** A1

### F11. Client List Sorting and Aging (P1-17)

**Files:** `web/app/dashboard/clients/page.tsx`
**What changes:**
- Add sort options: "Annual Spend" (descending), "Last Activity" (most recent), "Last Ordered" (most recent), "Company Name" (alpha)
- Add "Aging" badge: if client's `last_ordered_date` or `last_quoted_date` is >60 days ago, show amber "Aging" badge
- Sort selector dropdown in header area

**Estimated lines:** ~50 modified
**Dependencies:** None

### F12. Decoration Location Image Upload (P1-18)

**Files:** `web/components/projects/ProductDetailPanel.tsx`
**What changes:**
- In the decoration locations section, add a drag-and-drop zone per location for art files
- Uses `decoration.art_file_url` field
- Show thumbnail preview when image uploaded
- Replaces/supplements existing `production_file_url` field with a visual drop zone

**Estimated lines:** ~50 new
**Dependencies:** A1

### F13. Change Request Tag (P1-20)

**Files:** `web/app/dashboard/projects/page.tsx`, `web/components/projects/ProjectDetailPanel.tsx`
**What changes:**
- Pipeline/list view: when `project.change_request_pending === true`, show an amber "Changes Requested" badge on the project card
- Project detail: show a prominent banner "Client has requested changes" with dismiss action
- Portal: "Request Changes" button sets the flag

**Estimated lines:** ~30 new
**Dependencies:** A1

---

<a id="phase-g"></a>
## PHASE G — P2 Improvements

### G1. Display Name Override (P2-1)

**Files:** `web/components/projects/ProductDetailPanel.tsx`
**What changes:**
- Add "Display Name" field at top of product detail. Auto-populated from catalog product name but fully editable.
- Uses `line_item.display_name`. If set, shown in portal and project views instead of `product_name`.

**Estimated lines:** ~15 new
**Dependencies:** A1

### G2. Colors in Quantity Entry (P2-2)

**Files:** `web/components/projects/ProductDetailPanel.tsx`
**What changes:**
- Currently size/quantity grid only shows sizes as rows. When product has `selected_color`, show a color-grouped quantity entry:
  - Color header → size/quantity row per color
  - Allows per-color-per-size quantities
- This requires adding `color` field to `SizeQuantity` or creating a nested structure

**Estimated lines:** ~80 modified
**Dependencies:** A1

### G3. Relocate Art/Quantities Received (P2-3)

**Files:** `web/components/projects/ProductDetailPanel.tsx`
**What changes:**
- Move `art_received` and `quantities_received` checkboxes from their current position to a prominent "Readiness Gates" section at the top of the product detail
- Large toggle-style checkboxes with labels "Art Received" and "Quantities Received"
- Below them: "Ready" green badge (both checked) or "Draft" amber badge (either unchecked)
- Business rule reminder: "Financial calculations are suppressed until both gates are checked"

**Estimated lines:** ~40 modified
**Dependencies:** None

### G4. Client-Submitted File Linking (P2-4)

**Files:** `web/app/portal/[shareableLink]/page.tsx`
**What changes:**
- When client uploads artwork, prompt: "Does this artwork relate to a product on this project?" with product dropdown
- If yes, select product and optionally decoration location
- File gets `product_id` and `decoration_location_id` metadata
- Admin sees files grouped by product/location in "Client Submitted" files tab

**Estimated lines:** ~60 new
**Dependencies:** F2

### G5. Creative AI Description Assistant (P2-5)

**Files:** `web/components/projects/CreativeRequestDetailPanel.tsx`
**What changes:**
- Add "AI Assistant" button next to description field
- On click: opens a chat-style mini panel where user describes what they need in natural language
- Mock AI generates a structured description from the free-form input
- "Use This Description" button fills the description field

**Estimated lines:** ~80 new
**Dependencies:** None

### G6. Creative Files Section Restructure (P2-6)

**Files:** `web/components/projects/CreativeRequestDetailPanel.tsx`
**What changes:**
- Replace flat file list with tabbed sections: "Provided Files", "Client-Provided Files", "Print Files", "Miscellaneous"
- Uses `CreativeFileSection` type
- Upload to specific section, files tagged with section type

**Estimated lines:** ~60 modified
**Dependencies:** A1

### G7. Creative Kanban View (P2-7)

**Files:** `web/app/dashboard/creative/page.tsx`
**What changes:**
- Add view toggle: "Table" | "Kanban" (same pattern as projects page)
- Kanban columns: Pending, In Progress, Review, Approved, Cancelled
- Cards show: title, type badge, project name, due date, assignee
- Drag-and-drop between columns updates status

**Estimated lines:** ~100 new
**Dependencies:** None

### G8. Creative Note Per Attachment (P2-8)

**Files:** `web/components/projects/CreativeRequestDetailPanel.tsx`
**What changes:**
- When uploading a file to creative request, show a "Note" text input alongside each file
- Note stored with the file metadata
- Display note below file name in file list

**Estimated lines:** ~20 modified
**Dependencies:** None

### G9. Vendor Related Projects (P2-9)

**Files:** `web/app/dashboard/vendors/page.tsx`
**What changes:**
- In vendor detail, add "Related Projects" section
- Query demo projects where any line item's decoration `vendor_id` or `vendor_name` matches this vendor
- Display as table: project name, client, status, total (clickable to project)

**Estimated lines:** ~60 new
**Dependencies:** None

### G10. Vendor Related Tickets (P2-10)

**Files:** `web/app/dashboard/vendors/page.tsx`
**What changes:**
- For decorator vendors, add "Tickets" section replacing the scorecard
- Show tickets where `linked_vendor_id` matches this vendor
- Table: ticket name, type, fault, status, project (clickable)
- Remove scorecard charts for now (keep average lead time as a simple stat)

**Estimated lines:** ~60 modified
**Dependencies:** F3

### G11. Public-Facing Ticket View (P2-11)

**Files:** NEW: `web/app/ticket/[shareableLink]/page.tsx`
**What changes:**
- New public route (similar to portal's `[shareableLink]` pattern)
- Shows ticket details for vendor-facing view: ticket name, description, type, supporting files (downloadable)
- Vendor can: add comments/responses (inline form), specify next action (dropdown: reprint, refund, credit, other), submit response
- Admin sees vendor responses in admin ticket detail

**Estimated lines:** ~250 new
**Dependencies:** F3

### G12. Client CRM Section (P2-12)

**Files:** `web/app/dashboard/clients/[id]/page.tsx`
**What changes:**
- New "CRM" tab on client detail page
- Notes section: chronological note entries with author, date, content
- Attachments section: file uploads (proposals, contracts, etc.)
- "Add Note" inline form, "Upload File" button

**Estimated lines:** ~100 new
**Dependencies:** E4

### G13. Tax Exempt Document Upload (P2-13)

**Files:** `web/app/dashboard/clients/[id]/page.tsx`
**What changes:**
- When `tax_exempt` is checked on client, show a "Tax Exempt Documentation" section
- Drag-and-drop upload zone for tax exempt certificate
- Show uploaded document with name, date, download link
- Warning if tax_exempt is checked but no document uploaded

**Estimated lines:** ~40 new
**Dependencies:** E4

### G14. International Address Support (P2-14)

**Files:** `web/app/dashboard/clients/[id]/page.tsx`
**What changes:**
- Address form gets an "International" toggle
- When enabled: country dropdown appears, state field becomes free text (not US state picker)
- `Address` interface already has `country` field — just need UI to support it

**Estimated lines:** ~30 modified
**Dependencies:** F5

### G15. Portal Per-Product Approve/Decline (P2-17)

**Files:** `web/app/portal/[shareableLink]/page.tsx`
**What changes:**
- Each product in the portal gets "Approve" and "Decline" buttons
- Decline: confirmation dialog "Are you sure you want to remove [Product] from this project?"
- On decline: product marked as declined (greyed out, strikethrough)
- On approve: product marked as approved (green checkmark)
- Client can un-decline (re-add) if desired

**Estimated lines:** ~60 new
**Dependencies:** F1

### G16. Portal Artwork Cross-Product Linking (P2-18)

**Files:** `web/app/portal/[shareableLink]/page.tsx`
**What changes:**
- When client uploads artwork for a product, prompt: "Does this artwork relate to any other products on this project?"
- If yes: show checkboxes for other products on the project
- Selected products get the same artwork linked

**Estimated lines:** ~40 new
**Dependencies:** G4

### G17. Project Payments Section (P2-19)

**Files:** `web/components/projects/ProjectDetailPanel.tsx`
**What changes:**
- New "Payments" section in project detail
- Shows payment status badge: Unpaid, Paid, Partial
- If paid: payment details (amount, method, date, reference number)
- For prepay projects: prominent "Payment Required" indicator
- Admin can mark as paid with inline form (amount, method, date, reference)

**Estimated lines:** ~80 new
**Dependencies:** A1

### G18. Product Multi-Supplier Pricing (P2-20, P2-25)

**Files:** `web/components/products/ProductEditModal.tsx`
**What changes:**
- Add "Suppliers" section in product edit modal
- Same product can have multiple supplier entries: supplier name, supplier-specific blank costs
- When adding product to project, user selects which supplier's pricing to use
- Simple implementation: array of `{ supplier_name: string; blank_costs: BlankCost[] }` on Product

**Estimated lines:** ~100 new
**Dependencies:** A1

### G19. AI Color Swatch Detection (P2-21)

**Files:** `web/components/products/ProductEditModal.tsx`
**What changes:**
- When user uploads/drops a color variant image, show "Detect Color" button
- Mock AI analysis: extract dominant color, suggest hex value and color name
- Auto-populate the color hex swatch field
- Demo mode: return a preset color based on image filename or random from a palette

**Estimated lines:** ~50 new
**Dependencies:** E11

### G20. Creative Public URL for All Requests (P2-22)

**Files:** `web/app/dashboard/creative/page.tsx`
**What changes:**
- "Share All Requests" button generates a shareable URL
- Links to a new public page showing all creative requests in a summary view
- Creative team can see: request list, status, due dates, download files

**Estimated lines:** ~40 new (button + state), plus public page below

### G21. Creative Public All-Requests Page

**Files:** NEW: `web/app/creative/[shareableLink]/page.tsx`
**What changes:**
- Public page showing all creative requests for a project or org
- Table: title, type, status, due date, project name
- Click row: shows files for download, version history
- No edit capabilities — read-only for creative team

**Estimated lines:** ~200 new
**Dependencies:** G20

### G22. Create Creative Request from Main Tab (P2-23)

**Files:** `web/app/dashboard/creative/page.tsx`
**What changes:**
- "New Creative Request" button on creative page header
- Modal/form: select existing project (dropdown) OR quick-create project (name only)
- Full creative request form: title, type, description, due date, files
- On save: creates creative request linked to selected project

**Estimated lines:** ~80 new
**Dependencies:** F7

### G23. Decks Upload Version Notes (P2-24)

**Files:** `web/components/projects/ProjectDetailPanel.tsx`
**What changes:**
- In the Files section, "Decks" tab: when uploading a file, show a "Version Notes" text input
- Notes stored with the file metadata
- Display version notes below deck file name

**Estimated lines:** ~15 new
**Dependencies:** F2

---

<a id="files-modified-summary"></a>
## Files Modified Summary

| File | Phases | Changes |
|------|--------|---------|
| `web/lib/types/app.ts` | A1 | ~25 new/modified interfaces, ~120 lines |
| `web/lib/constants/app.ts` | A2, E1 | Price codes, US states, status updates, ~80 lines |
| `web/lib/utils/quoting.ts` | A3 | interpolateSecondaryBreaks, distributeDecorationCosts, calculateAllInLineItem, ~180 lines |
| `web/lib/demo/demo-data-provider.ts` | A4 | Massive update: field renames, new demo data for all new types, ~250 lines |
| `web/app/dashboard/orders/page.tsx` | B1, B2, B3, E1 | Full order detail rewrite (SlidePanel, shipments, status transitions), ~400 lines modified |
| `web/components/dashboard/SplitShipmentBuilder.tsx` | C1 | Complete rewrite (multi-product matrix), ~450 lines |
| `web/components/projects/ProjectDetailPanel.tsx` | C2, E1, E2, E7, E14, F2, F8, F9, G3, G17, G23 | Split shipments tab, notes restructure, file restructure, payments, ~300 lines modified |
| `web/components/projects/ProductDetailPanel.tsx` | D2, E2, E3, E5, E6, F8, F9, F12, G1, G2, G3 | Pricing, color selection, charges rename, timeline, display name, ~300 lines modified |
| `web/components/shared/PricingGrid.tsx` | D3, E2 | All-in mode, charge rename, ~100 lines |
| `web/components/products/ProductEditModal.tsx` | D1, E11, G18, G19 | All-in price breaks tab, drag-drop images, multi-supplier, AI color, ~380 lines |
| `web/app/dashboard/clients/page.tsx` | E4, F11 | Full-page navigation, sorting, aging badges, ~50 lines |
| `web/app/dashboard/clients/[id]/page.tsx` | E1, E4, F4, F5, F6, G12, G13, G14 | Major expansion: contacts, address book, art library, CRM, ~600 lines |
| `web/app/dashboard/projects/page.tsx` | E1, F10, F13 | Deadline rename, inline client creation, change request badge, ~80 lines |
| `web/app/dashboard/projects/[id]/page.tsx` | E1, E5 | Deadline rename, Add Product sidebar, ~250 lines |
| `web/app/portal/[shareableLink]/page.tsx` | C3, E1, E8, E9, E13, E16, F1, G4, G15, G16 | Two-phase flow, split shipments, file linking, product approve/decline, ~400 lines modified |
| `web/app/dashboard/decorations/page.tsx` | E10 | Vendor grouping, KPI removal, ~150 lines modified |
| `web/app/dashboard/settings/page.tsx` | E15 | Remove products/matrices tabs, ~100 lines deleted |
| `web/app/dashboard/vendors/page.tsx` | E12, G9, G10 | Editable fields, contacts, related projects, tickets, ~320 lines modified |
| `web/app/dashboard/tickets/page.tsx` | F3 | Complete rewrite: full CRUD, ~500 lines |
| `web/app/dashboard/creative/page.tsx` | F7, G7, G20, G22 | Type update, Kanban view, public URL, create from main, ~220 lines |
| `web/components/projects/CreativeRequestDetailPanel.tsx` | F7, G5, G6, G8 | AI assistant, files restructure, note per attachment, ~160 lines |
| **NEW** `web/app/ticket/[shareableLink]/page.tsx` | G11 | Public ticket view for vendors, ~250 lines |
| **NEW** `web/app/creative/[shareableLink]/page.tsx` | G21 | Public creative all-requests page, ~200 lines |

---

<a id="type-system-changes"></a>
## Type System Changes

### Modified Interfaces

| Interface | Field Changes |
|-----------|---------------|
| `Project` | Rename `enhanced_date` → `project_deadline`. Add: `ship_date`, `estimated_shipping_cost`, `split_shipments: SplitShipmentDestination[]`, `comments: ProjectComment[]`, `client_facing_notes`, `change_request_pending`, `approval_phase`, `payment_status`, `payment_details` |
| `ProjectLineItem` | Rename `enhanced_date` → `project_deadline`. Add: `ship_date`, `display_name`, `product_fixed_charges: ProductFixedCharge[]`, `estimated_shipping_cost` |
| `LineItemDecoration` | Add: `art_file_url` |
| `Order` | Add: `shipments: Shipment[]`, `sales_order_pdf_url`, `invoice_pdf_url` |
| `OrderStatus` | Remove: `'entered'`. Add: `'partially-shipped'` |
| `Product` | Add: `all_in_price_breaks: AllInPriceBreak[]`, `setup_cost_per_color`, `setup_sale_per_color` |
| `ClientContact` | Add: `contact_type?: ContactType` |
| `Vendor` | Add: `contacts: VendorContact[]` |
| `Ticket` | Add: `order_id`, `linked_vendor_id`, `name`, `priority`, `shareable_link`, `comments: TicketComment[]` |
| `CreativeRequestType` | Replace with: `'branding-deck' | 'tier-a-deck' | 'tier-b-deck' | 'tech-pack' | 're-vector' | 'single-mock' | 'other'` |

### New Interfaces

| Interface | Purpose |
|-----------|---------|
| `ProductFixedCharge` | Product-level fixed charges (rush fee, etc.) |
| `Shipment` | Individual shipment on an order |
| `SplitShipmentDestination` | Destination in split shipment with address + contact |
| `SplitShipmentAllocation` | Per-product quantity allocation to a destination |
| `AllInPriceBreak` | Quantity break with list price + price code for all-in products |
| `ProjectComment` | Comment entry with @mention support |
| `VendorContact` | Contact person on a vendor |
| `TicketComment` | Comment on a ticket |

### New Union Types

| Type | Values |
|------|--------|
| `PriceCode` | `'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'L' | 'M' | 'N' | 'P' | 'R'` |
| `ContactType` | `'order' | 'finance' | 'shipping' | 'billing' | 'general' | 'other'` |
| `CreativeFileSection` | `'provided' | 'client-provided' | 'print-files' | 'miscellaneous'` |

---

<a id="new-components"></a>
## New Components

| File | Purpose | Key Props |
|------|---------|-----------|
| `web/app/ticket/[shareableLink]/page.tsx` | Public vendor-facing ticket view | Route param: shareableLink |
| `web/app/creative/[shareableLink]/page.tsx` | Public creative team all-requests view | Route param: shareableLink |

No other **new** component files needed. All other work is modifications to existing files. The SplitShipmentBuilder is a full rewrite of an existing file, not a new file.

---

<a id="not-in-this-round"></a>
## NOT in This Round (P3 Deferred)

| # | Item | Reason |
|---|------|--------|
| P3-1 | Stripe payment integration (prepay checkout) | Requires real Stripe account + webhooks. Placeholder UI built in F1. |
| P3-2 | AI email inbox (Boundless → order record association) | XXL complexity, requires email parsing infrastructure |
| P3-3 | AI tracking lookup from pasted tracking number | Requires external tracking API integration |
| P3-4 | Order lifecycle email automation | Requires email service (SendGrid/Resend). Mock toasts added in B3. |
| P3-5 | Salesforce bridge / sync | XXL complexity, enterprise integration |
| P3-6 | PromoStandards API integration | XL complexity, requires vendor API access |
| P3-7 | Public catalog full ordering flow | XL, requires project creation from public route |
| P3-8 | Public catalog embed on external website | Requires iframe/embed strategy |
| P3-9 | Public catalog decoration method toggle + artwork | Requires P3-7 first |
| P3-10 | Invoice portal view with payment link | Requires Stripe |
| P3-11 | Real database / Supabase schema migration | XXL, infrastructure milestone |
| P3-12 | Real auth / multi-tenancy | Requires P3-11 |
| P3-13 | Commission tracking automation | Requires real data |
| P3-14 | Programs module refinement | Lower priority |

---

<a id="terminology-rename-map"></a>
## Terminology Rename Map

### Field Renames (Types + Demo Data)

| Current | New | Files |
|---------|-----|-------|
| `enhanced_date` (field name) | `project_deadline` | `types/app.ts` (Project line 238, ProjectLineItem line 273), `demo-data-provider.ts` (lines 723, 744, 800, all line items with this field) |

### UI Label Renames

| Current Label | New Label | Files + Lines |
|---------------|-----------|---------------|
| "Enhanced Date" | "Project Deadline" | `ProjectDetailPanel.tsx` (label near line 206), `projects/page.tsx` (lines 505, 527), `projects/[id]/page.tsx` (lines 374, 376), `clients/[id]/page.tsx` (line 204), `orders/page.tsx` (line 289), `portal/[shareableLink]/page.tsx` (line 322) |
| "Product Add-Ons" | "Run Charges" | `ProductDetailPanel.tsx` (lines 937, 940, 947, 958) |
| "Location Add-Ons" | "Fixed Charges" | `ProductDetailPanel.tsx` (lines 1024, 1027, 1034, 1045) |
| "Add Product Add-On" | "Add Run Charge" | `ProductDetailPanel.tsx` (line 947) |
| "Add Location Add-On" | "Add Fixed Charge" | `ProductDetailPanel.tsx` (line 1034) |
| "No product add-ons yet" | "No run charges yet" | `ProductDetailPanel.tsx` (line 958) |
| "No location add-ons yet" | "No fixed charges yet" | `ProductDetailPanel.tsx` (line 1045) |
| "Quote Details" | "Products" | `portal/[shareableLink]/page.tsx` (line 353) |
| "Quick Reorder" | REMOVE entirely | `portal/[shareableLink]/page.tsx` (line 521+) |
| "Entered (Salesforce)" | REMOVE status | `constants/app.ts` (line 46), `demo-data-provider.ts` (line 78) |
| "Full Ticketing Coming in Round 2" | REMOVE banner | `tickets/page.tsx` (line 48) |

### Status Value Changes

| Current | New | Files |
|---------|-----|-------|
| `OrderStatus = 'entered'` | REMOVE from union type | `types/app.ts` (line 18) |
| (none) | Add `'partially-shipped'` to `OrderStatus` | `types/app.ts` |
| `ORDER_STATUS_LABELS['entered']` | REMOVE key | `constants/app.ts`, `demo-data-provider.ts` |
| (none) | Add `ORDER_STATUS_LABELS['partially-shipped'] = 'Partially Shipped'` | `constants/app.ts`, `demo-data-provider.ts` |
| `CreativeRequestType` values | Replace: `'full-deck'` → `'tier-a-deck'`, add `'tier-b-deck'`, `'tech-pack'`, `'single-mock'` | `types/app.ts`, demo data |

---

<a id="business-logic-specs"></a>
## Business Logic Specs

### 1. Price Break Distribution Algorithm (Phase A3)

**Problem:** A product on a project has multiple decoration locations. Location 1 (primary) uses Screen Print matrix with breaks at [24, 36, 50, 100, 200, 500]. Location 2 (secondary) uses Embroidery matrix with breaks at [24, 36, 50, 100, 200, 500]. Location 3 uses Heat Transfer with breaks at [24, 36, 50, 100, 200, 500].

When matrices have DIFFERENT break points (common with different vendors), the secondary costs must be interpolated at the primary break points.

**Algorithm — Linear Interpolation:**

```
Given:
  primary_breaks = [24, 36, 50, 100]  (from screen print matrix)
  secondary_tiers = [
    { min: 12, max: 23, cost: 6.85 },  (embroidery, 2 colors)
    { min: 24, max: 47, cost: 6.50 },
    { min: 48, max: 71, cost: 5.50 },
    { min: 72, max: 143, cost: 4.50 },
    { min: 144, max: 9999, cost: 3.15 },
  ]

For each primary break point Q:
  1. Find the secondary tier where Q falls within [min, max]
  2. If exact match → use that tier's cost directly
  3. If between tiers → linear interpolation:
     cost = low_cost + (high_cost - low_cost) * (Q - low_max) / (high_min - low_max)
  4. If below all tiers → use lowest tier cost
  5. If above all tiers → use highest tier cost

Example calculation for primary_break = 50:
  Falls in secondary tier [48, 71] → cost = 5.50 (direct match)

Example for primary_break = 36:
  Falls in secondary tier [24, 47] → cost = 6.50 (direct match)

Example where breaks DON'T align:
  primary_breaks = [25, 50, 100, 250]
  secondary_tiers = [
    { min: 12, max: 23, cost: 7.00 },
    { min: 24, max: 49, cost: 5.50 },
    { min: 50, max: 99, cost: 4.00 },
    { min: 100, max: 499, cost: 3.00 },
  ]

  For Q=25: falls in [24,49] → cost = 5.50
  For Q=50: falls in [50,99] → cost = 4.00
  For Q=100: falls in [100,499] → cost = 3.00
  For Q=250: falls in [100,499] → cost = 3.00
```

**Unified cost per unit at each break:**
```
unified_cost(Q) = blank_cost(Q) + primary_decoration_cost(Q) + Σ interpolated_secondary_cost(Q) + Σ run_charges
```

**Client sees:** One clean set of quantity breaks with unified per-unit pricing.
**Admin sees:** Tooltip showing the breakdown (which location contributes what cost at that break).

### 2. Price Code System (Phase D)

**ASI/PPAI Standard Price Codes:**

| Code | Discount % | Multiplier (cost = list * multiplier) |
|------|-----------|---------------------------------------|
| A | 50% | 0.50 |
| B | 47.5% | 0.525 |
| C | 45% | 0.55 |
| D | 42.5% | 0.575 |
| E | 40% | 0.60 |
| F | 37.5% | 0.625 |
| G | 35% | 0.65 |
| H | 32.5% | 0.675 |
| L | 30% | 0.70 |
| M | 25% | 0.75 |
| N | 20% | 0.80 |
| P | 15% | 0.85 |
| R | 10% | 0.90 |

**How it works for all-in products:**

```
Product: YETI Rambler 20oz
Price break grid:
  Column 1: Qty 24-49,  List $28.00, Code C → Net Cost = $28.00 * 0.55 = $15.40
  Column 2: Qty 50-99,  List $26.00, Code C → Net Cost = $26.00 * 0.55 = $14.30
  Column 3: Qty 100-249, List $24.00, Code G → Net Cost = $24.00 * 0.65 = $15.60
  Column 4: Qty 250+,   List $22.00, Code G → Net Cost = $22.00 * 0.65 = $14.30

When added to project with qty=75:
  Uses Column 2 → List $26.00, Code C
  Cost to 85 Supply = $14.30/unit
  Sale price = $26.00/unit (the list price IS the client price)
  Margin = ($26.00 - $14.30) / $26.00 = 45%

Admin enters the list price + selects price code.
System calculates net cost automatically.
Margin = (list_price - net_cost) / list_price * 100
```

**Setup cost per color (all-in products):**
```
Product: Coffee mug with logo
setup_cost_per_color = $25.00 (what 85 Supply pays the vendor per color)
setup_sale_per_color = $40.00 (what client pays per color)

3-color logo:
  Setup cost = $25.00 × 3 = $75.00
  Setup sale = $40.00 × 3 = $120.00
  Setup margin = $45.00

These are FIXED charges (not per-unit), added to the subtotal.
```

### 3. Split Shipment Data Model (Phase C)

**Allocation Matrix:**

```
Project: Raisin Canes World Tour
Line Items:
  - li-1: Skull T-Shirts (300 total)
  - li-2: Staff Polos (150 total)
  - li-3: Branded Caps (500 total)

Destinations:
  dest-1: Nashville HQ (primary)
  dest-2: Chicago Store
  dest-3: LA Store

Allocation Matrix:
                    | Skull Tees | Staff Polos | Branded Caps |
  Nashville HQ      |    100     |     75      |     200      |
  Chicago Store     |    100     |     50      |     150      |
  LA Store          |    100     |     25      |     150      |
  ────────────────  | ───────── | ─────────── | ──────────── |
  TOTAL             |    300 ✓  |    150 ✓    |     500 ✓    |
```

**Validation rules:**
- Sum of each column MUST equal the product's total quantity
- If column total < product total: show "X remaining" in amber
- If column total > product total: show "X over-allocated" in red
- Each destination must have at least one product allocated
- All cells default to 0

**Data structure:**
```typescript
// Stored on Project
split_shipments: [
  {
    id: 'dest-1',
    label: 'Nashville HQ',
    address: { street: '...', city: 'Nashville', state: 'TN', zip: '37219', country: 'USA' },
    contact_name: 'Marcus Thompson',
    contact_phone: '615-555-0101',
    address_book_entry_id: 'abe-1',  // Links to client address book
    allocations: [
      { line_item_id: 'li-1', product_name: 'Skull T-Shirts', quantity: 100 },
      { line_item_id: 'li-2', product_name: 'Staff Polos', quantity: 75 },
      { line_item_id: 'li-3', product_name: 'Branded Caps', quantity: 200 },
    ]
  },
  // ... more destinations
]
```

### 4. Order Lifecycle State Machine (Phase B)

```
                          ┌────────────────────┐
                          │ Order Entry Needed  │
                          │  (initial state)    │
                          └────────┬───────────┘
                                   │
                     [Upload sales order PDF]
                     [Click "Mark as Entered"]
                     [→ Email to client w/ PDF]
                                   │
                          ┌────────▼───────────┐
                          │   In Production     │
                          └────────┬───────────┘
                                   │
                     [Add first shipment]
                     [Auto-transition when
                      items_shipped > 0 AND
                      items_shipped < total]
                                   │
                          ┌────────▼───────────┐
                          │ Partially Shipped   │
                          └────────┬───────────┘
                                   │
                     [All items shipped OR
                      manual "Mark Shipped"]
                                   │
                          ┌────────▼───────────┐
                          │      Shipped        │
                          └────────┬───────────┘
                                   │
                     [All shipments delivered OR
                      manual "Ready for Invoice"]
                                   │
                          ┌────────▼───────────┐
                          │ Ready for Invoicing │
                          └────────┬───────────┘
                                   │
                     [Upload invoice PDF]
                     [Click "Send Invoice"]
                     [→ Email to client w/ link]
                                   │
                          ┌────────▼───────────┐
                          │      Invoiced       │
                          └────────────────────┘

    ┌──────────┐
    │ Cancelled │ ← Available from ANY status
    └──────────┘
```

**Transition validation:**
| From | To | Required |
|------|----|----------|
| Order Entry Needed | In Production | `sales_order_pdf_url` must be set |
| In Production | Partially Shipped | At least 1 shipment added with `items_shipped > 0` |
| Partially Shipped | Shipped | Sum of all `shipment.items_shipped` >= `order.quantity` |
| Shipped | Ready for Invoicing | All shipments in `delivered` status (or manual override) |
| Ready for Invoicing | Invoiced | `invoice_pdf_url` must be set |
| Any | Cancelled | Confirmation dialog |

---

<a id="demo-data-requirements"></a>
## Demo Data Requirements

### New Demo Data Factories

| Function | Returns | Purpose |
|----------|---------|---------|
| `getDemoSplitShipments(projectId)` | `SplitShipmentDestination[]` | Split shipment data for demo projects |
| `getDemoShipments(orderId)` | `Shipment[]` | Shipment records for demo orders |

### Modified Demo Data

| Data Set | Changes |
|----------|---------|
| All projects | `enhanced_date` → `project_deadline`, add `ship_date` (2-3 projects), add `comments: []`, `client_facing_notes`, `change_request_pending: false`, `approval_phase: 'approved'`, `payment_status: 'unpaid'`, `split_shipments: []`, `estimated_shipping_cost` |
| All line items | `enhanced_date` → `project_deadline`, add `ship_date`, `display_name`, `product_fixed_charges: []`, `estimated_shipping_cost` |
| All decorations | Add `art_file_url` to 2-3 entries |
| All orders | Remove `'entered'` status orders (→ `'in-production'`), add `shipments: []`, `sales_order_pdf_url`, `invoice_pdf_url`. Add 1 order with `partially-shipped` status and shipments. |
| All-in products (prod-3 Drinkware, etc.) | Add `all_in_price_breaks` with 4 columns and price codes. Add `setup_cost_per_color`, `setup_sale_per_color`. |
| All clients | Add `contact_type` to contacts |
| All vendors | Add `contacts: VendorContact[]` (empty default, populated for 2 vendors) |
| All tickets | Add `name`, `priority`, `order_id`, `linked_vendor_id`, `shareable_link`, `comments` |
| 1 project | `change_request_pending: true` |
| 1 project | `approval_phase: 'collecting'` (for portal demo) |
| 1 project | `payment_status: 'paid'` with `payment_details` |
| 1 project | Populated `split_shipments` (2 destinations, 3 products) |
| 1 project | Populated `comments` (3 sample comments with @mentions) |
| Creative requests | Update type values to new enum |
| ORDER_STATUS_LABELS | Remove `'entered'`, add `'partially-shipped'` |
| ORDER_STATUS_STYLES | Remove `'entered'`, add `'partially-shipped'` |

---

<a id="known-risks"></a>
## Known Risks

### 1. TypeScript Cascade from OrderStatus Removal
Removing `'entered'` from `OrderStatus` will break any file that references that status value. Files to check:
- `orders/page.tsx` (ALL_ORDER_STATUSES, ORDER_KANBAN_STATUSES, STATUS_COLORS)
- `constants/app.ts` (ORDER_STATUS_LABELS, ORDER_STATUS_STYLES)
- `demo-data-provider.ts` (ORDER_STATUS_LABELS, ORDER_STATUS_STYLES, any demo orders with `'entered'` status)
- Any Kanban board status columns
**Mitigation:** Do the type change in A1, then immediately fix all references in A4 and B1.

### 2. `enhanced_date` → `project_deadline` Rename Scope
This field name appears in types, demo data, and at least 8 UI files. A missed rename will cause TypeScript errors.
**Mitigation:** The Mechanic should use a project-wide search for `enhanced_date` and `Enhanced Date` after making the type change to catch every occurrence.

### 3. SplitShipmentBuilder Rewrite
The current component has a fundamentally different data model (single product). The rewrite changes props, state, and rendering. Any code that imports `SplitShipmentBuilder` will break.
**Mitigation:** Check all import sites. Currently imported in `ProjectDetailPanel.tsx` and possibly `projects/[id]/page.tsx`. Update props at all call sites.

### 4. Demo Data Provider Size
At 2,890 lines, this file is already large. Adding ~250 lines of new demo data pushes it further. Large files are harder to modify atomically.
**Mitigation:** Follow the Atomic Component Law — for sections needing major changes, replace entire blocks rather than surgical edits.

### 5. Portal Page Complexity
`portal/[shareableLink]/page.tsx` is 814 lines and will receive changes from 10+ steps across phases C, E, F, and G. Risk of merge conflicts if phases are done in parallel.
**Mitigation:** All portal changes should be batched and done sequentially. The Mechanic handles data/logic changes first, the Tailor handles UI changes second.

### 6. PricingGrid Contract Between Mechanic and Tailor
The PricingGrid component needs to support two modes (contract and all-in). The Mechanic builds the data model and calculation logic. The Tailor builds the rendering. They must agree on the prop interface.
**Mitigation:** A3 defines the `distributeDecorationCosts` return type. D3 extends PricingGrid props. The prop interface is: `{ mode: 'contract' | 'all-in'; ...existingProps }`.

### 7. Price Code Research Accuracy
The ASI/PPAI price code percentages in this plan are based on industry standard documentation. If Trevor uses a non-standard mapping (some distributors vary), the constants may need adjustment.
**Mitigation:** The `PRICE_CODE_DISCOUNTS` constant is centralized in `constants/app.ts` — easy to adjust without touching logic.

---

## Execution Order Summary

```
MECHANIC (Types + Data + Logic):
  A1 → A2 → A3 → A4 → then B1-B3, C1, D1-D3
  (builds ALL foundation before Tailor starts)

TAILOR (UI):
  E1-E17 → F1-F13 → G1-G23
  (sweeps corrections, then features, then improvements)

INSPECTOR:
  Full verification after each major phase
  tsc check after every type system change
  Production build check at end
```

**Total estimated scope:**
- Modified lines: ~4,500
- New lines: ~1,800
- Deleted lines: ~300
- Net change: ~6,000 lines
- Files touched: 22 existing + 2 new = 24 files
