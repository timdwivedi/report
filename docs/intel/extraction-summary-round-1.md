# Extraction Summary -- Round 1
> **Source:** Call 3 transcript (177 min, Feb 23 2026)
> **Surgeon:** Phase 1 of Post-Build Squad
> **Participants:** Trevor Sarver (85 Supply / Boundless), Vitaliy S., Jeremy Kreutzer

---

## Executive Summary

This 177-minute call is the deepest technical brain-dump Trevor has done to date. He walked through the BrandOps app live on screen share, comparing it against his existing CommonSkew tool and his own Lovable-built application, identifying gaps and dictating how the industry actually works at the data-model level. The call covers the full lifecycle of a merch order: lead generation, client onboarding, project creation, product quoting (contract vs. all-in), decoration matrices, creative requests, order entry, shipment tracking, floor stock management, customer service ticketing, and invoicing.

The single most important takeaway is that **the decoration matrix and its relationship to vendors/decorators is the core pricing engine** -- every dollar of margin flows through it. Trevor explicitly stated that a miscalculation in any cell of the matrix can cause the company to lose money on a job. The second major takeaway is that **contract products vs. all-in products are fundamentally different data structures** that must be handled differently in the quoting engine, project detail, and order lifecycle. The third is that Trevor sees this not just as his tool but as a **platform for the entire decorated promo products industry** -- he wants AI agents replacing human roles (outside sales rep, inside account manager, order manager, customer service, creative coordinator) and believes companies doing $20M+ would pay $30K-$50K/month for this.

Trevor also confirmed the immediate priority: get the front end looking production-ready based on this call's feedback, then do a Salesforce deep-dive on a subsequent call so they can wire up order entry into Boundless' existing Salesforce instance. Aaron (Boundless CEO) does not need to see Salesforce integration to be sold -- he needs to see a polished, working front end with correct industry terminology and flows.

---

## New Entities Required

| Entity | Description | Key Fields | Priority |
|--------|-------------|------------|----------|
| **Vendors** | Blank suppliers + decorators (separate from clients) | `id`, `name`, `type` (supplier / decorator / both), `contact_info`, `notes`, `org_id` | P0 |
| **Vendor Decorator Matrices** | Pricing matrices linked to a specific vendor/decorator | `id`, `vendor_id`, `decoration_type`, `name`, `price_breaks` (JSON), `fixed_charges`, `run_charges`, `org_id` | P0 |
| **Creative Requests** | Design/art requests linked to a project | `id`, `project_id`, `title`, `type` (branding_deck / re-vector / mockup / full_design), `description`, `assigned_to`, `status` (requested / in_progress / client_review / complete), `due_date`, `supporting_files[]`, `versions[]`, `org_id` | P1 |
| **Tickets** | Customer service / issue tracking | `id`, `order_id`, `client_id`, `type` (reprint / refund / credit), `fault` (us / vendor), `spoilage_count`, `spoilage_percent`, `status` (open / investigating / resolved), `resolution`, `vendor_ticket_id`, `credit_amount`, `org_id` | P1 |
| **Address Book** | Client address collections with folder grouping | `id`, `client_id`, `org_id` | P0 |
| **Address Book Folders** | Named groups within an address book (e.g., "2026 World Tour") | `id`, `address_book_id`, `name`, `org_id` | P0 |
| **Address Book Entries** | Individual addresses within a folder | `id`, `folder_id`, `label`, `address_line_1`, `address_line_2`, `city`, `state`, `zip`, `country`, `contact_name`, `phone` | P0 |
| **Floor Stock** | Warehouse inventory records per order | `id`, `order_id`, `client_id`, `warehouse_location`, `pallet_number`, `carton_number`, `contents` (JSON: size/qty breakdown), `status` (stocked / pulled / shipped), `org_id` | P3 |
| **Pull Requests** | Client requests to pull floor stock cartons | `id`, `floor_stock_id`, `client_id`, `destination_address`, `status`, `ship_date`, `tracking`, `org_id` | P3 |
| **Client Budgets** | Annual/periodic spend budgets per client | `id`, `client_id`, `budget_amount`, `spent_amount`, `period`, `year`, `org_id` | P2 |
| **Purchase Orders** | POs sent to vendors/decorators per order | `id`, `order_id`, `vendor_id`, `items` (JSON), `total`, `status`, `sent_date`, `org_id` | P1 |
| **Shipments** | Tracking records per order (multiple per order for split ships) | `id`, `order_id`, `carrier`, `tracking_number`, `ship_date`, `estimated_delivery`, `transit_speed`, `destination_address`, `status`, `org_id` | P1 |

