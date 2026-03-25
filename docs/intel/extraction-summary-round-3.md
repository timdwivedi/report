# Extraction Summary -- Round 3
> **Source:** Call 4 (108 min, Feb 24 2026) + 32 gold-standard app screenshots
> **Surgeon:** PB-1 (Round 3)
> **Participants:** Trevor Sarver (85 Supply / Boundless), Vitaliy S., Jeremy Kreutzer
> **Date:** 2026-02-25

---

## Executive Summary

This 108-minute call marks a critical inflection point. Trevor is no longer giving feature requirements -- he is giving **pixel-level UX mandates** backed by a fully functional Lovable-built reference app ("MerchPortal") that he built over a weekend. The 32 screenshots constitute a binding visual specification. Trevor's #1 priority is **UX parity with his Lovable app**, not new features. He explicitly stated: "My objective one is to achieve what I have in my current app."

Three major developments from this call:

1. **Aaron (Boundless CEO) approved the revenue split model.** The business deal is now real: 60% Boundless / 40% Trevor on all website orders, with Boundless keeping this revenue separate from Trevor's salary. Trevor proposes a 50-50 split with Vitaliy/Jeremy on his 40% share. This transforms BrandOps from a demo to a revenue-generating platform.

2. **HIT Promotional Products API access confirmed.** CJ (CEO of HIT) connected Trevor with Raj (CTO) for direct API integration. This will be the foundational all-in product catalog -- a one-time annual pull, not PromoStandards slop.

3. **Trevor wants vibe-code access.** He wants to be able to use the X-ray feedback tool and make UI changes himself on weekends. His exact words: "When I have full control and autonomy, I don't need a dev. I'll build the software." This means the UI must be modular enough for a non-developer to iterate on.

The single most important deliverable is the **Project Detail slide-out panel** matching Trevor's Lovable screenshots exactly. Everything else is secondary.

---

## New Entities Required

| Entity | Description | Key Fields | Priority | Source |
|--------|-------------|------------|----------|--------|
| **Referral Program** | Referral kickback tracking for website orders | `referral_code`, `referrer_id`, `kickback_percent` (1-2%), `order_id`, `payout_status` | P1 | Trevor: "We need to build in a referral kickback, a 1%, 2% kickback if you use a referral code to our website." |
| **Website Order (E-Com)** | Orders originating from the public-facing website, distinct from internal projects | `source: 'website'`, `stripe_payment_intent_id`, `card_captured: boolean`, `card_charged: boolean`, `existing_client: boolean` | P1 | Trevor: "We capture the credit card information right there... we don't charge it... if they approve the project, are you sure this will charge your card? Yes. Boom." |
| **AI Inbox** | Dedicated email inbox for AI agent to parse Boundless notifications | `inbox_email`, `type` (sales_order / shipment / invoice), `parsed_data` (JSON), `matched_order_id`, `status` | P2 | Trevor: "We can have a dedicated inbox for the AI agent to click that, grab that invoice... same for shipments." |

---

## Modifications to Existing Entities

| Entity | Change | Reason | Priority |
|--------|--------|--------|----------|
| **Products** | Add `show_on_website: boolean` toggle | Trevor: "I as a user can go, yes, show on website, yes, no." Already in screenshots (from R1), now confirmed as critical for e-com flow. | P0 |
| **Products** | Add `vendor_source: string` (e.g., "Hit Promo", "Manual") and `vendor_api_id: string` | For HIT API integration -- products pulled from API need to be linked back to their source for annual refresh. Trevor: "Filter by hit promo, right? And I see their whole catalog." | P1 |
| **Products** | Contract product can also be all-in | Trevor: "An apparel piece can be both. I do have vendors that say, Trevor, don't even worry about ordering the blank t-shirts... We will do that. And here is an all-in price." This means product_type may need a `hybrid` option or the ability to switch pricing model per-project. | P0 |
| **Projects** | Add `source: 'internal' | 'website'` field | To distinguish Aaron-trackable website revenue from existing client orders. Trevor: "He wants to make absolutely unequivocally sure that an existing client, when they go to the website, that is not... he goes, I want to see new revenue." | P1 |
| **Orders** | Add `sales_order_pdf_url: string` | Kristen downloads PDF from Salesforce and uploads it to the order record. Trevor: "She's going to grab that PDF and upload it as the sales order, the PDF." | P1 |
| **Orders** | Add `boundless_entered: boolean`, `boundless_sales_order_number: string` | For Boundless flow tracking. Trevor: "She enters that into the system, a sales order is going to be sent." | P1 |
| **Client Portal** | Must show: projects, orders, shipments, reorder capability | Trevor: "For a client to go to 85supply.com, log in and see projects, orders, for reordering." | P2 |
| **Website Checkout** | Add `billing_appears_as: string` (default: "Boundless") | Legal requirement. Trevor: "Whenever we capture their credit card, explicitly saying your charge will appear as Boundless." | P1 |
| **Commissions** | Add commission payout timing: paid after order shipped + 1-2 week hold period | Trevor: "Commissions are paid after the order has been completed and shipped... there's a simple one to two week pay period or period to ensure there's no issues." | P2 |

