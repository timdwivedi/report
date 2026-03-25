# Extraction Summary — Round 5

> **Source:** Trevor's Voice Note Dump (`trevor-voice-dump-brandops-io.md`) — 1,023 lines, all modules
> **Surgeon:** Two-pass extraction — every explicit correction, business rule, feature request, and UX direction captured
> **Date:** 2026-03-05
> **Build:** BrandOps — `/Users/vit10081/Desktop/bloom-builds/brandops/`

---

## CRITICAL CORRECTIONS (Must Fix — Trevor explicitly said current behavior is WRONG)

These are items Trevor specifically called out as incorrect, confusing, or needing immediate change in the current app:

1. **"Enhanced date" terminology is WRONG** — Trevor: *"The terminology 'enhanced date' is null and should be replaced with 'Project Deadline.' That is the date that the project needs to be completed by us in order to meet the client-in-hands date."* Every occurrence of `enhanced_date` in types, UI labels, and field names must become `project_deadline` / "Project Deadline". (Currently: `enhanced_date` on Project, `enhanced_date` on ProjectLineItem, label "Enhanced Date" in UI)

2. **"Product add-ons" and "location add-ons" terminology is WRONG** — Trevor: *"This is, according to the industry, incorrect. This should be run charges and fixed charges."* The current `LineItemAddOn` with `level: 'product' | 'location'` labeling must be renamed to use "Run Charges" and "Fixed Charges" industry terminology. The dual-level add-on UI labels "Product Add-Ons" / "Location Add-Ons" must change.

3. **Colors on product-on-project are a TEXT FIELD — that is incorrect** — Trevor: *"Right now, the colors are in a text field, and that is incorrect."* When adding a product from catalog, colors should be selectable from the product's `available_colors`. Only on quick-entry should the user type colors and hit Enter to create them.

4. **Client detail view is a small quarter pop-up — WRONG** — Trevor: *"That should be changed to a full experience for full client management."* Currently clients open in a partial sidebar. Must be full-page client detail.

5. **"Add Product" on project shows product name + quantity — WRONG** — Trevor: *"Currently, the user clicks Add Product, and it has a product name and a quantity. That is not the proper user experience."* Must be 3/4 sidebar with catalog lookup OR quick entry toggle.

6. **Notes/voice note area on projects is confusing** — Trevor: *"This is extremely confusing because below there's also internal notes."* Current "Notes" field next to voice note should become a "Comments" section (with @mentions). "Internal Notes" below should become "Notes" with two sub-sections: "Client-Facing Notes" and "Internal Notes". Move the notes section above client details and below comments.

7. **Decorations page KPI metrics are wrong** — Trevor: *"These KPI metrics are not important."* Remove "Decoration types / Price breaks / Setup charges / Run charges" KPI cards. Replace with decorator-vendor-level navigation: user selects a decorator vendor, then sees matrices within that vendor.

8. **Decorations page structure is wrong — needs one more level** — Trevor: *"The database structure needs to go one more level deep. I want to select Culture Studio, and then I want to see all of their decoration matrices within there."* Currently matrices are flat-listed. Must be grouped by vendor (decorator).

9. **Sizes not populating on contract product** — Trevor: *"Small through XL, 2X, 3X, 4X, for example, those are not populating, so we need a remedy."* When a contract product is selected from catalog, sizes and blank costs must auto-populate.

10. **"Quick Reorder" section on client portal is nonsensical** — Trevor: *"We need to remove all of this; it makes no logical sense currently."* Remove completely.

11. **Track Orders button shown when no orders exist** — Trevor: *"If there are no orders related to a project, that 'Track Orders' button should not be available."*

12. **Client-facing "Approve and Confirm Order" button is wrong in certain cases** — When information is still missing (no shipping costs, etc.), button should say "Submit Final Details" not "Approve and Confirm Order." Two-phase approval flow needed.

13. **Product image upload is an image URL field — WRONG** — Trevor: *"Currently, it's an image URL. That is incorrect. It should be an easy way to just drag and drop."*

14. **Vendor/supplier fields are not editable** — Trevor: *"I need to be able to edit these fields."* and *"we cannot edit records right now."*

15. **Client-facing artwork file statuses don't make sense** — Trevor: *"These files show approved, pending review, pending review. That doesn't make logical sense."* Files should be linked to products/decoration locations, not shown with arbitrary statuses.

16. **Lead Source / Project Source field cannot be edited on a project** — Trevor: *"I don't know where I can edit that on a project right now, so it's pointless that it's on the front of the record."*

17. **Settings page has Products and Decorator Matrices sections** — Trevor: *"I want to remove products and decorator matrices because those are handled on the left navigation bar."*

18. **Tickets page says "coming in round 2"** — Trevor: *"That's not correct. I want you to fully build out a ticketing solution."*

19. **Decoration types were removed from Product catalog** — Trevor later corrected himself: *"Earlier I told you to remove the decoration types from a product; that's not necessarily the truth. A decoration type should still remain because a decoration type might be applied to an all-in product."*

---

## MODULE-BY-MODULE REQUIREMENTS

### Clients

