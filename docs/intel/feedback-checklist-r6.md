# Feedback Checklist — Round 6
> Pre-audited against codebase on 2026-03-09. Source: Brandops.io (1).md (Trevor voice feedback)
> Status: DONE / PARTIAL / MISSING / DEFERRED

## Scorecard
| Status | Count |
|--------|-------|
| DONE | 68 |
| PARTIAL | 21 |
| MISSING | 22 |
| DEFERRED | 1 |
| N/A | 1 |
| TOTAL | 113 |

---

## CLIENTS (12 items)

| ID | Type | Pri | Item | Status | Notes |
|----|------|-----|------|--------|-------|
| FB-001 | FEATURE | P1 | Client detail opens as full page | DONE | Route at /clients/[id], 1506 lines |
| FB-002 | FEATURE | P1 | Contact types (order, finance, shipping, billing) | DONE | Color-coded badges, ContactType union type |
| FB-003 | FEATURE | P1 | Address book with groups/folders | DONE | Folder sidebar, create/rename |
| FB-004 | UI_CHANGE | P1 | Address fields Line 2/3 | PARTIAL | Only 1 street field, no Line 2/3 in Address interface |
| FB-005 | FEATURE | P1 | International shipping support | DONE | Toggle switches state to free-text + country |
| FB-006 | FEATURE | P1 | CSV import for address groups | DONE | Parse + preview modal + confirm |
| FB-007 | FEATURE | P1 | Tax exempt with doc upload | DONE | Full UI, drag/drop (mock upload) |
| FB-008 | FEATURE | P1 | Projects + orders from client detail | DONE | Two tabs, live counts |
| FB-009 | FEATURE | P1 | CRM tab (notes + attachments) | DONE | Fully implemented |
| FB-010 | FEATURE | P1 | Client art/file library from detail | DONE | Folder sidebar + file grid (mock upload) |
| FB-011 | UI_CHANGE | P2 | Client list sorting by confirmed spend | PARTIAL | Missing confirmed-order spend sort |
| FB-012 | FEATURE | P1 | Priority-based client display (VIP/standard/at-risk) | MISSING | No priority field on Client type |

---

## PROJECTS (31 items)

| ID | Type | Pri | Item | Status | Notes |
|----|------|-----|------|--------|-------|
| FB-013 | FEATURE | P1 | Inline client creation on new project | DONE | Full form with contact type |
| FB-014 | UI_CHANGE | P0 | "Enhanced date" → "Project Deadline" everywhere | PARTIAL | Table column header still says "Enhanced" on projects/page.tsx:351 |
| FB-015 | UI_CHANGE | P1 | Contact TYPE field when adding contact to project | MISSING | Hardcoded to 'other' in ProjectDetailPanel:475 |
| FB-016 | UI_CHANGE | P1 | Comments + Notes (client-facing/internal tabs) | DONE | No @mention autocomplete |
| FB-017 | UI_CHANGE | P1 | Comments/Notes above client details | MISSING | Currently below in layout |
| FB-018 | FEATURE | P1 | Product Files tab | DONE | First/default tab |
| FB-019 | FEATURE | P1 | Files linked to products/decoration locations | PARTIAL | Product link works, decoration link not shown |
| FB-020 | FEATURE | P1 | Client Submitted: admin mark ok/problem | DONE | Toggle with color badges |
| FB-021 | FEATURE | P3 | Prepay Stripe "Approve and Pay" | PARTIAL | UI shell exists, disabled/mocked |
| FB-022 | UI_CHANGE | P2 | Track Orders hidden when no orders | N/A | Button doesn't exist |
| FB-023 | UI_CHANGE | P1 | Project header: contact + billing + shipping | PARTIAL | Only number/name/deadline shown |
| FB-024 | UI_CHANGE | P1 | "Quote Details" → "Products" | DONE | |
| FB-025 | FEATURE | P1 | Client sees product, color, deco, charges | DONE | |
| FB-026 | FEATURE | P1 | Client can enter quantities on portal | MISSING | Read-only display only |
| FB-027 | FEATURE | P1 | Client can save notes per product on portal | MISSING | Zero notes functionality |
| FB-028 | FEATURE | P1 | Client upload artwork + relate to products | DONE | Drag-drop + product linking |
| FB-029 | FEATURE | P1 | Product presentation mode | DONE | |
| FB-030 | FEATURE | P2 | Client can add decoration location on portal | PARTIAL | Not on portal side |
| FB-031 | FEATURE | P1 | Per-product approve/decline by client | DONE | ThumbsUp/ThumbsDown + Re-add |
| FB-032 | UI_CHANGE | P1 | "Request Changes" tag on backend | DONE | Amber badge on kanban + table |
| FB-033 | UI_CHANGE | P1 | File status logic fix | DONE | Old status removed |
| FB-034 | UI_CHANGE | P1 | No quantities → hide graph, total = zero | PARTIAL | Graph shows empty bars, total correct |
| FB-035 | FEATURE | P1 | Public-facing notes as intro for client | MISSING | No admin intro section |
| FB-036 | UI_CHANGE | P1 | Remove Quick Reorder | DONE | CC-8 comment |
| FB-037 | FEATURE | P1 | Est. shipping cost project level | DONE | |
| FB-038 | FEATURE | P1 | Est. shipping cost per product | DONE | |
| FB-039 | FEATURE | P1 | Two portal phases: Submit vs Approve | DONE | approval_phase drives logic |
| FB-040 | UI_CHANGE | P1 | Ship date in project-level Timeline | PARTIAL | Only per-product, not project-level panel |
| FB-041 | FEATURE | P1 | Ship date per-product override | DONE | |
| FB-042 | FEATURE | P1 | Project Deadline per-product override | DONE | |
| FB-043 | FEATURE | P1 | Lead Source editable | DONE | Dropdown in header |