---

## Feature Requirements (P0/P1/P2/P3)

### P0 -- Must Have (Blocks Everything)

1. **Project Detail 3/4 Slide-Out Panel (Match Lovable App Exactly)**
   - Opens from Projects list as a 75% width right-side slide panel, NOT a full page
   - Pipeline status stepper at top: Opportunity > Qualifying > Curating > In Design > Presenting > Client Review > Ordered
   - Two-column layout: Client/Shipping (left 40%) + Timeline/Financial (right 60%)
   - Collapsible Notes section
   - Products list with inline thumbnails, Contract/All-in badges, Draft/Approved badges
   - Creative Requests section with assignee, due date, status badge
   - Tabbed file manager: Project Files | Decks | Client Art | Client Submitted | Production Files | Misc
   - Action bar: Copy Client Link | Preview | Cancel Project
   - Bottom toolbar: Admin toggle | Switch view
   - **Screenshots:** `22.03.42.png`, `22.04.00.png`, `screencapture-...22_04_47.png`

2. **Product Detail Nested Panel (Within Project)**
   - Opens as a nested 60% slide panel when clicking a product in the project
   - Top section: Primary image with badge, Display Name, Product (searchable catalog dropdown), Colors, Blank costs by size tier (S-XL, 2XL, 3XL, 4XL), Upload, Art Received / Quantities Received checkboxes
   - Dual notes: Client-Facing (white bg) + Internal Admin Only (amber/yellow bg)
   - Decoration Locations table: Location | Decoration | Print Colors, "Include in unit price" toggle, delete button
   - **PRICING GRID** (the money shot): Rows = Blank, Deco, Cost, Margin (editable per-column), Sale Price, Profit. Columns = qty breaks (24-35, 36-49, 50-99, 100-199, 200-499, 500-999, 1000+)
   - Per-Unit Add-Ons section: Location | Name | Cost | Sale
   - Shipping & Setup Notes textarea (visible to clients)
   - Quantities Received toggle: Color x Size matrix with per-cell input, row totals, column totals, grand total
   - **Screenshots:** `22.04.07.png`, `22.04.15.png`, `22.04.21.png`

3. **Decoration Matrices Must Be Functional**
   - Trevor: "I need to go in there and actually hard code a couple of matrices, because then I'm going to go back and make sure that the actual mathematics are calculated correct"
   - The Decorations page must allow real data entry with correct qty-range x color-count pricing
   - Trevor will manually enter matrices for testing -- this is the validation gate
   - **Screenshots:** `22.06.20.png`, `22.06.24.png`, `22.06.27.png`, `22.06.30.png`

4. **Contract vs All-In Product Dual-Type Support**
   - Product edit modal must have 4 tabs: Basics | Blank Costs | Variants | Decorations
   - Contract: "Blank + decoration pricing model" badge
   - Product type shown clearly in Basics tab
   - Blank Costs tab: S-XL ($3), 2XL ($4), 3XL ($5), 4XL ($6) -- default values, overridable at project level
   - Variants tab: Available Sizes checkboxes + Colors list with swatches (Yellow, Black, Blue, Purple, Tan, Red)
   - Decorations tab: Define where decoration can be applied, with placeholder warning
   - **Screenshots:** `22.05.48.png`, `22.05.54.png`, `22.06.01.png`, `22.06.07.png`, `22.06.14.png`

### P1 -- Core Experience (Revenue-Enabling)