---

## Entity Modifications (Existing)

| Entity | Change | Reason | Priority |
|--------|--------|--------|----------|
| **Clients** | Rename conceptually: client = company. Add `payment_terms` (net_30 / prepay / etc.), `purchasing_status`, `last_quoted_date`, `last_ordered_date`, `status` (active / inactive) | Trevor: "A client is the word client is a flippant terminology. What it really means is company." CRM needs purchase activity tracking. | P0 |
| **Clients** | Add `primary_shipping_address`, `primary_billing_address` at company level | "When you create a company, you should have a primary shipping and a primary bill to address" | P0 |
| **Client Contacts** | Add `contact_type` (billing / finance / shipping / primary / all) | "Select which kind of contact type they are" | P0 |
| **Projects** | Add `project_deadline`, `in_hands_date` (enhanced date), `primary_billing_address`, `primary_shipping_address`, `payment_terms`, `project_contact_id` | "A project deadline is the day that the project needs to be completed... enhanced date is the date the product is needed" | P0 |
| **Project Line Items** | Add `in_hands_date` (per-product enhanced date), `production_time` (preset: 5-7 days, 7-10 days, etc.), `vendor_id` (blank supplier), `decorator_vendor_id` | "The products associated to a project may have separate enhanced dates" | P0 |
| **Project Line Items** | Add `product_type` (contract / all_in) | "There are contract products and there are all-in products" -- fundamentally different pricing | P0 |
| **Products** | Add `product_type` (contract / all_in), restructure to support both pricing models | Contract = blank + decoration + margin. All-in = single vendor, single cost. | P0 |
| **Products** | Add `available_decorations[]`, `thumbnail_image`, `description` | Seen in Trevor's existing app -- products need image and decoration method links | P1 |
| **Decoration Locations** | Now a standalone entity linked to line items, not just a field. Each location has: `position` (front / back / sleeve / left_chest / neckline), `decoration_method`, `color_count` or `stitch_count`, `decorator_matrix_id`, `setup_cost`, `run_charges` | "A decoration is not a decoration. It is a separate standalone object that is added to an item." | P0 |
| **Orders** | Add `ship_date`, `vendor_id`, `decorator_vendor_id`, `purchase_order_id`, `invoice_status` (pending / ready_to_invoice / invoiced / paid), `freight_cost` | Order lifecycle requires PO, shipping, and invoicing fields | P1 |
| **Project Statuses** | Merge "Presenting" and "Client Review" into single "Client Review" status | Trevor: "Presenting and client review do not currently make sense to me... we could just put it in client review" | P0 |
| **Sidebar Navigation** | Reorder: Dashboard > Clients > Projects > Orders > Commissions > Analytics > Settings. Programs = "Coming Soon" for now. Add "Tickets" | Trevor dictated exact sidebar order | P0 |

---

## Feature Requirements (by Priority)

### P0 -- Must Have for V1 (blocks Aaron demo + first real use)

1. **Contract vs. All-In Product Types**
   - Contract product: blank cost + decoration costs (per location) + margin = sale price
   - All-in product: single vendor, single cost + margin = sale price
   - Product creation form must ask for type first, then show appropriate fields
   - Filter products list by type (contract / all_in)

2. **Decoration Locations as Standalone Objects**
   - When adding a line item to a project, user adds decoration locations individually
   - Each location: position, decoration method, color count (screen print) or stitch count (embroidery), linked decorator matrix
   - Location lookup from decorator matrix to auto-populate price breaks
   - Visual thumbnail per location on the line item

