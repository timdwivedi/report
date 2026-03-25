# Master Plan — Round 4

> **Source:** extraction-summary-round-4.md (Surgeon PB-1)
> **Build:** BrandOps — 85 Supply / Boundless
> **Round:** 4 (Scaffold → R1 → R2 Elite → R3 Quality → **R4 Product Experience**)

---

## Round Theme: "The Product Experience"

Trevor wants to go ham on the product workflow. This round transforms BrandOps from a demo shell into a product management powerhouse — the products page, the project→catalog linkage, dual-level add-ons, and the AI product scraper that replaces PromoStandards.

---

## Phase A — Foundation (Mechanic)

### Step A1. Type System Updates (`web/lib/types/app.ts`)

**Modify `LineItemAddOn`:**
```typescript
export interface LineItemAddOn {
  id: string;                        // NEW
  name: string;
  cost_per_unit: number;
  sale_price_per_unit: number;       // NEW
  level: 'product' | 'location';     // NEW
  decoration_id?: string;            // NEW — only for location-level
}
```

**Add `quantities_received` to `ProjectLineItem`:**
```typescript
quantities_received: boolean;        // NEW — after art_received
```

**Add `images` to `ProductColor`:**
```typescript
export interface ProductColor {
  name: string;
  hex: string;
  swatch_url?: string;
  images?: { url: string; is_primary: boolean }[];  // NEW
}
```

**Add `ProductDecorationLocation` interface + field on Product:**
```typescript
export interface ProductDecorationLocation {
  id: string;
  location_name: string;
  placeholder_run_charge?: number;
  placeholder_setup_charge?: number;
}
```
Add to Product: `decoration_locations?: ProductDecorationLocation[];`

**Add `ScrapedProductData` interface:**
```typescript
export interface ScrapedProductData {
  source_url: string;
  product_name: string;
  description: string;
  original_description: string;
  images: string[];
  colors: { name: string; hex?: string; swatch_url?: string }[];
  sizes: string[];
  specs: Record<string, string>;
  supplier_name: string;
  supplier_sku: string;
  msrp?: number;
}
```

**Add `AddOnLevel` union type:**
```typescript
export type AddOnLevel = 'product' | 'location';
```

### Step A2. Constants Updates (`web/lib/constants/app.ts`)

Add decoration location presets:
```typescript
export const DECORATION_LOCATION_PRESETS = [
  'Front Chest', 'Full Front', 'Full Back', 'Left Chest',
  'Right Chest', 'Left Sleeve', 'Right Sleeve', 'Collar',
  'Neckline', 'Pocket', 'Other'
] as const;
```

### Step A3. Demo Data Updates (`web/lib/demo/demo-data-provider.ts`)

- Update existing add-ons to include `id`, `sale_price_per_unit`, `level: 'product'`
- Add 1-2 location-level add-on examples (puff ink, metallic ink)
- Add `quantities_received: false` to existing line items
- Add `decoration_locations` to 2-3 existing products
- Add `images` array to 2-3 ProductColor entries
- Add a `getScrapedProductDemo()` function returning mock ScrapedProductData

### Step A4. Quoting Engine Updates (`web/lib/utils/quoting.ts`)

- Update `calculateLineItem()` to handle dual-level add-ons:
  - Product add-ons: `SUM(addon.cost_per_unit)` where `level === 'product'`
  - Location add-ons: `SUM(addon.cost_per_unit)` where `level === 'location'`
  - Both contribute to the per-unit cost in the pricing grid

### Step A5. API Route — Product Scraper (`web/app/api/products/scrape/route.ts`)

New API route: `POST /api/products/scrape`
- Input: `{ url: string }`
- Output: `ScrapedProductData`
- **Demo mode (default):** Return mock `ScrapedProductData` based on the URL domain:
  - ssactivewear.com → mock Bella Canvas 3001 Unisex Tee
  - sanmar.com → mock Nike Dri-FIT Polo
  - hitpromo.net → mock promotional sunglasses
  - Other → generic mock product
- **Live mode (future):** When `ANTHROPIC_API_KEY` is set, fetch URL, parse with cheerio, extract with Claude Haiku

---

## Phase B — UI: AI Product Assistant (Tailor)

### Step B1. Product Scrape Review Form (`web/components/products/ProductScrapeReview.tsx`)

New component. Pre-filled form showing scraped data for user review before publishing:
- Product name (editable text input)
- AI description (editable textarea) + toggle to see original description
- Images grid (click to select primary, click to exclude)
- Colors list with hex swatches (checkboxes to include/exclude)
- Sizes (checkboxes to include/exclude)
- Specs table (read-only)
- Supplier info (name, SKU — read-only)
- **User pricing section:** Blank cost tiers OR vendor cost (depending on product type selection)
- Category dropdown, active toggle
- "Publish to Catalog" button → creates Product + closes

### Step B2. Products Page — AI Entry Mode (`web/app/dashboard/products/page.tsx`)

Modify "Add Product" flow to offer three modes:
- **Quick Entry** (current behavior — opens ProductEditModal with empty form)
- **AI Entry** — Opens a URL input dialog → calls scrape API → opens ProductScrapeReview form
- Mode selector: simple tab/pill toggle at the top of the add product flow