5. **Public Website E-Commerce Flow**
   - Step indicator: Select Items > Complete Project Info > Connect With Rep
   - Product grid with Style/Brand/View filters
   - "Add to Project" button per product, "Product Added" confirmation modal (Continue Browsing | Finalize Project)
   - Product detail: color selection, decoration type, locations, price grid
   - Project Details form: Existing client? (Yes/No), Project Name, Contact Info, In-Hands Date, Budget (range selector), Billing/Shipping Address
   - Stripe card capture (charge later on approval)
   - Hard-coded 40% margin on all website orders (not 35%)
   - "Not finding what you're looking for? Click here" manual request fallback
   - **Screenshots:** `22.02.25.png`, `22.02.31.png`, `22.02.40.png`
   - Trevor: "On the website, guys, I want to hard code everything at 40... 35 in my industry is aggressive."

6. **HIT Promotional Products API Integration**
   - One-time catalog pull (annual updates)
   - Products imported to org catalog with `vendor_source: 'Hit Promo'`
   - User can filter by vendor, toggle show_on_website, edit descriptions
   - All-in pricing with ASI price codes (C = 40%, G = 20%, etc.)
   - Additional colors = additional run charges ($0.50/unit/extra color) + additional setup charges ($50/setup)
   - Trevor: "One pull request is from one thing... they update their catalog one time a year."

7. **Boundless Order Entry Bridge**
   - Project approved > products split into individual orders
   - Order view shows raw cost so Kristen can enter into Salesforce
   - Kristen enters order, downloads sales order PDF, uploads to record in BrandOps
   - Checkbox: "Send confirmation: Yes/No" (she selects No)
   - AI inbox workflow: Boundless sends ship notifications to dedicated inbox, AI parses and adds tracking to order
   - Trevor: "Our only action items are to create a systematic flow of sales orders from Boundless sent to a dedicated AI inbox."

8. **Referral Code System**
   - 1-2% kickback on referral code orders
   - Referrer dashboard: see referrals, projects, commissions owed, estimated payouts, analytics
   - Trevor: "Build in a referral kickback, a 1%, 2% kickback if you use a referral code to our website."

### P2 -- Differentiators

9. **Client Portal Refinement**
   - Logged-in client sees: projects, orders, shipments, reorder capability
   - Real-time tracking via parsed ship notifications
   - Reorder flow for existing products
   - Trevor: "Refine the client portal. What does it look like? For a client to go to 85supply.com, log in."

10. **Boundless Co-Brand Toggle**
    - Feature flag: `is_boundless_cobrand: boolean` per org
    - Boundless co-brands get simplified order flow (no PO generation, no vendor management)
    - Non-Boundless orgs get full traditional flow with POs and vendor communication
    - Trevor: "There's an industry traditional flow of an order, and then there's the Boundless proprietary flow."
    - Vitaliy: "We could just have like a toggle where if you're a Boundless rep or co-brand, you would have access to that extra little feature set."

11. **Revenue Reporting for Aaron/Kevin**
    - Monthly reporting: gross revenue, gross profit, website vs existing client attribution
    - Must clearly show new revenue vs existing client revenue
    - Kevin (Boundless CFO) wants monthly reporting
    - Trevor: "They're going to want to click. They want monthly reporting of all the revenue."

### P3 -- Future Vision

12. **SaaS Multi-Tenant Distribution**
    - Beta test with companies doing $10M+ annually
    - First: 85 Supply guinea pig > Boundless co-brands > Threadbird/Culture Studio beta > General SaaS
    - Trevor: "No beta testers that we would have do less than 10 million annually."

13. **AI-Powered Invoice Parsing**
    - Dedicated inbox receives Boundless invoices
    - AI extracts invoice data, matches to order, adds to record
    - Trevor can approve/reject from within BrandOps
    - Trevor: "A portal where I select, yes, that is good. To be invoiced."

---

## Business Rules (Exact Formulas, Edge Cases)