3. **Vendor/Decorator Entity + Per-Vendor Matrices**
   - Users can have their own default decorator matrices AND associate vendor-specific matrices
   - Each vendor has their own screen print, embroidery, DTG, heat transfer pricing
   - Vendor selector when adding decoration to a line item (e.g., "Culture Studio" for screen printing)
   - Decorator matrices editable: rows = qty ranges, columns = print colors (screen print) or stitch count ranges (embroidery)

4. **Fixed Charges and Run Charges on Decoration**
   - Fixed charges: flat fee per location (e.g., setup fee = $20/color/location), can have qty breaks
   - Run charges: per-unit cost that varies by quantity (e.g., puff ink = $1.00 at 24 units, $0.75 at 36)
   - Examples: printed tags, specialty inks, metallic inks, glow in the dark
   - Auto-calculation of setup fees based on color count (e.g., 3-color print x $20 = $60 setup)

5. **Client = Company + Contacts + Address Book**
   - Company record: name, primary shipping address, primary billing address, payment terms, status, purchasing status
   - Contacts sub-table: first name, last name, email, title, phone, contact type
   - Address book with named folders (for tours, multi-location clients)
   - CSV import for address folders (band tour dates example)
   - Client list sortable by last activity, last order date

6. **Project Detail Enhancements**
   - Add: project deadline, in-hands date (enhanced date), primary billing, primary shipping, payment terms, project contact
   - Per-product enhanced dates and production time selectors
   - Creative requests section on project detail (see P1)
   - Files section with categorized folders: Project Files, Client Art, Production Files, Decks, Client Submitted, Miscellaneous

7. **Project Status Consolidation**
   - Merge "Presenting" and "Client Review" into single "Client Review" stage
   - Final statuses: Opportunity > Qualifying > Curating > InDesign > Client Review > Confirmed > Cancelled
   - Status can go backwards (e.g., Client Review back to Curating if designs need revision)

8. **Sidebar Navigation Reorder**
   - Dashboard > Clients > Projects > Orders > Commissions > Analytics > Settings
   - Programs sidebar item shows "Coming Soon" placeholder
   - Add Tickets to sidebar (for customer service)

### P1 -- Core Experience

9. **Production Files Linked to Decoration Locations**
   - When uploading a production file, user must select which decoration location it belongs to
   - "Which location? Front, sleeve, back?" prompt on file upload
   - File carries through from project to order

10. **Creative Requests Module**
    - Accessible from project detail and as a standalone sidebar/section
    - Types: branding deck, re-vector, mockup, full design, technical art
    - Fields: title, type, description, assigned to, due date, status
    - Attachment upload per request with versioning
    - Statuses: Requested > In Progress > Client Review > Complete
    - For V1: creative requests sent to Boundless creative team (not AI-generated yet)

11. **Order Lifecycle + Purchase Orders**
    - When project is confirmed, each product becomes an individual order
    - Each order generates a purchase order to the vendor/decorator
    - PO includes: decoration costs per location, blank cost, total, mockup attachment
    - Order statuses: Order Entry > Entered > In Production > Shipped > Ready for Invoicing > Invoiced
    - Ship date tracking with 2-day-before check-in automation concept

12. **Client Portal Split Shipment Wizard**
    - Step 1: Enter all destination addresses
    - Step 2: Associate products/quantities to each address
    - Step 3: Review summary
    - Step 4: Submit (returns to project view with split shipment info visible)

13. **Customer Service Ticketing**
    - Ticket types: Reprint, Refund, Credit
    - Fault assignment: Our fault vs. Vendor fault
    - Spoilage tracking: if <= 3% spoilage, auto-refund; if > 3%, initiate reprint request to vendor
    - Vendor ticket creation for chargebacks
    - Reprint creates new order in order lifecycle
    - Add "Tickets" to sidebar navigation

14. **Invoicing Flow**
    - When order marked as shipped, status changes to "Ready to Invoice"
    - Invoice review + approval workflow (Trevor reviews before sending to client)
    - Option: "Approve and send to customer" or "Approve but I'll send manually"