---

## SPLIT SHIPMENTS (8 items)

| ID | Type | Pri | Item | Status | Notes |
|----|------|-----|------|--------|-------|
| FB-044 | FEATURE | P1 | Split shipment builder | DONE | 800-line component |
| FB-045 | FEATURE | P1 | Create destination from scratch | DONE | |
| FB-046 | FEATURE | P1 | Lookup client address book | DONE | Grouped by folder |
| FB-047 | FEATURE | P1 | Save new address to client address book | MISSING | No onSaveAddress callback |
| FB-048 | FEATURE | P1 | Visual breakdown | DONE | Two-panel layout |
| FB-049 | FEATURE | P2 | Download PNG | PARTIAL | Toast only, no actual export |
| FB-050 | FEATURE | P1 | Client-facing builder | DONE | 3-step wizard |
| FB-051 | FEATURE | P1 | Quantity mismatch warning | DONE | 3-layer system |

---

## FILES ON PROJECT (6 items)

| ID | Type | Pri | Item | Status | Notes |
|----|------|-----|------|--------|-------|
| FB-052 | FEATURE | P1 | Project files dump section | DONE | |
| FB-053 | FEATURE | P1 | Decks with version notes | DONE | |
| FB-054 | FEATURE | P1 | Client Art linked to client artwork library | MISSING | Separate systems, no cross-link |
| FB-055 | FEATURE | P1 | Client Submitted shows product/decoration in admin | PARTIAL | Portal captures, admin doesn't show |
| FB-056 | FEATURE | P1 | Miscellaneous section | DONE | |
| FB-057 | UI_CHANGE | P1 | Admin sees decoration location per file | MISSING | Not rendered in UI |

---

## ORDERS (12 items)

| ID | Type | Pri | Item | Status | Notes |
|----|------|-----|------|--------|-------|
| FB-058 | FEATURE | P1 | Full 3/4 slide panel | DONE | 75vw |
| FB-059 | FEATURE | P1 | Order shows sale, profit, ship, art, image | DONE | Primary image = placeholder icon |
| FB-060 | FEATURE | P1 | Mark as Entered → In Production | DONE | |
| FB-061 | FEATURE | P1 | Email with sales order PDF | DONE | Mock |
| FB-062 | FEATURE | P1 | Sales order PDF upload | DONE | |
| FB-063 | FEATURE | P1 | Partially Shipped status | DONE | |
| FB-064 | FEATURE | P1 | Shipment creation | DONE | AI cosmetic |
| FB-065 | FEATURE | P1 | Send to Client email | DONE | Mock |
| FB-066 | FEATURE | P1 | Delivered → Ready for Invoicing | DONE | |
| FB-067 | FEATURE | P1 | Invoice PDF + Send Invoice | DONE | |
| FB-068 | FEATURE | P1 | Client portal shows invoice | DONE | |
| FB-069 | FEATURE | P3 | AI email inbox for Salesforce scraping | DEFERRED | Complex integration, needs real backend |

---

## CREATIVE REQUESTS (13 items)