| Rule | Context | Trevor's Exact Words |
|------|---------|---------------------|
| Website orders at 40% margin, not 35% | E-com pricing | "On the website, guys, I want to hard code everything at 40... 35 in my industry is aggressive. That's usually, right?" |
| Boundless takes 60%, Trevor keeps 40% of gross profit | Revenue split on all orders | "60% of the profit goes to Boundless, 40% goes to me." |
| Website revenue must be new business only | Aaron's requirement | "He wants to make absolutely unequivocally sure that an existing client, when they go to the website, that is not... he goes, I want to see new revenue." |
| Commissions paid after ship + 1-2 week hold | Payout timing | "Commissions are paid after the order has been completed and shipped... there's a simple one to two week pay period." |
| Credit card captured but NOT charged until project approved | Stripe flow | "We capture the credit card information... we don't charge it... if they approve the project, are you sure this will charge your card? Yes. Boom." |
| Charge appears as Boundless on credit card | Legal requirement | "Explicitly saying your charge will appear as Boundless." |
| ASI Price Codes: C = 40% margin, G = 20% margin | All-in product pricing | "A C is 40%... G is 20%. So my cost on a setup is 35 bucks or 30 bucks. But I'm going to bill my client 50." |
| All-in additional colors: +$0.50/unit run charge per extra color + $50/setup per extra color | Additional color pricing | "Add 50 cents per extra color per unit. That's a run charge... there would be an extra $100. There'd be $150 setup." |
| Apparel can be BOTH contract and all-in | Product type flexibility | "An apparel piece can be both. I do have vendors that say, Trevor, don't even worry about ordering the blank t-shirts... We will do that. And here is an all-in price." |
| Combined color quantities for price breaks | Multi-color pricing | "If you order 50 of each, you get the 100-piece price break." (Confirmed from Lovable app demo, R1 rule re-validated) |
| HIT catalog updates once per year | API pull frequency | "They update their catalog one time a year. So one pull request is from one thing." |
| PromoStandards API rejected in favor of direct supplier integration | Integration strategy | "Promo standards, it's slop. It's API slop. We're just going to go direct to these suppliers." |
| Kristen enters orders into Salesforce manually | Boundless bridge flow | "Kristen's going to enter it... She'll select No [send confirmation]. She can download that PDF and drop it on the record." |
| No Salesforce email notifications from BrandOps orders | Prevent duplicate emails | "I can turn them off... Send confirmation, yes, no. She'll select no." |
| Apparel = contract product (99% of the time) | Product type mapping | "Apparel, 99% of the time is contract product. Promo is all-in product usually." |

---

## UX Decisions (Trevor's Exact Quotes)

| Decision | Trevor's Words | Impact |
|----------|---------------|--------|
| Project detail must be a 3/4 slide-out, not full page | "I poured my heart and soul into the UX of this project, the project layout." | Convert project detail from full page to SlidePanel component |
| Dual notes on product (client-facing + internal) | "Client-facing notes to the project... or internal notes that says, I spoke to that vendor, they custom-quoted that for us... really private ." | White bg for client notes, amber/yellow bg for internal notes |
| Pricing grid is "the money shot" | "I can see the price breaks with the blank deco, I mean, this UX is like, literally." | PricingGrid must show Blank, Deco, Cost, Margin, Sale Price, Profit per qty break |
| Trevor wants to vibe-code the UI himself | "When I have full control and autonomy, I don't need a dev. I'll build the software." | UI must be modular, well-structured, easy for a non-dev to iterate |
| X-ray feedback tool is the primary async feedback mechanism | "I can just sit there through the app, clean this up, fix this, voice note, voice note, voice note." | X-ray mode with voice notes replaces Google Doc feedback flow |
| Website should be "add to order" not "add to project" | "The real concept is like add to order, right? Like we're not an agency anymore. Kind of marrying that e-commerce." | Public website uses e-commerce language, not agency language |
| Not Custom Ink B2C style -- we are B2B | "We're B2B. We're a B2B organization. We're not B2C." | No "design your own" feature. Upload artwork + select decoration + see price grid. |
| Premium design services as an upsell, not DIY | "Check out our premium graphic design services, starting at $300 per approved design." | Design request CTA on product pages, not a design tool |
| Shoestring budget constraint | "We want to do this on a shoestring budget. I don't want to go spending shitloads of money on API calls." | Use Haiku where possible, minimize API costs, let Trevor self-serve via X-ray |
| Demo data stays for onboarding | Vitaliy: "When a new client comes on, they would see the mock-up data as an example for the onboarding steps." Trevor agreed. | Demo data not deleted -- hidden once real data enters |
| Threadbird ($20M/yr) is the e-com benchmark | "These guys are doing 20 million right now annually. All through their website." | Catalog UX should match/exceed Threadbird quality |
| Creative request detail page has time tracking, versioning, edit requests | Screenshot `22.04.32.png` shows: Status, Assigned To, Due Date, Attachments, Version History, Edit Requests | Full creative request management, not just a list |

---

## Integration Requirements