15. **Automated Vendor Communication Concept**
    - 2 days before ship date: automated check-in email to vendor contact
    - Vendor receives email with button: "On Schedule" / "Off Schedule" + notes
    - Response updates order status accordingly

### P2 -- Differentiators

16. **Public Product Catalog with Real-Time Quoting**
    - Rip UX from CommonSkew's product catalog
    - Customer selects product > decoration type > location count > quantity > sees real-time price
    - Full price break grid visible below the calculator
    - "Start a Project" flow from catalog
    - Product admin can toggle "Show on website: yes/no"

17. **Size Breakdown Calculator Tool**
    - Input: target quantity
    - Apply standard size ratio (bell curve: S through 4XL)
    - Output: quantity per size
    - Downloadable visual / copy to clipboard
    - Accessible as standalone tool AND from within project

18. **Client Budget Tracking**
    - Clients can have annual/periodic budgets
    - Track spend against budget
    - Show remaining budget on client detail
    - "Corporate companies who have budgets they must spend before the end of the year for tax purposes"

19. **Reorder Portal for Existing Clients**
    - Pre-built product portal per client (like CommonSkew "shops")
    - Client sees their approved products with price breaks
    - Client enters quantities, adds to cart, submits reorder
    - Order flows into project/order pipeline automatically
    - Trevor example: Disciple (rock band) just placed $7K reorder this way

20. **Defined vs. Undefined Project Templates**
    - Defined: client knows exactly what they want (product, qty, color, logo, date)
    - Undefined: client has assets/interest but needs guidance (concierge/wizard flow)
    - Template-based project creation for each type

### P3 -- Future Vision

21. **Floor Stock / Warehouse Management**
    - Track inventory in warehouse down to row, pallet, carton level
    - Carton contents: size/qty breakdown
    - Client portal shows floor stock, allows pull requests by carton (no breaking cartons)
    - Pull request = mini order (new shipment in lifecycle)
    - Premium add-on feature: "Do you have floor stock? Pay extra for this"

22. **AI Agent Roles (Full Autonomous Operation)**
    - Outside Sales Rep: LinkedIn scraping, outbound messaging, lead generation
    - Inside Account Manager (modeled after Kristen): vendor knowledge, product knowledge, decoration knowledge, project management, deadline tracking
    - Order Manager: PO generation, vendor communication, ship date tracking, shipment creation
    - Customer Service Agent: ticket triage (reprint/refund/credit), fault diagnosis, spoilage calculation, vendor chargeback
    - Creative Coordinator: AI-assisted design direction, design brief generation from client assets
    - CFO Agent: financial tracking, commission calculations, profit analysis
    - Graphic Designer Agent: generate merch design decks (18-24 months away per Trevor, but Gemini 3.1 may accelerate)
    - CTO/Dev Bot: handle integrations for enterprise clients switching platforms

23. **Salesforce Integration (V1 Priority for Boundless)**
    - Order entry from BrandOps into Boundless Salesforce
    - Control/disable Salesforce email notifications (redirect to BrandOps)
    - Shipment tracking sync
    - Invoice approval flow
    - Key people: Matthew (order manager at Boundless), Tyler (accounting), Kristen (account rep)
    - Trevor will provide Loom videos + screenshots + voice notes in organized Google Doc

24. **CMS / Website Builder**
    - Basic website template for merch companies
    - Products from admin catalog auto-populate website
    - CMS tool for image/copy overrides
    - "A software for other merch companies... they could design their own website"

25. **Third-Party Integrations**
    - S&S Activewear API (blank product catalog + pricing)
    - UPS shipping (billed to company account)
    - ShipHero / ShipStation (3PL shipment software)
    - Front App (email management -- Trevor uses this)
    - Trello replacement (project management -- currently using Trello alongside CommonSkew)

