# Brand Ops — Call 4 Implementation Plan

> **Source**: TVJ 4th Call (Feb 24, 2026) + 32 Gold Standard App Screenshots
> **Priority**: UX refinement → Database accuracy → Pricing engine → API integrations

---

## Executive Summary

Trevor's feedback is **not** about missing features — the app already has everything. It's about **UX polish** to match his gold-standard app (Lovable build) and **pricing accuracy** for real-world merch calculations. The screenshots provide exact pixel-level reference for every screen.

---

## Phase 1: Project Detail UX Overhaul (CRITICAL — Trevor's #1 Priority)

### 1.1 Project Detail Page → 3/4 Pop-Out Layout
**Reference**: Screenshots `22.03.42.png`, `22.04.00.png` (full page capture)

Trevor's gold standard shows a project detail that opens as a **3/4 width slide-out panel** from the Projects list, NOT a full page. Current app has a full page. Must change to:

```
┌──────────────────────────────────────────────────────────────┐
│  ← Client Name                                               │
│  Project Name              [Copy Client Link] [Preview] [X]  │
│  ○───●───○───○───○───○───○───○                               │
│  Opp  Qual  Cur  Des  Pres  Rev  Ord                        │
│                                                              │
│  ┌─────────────────┐  ┌──────────────────────────────────┐  │
│  │ Client           │  │ ⏱ Timeline & Production          │  │
│  │ Company Name     │  │ In Hands Date: Feb 27, 2026      │  │
│  │ + Contacts       │  │ Project Deadline: Feb 24, 2026   │  │
│  │ Jeremy K.        │  │ Production Time: Standard ▼      │  │
│  │ Order | Finance  │  │ Split Ship: No                   │  │
│  ├─────────────────┤  ├──────────────────────────────────┤  │
│  │ 📍 Shipping Addr │  │ $ Financial                      │  │
│  │ Primary (Default)│  │ Budget: $10,000                  │  │
│  │ 1123 Street St   │  │ Tax Exempt: No                   │  │
│  │ Nashville, TN    │  │ Payment Terms: Prepay            │  │
│  └─────────────────┘  └──────────────────────────────────┘  │
│                                                              │
│  ▼ Notes (collapsible)                                       │
│                                                              │
│  Products                              [+ Add Product]       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 🖼 Jeremys Concert Tees | Contract | Draft           │   │
│  │   Black | Front Chest: Screen Printing (1 color)     │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ 🖼 Jeremys Concert Tees (Copy) | Contract | Draft    │   │
│  │   Black | Front Chest: Screen Printing (5 colors)    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Creative Requests                     [+ New Request]       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Corey Kent 2026 Product Deck | Branding Deck         │   │
│  │ → Zach | Due Feb 23 | ✅ Completed                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Files                                                       │
│  [Project Files] [Decks] [Client Art] [Client Submitted]    │
│  [Production Files] [Misc]                                   │
│  ┌─────────┐ ┌───────────────────────────────────────────┐  │
│  │ 📁 New   │ │ All Files              [Upload]          │  │
│  │ All Files│ │ No files yet. Upload some above.         │  │
│  └─────────┘ └───────────────────────────────────────────┘  │
│                                                              │
│  [⚙ Admin] [→ Switch]                                       │
└──────────────────────────────────────────────────────────────┘
```

**Changes Required:**
- [ ] Convert `/dashboard/projects/[id]` from full page to slide-out panel
- [ ] Add pipeline status stepper at top (Opportunity → Qualifying → Curating → In Design → Presenting → Client Review → Ordered)
- [ ] Two-column layout: Client/Shipping (left) + Timeline/Financial (right)
- [ ] Collapsible Notes section
- [ ] Products list with inline badges (Contract/All-in, Draft/Approved)
- [ ] Creative Requests section with assignee, due date, status
- [ ] Tabbed file manager (6 tabs: Project Files, Decks, Client Art, Client Submitted, Production Files, Misc)
- [ ] Action bar: Copy Client Link, Preview, Cancel Project
- [ ] Bottom toolbar: Admin/Switch toggle

### 1.2 Product Detail Panel (within Project)
**Reference**: Screenshots `22.04.07.png`, `22.04.15.png`, `22.04.21.png`

When clicking a product in the project, opens a **nested panel** showing:

**Top Section — Product Basics:**
- Primary image with "Primary" badge
- Display Name (editable)
- Product (from catalog, searchable)
- Colors selected (chip selector)
- Blank cost columns by size tier: S-XL, 2XL, 3XL, 4XL (with $ amounts)
- Image upload area
- Checkboxes: ☐ Art Received, ☐ Quantities Received

