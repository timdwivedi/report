# Master Build Plan -- Round 1 (Post-Build)

> **Created:** 2026-02-23
> **Source:** Call 3 extraction (177 min) + competitive research + codebase audit
> **Previous state:** 04_master_build_plan.md (completed), 05_next_moves.md (current), 06_admin_multi_tenant.md (completed)
> **Round:** 1 (first post-build iteration)
> **Goal:** Make the front end demo-ready for Trevor to show Aaron (Boundless CEO)

---

## What Changed Since Last Plan

The original `04_master_build_plan.md` was a 16-step plan to go from scaffold to functional demo. **That plan was fully executed.** The app now has 18+ pages, 21 API routes, a quoting engine, demo data for 11 entity types, an admin panel with multi-tenant architecture, and every sidebar link resolves to a real page.

Call 3 (177 minutes, Feb 23 2026) revealed that the **data model is fundamentally incomplete** for how the decorated promo products industry actually works. Here is what changed:

### New Architectural Requirements (not in original plan)

| Requirement | Why It Matters |
|-------------|----------------|
| **Contract vs. All-In product types** | Two completely different pricing paths. The existing quoting engine assumes one model. |
| **Vendor/Decorator as a first-class entity** | Decorator matrices must be linked to specific vendors, not just org-level defaults. No vendor entity exists. |
| **Decoration locations as standalone objects** | Currently a field on a line item. Trevor was emphatic: each location is its own object with method, color/stitch count, matrix lookup, setup cost, and run charges. |
| **Fixed charges and run charges** | Two new charge types with different calculation models. Neither exists in the current quoting engine. |
| **Client = Company + Contacts + Address Book with folders** | Current client entity is flat. Needs contact types, address book with named folders, CSV import. |
| **Per-product enhanced dates and production time** | Line items need individual enhanced dates and production time selectors, not just a project-level date. |
| **Creative requests module** | Entirely new entity and UI. Trevor's daily workflow. |
| **Customer service ticketing** | Entirely new entity. Reprint/refund/credit with spoilage rules. |
| **Purchase orders per order** | Orders need PO generation linked to vendors/decorators. |
| **Project status consolidation** | "Presenting" and "Client Review" must merge. Current kanban has 8+ columns including "Presenting". |
| **Sidebar reorder** | Trevor dictated exact order: Dashboard > Clients > Projects > Orders > Commissions > Analytics > Settings. Currently Projects comes before Clients. |

### What the Original Plan Got Right

- All 18+ pages built and functional
- Quoting engine math is correct (for the single-model case)
- Demo data provider with cross-referenced IDs
- API routes with demo fallback pattern
- Admin panel with multi-tenant architecture
- Client portal with shareable links
- Commission calculator with animated counters

---

## Build Philosophy for This Round

**Front-end first, database second.**

Trevor explicitly said: "The number one thing is I want to get the front end good... then it's a lot easier to wire up the rest."

This means:

1. **All changes are to the type system, demo data, and UI components.** No database migrations in this round.
2. **Correct industry terminology everywhere.** "Enhanced date" not "in-hands date" in the UI. "Decoration location" not "decoration". "Contract" and "All-In" product types.
3. **Correct UX flows.** The quoting engine must visually branch for contract vs. all-in. Decoration locations must feel like standalone objects being attached to products.
4. **Demo data must tell a realistic story.** Real product names (Gildan 5000, Bella+Canvas 3001, Richardson 112), real decorator names (Culture Studio, Lightning Stitch), real client scenarios.
5. **Every page Trevor clicks must feel production-ready.** No dead ends, no placeholder text, no broken flows.

---

## Phase Plan (Ordered by Dependency + Priority)

### Phase A: Data Model Foundation (Steps 1-3)

These steps change the type system and demo data that everything else depends on. Must be done first.

---

#### Step 1: Product Type Split (Contract vs. All-In)

**What changes:**
- Add `ProductType = 'contract' | 'all-in'` to type system
- Add `product_type` field to `Product`, `ProjectLineItem`, and related interfaces
- Contract product: `blank_cost + decoration_costs + margin = sale_price`
- All-in product: `vendor_cost + margin = sale_price` (single vendor, single cost)
- Add `vendor_cost` field to `ProjectLineItem` for all-in products
- Update demo data: ~60% contract products (apparel), ~40% all-in products (drinkware, office supplies, koozies, lighters)