26. **Tiered SaaS Pricing Model**
    - Tier by gross revenue: $0-$250K/mo, $250K+, etc.
    - Add-ons: extra users, calculator tools, floor stock management, custom API integrations
    - Lifetime deals for first 100 users (scarcity launch)
    - Enterprise pricing: $30K-$50K/month for companies replacing $80K-$100K/year employees

---

## Business Rules Extracted

| Rule | Context | Implementation Note |
|------|---------|---------------------|
| Contract product pricing = blank cost + decoration costs (per location) + margin | Core pricing formula for apparel | `unit_cost = blank_cost(qty) + SUM(decoration_cost_per_location) + SUM(run_charges) + SUM(fixed_charges)`; `unit_price = unit_cost / (1 - margin%)` |
| All-in product pricing = vendor cost + margin | Single-vendor products (mugs, lighters, etc.) | Different calculation path than contract products |
| Screen print pricing is based on print colors | Determines which column in the decorator matrix | Matrix: rows = qty ranges, columns = color count |
| Embroidery pricing is based on stitch count | Determines which column in the embroidery matrix | Common ranges: 3K-4K (left chest), 8K-10K (full front) |
| Small through XL blank cost is usually the same; 2XL+ is higher | Industry standard pricing tiers for blanks | Blank cost tiers: S-XL, 2XL, 3XL-4XL |
| Blank cost field must be editable (overridable) | "Sometimes that can change. You might need to override it." | Allow manual override even when auto-populated from product catalog |
| Free setups for orders of 50+ shirts | Trevor's company-specific rule | Configurable per-org: setup fee waiver threshold |
| Spoilage <= 3%: auto-refund customer | Industry standard for acceptable loss | Business rule in ticket system |
| Spoilage > 3%: initiate vendor reprint request | Vendor is liable for excess spoilage | Creates new order in lifecycle for the reprinted units |
| No breaking cartons in floor stock | Warehouse management rule | Pull requests must be by full carton |
| Each product on a project becomes a separate order when confirmed | Project-to-order conversion | One project with 5 line items = 5 individual orders |
| Enhanced date = in-hands date (industry term) | Date product must be delivered to client | Critical for production timeline calculations |
| Project deadline = internal date to meet all enhanced dates | Factors in production time + shipping transit | `project_deadline = earliest(enhanced_date - production_time - shipping_transit)` per product |
| Production time check: can we meet the enhanced date? | Bot must verify turnaround feasibility | If not feasible, trigger vendor communication to confirm capacity |
| Price breaks may differ between vendor matrices | Different decorators have different qty breaks | Must interpolate/align price breaks when calculating across different vendor matrices |
| Some decorators won't do high-color-count prints at low quantities | Matrix cells can be zero/empty for certain qty/color combos | Zero in matrix cell = not available at that qty/color combo, suggest DTG instead |
| Follow-up 1 week after delivery | Customer satisfaction check | Star rating, customer service rating, issue reporting |
| Invoice requires Trevor's approval before sending to client | Approval gate in invoicing flow | Options: approve + send, or approve + send manually |
| Salesforce email notifications must be disabled when using BrandOps | Prevent duplicate/conflicting client emails | Turn off Boundless portal emails, control notifications from BrandOps |

---

## UX Preferences & Decisions