**Notes Section (collapsible):**
- Client-Facing Notes (white background) — "Shown to the client for this product"
- Internal Notes (Admin Only) (yellow/amber background) — "Only visible to your team"

**Decoration Locations Section:**
- Table: Location | Decoration | Print Colors
- e.g., "Front Chest" | "Screen Printing ▼" | "1 Color ▼"
- "Include in unit price" toggle (blue)
- [+ Add Location] button
- Red delete (🗑) button per row

**Pricing Grid:**
**Reference**: Screenshot `22.04.15.png` — THIS IS THE MONEY SHOT

```
                  Margin: 35% ▼         [Hide Grid]
         24-35  36-49  50-99  100-199  200-499  500-999  1000+
Blank    $3.00  $3.00  $3.00   $3.00    $3.00    $3.00   $3.00
Deco     $4.15  $3.75  $2.70   $1.88    $1.58    $1.30   $1.22
Cost     $7.15  $6.75  $5.70   $4.88    $4.58    $4.30   $4.22
Margin    35%    35%    35%     35%      35%      35%      35%
Sale $   $9.65  $9.11  $7.70   $6.59    $6.18    $5.80   $5.70
Profit   +$2.50 +$2.36 +$2.00 +$1.71   +$1.60   +$1.50  +$1.48
```

**Per-Unit Add-ons Section:**
- "Puff ink, discharge, printed tags, etc. — included in pricing grid"
- Table: Location | Name | Cost | Sale | ✕
- e.g., "Front Chest" | "Puff Inks" | 0.5 | 0.95

**Shipping & Setup Notes:**
- Text area: "Shipping & tax is calculated based on final order quantities"
- Helper text: "Visible to clients. Clarify shipping, tax, or setup cost expectations."

**Quantities Received Section:**
**Reference**: Screenshot `22.04.21.png`
- Toggle: "Toggle on when client provides quantities"
- Color-by-size matrix:

```
Color    XS   S    M    L    XL   2XL  3XL  Total
Black     0    0    0    0    0    0    0      0
Total     0    0    0    0    0    0    0      0
                                    Grand Total: 0 units
```

**CRITICAL BUSINESS RULE**: When multiple colors are ordered, their quantities COMBINE for price break calculations. Example: 50 black + 50 yellow = 100-piece price break for BOTH.

**Changes Required:**
- [ ] Build slide-out product detail panel within project view
- [ ] Implement dual-note system (client-facing vs internal)
- [ ] Build decoration location editor with type/color dropdowns
- [ ] Build pricing grid component with live calculation
- [ ] Implement per-unit add-ons table
- [ ] Build quantities-received matrix (color × size)
- [ ] Implement combined quantity price break logic
- [ ] Art Received / Quantities Received checkboxes at top

---

## Phase 2: Product Catalog & Decorations (Database Accuracy)

### 2.1 Edit Product Modal — 4 Tabs
**Reference**: Screenshots `22.05.48.png` through `22.06.14.png`

**Tab 1 — Basics:**
- Primary Image upload
- Product Name *
- Internal SKU
- Product Type: `Contract` (Blank + decoration pricing model) | `All-in` (flat vendor cost)
- Active Status toggle: "Inactive products won't appear in project selections"

**Tab 2 — Blank Costs:**
- "Default Blank Costs — Base cost for the blank garment before decoration"
- Info box: "These are default values. They can be overridden at the project level when pricing specific orders."
- Size tier columns: S-XL ($3), 2XL ($4), 3XL ($5), 4XL ($6)

**Tab 3 — Variants:**
- Available Sizes: Checkboxes (XS, S, M, L, XL, 2XL, 3XL, 4XL)
- Colors: List with color swatch + name + image icon + delete
  - e.g., 🟡 Yellow, ⚫ Black, 🔵 Blue, 🟣 Purple, ⬜ Tan, 🔴 Red
  - [+ Add Color] button

**Tab 4 — Decorations:**
- "Decoration Locations — Define where decoration can be applied on this product"
- Warning: "⚠ Placeholder Values Only — These pricing values are temporary placeholders. Real decoration pricing will be configured separately once decoration types are implemented."
- [+ Add Location] button
- Add locations like "Front", "Back", or "Left Chest"