**Which files:**
- `web/lib/types/app.ts` -- Add `ProductType`, modify `Product`, `ProjectLineItem`
- `web/lib/demo/demo-data-provider.ts` -- Update demo products with `product_type`
- `web/lib/utils/quoting.ts` -- Branch `calculateLineItem()` on product type

**Dependencies:** None (foundational)
**Estimated complexity:** **M** (type changes cascade but logic is straightforward)

---

#### Step 2: Vendor/Decorator Entity

**What changes:**
- New `Vendor` interface: `id`, `name`, `type` (supplier / decorator / both), `contact_info`, `notes`, `org_id`
- New `VendorDecoratorMatrix` interface: links a decorator matrix to a specific vendor
- Modify `DecoratorMatrix` to add optional `vendor_id` field (null = org default, populated = vendor-specific)
- Update demo data with real vendors: Culture Studio (decorator, Chicago), Lightning Stitch (decorator, Texas), 33 Inc (decorator), S&S Activewear (supplier)
- Each vendor has their own screen print/embroidery/DTG pricing matrices

**Which files:**
- `web/lib/types/app.ts` -- Add `Vendor`, `VendorType`, modify `DecoratorMatrix`
- `web/lib/demo/demo-data-provider.ts` -- Add `getDemoVendors()`, update matrices with `vendor_id`
- `web/lib/constants/app.ts` -- Add vendor type labels

**Dependencies:** None
**Estimated complexity:** **M** (new entity + demo data, but no complex logic)

---

#### Step 3: Decoration Locations as First-Class Objects

**What changes:**
- New `DecorationLocationObject` interface (distinct from the current `DecorationLocation` union type which is just a string enum of positions)
- Each decoration location object has: `id`, `position` (front/back/sleeve/left-chest/neckline), `decoration_method`, `color_count` or `stitch_count`, `decorator_matrix_id`, `vendor_id`, `setup_cost`, `run_charges[]`, `production_file_url`
- New `RunCharge` interface: `name` (puff ink, printed tags, specialty ink), `cost_per_unit`, `quantity_breaks[]`
- New `FixedCharge` interface: `name` (setup fee), `amount`, `calculation` (per-color-per-location, flat)
- Rename existing `DecorationLocation` type to `DecorationPosition` to avoid confusion
- Update `LineItemDecoration` to reference the new object structure
- Update `calculateLineItem()` to sum: `blank_cost + SUM(decoration_location.matrix_cost) + SUM(run_charges) + SUM(fixed_charges)`

**Which files:**
- `web/lib/types/app.ts` -- Rename type, add new interfaces
- `web/lib/utils/quoting.ts` -- Update calculation to handle fixed charges, run charges, per-location costs
- `web/lib/demo/demo-data-provider.ts` -- Update demo line items with full decoration location objects

**Dependencies:** Step 2 (vendor entity needed for `vendor_id` on decoration locations)
**Estimated complexity:** **L** (biggest data model change; cascades through quoting engine)

---

### Phase B: Core UX Corrections (Steps 4-7)

These steps fix the UI to match Trevor's explicit instructions from Call 3.

---

#### Step 4: Sidebar Navigation Reorder