| ID | Type | Pri | Item | Status | Notes |
|----|------|-----|------|--------|-------|
| FB-070 | FEATURE | P1 | Types: branding deck, tier A/B, tech pack | DONE | |
| FB-071 | FEATURE | P1 | User can create custom type | DONE | |
| FB-072 | UI_CHANGE | P1 | Initial draft date + overall due date | PARTIAL | Only due date field |
| FB-073 | FEATURE | P1 | Upload with note per attachment | DONE | |
| FB-074 | UI_CHANGE | P1 | Version history URL field | PARTIAL | Notes yes, URL per version missing |
| FB-075 | FEATURE | P1 | Edit request flow | DONE | |
| FB-076 | FEATURE | P1 | Files section (Provided/Print/Misc) | DONE | 4 sections |
| FB-077 | FEATURE | P1 | AI assistant for description | DONE | Mock |
| FB-078 | FEATURE | P1 | Public URL per creative request | MISSING | Only all-requests URL |
| FB-079 | FEATURE | P1 | Kanban view | DONE | |
| FB-080 | FEATURE | P1 | Create from main tab + link | DONE | |
| FB-081 | FEATURE | P1 | Public URL for all creative requests | DONE | |
| FB-082 | FEATURE | P2 | Create project inline from creative request | MISSING | |

---

## PRODUCTS (10 items)

| ID | Type | Pri | Item | Status | Notes |
|----|------|-----|------|--------|-------|
| FB-083 | UI_CHANGE | P2 | Sizes with blank costs single view | PARTIAL | Split across 2 tabs |
| FB-084 | FEATURE | P1 | Color variants with drag-drop | DONE | |
| FB-085 | UI_CHANGE | P2 | Auto color swatch from image | PARTIAL | Name-to-hex only |
| FB-086 | UI_CHANGE | P1 | Remove Decorations tab from product form | MISSING | Tab still present |
| FB-087 | UI_CHANGE | P1 | All-in: hide Blank Costs tab | PARTIAL | Simplified but still shown |
| FB-088 | FEATURE | P1 | Multi-supplier pricing | DONE | |
| FB-089 | FEATURE | P1 | Price code system A-R | DONE | |
| FB-090 | FEATURE | P1 | Calculate raw cost from sale + code | DONE | |
| FB-091 | FEATURE | P1 | Quick creation/entry toggle | DONE | |
| FB-092 | UI_CHANGE | P2 | Contract: matrix selector in product form | PARTIAL | No matrix link |

---

## DECORATIONS (3 items)

| ID | Type | Pri | Item | Status | Notes |
|----|------|-----|------|--------|-------|
| FB-093 | UI_CHANGE | P1 | Remove KPI metrics | DONE | |
| FB-094 | FEATURE | P1 | Vendor drill-down | DONE | |
| FB-095 | FEATURE | P1 | Create/edit within vendor | DONE | |

---

## VENDORS (5 items)

| ID | Type | Pri | Item | Status | Notes |
|----|------|-----|------|--------|-------|
| FB-096 | FEATURE | P1 | Editable vendor fields | DONE | |
| FB-097 | FEATURE | P1 | Multi-contact management | DONE | |
| FB-098 | UI_CHANGE | P1 | Remove performance scorecard | MISSING | Still present |
| FB-099 | FEATURE | P1 | Related tickets | DONE | |
| FB-100 | FEATURE | P1 | Related projects | DONE | |

---

## TICKETS (7 items)

| ID | Type | Pri | Item | Status | Notes |
|----|------|-----|------|--------|-------|
| FB-101 | FEATURE | P1 | Full ticketing system | DONE | |
| FB-102 | FEATURE | P1 | Link to projects and orders | DONE | |
| FB-103 | FEATURE | P1 | Create ticket FROM project/order detail | MISSING | Only from Tickets page |
| FB-104 | FEATURE | P1 | Ticket fields | DONE | |
| FB-105 | FEATURE | P1 | Public ticket URL | DONE | Routing mismatch to fix |
| FB-106 | FEATURE | P1 | Vendor comments on public ticket | DONE | |
| FB-107 | FEATURE | P1 | Tickets section on project + order detail | MISSING | |

---

## SETTINGS (1 item)

| ID | Type | Pri | Item | Status | Notes |
|----|------|-----|------|--------|-------|
| FB-108 | UI_CHANGE | P2 | Remove /settings/matrices route | PARTIAL | Tabs clean but route still exists |

---

## CATALOG (5 items)

| ID | Type | Pri | Item | Status | Notes |
|----|------|-----|------|--------|-------|
| FB-109 | UI_CHANGE | P1 | Primary images + color options | MISSING | Placeholder icons only |
| FB-110 | FEATURE | P1 | Toggle decoration methods | DONE | |
| FB-111 | FEATURE | P1 | Submit from catalog → creates project | MISSING | Just navigation link |
| FB-112 | FEATURE | P1 | Catalog ordering flow | MISSING | No ordering flow |
| FB-113 | UI_CHANGE | P1 | Lead Source "Website" on submission | MISSING | |