**Changes Required:**
- [ ] Ensure Edit Product modal has all 4 tabs matching screenshots
- [ ] Contract vs All-in type toggle affects which pricing fields show
- [ ] Blank costs by size tier (S-XL, 2XL, 3XL, 4XL) — match screenshot exactly
- [ ] Color variant management with swatches
- [ ] Decoration location definitions per product

### 2.2 Decorations Page
**Reference**: Screenshots `22.06.20.png` through `22.06.30.png`

**Decorations List:**
Cards showing:
- Name (e.g., "Embroidery", "Screen Printing")
- Type badge (Embroidery, Print)
- Stats: "5 price breaks, 1 run charge, 2 setup charges"

**Edit Decoration Modal — 3 Tabs:**

**Tab 1 — Basics:**
- Name
- Decoration Type dropdown (Embroidery, Screen Printing, DTG, etc.)

**Tab 2 — Price Breaks:**
Price Break Matrix with:
- Rows = Qty Ranges (e.g., 24-47, 48-71, 72-143, 144-287, 288-1000)
- Columns = Stitch/Color counts
- [+ Add Stitch Count] and [+ Add Qty Row] buttons
- Each cell = price per unit

**Tab 3 — Run Charges & Setups:**
- **Decoration Setup Charges** (FIXED charges):
  - Table: Name | Cost | Sale Price | Free Above Qty
  - e.g., "Digitizing Fee" | $25 | $50 | —
  - e.g., "Tape & Edit Fee" | $10 | $20 | —
  - [+ Add Setup] button

- **Run Charges** (PER-UNIT charges):
  - Table: Name | Cost | Sale
  - e.g., "Per Head Run Charge" | $0.5 | $1
  - [+ Add Charge] button

**CRITICAL TERMINOLOGY (from Trevor):**
- **Fixed Charge** = Setup fee, flat rate per job (e.g., $50 screen setup). NOT per-unit.
- **Run Charge** = Per-unit surcharge (e.g., $0.50/unit for folding, puff ink, extra color)
- Multiple colors = multiple setups. 3-color print = base setup ($50) + 2 additional setups ($100 more = $150 total)
- Additional colors ALSO have a run charge (e.g., $0.50/unit/extra color)

**Changes Required:**
- [ ] Verify decoration cards match screenshot layout
- [ ] Implement Price Break Matrix with dynamic stitch count columns
- [ ] Implement Setup Charges table (Name, Cost, Sale, Free Above Qty)
- [ ] Implement Run Charges table (Name, Cost, Sale)
- [ ] Ensure price break lookup uses correct quantity-range matching

---

## Phase 3: Pricing Engine (Mathematical Accuracy)

### 3.1 Contract Product Pricing
The pricing grid in the product detail (within a project) MUST calculate correctly:

```
For each quantity break:
  Blank Cost = products.blank_costs[size_tier] (from catalog)
  Deco Cost  = decorator_matrices.pricing_tiers[qty_range][color_count]
  Run Charges = SUM(decoration run_charges.cost_per_unit)

  Unit Cost = Blank + Deco + Run Charges

  Fixed Charges (setup fees) are separate line items, NOT per-unit

  Margin % = (editable, default from org settings)
  Unit Price = Unit Cost / (1 - Margin/100)
  Profit = Unit Price - Unit Cost
```

### 3.2 All-In Product Pricing (HIT Promo style)
- Single vendor cost per unit (includes blank + decoration)
- Price codes: C = 40% margin, G = 20% margin, etc.
- Setup charges are separate
- Additional colors = additional run charges + additional setups

### 3.3 Combined Quantity Price Breaks
**CRITICAL**: When a project has 50 black + 50 yellow of the same product, BOTH colors get the 100-piece price break. The system must:
1. Sum all color quantities for the same product
2. Use the COMBINED total to determine the price break tier
3. Apply that tier's pricing to ALL colors

**Changes Required:**
- [ ] Build pricing calculation engine as a pure function
- [ ] Implement combined-quantity logic across colors
- [ ] Verify blank cost lookup by size tier
- [ ] Verify decoration cost lookup by qty range + color count
- [ ] Add run charge and fixed charge accumulation
- [ ] Build margin override per line item
- [ ] Real-time pricing grid update on any input change

---

## Phase 4: Client Management Polish

### 4.1 Client Detail — 4 Tabs
**Reference**: Screenshots `22.03.00.png` through `22.03.27.png`