| Decision | What Trevor Said | Impact |
|----------|-----------------|--------|
| Sidebar order | "Dashboard, Clients, Projects, Orders... Programs coming soon. Commissions is very important. Then Analytics and Settings." | Reorder sidebar navigation |
| Client = Company terminology | "A client is the word client is a flippant terminology. What it really means is company." | Consider labeling as "Companies" or keep "Clients" but treat as company internally |
| Decorator matrices belong in Settings | "In the current app we have, it's in settings." Confirmed Settings is the right place. | Keep matrices under Settings, not as standalone sidebar item |
| Merge Presenting + Client Review | "Presenting and client review do not currently make sense to me... we could just put it in client review" | Remove "Presenting" stage from project pipeline |
| Manual matrix entry is acceptable | "Don't get hung up on the fact that you have to add your rows... That's totally normal in the industry." | No need for AI-powered matrix import in V1, but an AI wizard would be a "cool experience" |
| File organization on projects | Project Files (dump all), Decks, Client Art, Client Submitted, Production Files (linked to decoration locations), Miscellaneous | Implement file categorization on project detail |
| Products should have "Show on website" toggle | "The product module would kind of double as, like, is shown on the website, yes, no" | Products have a `visible_on_catalog` boolean |
| Copy the CommonSkew product catalog UX | "We're going to rip these guys off here" | Real-time quoting with decoration/qty selectors on product detail |
| CommonSkew's UX is bad in areas | "Their UX is terrible. They should be able to click and see the whole grid." | Show full price break grid, not just single-qty lookup |
| Front end first, database second | "The number one thing is I want to get the front end good... then it's a lot easier to wire up the rest" | Prioritize visual polish and correct UX flows over database connectivity |
| Voice notes + screenshots for async feedback | Trevor will send organized Google Doc with screenshots + voice notes per feature area | Async feedback loop, not just calls |
| Refer back to Trevor's Lovable app for structure | "I would highly recommend... revert back to my original app" | Use Trevor's existing app as the UX reference, not just CommonSkew |

---

## AI Agent Roles Identified

| Agent | Role | Key Capabilities |
|-------|------|-------------------|
| **Outside Sales Rep** | Lead generation + prospecting | LinkedIn scraping, outbound email/DM, lead qualification, pipeline feeding |
| **Inside Account Manager** | Day-to-day client management | Vendor knowledge, product expertise, decoration knowledge, project management, deadline monitoring, quote creation, client communication |
| **Order Manager** | Post-confirmation order processing | PO generation, vendor communication, ship date tracking (2-day pre-check), shipment creation, tracking procurement |
| **Customer Service Agent** | Issue resolution | Ticket triage (reprint/refund/credit), fault diagnosis (us vs vendor), spoilage calculation, vendor chargeback requests, resolution tracking |
| **Creative Coordinator** | Design request management | Brief generation from client assets, design direction suggestions, file versioning, status tracking with creative team |
| **Client Relations Bot** | Proactive outreach to existing clients | "Is there anything you need? Would you like some free graphic design services?" -- re-engagement and upsell |
| **Senior Project Manager** | Cross-project oversight | "Oversees all of the projects and is saying, hey client, I see your event..." -- deadline monitoring, proactive communication |
| **CFO Agent** | Financial oversight | Commission calculations, profit tracking, budget monitoring, cost analysis |
| **Graphic Designer Agent** | Merch design generation | Full deck creation, mockups, product visualization (Trevor says 18-24 months out, but Gemini 3.1 may accelerate) |
| **Procurement Agent** | Vendor coordination | "Send an email to the vendor to say, if we get you this purchase order... can you meet this enhanced date?" |
| **CTO/Dev Bot** | Enterprise integration management | Ensure seamless API integrations for large clients switching from existing software |

---

## Integration Requirements

| System | Purpose | Priority |
|--------|---------|----------|
| **Salesforce** | Order entry into Boundless' existing system; email trigger control; shipment tracking; invoice approval | P0 (V1 for Boundless) |
| **S&S Activewear** | Blank product catalog + real-time pricing (API integration for blank costs) | P1 |
| **CommonSkew** | Competitive reference (rip UX patterns); Trevor's current tool being replaced | N/A (reference only) |
| **UPS** | Shipping account integration; auto-generate tracking; cost calculation | P2 |
| **ShipHero / ShipStation** | 3PL shipment software integration for enterprise clients | P3 |
| **Front App** | Email management tool Trevor uses; potential integration for email workflows | P3 |
| **Trello** | Currently used for project management CRM; being replaced by BrandOps | N/A (being replaced) |
| **Culture Studio portal** | Trevor's main decorator has their own ordering platform with dropship capability | P3 |

---

## What Already Exists vs. What's Needed

### Already Built (from 05_next_moves.md)
- 18+ dashboard pages with demo data
- Quoting engine with decorator matrix math
- KanbanBoard, DataTable, SplitShipmentBuilder components
- 21 API routes with demo fallback
- Commission calculator with animated counters
- Client portal with shareable link
- Public product catalog
- Settings hub with 5 tabs including matrix editor
- Full type system (13+ entity types)

