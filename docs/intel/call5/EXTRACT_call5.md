# EXTRACT — Call 5 (March 3, 2026)

> Source: `Call_5_TVJ.md` — 82 min call with Trevor, Vitaliy, Jeremy
> Old app reference code: `old-app-reference/` (11 TSX files from Lovable)

---

## CRITICAL CONTEXT

Trevor built a fully functional merch management app in Lovable called "MerchPortal". He's attached to specific UX patterns from that app. The old app code is in `old-app-reference/` — use it as **exact reference** for what he expects.

**The old app uses its own Supabase database structure. We do NOT copy the database schema. We adapt the UX patterns to our own data model.** The old app's data layer (Supabase queries, types) is reference only — we build our own tables, types, and API routes following the BrandOps architecture.

---

## GAP ANALYSIS — What's Missing From BrandOps

### Priority 1: Products Page Overhaul

**Current state:** Products page uses demo data with a basic table + simple edit modal.
**What Trevor expects:** A 4-tab product form (Basics, Blank Costs, Variants/Colors, Decoration Locations).

**Reference:** `old-app-reference/ProductsPage.tsx`

Key features to port:
- **4-tab form** inside a dialog/modal:
  - Basics: Name, SKU, primary image URL, active toggle
  - Blank Costs: Cost tiers by size range (S-XL, 2XL, 3XL, 4XL)
  - Variants: Size selection checkboxes + color entries (color name, hex, multiple images per color)
  - Decoration Locations: Named locations (Front Chest, Back, Left Sleeve) with placeholder run/setup charges
- Product table with columns: Name, SKU, Type, Sizes, Status (Active/Inactive)
- Click row to edit
- "Add Product" button opens create form

**Important:** This is still demo/frontend data for now. Build the UI with local state or demo data provider. Database migration comes later.

---

### Priority 2: Project → Product Catalog Linking

**Current state:** Projects have line items but product selection is manual.
**What Trevor expects:** "Add Product" in a project offers two modes:
1. **From Catalog** — Browse/search existing products, select one, auto-populate details
2. **Quick Entry** — Manual entry for custom/one-off products

**Reference:** `old-app-reference/ProjectDetailPage.tsx` (lines 240-260)

The project detail uses a `Sheet` component (three-quarter width, 75vw) for product editing:
```tsx
<Sheet open={isOpen} onOpenChange={handleOpenChange}>
  <SheetContent side="right" className="sm:max-w-[75vw] w-full p-0 flex flex-col">
    <ProjectProductForm projectId={id!} item={editingItem} ... />
  </SheetContent>
</Sheet>
```

Ensure the BrandOps project detail uses this slide-out sheet pattern for line item editing.

---

### Priority 3: Dual-Level Add-On System

**Not in old app code — this was discussed on the call and is NEW.**

Trevor needs add-ons at two levels:
1. **Product-level add-ons** — Charges that apply to the whole product (e.g., "fold each shirt" — fixed per-unit cost, not tied to any decoration location)
2. **Location-level add-ons** — Charges tied to a specific decoration location (e.g., "puff ink on front chest logo" — per-unit upcharge on that location)

**UX pattern:**
- Each project line item has an "Add-Ons" section
- "Add Product Add-On": name, cost, sale price (fixed per unit)
- "Add Location Add-On": select location, name, cost, sale price (per unit at that location)

---

### Priority 4: AI Product Assistant (URL Scraper)

**Trevor's #1 most excited feature.** He said: "If we build this, we don't need the PromoStandards integration."

**What it does:**
1. User clicks "Add Product" → selects "AI Entry" (vs manual entry)
2. Pastes a supplier product URL (S&S Activewear, HitPromo, SanMar, etc.)
3. AI scrapes the page: product name, images, colors, sizes, descriptions, specs
4. AI humanizes the description copy ("These sunglasses come in a wonderful fresh matte finish...")
5. User reviews extracted data, edits what they want, enters their own pricing
6. Click "Publish" → saves to product catalog

**Implementation approach:**
- API route: `POST /api/products/scrape` — accepts URL, uses fetch + cheerio/JSDOM to extract structured data
- AI call: Pass extracted HTML to Claude, ask for structured JSON (name, description, colors, sizes, images, specs)
- Frontend: Review form pre-filled with scraped data, user edits + adds pricing, saves

**Supplier sites to target (from call):**
- S&S Activewear (ssactivewear.com) — "This is everyone's supplier. $5 billion company."
- HitPromo (hitpromo.net)
- SanMar (sanmar.com)
- Any distributor product page

**Trevor's quote:** "Paste the URL, it extracts all the data I need, I enter my own pricing and click save and I'm done. Holy living shit, dude."