**Client Detail View:**
- Open as FULL PAGE (not quarter pop-up) when a client is selected
- Each client has multiple **contacts** with: name, email, phone, **contact type** (order contact, finance contact, etc.)
- Primary billing address + primary shipping address shown prominently
- **Address Book** with **folders/groups** (e.g., "2026 World Tour", "HQ Locations")
  - Standard address fields: Address 1, Address 2, Address 3, City, State (picker of lower 48 US states), Zip
  - International shipping support with international address experience
  - **CSV import** for address groups
  - State field = picker (all 50 states), not free text
- If **tax_exempt** is checked, show an **upload field** for tax-exempt documentation
- Client page shows: all projects related to that client, all orders related to that client (clickable navigation)
- Simple **CRM section**: notes, attachments
- **Client Art library** visible from client page — folders within (starting folders: "Branding" and "Logos")
- Same client art library accessible from Projects (linked, not duplicated)

**Client List View:**
- Sort by: annual sales to date, total spend (from confirmed projects/orders), last activity date
- Show clients by **priority and spend** — most important clients first
- Easy identification of **aging clients** (haven't contacted in a while)
- "Last Updated" field needs refinement to reflect meaningful activity

**Gap vs R4.5:** Client detail exists but is a sidebar, not full-page. Contacts exist but lack contact type. Address book with folders exists in types (`AddressBookFolder`) but likely basic in UI. Tax exempt exists as boolean but no upload field. Client art library concept is new. CRM notes section is new. Priority/spend sorting on list view is new.

---

### Projects

**New Project Creation:**
- User names project, selects client
- **Ability to create a new client inline** from new project flow — enter client name + main contact (name, email, phone, contact type). Billing/shipping can be deferred.
- Project Deadline picker (replaces "Enhanced Date") — *"the date that all of the product needs to be in the client's hands"*
- **Add a Ship Date** field in Timeline & Production section — may apply to all products but overridable per product
- Production Time: Standard / Rush — existing, keep as-is
- Split Shipment: Yes / No — existing, keep as-is

**Project Detail View:**
- **Comments section** (replaces current "Notes" next to voice note) — supports @mentions of team members. Position: below header, above client details.
- **Notes section** (replaces current "Internal Notes") — contains two sub-sections: "Client-Facing Notes" and "Internal Notes". Position: above client details, below comments.
- Contact type field required when adding contacts to project
- **Lead Source / Project Source** must be editable from project detail (currently read-only on record front)
- **Payments section** on project — shows payment status, transaction details when prepay projects are paid
- **Estimated shipping cost** field at project level — admin enters estimated shipping for entire project
- **Tickets section** on project — shows linked tickets (cross-references Tickets module)

**Pipeline Status:**
- Current statuses: Opportunity, Qualifying, Curating, In Design, Client Review, Confirmed, Order Entry, In Production, Shipped, Cancelled
- Note: voice dump lists `Presenting` between `In Design` and `Client Review` but current types have `in-design` then `client-review`. The original overview section lists "Presenting" as a stage. **Clarify if `presenting` stage is needed** or if In Design covers it.
- Add **tag/badge on Client Review** when client has requested changes — visible both on pipeline list and when project is selected

**Files Section Restructure:**
- **Project Files** — starting files, general dumps from client
- **Decks** — creative request decks; prompt for notes/version on upload
- **Client Art** — linked lookup to client's art library (from Clients module). Shows folders (Branding, Logos, etc.)
- **Product Files** — NEW tab: files linked to products on the project or decoration locations on products
- **Client Submitted** — files uploaded by client on public-facing URL. Linked to product or decoration location. Admin can mark as **"OK" or "Problem"**. Project cannot move forward with unresolved "Problem" files.
- **Miscellaneous** — general project files (CSVs, etc.)

**Gap vs R4.5:** ProjectDetailPanel exists with inline address form, notes, voice note. Comments with @mentions is new. Notes restructure is new. Payments section is new. Estimated shipping cost is new. File tabs partially exist (project-files, decks, client-art, client-submitted, production-files, miscellaneous in `ProjectFileCategory` type) but Product Files tab and OK/Problem marking are new. Ship date field does not exist. Presenting status unclear.

---

### Product on Project

**Add Product Flow:**
- Click "Add Product" opens 3/4 sidebar (not small modal)
- **Toggle: "From Catalog" or "Quick Entry"**
  - From Catalog: search/browse products, distinguishes contract vs all-in
  - Quick Entry: same layout but all fields are manual entry — type brand, style, blank costs, sizes, colors (type and Enter to create)
- **Display Name** auto-populates from catalog product name but user can override (e.g., "Skull T-Shirts")
- **Primary Image** — large, prominent, drag-and-drop. Plus multiple sub-images.
- **Pricing Mode** (Contract / All-In) auto-populates from selected product, overridable
- **Delete/remove product** from project — available from product detail and from project overview
- When contract product selected from catalog: **sizes and blank costs auto-populate** (currently broken)

**Color Selection:**
- From Catalog: select from product's `available_colors` (not text field)
- Quick Entry: type color name, hit Enter to create selectable option
- Colors link to size/quantity entry

**Decoration Locations:**
- User adds location → selects position, method, color count
- **Drag-and-drop image per location** — art file specific to that decoration location
- **First decoration location = primary price breaks** for the entire product
- **Secondary locations with different matrices**: system distributes secondary matrix price breaks across primary price breaks mathematically. Admin sees distribution; client sees clean incremental price breaks.
- Tooltip/helper explaining price break distribution
- **Run charges and fixed charges per location** (not "add-ons"):
  - Run charge: per-unit surcharge (e.g., discharge inks), related to a specific location, cost populates from decorations database, sale price calculated from margin
  - Fixed charge: flat fee (e.g., screen setup), related to a specific location, looks up decoration fixed charges
- Below the price grid: ability to add **product-level fixed charges** (e.g., rush fee)

**Quantities:**
- **No financial data calculated unless quantities are received** (business rule)
- `art_received` and `quantities_received` checkboxes — relocate to prominent position so user clearly understands these are required before processing
- Quantities section should show available colors for quantity entry (not just sizes)

**Per-Product Timeline:**
- Project deadline applies to all products by default
- Admin can override deadline per individual product (e.g., t-shirts by the 1st, mugs by the 3rd)
- **Ship date per product** — overridable from project-level ship date

**Notes:**
- Client-facing notes and internal notes per product — existing, keep as-is

**Gap vs R4.5:** Catalog lookup toggle exists conceptually but Add Product is basic. Display name override is new. Primary image drag-drop partially exists (R4 added multi-image per color). Color selection from catalog colors is new (currently text field). Decoration location image upload is new. Price break distribution algorithm is new (complex). Run/fixed charge renaming and per-location attachment is partially there (R4 added dual-level add-ons) but needs terminology change and UX rework. Per-product ship date is new.

---

### Client-Facing Project View (Portal)

**Header:**
- Project name, project number, client name, main contact, project deadline, in-hands date, primary billing address, primary shipping address

**Products Section:**
- Rename "Quote Details" to "Products"
- Show: product image, color, decoration details, fixed charges, run charges
- Show whether sizes have been received
- If quantities NOT entered: client can enter quantities and save
- Client can add notes per product and save
- Client can upload artwork per product and be prompted: *"Does this artwork relate to any other products on this project?"* — if yes, link to those products too

**Two-Phase Approval Flow:**
1. **Phase 1 — "Submit Final Details"**: Client fills in missing info (sizes, artwork, addresses). Sees success: *"Thank you, we've got everything. We're reviewing it. If we need anything else, we'll let you know."* Internal team reviews.
2. **Phase 2 — "Final Approval"**: Internal team sends back project for final approval.
   - **Net Terms**: Button says "Approve". Confirmation: *"Are you sure? Your project will be moved to production, and you will receive an invoice due within 30 days after it is shipped."*
   - **Prepay**: Button says **"Approve and Pay"**. Opens Stripe checkout. Payment recorded on backend with payment details in project's Payments section.

**Client Interaction Features:**
- Client can **approve or decline individual products** — decline removes from project (with confirmation). Can re-add if desired.
- Client can select decoration locations, drag-and-drop artwork, build their own quote
- Client can enter shipping/billing addresses (if missing) — updates propagate to client address book and project
- If no quantities: line total shows $0, no graph shown
- **Change Request flow**: When client requests changes, a tag appears on the project in pipeline view AND in project detail for admin
- **Public-facing notes** section — intro text from admin (e.g., "Hi, I've curated this project for you to review...")
- Remove "Quick Reorder" section completely
- "Track Orders" button hidden when no orders exist
- **Estimated shipping cost** visible on project level
- Per-product estimated shipping cost — populated by admin after quantities received

**Split Shipment Builder (Client-Side):**
- If split shipment = yes and nothing filled out, client can build their own split shipments step-by-step
- Look up client address book, create new addresses (prompted to save to address book)
- Associate quantities of each product to destinations
- See clear breakdown

**Gap vs R4.5:** Portal exists with basic product display, PDF download, Track Orders, artwork upload, approval button. Two-phase flow is new. Per-product interaction (approve/decline individual products, enter quantities, upload artwork with cross-product linking) is new. Change request tagging is new. Stripe integration is deferred (Phase 2+). Public-facing notes is new. Split shipment client builder is new.

---

### Split Shipments

- Its own section within the project (alongside files, creative requests, products)
- If split shipment = yes, admin creates split shipments with:
  - Destinations: create new OR look up client address book OR create + save to address book folder
  - Quantities of each product associated to each destination
  - Clear visual breakdown of all split shipments on the project
  - **Quantity validation**: if total quantities don't match product totals, show remaining/warning
- **Downloadable PNG** visual of split shipment breakdown — for email or public-facing sharing
- **Client-side builder**: If split shipment = yes and nothing configured, client can build their own on the portal (step-by-step UX)
- Extremely high-level logistics mapping — admin AND client experiences

**Gap vs R4.5:** Split shipment is a yes/no toggle on Project. No split shipment management, destination builder, quantity mapping, PNG download, or client builder exists. Entirely new module.

---

### Files

File organization within a project (restructured from current):

| Tab | Description | Upload Behavior |
|-----|-------------|----------------|
| **Project Files** | Starting files, general dump from client | Standard upload |
| **Decks** | Creative request decks | Prompt for notes/version on upload |
| **Client Art** | Linked to client's art library (from Clients module) | Navigate/browse folders, not separate upload |
| **Product Files** | Files linked to products or decoration locations on project | Link to product/location on upload |
| **Client Submitted** | Files uploaded by client on public URL | Linked to product/decoration location. Admin marks "OK" or "Problem" |
| **Miscellaneous** | General project files (CSVs, etc.) | Standard upload |

- **Production Files** (existing category) may map to Product Files or remain separate
- Files must be clearly linked to products or decoration locations
- Admin experience must be simple and clean

**Gap vs R4.5:** File categories exist in type system (`ProjectFileCategory`). Client Submitted exists. Product Files tab and OK/Problem marking are new. Client Art library link is new. Decks version prompt is new.

---

### Orders

**Order = individual product from a project, parsed out with all its details:**
- Product details, decoration locations, art files, costs, sale amounts, shipping costs
- Per-order ship date and in-hands date (may differ from project level)

**Order Detail View:**
- Full 3/4 sidebar (same UX as project detail), NOT small pop-up
- Shows: total sale amount, profit, ship date, in-hands date, art files, primary image, all associated files
- Access to all project files from order view

**Order Lifecycle:**
1. **Order Entry Needed** — admin sees all details, downloads files, manually enters into Salesforce
2. **In Production** — (replaces "Entered Salesforce" — Trevor: *"We can remove 'entered Salesforce' completely"*). User clicks "Mark as Entered" which triggers email to client with sales order PDF. Must upload sales order PDF (from Salesforce) to order record before marking as entered.
3. **Partially Shipped** — NEW status between In Production and Shipped. User adds shipments to order. Half shipped = partially shipped.
4. **Shipped** — fully shipped. Shipments tracked until delivered.
5. **Ready for Invoicing** — once all shipments delivered, moves here
6. **Invoiced** — user uploads invoice PDF, clicks "Send Invoice", client receives email with link to portal to view invoice

**Shipment Management:**
- Admin creates shipments on an order
- Paste tracking number → **AI looks up tracking details** (ship date, estimated arrival, carrier, etc.)
- "Send to Client" button — client receives shipment email
- Track shipments until delivered

**Email/Invoice Flow:**
- When marked as "In Production": email to client with sales order PDF attached and order tracking link
- When shipped: shipment notification email to client
- When invoiced: invoice email with portal link where client can view invoice

**AI Email Inbox (Future/Complex):**
- Dedicated inbox where Boundless team emails: sales orders, shipment details, invoices
- AI scrapes emails and associates with correct order records
- Identifies: sales orders, tracking info, invoices with pay links
- Goal: minimize manual data entry for the human operator

**Gap vs R4.5:** Orders page exists as basic list with small pop-out. No 3/4 sidebar detail. No shipment management. No PDF upload. No email triggers. No "Partially Shipped" status. No AI tracking lookup. No AI email inbox. "Entered (Salesforce)" status exists but Trevor wants it removed — go directly from "Order Entry Needed" to "In Production". Order lifecycle needs significant rework.

---

### Creative Requests

**Creating a Creative Request:**
- Title (user names it)
- Type: select from list OR create custom type. Trevor's types:
  - Branding Deck
  - Tier A Product Deck
  - Tier B Product Deck
  - Tech Pack
  - Re-Vector
  - Single Mock
- Initial draft date + overall due date
- Full description (editable)
- **AI Assistant option** for description — AI asks about the project, user types freely, AI fills out Description
- Upload attachments with **note per attachment**
- Supporting URLs

**Files Section (replacing "Attachments"):**
- Organized with sub-sections/tabs:
  - Provided Files / Reference Files
  - Client-Provided Files
  - Print Files
  - Miscellaneous
- User can create folders/tabs within

**Version History:**
- Graphics team uploads via public-facing URL
- Version = URL (from pitch.com) + optional notes
- Mark as "Ready" / status change

**Edit Requests:**
- User creates edit request with supporting documents/art files
- Re-shares public-facing URL with Creative team
- Creative team downloads new assets, makes edits, uploads new version, marks complete
- Cycle continues until final approval

**Public-Facing URL:**
- Creative team sees: full request, overview, supporting files (downloadable), due date
- They can: upload a version (URL link + notes), mark as complete, download files

**Main Creative Tab (standalone page):**
- All creative requests across all projects
- Click to open full detail (files, edit requests, public URL)
- Edit, mark as approved, change status
- **Kanban view** for status tracking
- Upcoming/due view
- **Public-facing URL for ALL creative requests** — shareable overview for creative team
- Create creative request from main tab: link to existing project OR create quick project

**Gap vs R4.5:** Creative page exists (R4 added standalone `/dashboard/creative`). CreativeRequest model has title, type, files, versions, edit requests. But: AI assistant for description is new. Files restructure into sections (Provided, Client-Provided, Print, Misc) is new. Note per attachment is new. Custom type creation is new. Kanban view is new. Public-facing URL for individual requests exists partially but all-requests overview is new. Create-from-main-tab is new. The creative request types need updating (current: re-vector, mockup, full-deck, color-separation, branding-deck, other).

---

### Products (Catalog)

**Contract Products (apparel, decorated goods):**
- Basics: Product Name, Internal SKU
- **Sizes available** — user adds sizes (critical, currently missing in creation flow)
- **Blank Costs** per size break — existing, keep
- **Variants (Colors)**: drag-and-drop image per color. AI analyzes uploaded image to **auto-populate color swatch**. User enters color name. Repeat for multiple colors.
- Remove "Decorations" section from product creation — *"Decorations can be completely removed because that is controlled on the decoration location level"*... BUT Trevor corrected: decoration TYPE should remain on product (for all-in products especially). Keep `applicable_decorations` on Product.
- Same product from different suppliers = different costs. Must solve: product linked to supplier with supplier-specific pricing.

**All-In Products (drinkware, promotional items):**
- Basics: Product Name, variants (sizes may be physical sizes like 2oz, 9oz)
- NO blank costs (all-in pricing)
- **Price breaks**: columns = quantity breaks, rows = per-unit charge
- **Setup cost per color** (cost + sale price) — controlled within product catalog, populates on project
- **Price Code system** (ASI/PPAI industry standard):
  - Each column (price break) can have a different price code
  - Price code = discount percentage: C = 40%, G = 20%, etc.
  - User enters sale price + selects price code per column
  - System calculates raw cost from price code discount
  - Critical for margin calculation when product is added to project

**Color Variant Image Upload:**
- Drag-and-drop (not URL field)
- AI color swatch detection from uploaded image
- Quick variant entry

**AI Product Scraper:**
- Exists from R4 — keep and refine

**Gap vs R4.5:** Products page exists with contract/all-in toggle. Product creation exists. R4 added multi-image per color, decoration locations tab, AI scraper. Missing: size entry in creation flow, AI color swatch detection, price code system for all-in products, supplier-specific pricing for same product, all-in price break matrix with per-column price codes. Price code system is entirely new and complex.

---

### Decorations

**Structure Rework:**
- Landing page: list of **decorator vendors** (not flat matrix list)
- Click vendor → see all matrices for that vendor
- Current KPI cards (decoration types, price breaks, setup charges, run charges) — REMOVE

**Matrix Management:**
- Create/edit matrices within a vendor
- Matrix = decoration method + pricing tiers (quantity breaks x color counts)
- This is the lookup source when admin adds decoration location to a contract product on a project

**Pricing Logic:**
- Contract product on project → looks up decorator matrix for the selected method
- All-in product → does NOT use decorator matrix (has its own price breaks)
- Primary location price breaks = the price breaks shown to client
- Secondary location price breaks distributed mathematically across primary

**Gap vs R4.5:** Decorations page exists with flat matrix list. KPI cards exist. Matrix editing exists. Missing: vendor-level grouping (one level deeper), KPI card removal. The matrix-to-project pricing link exists in `calculateLineItem()`.

---

### Vendors

**Supplier Management:**
- Editable fields (currently read-only)
- Add contacts: first name, last name, email, phone, title
- Notes field
- Remove performance scorecard for now
- Show related projects (active or completed)

**Decorator Management:**
- Editable fields
- Add contacts: first name, last name, email, phone, title, notes
- **Performance section**: show related tickets (from Tickets module) instead of scorecard
- Average lead time — keep
- On-time rate, reprint rate — remove for V1 (can't calculate yet)
- Show related projects

**Gap vs R4.5:** Vendors page exists with basic display. Vendor scorecard exists in types. Missing: field editing, contact management (multiple contacts per vendor), related projects section, ticket linkage for decorators. Scorecard to be removed/simplified.

---

### Tickets

**Full Ticketing System:**
- Create ticket from Tickets module OR from within a project/order
- Link to project AND/OR order
- Fields: ticket name, priority, fault (vendor / our fault), requested action, resolution status
- Status lifecycle: open → in-progress → resolved → closed
- Additional professional ticketing fields as needed

**Cross-References:**
- Tickets visible on project detail (Tickets section)
- Tickets visible on order detail
- Tickets visible on vendor (decorator) detail

**Public-Facing Ticket View:**
- Shareable URL for vendors (when vendor is at fault)
- Vendor sees: ticket details, supporting files (downloadable)
- Vendor can: add comments/responses, specify next action (reprint, refund, etc.), submit response
- Admin manages tickets fully on admin side

**Gap vs R4.5:** Tickets page exists but shows "Full ticketing coming in round 2" placeholder. Types exist: `Ticket` with type, fault, reason, quantity, cost, status, resolution. Missing: full CRUD, project/order linking UI, vendor-facing public URL, comment/response system, cross-reference sections on project/order/vendor.

---

### Product Catalog (Public)

**Customer-Facing Experience:**
- See products with primary images and all color options
- Toggle between decoration methods (screen print, embroidery, etc.)
- For contract products: select locations, choose print colors, upload artwork per location
- For all-in products (coffee mugs, etc.): still need decoration type shown (not removed from product)
- Best merch ordering experience: *"marry e-commerce with working with a true agency"*
- Categories and filtering from admin product setup
- All product details mapped 1:1 between admin and public catalog — no fake/empty fields

**Ordering Flow from Catalog:**
- Customer adds product to project
- Names project
- Enters: shipping address, billing address (is billing same as shipping? yes/no), company name, email, primary contact info, additional notes
- Existing client: auto-match
- Submission → success message → appears in Projects tab as "Opportunity" with Lead Source = "Website"

**Embedding:**
- Catalog will be embedded on primary website (brandops.io or similar)
- Welcome message, instructions, CTA

**Gap vs R4.5:** Public catalog exists (basic). Missing: decoration method toggle, per-location artwork upload, full ordering flow with project creation, address entry, existing client matching, proper embedding experience. Current catalog is "vanilla and bare bones."

---

### Settings

- Remove "Products" section (handled in left nav Products page)
- Remove "Decorator Matrices" section (handled in left nav Decorations page)
- Everything else is fine

**Gap vs R4.5:** Settings page exists with products and matrices sections. Simple removal needed.

---

## BUSINESS RULES (Exact formulas, validation rules, edge cases)

### Pricing Logic

1. **No financial data calculated unless quantities are received on a product.** Zero quantities = $0 line total, no graph displayed.

2. **First decoration location = primary price breaks.** All subsequent locations with different matrices have their price breaks distributed/interpolated across the primary breaks. Client always sees clean incremental breaks.

3. **Price break distribution algorithm:** If primary (screen print) breaks are [24, 36, 50, 100] and secondary (embroidery) breaks are [12, 24, 48, 72, 144], the system must interpolate embroidery costs at the primary break points (24, 36, 50, 100) so the client sees one unified set of quantity breaks. Admin can see the distribution was applied (tooltip or indicator).

4. **Price Code system for all-in products:** Price code letter = discount percentage. C = 40% discount (sale price x 0.60 = cost). G = 20% discount (sale price x 0.80 = cost). Each column in the price break grid can have a different price code. System calculates raw cost = sale_price * (1 - price_code_discount_percent).

5. **Run charges** = per-unit surcharges (e.g., discharge inks, puff ink, printed tags). Attached to a decoration location. Cost populates from decorations database. Sale price = cost + margin.

6. **Fixed charges** = flat fees (e.g., screen setup, flash charge). Attached to a decoration location OR product level. Looks up decoration fixed charges database.

7. **Product-level fixed charges** (below price grid) = charges not tied to a location, e.g., rush fee.

8. **Same product, different suppliers = different costs.** The product catalog must support this. When adding to project, user must know which supplier's pricing they're using.

### Validation Rules

9. **Project cannot be approved without billing AND shipping address.** If client on portal doesn't have these, they must enter them (and data propagates to client address book).

10. **Project cannot move forward with "Problem" files.** Admin marks client-submitted files as OK or Problem. All must be OK to proceed.

11. **Art received + quantities received = two gates.** Both must be checked for a product to be "Ready." (This exists from R4 — keep.)

12. **Order cannot go from "Order Entry Needed" to "In Production" without sales order PDF uploaded.**

13. **Split shipment quantities must match product total quantities.** If mismatch, show remaining/warning to admin.

14. **Prepay projects require credit card capture before final approval.** Portal shows "Approve and Pay" button. Stripe checkout required.

### Payment Terms Logic

15. **Net Terms (net15/30/45/60):** Approve → invoice generated → payment due N days after shipment.
16. **Prepay:** Approve and Pay → Stripe checkout → payment recorded on project → production proceeds.
17. **Project-level payment marker** — "This has been paid" indicator with payment details section.

### Email Triggers

18. **Order entered (In Production):** Email to main order contact with sales order PDF + tracking link
19. **Order shipped:** Shipment notification email with tracking details
20. **Invoice ready:** Email with portal link to view invoice

---

## TERMINOLOGY CORRECTIONS

| Current Term | Correct Term | Notes |
|---|---|---|
| Enhanced Date | **Project Deadline** | *"The terminology 'enhanced date' is null"* — globally replace |
| Product Add-Ons | **Run Charges** | Per-unit surcharges on product or location level |
| Location Add-Ons | **Fixed Charges** (and Run Charges) | Both can exist on location level |
| Notes (next to voice note) | **Comments** | With @mention support |
| Internal Notes | **Notes** (with sub-sections) | Client-Facing Notes + Internal Notes |
| Quote Details (portal) | **Products** | Simple rename |
| Approve and Confirm Order (portal) | **Submit Final Details** (phase 1) / **Approve** or **Approve and Pay** (phase 2) | Two-phase flow |
| Entered (Salesforce) | Remove status | Go directly to "In Production" |
| Decoration types / Price breaks KPIs | Remove | Not useful on Decorations landing |
| Attachments (creative requests) | **Files** | With sections: Provided, Client-Provided, Print, Misc |
| Lead Source field label | **Lead Source** | Trevor confirmed this name; needs to be editable |

---

## GAP ANALYSIS vs CURRENT BUILD

### Already Exists (Keep / Refine)
- Dashboard with pipeline value, metrics
- Client list with contacts, addresses
- Project pipeline lifecycle (Opportunity → ... → Shipped)
- Product detail panel with decorations, pricing grid, margin ticker
- Contract vs all-in product types
- Decoration matrices with quantity x color pricing
- Creative requests with title, type, versions, edit requests, public URL
- Creative standalone page
- Product compare modal
- Decoration recommender
- Project templates
- PO generation
- Command palette
- AI product scraper
- Client portal with project view, artwork upload, approval
- Address book types (folders, entries)

### Partially Exists (Needs Significant Rework)
- **Client detail view** — exists as sidebar, needs full-page
- **Add Product to project** — exists but is basic modal, needs 3/4 sidebar with catalog toggle
- **Color selection on product-on-project** — exists as text field, needs selectable colors from catalog
- **Decorations page** — exists flat, needs vendor-level grouping
- **Order detail view** — exists as small pop-out, needs full 3/4 sidebar
- **Order lifecycle** — statuses exist but need "Partially Shipped" added, "Entered Salesforce" removed
- **Files on project** — categories exist in types, need Product Files tab, OK/Problem marking, Client Art link
- **Creative request types** — exist but need updating to Trevor's list
- **Vendor management** — exists but fields are read-only, no contacts
- **Notes/Comments on project** — exists but UX is confusing, needs restructure
- **Product catalog (public)** — exists but "vanilla and bare bones"

### Completely New (Must Build)
- **Split Shipment builder** (admin + client-side, quantity mapping, PNG download)
- **Price break distribution algorithm** (multi-matrix interpolation)
- **Price Code system** for all-in products (ASI/PPAI codes, cost calculation)
- **AI color swatch detection** from uploaded images
- **Two-phase approval flow** on portal (Submit Details → Final Approval)
- **Payments section** on project (Stripe integration future, but section needed)
- **Estimated shipping cost** fields (project-level + per-product)
- **Ticket system** (full CRUD, linking, public-facing vendor view)
- **AI email inbox** for orders (future — Boundless email scraping)
- **AI tracking lookup** from pasted tracking numbers
- **Client CRM** (notes, attachments on client page)
- **Client art library** with folders (Branding, Logos)
- **Tax exempt document upload**
- **CSV address import** for address groups
- **Comment system with @mentions** on projects
- **Per-product ship date and deadline overrides**
- **Inline client creation from new project flow**
- **AI description assistant** for creative requests
- **Creative Kanban view**
- **All-requests public-facing URL** for creative team
- **Catalog ordering flow** (add to project, enter details, submit as Opportunity)

---

## PRIORITIZED CHANGES (P0 → P3)

### P0 — CRITICAL (Demo Showstoppers / Corrections)

These are things Trevor explicitly called wrong. Fix before any demo.

| # | Change | Module | Effort |
|---|--------|--------|--------|
| 1 | Rename "Enhanced Date" → "Project Deadline" everywhere (types, UI, labels, demo data) | Global | S |
| 2 | Rename "Product Add-Ons" / "Location Add-Ons" → "Run Charges" / "Fixed Charges" | Product Detail, Types | S |
| 3 | Fix color selection on product-on-project: selectable from catalog colors, not text field | Product on Project | M |
| 4 | Client detail → full-page view (not quarter pop-up) | Clients | M |
| 5 | Add Product → 3/4 sidebar with "From Catalog" / "Quick Entry" toggle | Projects | L |
| 6 | Fix sizes/blank costs auto-populating when contract product selected from catalog | Product on Project | M |
| 7 | Restructure Notes → Comments (with @mentions) + Notes (client-facing / internal sub-sections) on project | Projects | M |
| 8 | Remove "Quick Reorder" from portal | Portal | S |
| 9 | Hide "Track Orders" when no orders exist | Portal | S |
| 10 | Decorations page: group matrices by decorator vendor (one level deeper) | Decorations | M |
| 11 | Remove KPI cards from Decorations landing page | Decorations | S |
| 12 | Product image upload = drag-and-drop (not URL field) | Products | M |
| 13 | Make vendor/supplier fields editable | Vendors | M |
| 14 | Remove "coming in round 2" from Tickets — build full ticketing | Tickets | L |
| 15 | Remove Products and Decorator Matrices from Settings page | Settings | S |
| 16 | Make Lead Source / Project Source editable on project detail | Projects | S |
| 17 | Portal: rename "Quote Details" → "Products" | Portal | S |
| 18 | Rename "Entered (Salesforce)" → just go to "In Production" in order lifecycle | Orders | S |
| 19 | Keep decoration types on product (Trevor corrected earlier removal statement) | Products | S |

### P1 — HIGH VALUE (Core Feature Gaps)

Major features that are missing or need significant rework.

| # | Change | Module | Effort |
|---|--------|--------|--------|
| 1 | Two-phase approval flow on portal (Submit Details → Final Approval) | Portal | L |
| 2 | Run charges / fixed charges on location level + product-level fixed charges | Product on Project | L |
| 3 | Price break distribution algorithm (multi-matrix interpolation) | Quoting Engine | XL |
| 4 | Order detail → full 3/4 sidebar with all details, files, shipments | Orders | L |
| 5 | Order lifecycle rework: add Partially Shipped, shipment management, PDF upload, mark-as-entered | Orders | XL |
| 6 | Split Shipment builder (admin-side: destinations, quantity mapping, validation) | Projects | XL |
| 7 | File section restructure: Product Files tab, Client Art link, OK/Problem marking | Projects | L |
| 8 | Full ticketing system: CRUD, project/order linking, status lifecycle | Tickets | L |
| 9 | Client contacts with contact type (order contact, finance contact, etc.) | Clients, Projects | M |
| 10 | Address book with folders, state picker, CSV import | Clients | L |
| 11 | Client art library with folders (Branding, Logos) accessible from project | Clients, Projects | M |
| 12 | Vendor contact management (multiple contacts with title) | Vendors | M |
| 13 | Creative request type update + custom type creation | Creative | M |
| 14 | Per-product deadline and ship date overrides | Product on Project | M |
| 15 | Estimated shipping cost (project-level + per-product) | Projects, Portal | M |
| 16 | Inline client creation from new project flow | Projects | M |
| 17 | Client list: sort by spend, priority, last activity. Aging client identification | Clients | M |
| 18 | Decoration location image upload (drag-and-drop art per location) | Product on Project | M |
| 19 | All-in product price break matrix with per-column price codes | Products | XL |
| 20 | Change request tag on Client Review projects (pipeline + detail) | Projects, Portal | M |

### P2 — IMPORTANT (UX Improvements, Logic Refinements)

| # | Change | Module | Effort |
|---|--------|--------|--------|
| 1 | Display name override on product-on-project (auto-populate from catalog, editable) | Product on Project | S |
| 2 | Quantities received → show available colors for quantity entry | Product on Project | M |
| 3 | Relocate art_received / quantities_received to prominent position | Product on Project | S |
| 4 | Client-submitted file linking to product/decoration location | Portal, Projects | M |
| 5 | Creative requests: AI assistant for description | Creative | M |
| 6 | Creative requests: files section restructure (Provided, Client-Provided, Print, Misc) | Creative | M |
| 7 | Creative Kanban view | Creative | M |
| 8 | Creative: note per attachment on upload | Creative | S |
| 9 | Vendor: show related projects section | Vendors | M |
| 10 | Vendor (decorator): show related tickets instead of scorecard | Vendors | M |
| 11 | Public-facing ticket view for vendor fault cases | Tickets | L |
| 12 | Client CRM section (notes, attachments) on client page | Clients | M |
| 13 | Tax exempt document upload on client | Clients | S |
| 14 | International address support | Clients | M |
| 15 | Split shipment PNG download | Projects | M |
| 16 | Split shipment client-side builder | Portal | XL |
| 17 | Portal: client can approve/decline individual products | Portal | L |
| 18 | Portal: artwork upload with cross-product linking prompt | Portal | M |
| 19 | Project-level payments section (paid marker + details) | Projects | M |
| 20 | Product from different suppliers with supplier-specific pricing | Products | L |
| 21 | AI color swatch detection from uploaded images | Products | M |
| 22 | Creative: public-facing URL for all requests (team overview) | Creative | M |
| 23 | Create creative request from main tab + link to project | Creative | M |
| 24 | Decks upload: prompt for version notes | Projects (Files) | S |
| 25 | Same product different supplier costs in catalog | Products | L |

### P3 — FUTURE (Complex Integrations, Phase 2+)

| # | Change | Module | Effort |
|---|--------|--------|--------|
| 1 | Stripe payment integration (prepay checkout) | Payments | XL |
| 2 | AI email inbox (Boundless → order record association) | Orders | XXL |
| 3 | AI tracking lookup from pasted tracking number | Orders | L |
| 4 | Order lifecycle email automation (entered, shipped, invoice) | Orders | L |
| 5 | Salesforce bridge / sync | Orders | XXL |
| 6 | PromoStandards API integration (live supplier data) | Products | XL |
| 7 | Public catalog: full ordering flow (add to project, submit as Opportunity) | Catalog | XL |
| 8 | Public catalog: embed on external website | Catalog | M |
| 9 | Public catalog: decoration method toggle + per-location artwork | Catalog | L |
| 10 | Invoice portal view with payment link | Portal | L |
| 11 | Real database / Supabase schema migration | Infrastructure | XXL |
| 12 | Real auth / multi-tenancy | Infrastructure | XL |
| 13 | Commission tracking automation | Commissions | L |
| 14 | Programs module refinement | Programs | M |

---

## ARCHITECT NOTES

**Key complexity areas that need careful design:**

1. **Price Break Distribution Algorithm** — This is the single most complex piece of business logic. When a product has multiple decoration locations with different matrices (e.g., screen print at [24,36,50,100] and embroidery at [12,24,48,72,144]), the system must interpolate the secondary matrix costs at the primary break points. This requires mathematical interpolation, not simple lookup. Recommend: linear interpolation between the two nearest quantity breaks in the secondary matrix.

2. **Price Code System** — The ASI/PPAI price code system needs research. Common codes: A=50%, B=47.5%, C=45%, D=42.5%, E=40%, F=37.5%, G=35%, H=32.5%, L=30%, M=25%, N=20%, P=15%, R=10%. Each column in an all-in product's price grid can be on a different code. Raw cost = list price * (1 - discount%). This is foundational for margin calculation on promotional products.

3. **Split Shipments** — This is essentially a logistics allocation matrix: N products x M destinations with quantity allocation per cell. Needs validation (sum of allocations per product = total product quantity). Both admin and client UX. PNG export.

4. **Two-Phase Portal Flow** — The portal needs state management: Phase 1 (collecting info) vs Phase 2 (final approval). Different buttons, different messages, different validation rules. Payment terms dictate Phase 2 behavior (Approve vs Approve and Pay).

5. **Order Lifecycle** — Heavy rework. The current simple list becomes a full management interface with shipment tracking, PDF management, email triggers, and eventually AI email inbox integration. The "Entered Salesforce" status is removed — simplifies to: Order Entry Needed → In Production → Partially Shipped → Shipped → Ready for Invoicing → Invoiced.