**What changes:**
- Reorder sidebar items to match Trevor's dictated order:
  1. Dashboard
  2. Clients (moved up from position 3)
  3. Projects (moved down from position 2)
  4. Orders
  5. Products (keep, but not in Trevor's list -- needed for admin)
  6. Programs (change to "Coming Soon" placeholder)
  7. Commissions
  8. Analytics
  9. Settings
- Add "Tickets" sidebar item with "Coming Soon" badge
- Programs: clicking shows a "Coming Soon" placeholder page, not the current full programs page
- Add Products icon (currently uses Building2 for Programs; Products should use ShoppingBag or similar)

**Which files:**
- `web/components/layout/DashboardLayout.tsx` -- Reorder `navigation` array, add Tickets
- `web/app/dashboard/programs/page.tsx` -- Replace with "Coming Soon" placeholder (preserve existing code in comments for future)

**Dependencies:** None
**Estimated complexity:** **S** (15-minute change)

---

#### Step 5: Project Status Consolidation

**What changes:**
- Remove `'presenting'` from `ProjectStatus` union type
- Merge into `'client-review'`
- Final pipeline: Opportunity > Qualifying > Curating > In Design > Client Review > Confirmed > Cancelled
- Update kanban columns from 8 to 7
- Remove `'presenting'` from all label maps, style maps, demo data
- Update any demo projects with status `'presenting'` to `'client-review'`

**Which files:**
- `web/lib/types/app.ts` -- Remove `'presenting'` from `ProjectStatus`
- `web/lib/demo/demo-data-provider.ts` -- Update `PROJECT_STATUS_LABELS`, `PROJECT_STATUS_STYLES`, demo projects
- `web/app/dashboard/projects/page.tsx` -- Update kanban column config
- `web/lib/constants/app.ts` -- If status labels are duplicated there

**Dependencies:** None
**Estimated complexity:** **S** (find-and-replace, 15 minutes)

---

#### Step 6: Client Entity Overhaul

**What changes:**
- Add to `Client` interface: `status` (active/inactive), `purchasing_status`, `last_quoted_date`, `last_ordered_date`
- Add `primary_shipping_address` and `primary_billing_address` as named fields (currently just `billing_address` and optional `shipping_address`)
- Expand `ClientContact` with `contact_type` (billing / finance / shipping / primary / all) -- currently has `role` which is similar but labeled differently
- New `AddressBook` interface: `id`, `client_id`, `folders[]`
- New `AddressBookFolder` interface: `id`, `name` (e.g., "2026 World Tour"), `entries[]`
- New `AddressBookEntry` interface: full address + contact name + phone
- Update client detail page (`/dashboard/clients/[id]`) to show:
  - Company profile tab with payment terms, status, purchasing status
  - Contacts tab with contact type badges
  - Address Book tab with folder structure
  - Project History tab (already partially exists)
- Update client list page to be sortable by last activity, last order date

**Which files:**
- `web/lib/types/app.ts` -- Expand `Client`, `ClientContact`, add address book types
- `web/lib/demo/demo-data-provider.ts` -- Enrich demo clients with full data
- `web/app/dashboard/clients/page.tsx` -- Add sort options
- `web/app/dashboard/clients/[id]/page.tsx` -- Add tabs for contacts, address book, project history

**Dependencies:** None
**Estimated complexity:** **M** (significant UI work on client detail page)

---

#### Step 7: Project Detail Enhancements

**What changes:**
- Add to `Project` interface: `project_deadline`, `enhanced_date` (rename from `in_hands_date` for industry terminology), `primary_billing_address`, `primary_shipping_address`, `payment_terms`, `project_contact_id`
- Add to `ProjectLineItem`: `enhanced_date` (per-product), `production_time` (preset selector: "5-7 days", "7-10 days", "10-14 days", "15-20 days"), `vendor_id` (blank supplier), `decorator_vendor_id`
- Add file categorization on project detail:
  - Project Files (general dump)
  - Decks (presentation files)
  - Client Art (branding, style guides)
  - Client Submitted (files from client)
  - Production Files (linked to decoration locations)
  - Miscellaneous
- Add Creative Requests section on project detail (placeholder for Step 11)
- Update project detail page layout to show enhanced dates, production time, file categories

**Which files:**
- `web/lib/types/app.ts` -- Expand `Project`, `ProjectLineItem`
- `web/lib/demo/demo-data-provider.ts` -- Add dates, production times to demo projects
- `web/app/dashboard/projects/[id]/page.tsx` -- Major UI update with new sections
- New: `web/components/dashboard/ProjectFiles.tsx` -- File categorization component

**Dependencies:** Step 1 (product type), Step 3 (decoration locations), Step 6 (client addresses for billing/shipping defaults)
**Estimated complexity:** **L** (most complex page in the app; significant UI work)

---

### Phase C: Pricing Engine Upgrade (Steps 8-10)

These steps make the quoting engine match how the industry actually prices products.

---

#### Step 8: Contract vs. All-In Quoting Split

**What changes:**
- `calculateLineItem()` branches on `product_type`:
  - **Contract path:** `blank_cost(qty, size_tier) + SUM(decoration_costs_per_location) + SUM(run_charges) + SUM(fixed_charges)` / `(1 - margin%)`
  - **All-in path:** `vendor_cost` / `(1 - margin%)`
- Contract path needs size-tier awareness: S-XL same cost, 2XL higher, 3XL-4XL higher
- All-in path: single `vendor_cost` field, no decoration locations, no blank cost
- Update project detail quoting UI to show different fields based on product type
- Contract: show blank cost, decoration locations, charges breakdown
- All-in: show vendor cost only, margin slider, done

**Which files:**
- `web/lib/utils/quoting.ts` -- Branch logic, add size-tier cost support
- `web/app/dashboard/projects/[id]/page.tsx` -- Conditional UI for product type
- `web/lib/types/app.ts` -- Add `size_cost_tiers` to `Product` (S-XL, 2XL, 3XL+)

**Dependencies:** Step 1 (product type), Step 3 (decoration locations)
**Estimated complexity:** **M** (logic is clear, but UI branching adds surface area)

---

#### Step 9: Vendor-Specific Decorator Matrices

**What changes:**
- Decorator matrix selector on decoration locations: "Which decorator?" dropdown
- When vendor is selected, load that vendor's matrix for the decoration method
- Fallback to org default matrix if no vendor-specific matrix exists
- Matrix editor in Settings: group matrices by vendor, show vendor name
- Update `getDecorationCost()` to accept optional `vendor_id` parameter and look up the correct matrix

**Which files:**
- `web/lib/utils/quoting.ts` -- Add vendor matrix lookup
- `web/app/dashboard/settings/matrices/page.tsx` -- Group by vendor, add vendor selector
- `web/lib/demo/demo-data-provider.ts` -- Add vendor-specific matrices (Culture Studio screen print, Lightning Stitch embroidery)

**Dependencies:** Step 2 (vendor entity), Step 3 (decoration locations)
**Estimated complexity:** **M** (data plumbing, UI updates to matrix editor)

---

#### Step 10: Fixed Charges and Run Charges

**What changes:**
- UI for adding fixed charges to a decoration location: "Add Fixed Charge" button
  - Setup fee: `$X per color per location` (auto-calculated: 3 colors x $20 = $60)
  - Custom fixed charges with flat amount
- UI for adding run charges to a decoration location: "Add Run Charge" button
  - Run charge: name (puff ink, printed tags, specialty inks), per-unit cost with optional qty breaks
  - Example: puff ink = $1.00 at 24 units, $0.75 at 36 units
- Charges visible as line items under each decoration location in the project detail
- Quoting engine sums all charges: `decoration_matrix_cost + SUM(fixed_charges) + SUM(run_charges_per_unit)`
- Trevor's rule: "Free setups for orders of 50+ shirts" -- configurable waiver threshold per org

**Which files:**
- `web/lib/types/app.ts` -- `FixedCharge`, `RunCharge` interfaces (from Step 3)
- `web/lib/utils/quoting.ts` -- Add charge calculation
- `web/app/dashboard/projects/[id]/page.tsx` -- UI for adding/displaying charges
- `web/lib/demo/demo-data-provider.ts` -- Add charge examples to demo data

**Dependencies:** Step 3 (decoration locations), Step 8 (contract pricing path)
**Estimated complexity:** **M** (clear requirements, moderate UI work)

---

### Phase D: New Modules (Steps 11-14)

New entities and pages that don't exist yet.

---

#### Step 11: Creative Requests Module

**What changes:**
- New `CreativeRequest` interface: `id`, `project_id`, `title`, `type` (branding_deck / re-vector / mockup / full_design / technical_art), `description`, `assigned_to`, `status` (requested / in_progress / client_review / complete), `due_date`, `supporting_files[]`, `versions[]`, `org_id`
- Creative requests section on project detail page (tab or collapsible section)
- Standalone creative requests list page (optional, could be just the project-level view for V1)
- Request creation form: title, type selector, description, due date, file upload
- Status progression with visual indicator
- For V1: assigned_to = Boundless creative team members (David Mills, Zach)

**Which files:**
- `web/lib/types/app.ts` -- Add `CreativeRequest`, `CreativeRequestType`, `CreativeRequestStatus`
- `web/lib/demo/demo-data-provider.ts` -- Add `getDemoCreativeRequests()`
- `web/app/dashboard/projects/[id]/page.tsx` -- Add creative requests section
- New: `web/components/dashboard/CreativeRequestCard.tsx`

**Dependencies:** Step 7 (project detail enhancements)
**Estimated complexity:** **M** (new entity but straightforward CRUD UI)

---

#### Step 12: Customer Service Ticketing (Placeholder)

**What changes:**
- New `Ticket` interface: `id`, `order_id`, `client_id`, `type` (reprint / refund / credit), `fault` (us / vendor), `spoilage_count`, `spoilage_percent`, `status` (open / investigating / resolved), `resolution`, `vendor_ticket_id`, `credit_amount`, `org_id`
- Sidebar item "Tickets" links to a functional but minimal page
- Ticket list with type, status, client, order reference
- Ticket detail panel with basic fields
- Business rules visible in UI:
  - Spoilage <= 3%: eligible for refund (auto-badge)
  - Spoilage > 3%: eligible for reprint (auto-badge)
  - Fault = vendor: vendor chargeback indicator
- For V1: demo data only, no create/edit flow needed (just display)

**Which files:**
- `web/lib/types/app.ts` -- Add `Ticket`, `TicketType`, `TicketFault`, `TicketStatus`
- `web/lib/demo/demo-data-provider.ts` -- Add `getDemoTickets()`
- New: `web/app/dashboard/tickets/page.tsx`
- `web/components/layout/DashboardLayout.tsx` -- Tickets already added in Step 4

**Dependencies:** Step 4 (sidebar reorder adds Tickets)
**Estimated complexity:** **S** (display-only page with demo data)

---

#### Step 13: Production Files (Linked to Decoration Locations)

**What changes:**
- When uploading a production file on a project, user must select which decoration location it belongs to
- "Which location?" prompt: dropdown of decoration locations on the current line item
- File association stored on the decoration location object (`production_file_url`)
- Visual indicator on decoration location: "Production file attached" badge
- Files carry through from project to order (visible on order detail)

**Which files:**
- `web/app/dashboard/projects/[id]/page.tsx` -- File upload with location selector
- `web/components/dashboard/ProjectFiles.tsx` -- Location association UI
- `web/lib/types/app.ts` -- Already has `production_file_url` on decoration location (from Step 3)

**Dependencies:** Step 3 (decoration locations), Step 7 (project files section)
**Estimated complexity:** **S** (UI interaction, data already modeled)

---

#### Step 14: Vendor Management Page

**What changes:**
- New page: `/dashboard/settings/vendors` (under Settings, not top-level sidebar)
- Vendor list: name, type (supplier/decorator/both), contact info, matrix count
- Vendor detail: contact info, notes, linked decorator matrices
- Add/Edit vendor form
- Link from Settings hub to vendor management
- Link from decorator matrix editor to associated vendor

**Which files:**
- New: `web/app/dashboard/settings/vendors/page.tsx`
- `web/app/dashboard/settings/page.tsx` -- Add "Vendors" tab/link
- `web/lib/demo/demo-data-provider.ts` -- `getDemoVendors()` from Step 2

**Dependencies:** Step 2 (vendor entity)
**Estimated complexity:** **S** (standard CRUD page with DataTable)

---

### Phase E: Portal and Tools (Steps 15-17)

Enhancements to client-facing features and standalone tools.

---

#### Step 15: Client Portal Enhancements

**What changes:**
- Portal project view shows:
  - Product images with decoration location thumbnails
  - Enhanced date (per-product if different from project)
  - Status timeline (visual progression)
  - File downloads section (decks, approved artwork)
- Portal shows sale price only (no cost, no margin, no vendor info)
- "Request Changes" button that creates a note on the project (placeholder for V1)
- Split shipment info visible if configured

**Which files:**
- `web/app/portal/[shareableLink]/page.tsx` -- Enhanced display
- `web/app/portal/[shareableLink]/tracking/page.tsx` -- Status timeline

**Dependencies:** Step 7 (project detail data)
**Estimated complexity:** **M** (significant UI enhancement)

---

#### Step 16: Size Breakdown Calculator

**What changes:**
- Standalone tool accessible from a link in project detail and from Settings/Tools
- Input: target total quantity
- Apply standard size ratio (bell curve distribution):
  - S: 8%, M: 20%, L: 30%, XL: 25%, 2XL: 12%, 3XL: 4%, 4XL: 1%
- Output: table of size quantities
- Adjustable ratios (editable percentages)
- "Copy to clipboard" and "Apply to line item" buttons
- Visual bell curve chart (Recharts)

**Which files:**
- New: `web/components/dashboard/SizeBreakdownCalculator.tsx`
- `web/app/dashboard/projects/[id]/page.tsx` -- "Size Calculator" button on line items
- Optionally: standalone route `web/app/dashboard/tools/size-calculator/page.tsx`

**Dependencies:** None
**Estimated complexity:** **S** (self-contained component)

---

#### Step 17: Reorder Portal Concept

**What changes:**
- Conceptual UI only for this round (not functional backend)
- On client detail page: "Reorder Portal" tab showing:
  - List of previously ordered products for this client
  - Pre-configured price breaks per product
  - "Reorder" button per product (opens quantity entry)
  - Visual mock of what the client would see
- This is the CommonSkew "shops" equivalent that Trevor wants to replicate
- For V1: static demo data showing how it would work

**Which files:**
- `web/app/dashboard/clients/[id]/page.tsx` -- Add "Reorder Portal" tab
- `web/lib/demo/demo-data-provider.ts` -- Add reorder history to demo clients

**Dependencies:** Step 6 (client detail page)
**Estimated complexity:** **S** (display-only concept)

---

### Phase F: Polish and Demo Prep (Steps 18-20)

Final sweep to make everything demo-ready.

---

#### Step 18: Industry Terminology Sweep

**What changes:**
- Audit every page for incorrect or generic terminology. Replace with industry terms from the copy bank:
  - "In-hands date" -> "Enhanced Date" in UI labels (keep technical field name as `enhanced_date` or `in_hands_date` in code)
  - "Decoration" (as a simple field) -> "Decoration Location" where referring to the object
  - "Supplier" in product -> context-aware: "Blank Supplier" for contract, "Vendor" for all-in
  - "Setup fee" -> "Setup Charge" (consistent with industry)
  - "Price breaks" -> "Quantity Breaks" where appropriate
  - "Add-ons" -> "Run Charges" / "Fixed Charges" (proper terminology)
- Ensure project statuses use correct labels: "Curating" not "Sourcing", "In Design" not "Designing"
- Verify all demo data uses real product names (Gildan 5000, Bella+Canvas 3001, AS Color 5001, Richardson 112)

**Which files:**
- All dashboard page files (label text)
- `web/lib/demo/demo-data-provider.ts` (demo data labels)
- `web/lib/constants/app.ts` (label maps)
- `web/components/layout/DashboardLayout.tsx` (sidebar labels)

**Dependencies:** All previous steps
**Estimated complexity:** **S** (find-and-replace + review, but wide surface area)

---

#### Step 19: Demo Data Refresh

**What changes:**
- Replace generic demo data with realistic industry scenarios:
  - **Clients:** Corey Kent (touring artist, $300K+ spend), Tucker Carlson (media brand), Disciple (rock band with reorders), Cooper Allen (country artist, new album), plus corporate clients
  - **Products:** Real SKUs: Gildan 5000 Heavy Cotton Tee, Bella+Canvas 3001 Unisex Jersey, AS Color 5001 Staple Tee, Richardson 112 Trucker Cap, Carhartt K87 Workwear Pocket Tee
  - **Vendors/Decorators:** Culture Studio (Chicago, screen print + embroidery), Lightning Stitch (Texas, embroidery specialist), 33 Inc (DTG), S&S Activewear (blank supplier)
  - **Projects:** Mix of contract (apparel with decoration) and all-in (drinkware, koozies) projects
  - **Decoration examples:** Front chest screen print (3-color), back full print (6-color), left chest embroidery (4,000 stitches), sleeve print (1-color), neckline printed tags
- Ensure cross-referencing: project line items reference real products, real vendors, real matrices
- Price calculations must be mathematically correct in demo data

**Which files:**
- `web/lib/demo/demo-data-provider.ts` -- Major rewrite of demo data
- `web/lib/demo/admin-demo-data.ts` -- Update org names if needed

**Dependencies:** All Phase A-D steps (needs new types and entities)
**Estimated complexity:** **M** (large volume of data, must be internally consistent)

---

#### Step 20: Build Verification and Demo Walk-Through

**What changes:**
- Run `npm run build` -- zero errors
- Navigate every page in the sidebar -- no dead ends
- Click every client, project, order -- detail pages load
- Verify quoting math on 3 different project types:
  - Contract product with 2 decoration locations + run charges
  - All-in product with single vendor cost
  - Mixed project with both contract and all-in line items
- Verify kanban has 7 columns (not 8)
- Verify sidebar order matches Trevor's specification
- Verify "Programs" shows "Coming Soon"
- Verify "Tickets" appears in sidebar
- Verify enhanced date terminology is consistent
- Verify client detail shows contacts, address book, project history
- Verify portal hides cost/margin data
- Mobile responsive check on all major pages

**Which files:** None (verification only)
**Dependencies:** All steps complete
**Estimated complexity:** **S** (testing, not building)

---

## Files Affected (Summary)

### Modified Files

| File | Steps | Nature of Change |
|------|-------|------------------|
| `web/lib/types/app.ts` | 1,2,3,5,6,7,8,10,11,12 | Major type system expansion: new types, modified interfaces |
| `web/lib/utils/quoting.ts` | 1,3,8,9,10 | Quoting engine: contract/all-in split, vendor matrices, charges |
| `web/lib/demo/demo-data-provider.ts` | 1,2,3,5,6,7,9,10,11,12,17,19 | Demo data: new entities, enriched existing data, terminology |
| `web/lib/constants/app.ts` | 2,5,18 | Label maps, vendor types, status labels |
| `web/components/layout/DashboardLayout.tsx` | 4,18 | Sidebar reorder, new nav items |
| `web/app/dashboard/projects/page.tsx` | 5 | Kanban column update |
| `web/app/dashboard/projects/[id]/page.tsx` | 7,8,10,11,13,16 | Major: project detail with new sections |
| `web/app/dashboard/clients/page.tsx` | 6 | Sort options, terminology |
| `web/app/dashboard/clients/[id]/page.tsx` | 6,17 | Tabs: contacts, address book, reorder portal |
| `web/app/dashboard/settings/page.tsx` | 14 | Add vendors link |
| `web/app/dashboard/settings/matrices/page.tsx` | 9 | Group by vendor |
| `web/app/dashboard/programs/page.tsx` | 4 | Replace with "Coming Soon" |
| `web/app/portal/[shareableLink]/page.tsx` | 15 | Enhanced display |
| `web/app/portal/[shareableLink]/tracking/page.tsx` | 15 | Status timeline |
| `web/lib/demo/admin-demo-data.ts` | 19 | Updated org/user data |

### New Files

| File | Step | Purpose |
|------|------|---------|
| `web/app/dashboard/tickets/page.tsx` | 12 | Customer service ticketing page |
| `web/app/dashboard/settings/vendors/page.tsx` | 14 | Vendor management page |
| `web/components/dashboard/ProjectFiles.tsx` | 7,13 | File categorization with location linking |
| `web/components/dashboard/CreativeRequestCard.tsx` | 11 | Creative request display component |
| `web/components/dashboard/SizeBreakdownCalculator.tsx` | 16 | Size ratio calculator tool |

---

## What's NOT in This Round

These are explicitly deferred. Do not build them.

| Feature | Why Deferred | When |
|---------|-------------|------|
| **Salesforce integration** | Trevor will provide Loom videos + screenshots + voice notes in an organized Google Doc. No spec yet. | Round 2 (after Trevor sends docs) |
| **Floor stock / warehouse management** | P3 feature. Entity structure planned but UI is future. | Round 3+ |
| **AI agent implementation** | 11 agent roles identified but architecture not discussed. | Round 4+ (after core platform is live) |
| **PromoStandards API integration** | Table stakes but requires API membership and significant integration work. | Round 3 |
| **Stripe payment processing** | SaaS pricing not needed for Aaron demo. | Post-Aaron approval |
| **Email notification system** | Manual communication is fine for V1. | Round 2 |
| **Programs module (full build)** | Trevor said "Coming Soon" for now. | Round 2 |
| **Purchase order generation** | Requires order lifecycle to be wired. Front-end concept only this round. | Round 2 |
| **Automated vendor communication** | 2-day-before ship date check-in. Requires real order data. | Round 2 |
| **Invoicing flow** | Depends on order lifecycle + Salesforce. | Round 2 |
| **Public product catalog real-time quoting** | Catalog exists but real-time quoting from the catalog needs vendor matrices wired. | Round 2 |
| **CMS / website builder** | Far future. | Round 5+ |
| **Third-party integrations** (S&S, UPS, ShipHero, Front) | Each is a separate integration project. | Round 3-4 |
| **Database migration** | Front-end first. Schema will be updated after UI is approved. | Round 2 |
| **Auth flow / real login** | Demo mode is sufficient for Aaron demo. | Round 2 |

---

## Definition of Done

This round is complete when:

1. **Every sidebar link resolves to a functional page** with correct industry terminology
2. **Quoting engine handles both contract and all-in products** with visible branching in the UI
3. **Decoration locations display as standalone objects** on project line items, each with method, color/stitch count, vendor, and charges
4. **Vendor entity exists** in types and demo data, linked to decorator matrices
5. **Client detail page has tabs** for company profile, contacts (with types), address book (with folders), and project history
6. **Project detail page shows** enhanced dates, production time, file categories, creative requests section, and the correct quoting breakdown
7. **Kanban has 7 columns** (Presenting merged into Client Review)
8. **Sidebar order matches** Trevor's specification exactly
9. **Programs shows "Coming Soon"** and **Tickets appears in sidebar**
10. **Demo data uses real industry products, vendors, and client names** that Trevor will recognize
11. **`npm run build` passes** with zero errors
12. **No page shows generic/placeholder text** -- every label uses correct industry terminology
13. **Portal hides all cost/margin data** -- only sale prices visible to clients
14. Trevor can walk Aaron through the entire app without hitting a dead end, a wrong term, or a broken flow

---

## Execution Order (Recommended Session Breakdown)

### Session 1: Foundation (Steps 1-3)
Type system changes, vendor entity, decoration location restructure. This is the hardest session because everything downstream depends on it.

### Session 2: UX Corrections (Steps 4-7)
Sidebar reorder, status merge, client overhaul, project detail. Visible progress -- things start looking correct.

### Session 3: Pricing Engine (Steps 8-10)
Contract/all-in split in quoting, vendor matrices, charges. Math-heavy session.

### Session 4: New Modules (Steps 11-14)
Creative requests, ticketing placeholder, production files, vendor page. New pages and components.

### Session 5: Portal + Tools + Polish (Steps 15-20)
Portal enhancements, size calculator, reorder concept, terminology sweep, demo data refresh, verification.

---

## Architectural Decisions Log

| Decision | Rationale |
|----------|-----------|
| Rename `DecorationLocation` type to `DecorationPosition` | The term "decoration location" now refers to the full object, not just the position string. Avoids type name collision. |
| Keep `in_hands_date` in code, show "Enhanced Date" in UI | Industry term is "enhanced date" but `in_hands_date` is more self-documenting in code. Label maps handle the translation. |
| Vendor-specific matrices as `vendor_id` on `DecoratorMatrix` | Rather than a separate join table, adding `vendor_id` to existing matrix is simpler. `null` = org default. |
| Programs page becomes "Coming Soon" | Trevor explicitly requested this. Current programs page code preserved in comments for reactivation. |
| Tickets as display-only for V1 | Full ticketing CRUD is P1 but having the page with demo data shows the lifecycle is planned. |
| Size calculator as standalone component | Reusable from project detail and as standalone tool. Component-first, page second. |
| No database changes this round | Trevor's explicit instruction: front-end first. All changes are type system + demo data + UI. |