Already largely in place. Verify:
- [ ] Details tab: Company Name, Payment Terms dropdown, Tax Exempt toggle, Billing + Shipping addresses
- [ ] Contacts tab: List with role badges (Order, Finance), edit/delete
- [ ] Address Book tab: Multiple addresses with Add Address
- [ ] Files tab: Folder tree + file upload area

---

## Phase 5: Public Website & E-Commerce Flow

### 5.1 Product Catalog (Public-Facing)
**Reference**: Screenshots `22.02.25.png`, `22.02.31.png`

Flow: Select Items → Complete Project Info → Connect With Rep

- [ ] Step indicator at top
- [ ] Product grid with Style/Brand/View filters
- [ ] "Add to Project" button per product
- [ ] "Product Added" confirmation modal (Continue Browsing / Finalize Project)
- [ ] Product detail page with color selection, decoration type, locations, price grid

### 5.2 Project Details Form
**Reference**: Screenshot `22.02.40.png`

- [ ] Existing client? (Yes/No)
- [ ] Project Name, Contact Info (First, Last, Email, Phone, Company)
- [ ] In-Hands Date, Budget (range selector)
- [ ] Billing/Shipping Address
- [ ] Stripe payment capture (charge later on approval)

---

## Phase 6: Order Flow & Boundless Integration

### 6.1 Project → Order Conversion
1. Project approved → Products split into individual orders
2. Each order has: product, quantity, unit price, total, shipping address
3. Order status: Order Entry Needed → Entered → In Production → Shipped → Invoiced

### 6.2 Boundless-Specific Flow
- Kristen enters order into Salesforce
- Sales order PDF → uploaded to order record
- Ship notification email → parsed → tracking added to order
- Client portal shows real-time tracking

### 6.3 Commission Tracking
- Boundless takes 60% of gross profit
- Remaining 40% is Trevor's
- Of Trevor's share: 50-50 split with Vitaliy/Jeremy
- Website orders at 40% margin (not 35%)
- Referral kickback: 1-2% on referral code orders

---

## Phase 7: API Integrations (Future)

### 7.1 HIT Promotional Products API
- CJ (CEO) connecting with Raj (CTO) for API access
- One-time catalog pull (they update annually)
- Products → org product catalog with vendor = "Hit Promo"
- All-in pricing with price codes

### 7.2 Stripe Payment Capture
- Capture card on project submission (don't charge)
- Charge on project approval
- Refund capability

---

## Priority Execution Order

| Priority | Phase | Effort | Impact |
|----------|-------|--------|--------|
| 🔴 P0 | 1.1 Project Detail 3/4 layout | Large | Trevor's #1 ask |
| 🔴 P0 | 1.2 Product Detail within project | Large | Core pricing UX |
| 🟡 P1 | 3.1 Pricing engine accuracy | Medium | Must be correct |
| 🟡 P1 | 2.2 Decorations matrices | Medium | Enables pricing |
| 🟡 P1 | 2.1 Product catalog modal | Small | Already mostly done |
| 🟢 P2 | 4.1 Client detail polish | Small | Already mostly done |
| 🟢 P2 | 5.1 Public website catalog | Medium | Revenue enabler |
| 🟢 P2 | 5.2 Project submission form | Medium | Revenue enabler |
| 🔵 P3 | 6.x Order flow + Boundless | Large | Post-MVP |
| 🔵 P3 | 7.x API integrations | Large | Post-MVP |

---

## Squad Deployment Strategy

Run the squad (Departments 1-3) to bake this intel in:

1. **Copy this plan** → `docs/roadmap/call4-implementation.md` in brandops
2. **Copy screenshots** → Already in `docs/intel/call4/gold-standard-app-demo/`
3. **Update SPEC_TEMPLATE.md** with Phase 1 + 2 specs
4. **Run chain.sh** → Let agents build from the updated spec
5. **Post-build refinement** → Use X-Ray mode for Trevor to give feedback

---

## Key Business Context (for AI agents)

- **Trevor is moving to Arkansas** this week (Feb 25-28) — limited availability
- **Shoestring budget** — minimize API costs, use Haiku where possible
- **Boundless CEO (Aaron)** approved the revenue split model — this is real money
- **Threadbird** ($20M/yr) is the competitive benchmark for the catalog UX
- **Custom Ink** ($500M+) is NOT the direction — we're B2B, not B2C consumer design
- **Nick (Threadbird CEO)** said he'd buy this software — SaaS opportunity is real
- **Database must be CLEAN** — Trevor emphasized proper linking and relationships
- **Demo data stays** for onboarding — new clients see examples, then get blank canvas