### Gaps Identified from Call 3

| Gap | What Exists | What's Needed | Effort |
|-----|------------|---------------|--------|
| Contract vs. All-In product types | Products are generic | Two distinct product types with different pricing paths | High |
| Vendor/Decorator entity | No vendor entity | Full vendor management + per-vendor matrices | High |
| Decoration locations as objects | Decoration is a field on line item | Standalone decoration location objects linked to line items with matrix lookups | High |
| Fixed charges + Run charges | Not implemented | Per-decoration charge types with qty breaks | Medium |
| Client = Company + Address Book | Client entity exists but basic | Add payment terms, address book with folders, contact types, purchasing status | Medium |
| Project enhanced dates + deadline | No date fields beyond basic | Project deadline, per-product enhanced dates, production time selectors | Medium |
| Creative requests module | Does not exist | New entity + UI on project detail | Medium |
| Ticketing system | Does not exist | New entity + sidebar item + business rules | Medium |
| Production files linked to decoration locations | File upload exists but unlinked | File-to-location association on upload | Low |
| Purchase order generation | Does not exist | Auto-generate POs from confirmed orders | Medium |
| Sidebar order wrong | Current order doesn't match Trevor's preference | Reorder sidebar | Low |
| "Presenting" stage exists | 8-column kanban | Merge to 7 columns (remove Presenting) | Low |
| Vendor communication automation | Does not exist | Email templates + response buttons for vendors | Medium |
| Floor stock management | Does not exist | Full warehouse tracking (P3) | Very High |
| Reorder portal | Portal exists but not reorder-specific | Client-specific product shops with reorder flow | High |

---

## Surgeon's Recommendations

1. **Split the quoting engine into two paths immediately.** Contract products and all-in products have fundamentally different data structures and pricing logic. The existing `calculateLineItem()` function assumes a single pricing model. This needs to branch at the product type level before any other decoration work happens.

2. **Build the Vendor entity before touching decorator matrices.** Trevor's key complaint about the current matrix setup is that matrices should be linked to specific vendors/decorators, not just generic org-level matrices. The vendor entity is a prerequisite for the correct matrix architecture.

3. **Treat decoration locations as first-class entities.** The current demo data has decoration as a property of a line item. Trevor was very clear: decoration locations are standalone objects that get attached to products. Each has its own method, color/stitch count, matrix lookup, production file, setup cost, and run charges. This is the single biggest data model change.

4. **Prioritize the Client entity overhaul.** Trevor spent significant time on client structure: company + contacts (with types) + address book (with folders). The address book with CSV import for tour dates is a unique differentiator and a real pain point.

5. **Do NOT build Salesforce integration yet.** Trevor explicitly said he'll provide organized documentation (screenshots + voice notes in Google Doc) for the Salesforce flow. Wait for that before designing the integration. V1 order entry into Salesforce will be the bridge to Aaron's approval.

6. **Merge "Presenting" and "Client Review" project stages now.** This is a quick win that Trevor explicitly requested. Remove one column from the kanban.

7. **Add "Tickets" to the sidebar as a placeholder.** Even if the full ticketing system is P1, having the sidebar item with "Coming Soon" shows Trevor and Aaron that the full lifecycle is planned.

8. **Build the creative requests module on the project detail page.** This is Trevor's daily workflow -- he creates creative requests for the Boundless design team on every project. It's a natural fit as a tab/section on the project detail page.

9. **Schedule the Salesforce deep-dive call.** Trevor said: "Step one, we need to unpack, and I need to show you guys exactly the flow of order entry into Salesforce." He'll do Loom videos + screenshots in organized folders. This is the highest-value async deliverable to request from him.

10. **Keep "Programs" and "Floor Stock" as Coming Soon.** Trevor explicitly said: "For right now, I literally just want it to say Coming Soon" for Programs. Floor stock is a premium add-on feature for later.