| System | Purpose | Priority | New Info from Call 4 |
|--------|---------|----------|---------------------|
| **HIT Promotional Products API** | All-in product catalog pull, one-time annual import | P1 | CJ (CEO) connected Trevor with Raj (CTO). Direct API access confirmed. Trevor: "They're going to give us access to their API." |
| **Stripe** | Card capture on project submission, charge on approval, refund capability | P1 | Trevor: "Through Stripe this is totally a thing... you can take the card, you can bill it later." |
| **Boundless Salesforce** | Order entry bridge (Kristen manually enters), sales order PDF capture, invoice approval | P1 | Workflow refined: Kristen enters > downloads PDF > uploads to BrandOps record > AI inbox for ship notifications |
| **AI Email Inbox** | Parse Boundless sales orders, ship notifications, invoices; auto-add to order records | P2 | Trevor: "For every shipment, email the sales order number with the tracking, and email it to this inbox that AI analyzes it." |
| **Future Supplier APIs** | Bell Promo, Lanco, Top Tier, PCNA -- direct integrations, not PromoStandards | P3 | Trevor: "There's hit promo, Bell Promo, Lanco, Top Tier PCNA... we're doing our integrations direct with the supplier instead of promo standards." |

---

## Gap Analysis -- Built vs Screenshots

### Components Built This Session

| Component | File | What It Does |
|-----------|------|-------------|
| `SlidePanel` | `web/components/shared/SlidePanel.tsx` | Generic right-side slide-out panel (md/lg/xl/full widths), Portal-based, Escape to close, body scroll lock |
| `PricingGrid` | `web/components/shared/PricingGrid.tsx` | Pricing breakdown table: Blank, Deco, Run Charges, Add-Ons, Cost, Margin (editable per-column), Sale Price, Profit. Supports contract + all-in |
| `ProjectDetailPanel` | `web/components/projects/ProjectDetailPanel.tsx` | Full project detail with status stepper, 2-column layout, client/shipping/timeline/financial cards, products list, creative requests, tabbed files |
| `ProductDetailPanel` | `web/components/projects/ProductDetailPanel.tsx` | Nested product editor with catalog search, blank costs, dual notes, decoration locations, PricingGrid integration, per-unit add-ons, quantities matrix |
| `ProductEditModal` | `web/components/products/ProductEditModal.tsx` | 4-tab product editor: Basics, Blank Costs, Variants, Decorations |
| Decorations page | `web/app/dashboard/decorations/page.tsx` | Decoration cards with 3-tab modal: Basics, Price Breaks (matrix), Run Charges & Setups |
| Projects page | `web/app/dashboard/projects/page.tsx` | Kanban + table view with SlidePanel integration for project detail + nested product detail |
| Products page | `web/app/dashboard/products/page.tsx` | Product list with search, category filter, ProductEditModal integration |

### Pixel-by-Pixel Comparison: Built vs Gold Standard