### Step B3. Project ProductDetailPanel — "AI Entry" Mode (`web/components/projects/ProductDetailPanel.tsx`)

Add "AI Entry" as a third option alongside "From Catalog" and manual entry:
- URL input → scrape → pre-fill ProductDetailPanel fields
- Auto-creates the Product in the catalog AND populates the line item

---

## Phase C — UI: Products & Add-Ons Enhancements (Tailor)

### Step C1. ProductEditModal — Multi-Image Per Color (`web/components/products/ProductEditModal.tsx`)

Enhance the Variants tab:
- Each color entry: name, hex picker, images array
- Add Image URL button (adds to the images array for that color)
- Mark one image as primary (radio/checkbox)
- Display image thumbnails inline

### Step C2. ProductEditModal — Decoration Locations Tab Enhancement

Enhance the Decorations tab:
- Add named decoration locations (dropdown from `DECORATION_LOCATION_PRESETS` or custom text)
- Each location: name, placeholder run charge ($), placeholder setup charge ($)
- Add/remove locations inline
- These template locations pre-populate when the product is added to a project

### Step C3. ProductDetailPanel — Dual-Level Add-Ons (`web/components/projects/ProductDetailPanel.tsx`)

Restructure the existing "Per-Unit Add-Ons" section into two sub-sections:
- **Product Add-Ons:** Name | Cost | Sale Price | Delete (level = 'product')
- **Location Add-Ons:** Location (dropdown from decorations) | Name | Cost | Sale Price | Delete (level = 'location')
- "Add Product Add-On" and "Add Location Add-On" buttons
- Wire both into the pricing grid display

### Step C4. ProductDetailPanel — Quantities Received Checkbox

Add `quantities_received` checkbox next to the existing `art_received` checkbox.
- When both are checked, display a "Ready" badge
- When either is unchecked, display a "Draft" badge

---

## Phase D — UI: Creative Standalone Page (Tailor)

### Step D1. Creative Requests Page (`web/app/dashboard/creative/page.tsx`)

New page — standalone listing of ALL creative requests across ALL projects:
- Search input (by title)
- Status filter dropdown
- Type filter dropdown
- Each row: Title | Type badge | Client > Project breadcrumb | Assigned to | Due date | Status badge
- Click row → opens `CreativeRequestDetailPanel` (already built in R3)
- Row data comes from `getDemoCreativeRequests()` in demo data provider

### Step D2. Sidebar Navigation Update

Add "Creative" link to the sidebar if not already present. Should appear between "Projects" and "Orders" in the nav.

---

## Phase E — UI: Shipping Address Inline Add (Tailor)

### Step E1. Inline Address Form in ProjectDetailPanel

In the Shipping card of ProjectDetailPanel:
- Add a "New Address" button next to the address dropdown
- Clicking it reveals an inline form: Label, Street, City, State, Zip
- "Save" adds to the client's address book and selects it for this project
- "Cancel" hides the form

---

## NOT In This Round

- Real database / Supabase schema
- Real auth / multi-tenancy
- Salesforce integration
- Stripe payment processing
- Order lifecycle email automation
- Matt's email parsing (AI inbox)
- PromoStandards API
- Front-facing catalog enhancement (P2)
- Decorations page nested setup charge refinement (P2)

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `web/lib/types/app.ts` | LineItemAddOn restructure, quantities_received, ProductColor images, ProductDecorationLocation, ScrapedProductData, AddOnLevel |
| `web/lib/constants/app.ts` | DECORATION_LOCATION_PRESETS |
| `web/lib/demo/demo-data-provider.ts` | Updated add-ons, quantities_received, decoration_locations on products, color images, scraped product demo |
| `web/lib/utils/quoting.ts` | Dual-level add-on pricing |
| `web/app/api/products/scrape/route.ts` | **NEW** — Product scraper API |
| `web/components/products/ProductScrapeReview.tsx` | **NEW** — Scrape review form |
| `web/components/products/ProductEditModal.tsx` | Multi-image per color, decoration locations tab |
| `web/app/dashboard/products/page.tsx` | AI Entry mode selector |
| `web/components/projects/ProductDetailPanel.tsx` | Dual add-ons, quantities_received, AI entry option |
| `web/app/dashboard/creative/page.tsx` | **NEW** — Creative standalone page |
| `web/components/projects/ProjectDetailPanel.tsx` | Inline address form in shipping card |

**Estimated: 3 new files, 8 modified files, ~1200-1500 lines added.**

---

## Build Sequence

```
Mechanic: A1 → A2 → A3 → A4 → A5 (types, constants, demo, quoting, API)
  ↓ tsc gate
Tailor:   B1 → B2 → B3 (AI scraper UI)
          C1 → C2 → C3 → C4 (Products + add-ons)
          D1 → D2 (Creative page)
          E1 (Shipping address)
  ↓
Plumber:  Data flow audit
  ↓
Inspector: Deep verification
  ↓
Provocateur: Elite ideas
```