---

### Priority 5: Art Received / Quantities Received Checkboxes

**Reference:** `old-app-reference/plan.md` (Section 3)

Replace the product/line-item status dropdown with two checkboxes:
- **Art Received** — Admin has the artwork for this product
- **Quantities Received** — Admin has the quantity breakdown

Logic:
- Both checked → status = `ready_for_client_input`
- Either unchecked → status = `draft`

On the client-facing portal:
- Art NOT received → show upload section per decoration location
- Quantities NOT received → show quantity input matrix
- Both received → read-only summary

---

### Priority 6: Decorations Page Enhancement

**Reference:** `old-app-reference/DecorationsPage.tsx`

The old app has a sophisticated decoration pricing system:
- Price break matrix: rows = quantity ranges, columns = color/stitch counts, cells = unit prices
- Run charges with their own nested quantity breaks
- Setup charges with "free above qty" thresholds

Compare with current BrandOps decorations page and enhance if needed.

---

### Priority 7: Per-Location Artwork Upload (Client Portal)

**Reference:** `old-app-reference/plan.md` (Section 4)

When artwork is not received, the client portal should show one upload zone PER decoration location (not a single generic upload):
- Location name + thumbnail
- File dropzone
- Attached files with remove buttons

Files organized into folders: "Client Provided - {ProductName} - {LocationName}"

---

### Priority 8: Shipping Address From Project

Trevor mentioned: "I want to add a new shipping address from a project and save it to the client's address book."

**UX:** Inside project detail, shipping card should have "Add New Address" option that:
1. Opens inline form or modal
2. Saves to client's address book
3. Associates with this project

---

### Priority 9: Creative Requests Standalone Page

**Reference:** `old-app-reference/CreativePage.tsx`

A standalone creative requests listing page with:
- Search filter
- Status filter (all statuses)
- Type filter (all creative types)
- Designer/assigned filter
- Links to project + client
- Status + due date badges

Check if BrandOps has this as a standalone route or only embedded in project detail.

---

## ORDER LIFECYCLE AUTOMATION (Phase 3 — Backend)

These are documented here for future reference but are NOT part of the current squad run:

1. **Order confirmed** → Email to client with order confirmation
2. **Entered into Salesforce** → Email: "Your order has been entered. View sales order PDF."
3. **Partially shipped** → Email with tracking: "50 of 100 shirts shipped. UPS tracking: ..."
4. **Fully shipped** → Email with tracking
5. **Invoice ready** → Email with PDF + Stripe pay link

**Matt's email flow:** Matt (employee) forwards an email with SO number + tracking details → AI agent parses → updates order record → triggers client notification.

This requires: email inbound parsing, AI extraction, order record matching, notification system. Save for after V1 frontend is solid.

---

## FRONT-FACING CATALOG (Future)

Trevor wants a public-facing product catalog on his website where:
- Customers browse products with filters (brand, category, type)
- Grid layout with images
- Click product → detail page
- "Add to Project" or "Request Quote" flow
- Eventually connected to Stripe checkout

BrandOps already has `/catalog` and `/catalog/[productId]` routes. Evaluate current state and enhance.

---

## KEY QUOTES

> "My app that I have in Lovable, man — I'm just so bummed that I spent all that time in Lovable and now I can't access the code." — Trevor wants to keep what he loved but in a real stack.

> "If we built this [AI product assistant], we don't need a PromoStandards integration. Any distributor can now just copy, paste, review, and publish." — This is his competitive edge.

> "I'm going to compile one final heavy push. Let's get this app to a decent V1 where it makes logical sense to me." — He wants the beefy edits first, then sniper refinements.

> "The true test is passing it to somebody like Kristen or my other team members and just giving it to them. Does it make sense to you? Could you write up an order?" — Usability by his team is the bar.

---

## FILES TO REFERENCE

| File | What It Shows |
|------|--------------|
| `old-app-reference/ProductsPage.tsx` | 4-tab product form pattern |
| `old-app-reference/ProjectDetailPage.tsx` | Three-quarter sheet, info cards, stage pipeline |
| `old-app-reference/DecorationsPage.tsx` | Price break matrices, run charges, setup charges |
| `old-app-reference/OrdersPage.tsx` | Order lifecycle with shipment tracking |
| `old-app-reference/CreativePage.tsx` | Creative request listing with filters |
| `old-app-reference/CreativeDetailPage.tsx` | Full creative request management |
| `old-app-reference/ClientDetailPage.tsx` | Client detail with addresses, contacts, file library |
| `old-app-reference/plan.md` | 4 planned enhancements from the old app |