| Element | Gold Standard (Screenshot) | Built (Component) | Status | Gap |
|---------|---------------------------|-------------------|--------|-----|
| **Project Detail Layout** | 3/4 slide-out from project list, dark sidebar still visible behind | `SlidePanel` with `width='xl'` (75vw) | MATCH | None -- layout matches |
| **Status Stepper** | Horizontal pipeline: Opp > Qual > Cur > In Design > Presenting > Client Review > Ordered, dot + line style | `ProjectStatusStepper` referenced in `ProjectDetailPanel` | PARTIAL | Screenshot shows 7 stages including "Presenting" and "Ordered". Built version needs to include both (R1 said merge Presenting into Client Review, but Trevor's Lovable app still has it). **Need clarification.** |
| **Client Card** | Left column: Company name, contacts with role badges (Order, Finance), + Add button | Built with `Building2` icon, contact cards with role badges, "Add Contact" button | MATCH | Minor: screenshot shows chat icon on company name (red bubble), built version does not. Low priority. |
| **Shipping Address** | Dropdown "Primary Shipping (Default)", address display below | Built with `<select>` grouped by folder, address detail below | MATCH | None |
| **Timeline & Production** | In Hands Date (calendar), Project Deadline (calendar), Production Time (Standard/Rush dropdown), Split Ship (toggle) | Built with all 4 fields, toggle for split ship | MATCH | Screenshot `22.05.38.png` shows dropdown open with "Standard" and "Rush" options. Built has 5 options (Rush 5-7, Standard 7-10, Standard 10-14, Extended 15-20, Rush). **Trevor's app only shows 2 options.** May want to simplify. |
| **Financial** | Budget ($10000), Tax Exempt (No toggle), Payment Terms (Prepay) | Built with all 3 fields + summary row (Cost, Revenue, Margin) | ENHANCED | Built version adds summary row not in Trevor's app -- this is an improvement. |
| **Notes Section** | Collapsible with chevron | Built with collapse toggle | MATCH | None |
| **Products List** | Thumbnail, name, Contract badge, Draft badge, color, decoration summary per line item | Built with all elements: thumbnail, product_type badge, art_received badge, color chip, decoration summary, qty/price on right | MATCH | Good parity |
| **Product Detail -- Header** | Primary image with "Primary" badge, Display Name, Product (searchable), Colors (chip), Blank costs (S-XL $3, 2XL $4, 3XL $5, 4XL $6), Art Received checkbox, Quantities Received checkbox | Built with all fields including searchable ProductSearchDropdown, BlankCostInputs by size tier, checkboxes | MATCH | Blank cost tiers in built version use `['S-XL', '2XL', '3XL', '4XL']` labels matching screenshot exactly |
| **Product Detail -- Notes** | Client-Facing Notes (white) + Internal Notes (amber/yellow bg) | Built with white textarea + amber-bg textarea with amber border/placeholder | MATCH | Color-coded backgrounds match screenshot accurately |
| **Product Detail -- Decoration Locations** | Table: checkbox icon, Location dropdown, Decoration dropdown, Print Colors dropdown, delete (red trash), "Include in unit price" toggle | Built with icon, 3 dropdowns (position, method, color count), delete button, "Include in unit price" toggle with cost/unit display | MATCH | Built version adds cost/unit display in the toggle row, which is an enhancement |
| **PRICING GRID** | 7 qty columns (24-35 through 1000+), 6 rows (Blank, Deco, Cost, Margin %, Sale $, Profit), green profit text | Built with 5 qty columns (25-49 through 500+), same 6 rows, green profit text, editable per-column margin | **MISMATCH** | **Critical**: Built grid has 5 columns, screenshot has 7. Need to add: 24-35, 36-49, 50-99, 100-199, 200-499, 500-999, 1000+. Also, qty break labels differ (25-49 vs 24-35). Must align to Trevor's exact breaks. |
| **Per-Unit Add-Ons** | Table: Location, Name, Cost, Sale, X (delete) | Built with Location dropdown, Name input, Cost input, Sale (computed from margin), X delete | MATCH | Built version auto-computes Sale from margin, which is correct behavior |
| **Shipping & Setup Notes** | Textarea + helper text "Visible to clients" | Built with textarea + helper text | MATCH | None |
| **Quantities Received** | Toggle, Color x Size matrix (XS through 3XL), per-cell inputs, row/column totals, Grand Total | Built with toggle, color x size matrix, per-cell inputs, row/column totals, Grand Total badge | MATCH | Built version uses `['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']` sizes. Screenshot shows same columns. |
| **Decorations Page -- Cards** | Two cards: Embroidery (5 price breaks, 1 run charge, 2 setup charges) + Screen Printing (56 price breaks, 2 run charges, 1 setup charge), type badges | Built with decoration cards showing name, type badge, stats | MATCH | Stats format matches (e.g., "5 price breaks, 1 run charge, 2 setup charges") |
| **Decorations -- Edit Modal** | 3 tabs: Basics, Price Breaks, Run Charges & Setups | Built with 3-tab modal | MATCH | None |
| **Decorations -- Price Break Matrix** | Embroidery: Qty Range column + Stitch Count columns, + Add Stitch Count / + Add Qty Row buttons | Built with dynamic qty range rows + stitch/color count columns, add buttons | MATCH | Screenshot shows "1 stitches" column header for embroidery, which is unusual but matches |
| **Decorations -- Run Charges & Setups** | Setup Charges table (Name, Cost, Sale Price, Free Above Qty) + Run Charges table (Name, Cost, Sale) | Built with both tables matching column structure | MATCH | "Free Above Qty" column present in screenshot and in built version |
| **Product Edit Modal -- Basics** | Primary Image, Product Name, Internal SKU, Product Type (Contract badge), Active Status toggle | Built with all fields matching | MATCH | None |
| **Product Edit Modal -- Blank Costs** | "Default Blank Costs" header, info box about overridable values, S-XL ($3), 2XL ($4), 3XL ($5), 4XL ($6) | Built with size tier inputs | MATCH | Info box text matches: "These are default values. They can be overridden at the project level when pricing specific orders." |
| **Product Edit Modal -- Variants** | Available Sizes checkboxes (XS through 4XL), Colors list with swatches + delete + image icon | Built with size checkboxes and color list | MATCH | Color list matches: Yellow, Black, Blue, Purple, Tan, Red |
| **Product Edit Modal -- Decorations** | Placeholder warning, + Add Location, empty state with location name suggestions | Built with warning text and add location button | MATCH | Warning text matches: "Placeholder Values Only -- These pricing values are temporary placeholders." |
| **Public Website -- Catalog** | Step indicator at top, product grid with badges (Popular, Budget Friendly), Style/Brand filters, Grid/List toggle, "View Product" + "Add to Project" per card | Not yet compared -- this is in Trevor's existing Lovable public website, separate from admin app | NOT BUILT | Public website catalog is P1, not yet implemented in BrandOps |
| **Public Website -- Add Confirmation** | Modal: "Product Added to Project", product thumbnail, "Continue Browsing" / "Finalize Project" buttons | Not built | NOT BUILT | P1 feature |
| **Public Website -- Project Details** | Full form: Existing Client?, Project Name, Contact Info, In-Hands Date, Budget, Billing/Shipping | Not built | NOT BUILT | P1 feature |
| **Creative Request Detail** | Full page with: Status dropdown, Assigned To, Due Date, Attachments section (Upload, notes), Version History (Request Edits / Upload & Complete), Edit Requests | `ProjectDetailPanel` has creative request list but NOT the full detail view | **GAP** | Need a Creative Request Detail panel/page matching `22.04.32.png` |
| **Sidebar Navigation** | Dashboard > Clients > Projects > Orders > Products > Decorations > Creative > Settings | Built sidebar matches this order | MATCH | "Creative" item present in sidebar in screenshots, matching built version |
| **Threadbird Reference** | Catalog with category sidebar, product cards with color swatches, "From $X for 100" pricing | Not a build target -- reference for catalog UX quality | REFERENCE | Screenshots `22.07.19.png`, `22.07.26.png`, `22.07.34.png` show the benchmark |

---

## Surgeon's Recommendations (Prioritized)

### 1. CRITICAL: Fix PricingGrid Quantity Breaks to Match Screenshot
The built `PricingGrid` uses 5 quantity break columns (25-49, 50-99, 100-249, 250-499, 500+) but Trevor's Lovable app shows 7 columns (24-35, 36-49, 50-99, 100-199, 200-499, 500-999, 1000+). The break ranges also differ. This must be updated to match the screenshot exactly -- Trevor will be validating pricing calculations against this grid. Change the `DEFAULT_QUANTITY_BREAKS` array in `PricingGrid.tsx` to:
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

### 2. CRITICAL: Resolve Project Status Pipeline Discrepancy
Trevor's Lovable app (screenshot `22.03.42.png`) shows 7 stages: Opportunity > Qualifying > Curating > In Design > Presenting > Client Review > Ordered. But in R1 extraction, Trevor said to merge "Presenting" and "Client Review" into a single stage. His Lovable app still has both. The projects page (`projects/page.tsx`) has `KANBAN_STATUSES` that does NOT include "presenting" -- it has "client-review" directly after "in-design". **Ask Trevor which is correct on the next call.** For now, keep the 7-stage stepper in the slide panel since it matches his gold standard app.

### 3. HIGH: Build Creative Request Detail View
Screenshot `22.04.32.png` shows a full creative request detail page with: breadcrumbs (Client > Project > Request), Branding Deck type badge, Completed status badge, Status dropdown, Assigned To, Due Date, Time Tracking (0h 0m), Attachments section with notes, Version History with "Request Edits" and "Upload & Complete" actions, and Edit Requests section. The current `ProjectDetailPanel` only shows a list of creative requests -- there is no detail view. This needs to be built as a nested panel.

### 4. HIGH: Add "Product Type: Hybrid" Support
Trevor revealed that apparel products can be BOTH contract AND all-in depending on the vendor arrangement. The current `ProductType = 'contract' | 'all-in'` type does not support this. Two options:
- (a) Add `'hybrid'` as a third product type with a toggle in the project line item to switch pricing mode
- (b) Keep product types as-is but allow overriding the pricing model at the line-item level (more flexible)
Recommend option (b) -- add `pricing_override: 'contract' | 'all-in' | null` to `ProjectLineItem`.

### 5. HIGH: Simplify Production Time Dropdown
Trevor's Lovable app shows only 2 options: "Standard" and "Rush". The built version has 5 options. Simplify to match.

### 6. MEDIUM: Add ASI Price Code Support for All-In Products
Trevor explained the industry price code system (C = 40%, G = 20%, etc.). This needs to be a field on all-in products so the system can automatically compute margin from the code. Add `price_code: string` to the Product type for all-in products.

### 7. MEDIUM: Website Order Attribution System
Aaron requires clear attribution that website orders are from NEW clients, not existing ones. The "Are you an existing client?" dropdown on the Project Details form (screenshot `22.02.40.png`) serves this purpose. Ensure this field is prominently tracked and appears in revenue reporting.

### 8. LOW: Add Chat/Message Icon to Client Company Name
Screenshot `22.03.00.png` shows a red chat bubble icon next to the company name in the Client Details page. This suggests an in-app messaging or notification feature. Low priority but noted.

### 9. STRATEGIC: Prepare for Trevor's Self-Service UX Iteration
Trevor wants to use X-ray mode to make UI tweaks himself. This means:
- Code must be well-structured and readable
- Components must be small, self-contained, and well-named
- Tailwind classes should use semantic color names, not arbitrary hex
- Demo data should be clearly separated from component logic
- The feedback loop (X-ray > voice note > export > agent processing) must be frictionless

### 10. STRATEGIC: Dual Revenue Stream Architecture
The app now has two revenue streams:
- **Stream A:** Website e-commerce orders (40% margin, prepaid, new clients, trackable for Aaron)
- **Stream B:** SaaS subscriptions (future, for Threadbird/Culture Studio/Boundless co-brands)
The database schema and reporting must support both from the start. Do NOT conflate website order revenue with SaaS subscription revenue.

---

## New Copy Bank Entries

| Term | Definition | Trevor's Words |
|------|-----------|----------------|
| **ASI Price Codes** | Industry-standard codes that determine margin on promotional products. Each code = a margin percentage. | "The very first number tells me which rows the code applies to. A C is 40%. An AI model knows all about this. I've already asked ChatGPT." |
| **Co-Brand** | A company under the Boundless Network umbrella that uses Boundless infrastructure but operates semi-independently. | "You're going to hear me say co-brands, all these co-brands." |
| **Apparel vs Promo** | Apparel = garments (contract products, 99% of the time). Promo = promotional items like mugs, bags, keychains (all-in products). | "If I mention apparel, it's over here. If I mention promo, it's over here." |
| **Threadbird** | $20M/yr competitor; CEO Nick is a friend of Trevor's; benchmark for public catalog UX. | "Nick specifically said, Trevor, if you build an application, I'll buy it." |

---

## Key People (New or Updated from Call 4)

| Name | Role | Notes |
|------|------|-------|
| **CJ** | CEO, HIT Promotional Products | Connected Trevor with Raj for API access. HIT makes NFL hats. |
| **Raj** | CTO, HIT Promotional Products | Will provide API access for product catalog integration. |
| **Kevin** | CFO, Boundless Network | Wants monthly revenue reporting. Top money person at Boundless. |
| **Nick** | CEO, Threadbird | $20M/yr business. Was in Trevor's wedding. Said he'd buy BrandOps. |
| **Rich & Carlo** | Culture Studio (decorator, Chicago) | Saw BrandOps demo at lunch, said "shut the f up. That is bad, dude." |
| **Mike** | Trevor's Nashville friend/connector | Refers business, wants to be on the referral program. |

---

## Timeline & Logistics

- **Feb 25-28:** Trevor moving from Nashville to Arkansas. Limited availability.
- **Friday Feb 28:** Driving out of Nashville. Unavailable.
- **Sat-Sun Mar 1-2:** Setting up new house. Has Starlink for internet.
- **Target:** 3 weeks from now (mid-March) for "working prototype" -- Trevor's words: "I bet three weeks from now, we're just like, holy ."
- **Cold email infrastructure:** 3-week warm-up period needed. Jeremy to start setting up 50-60 inboxes.
- **Email reactivation:** 7,000+ verified contacts from 8 years of business (exported from HubSpot, FreshBooks, QuickBooks, Front).
