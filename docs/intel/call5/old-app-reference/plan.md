

# Client-Facing View Enhancements and Admin Product Status Overhaul

## 1. Show Decoration Location Thumbnails on Public View

Currently the public `PublicProductCard` only shows a text summary of decoration locations. This change adds a visual "Decoration Locations" section that displays each location with its thumbnail image, location name, decoration name, and details (colors/stitches).

### File: `src/pages/client/PublicClientProjectPage.tsx` (PublicProductCard)
- After the product header and before the pricing grid, add a "Decoration Details" section
- For each entry in `locations` that has a `decoration_id`:
  - Show a small thumbnail (40x40) from `loc.thumbnail_url` (fallback to a generic icon)
  - Show the location name, decoration name, and color/stitch detail
- Styled as a compact list with rounded thumbnails

---

## 2. Transpose Price Breaks Grid (Quantities on Top, Prices Left-to-Right)

Currently the pricing grid is vertical: rows = quantity ranges, columns = "Price Per Unit". Change it to a horizontal layout where:
- **Header row**: quantity range labels across the top (e.g., "24-47", "48-99", "100+")
- **Data row**: corresponding unit prices left-to-right beneath each quantity

This applies to both the `PublicProductCard` in `PublicClientProjectPage.tsx` and the `ClientProductCard`.

### Files: `src/pages/client/PublicClientProjectPage.tsx`, `src/components/projects/ClientProductCard.tsx`
- Replace the vertical table with a horizontal one
- Header: blank first cell + one column per tier showing the qty range
- Single body row: "Unit Price" label + price values across

---

## 3. Replace Product Status Dropdown with "Art Received" / "Quantities Received" Checkboxes

Remove the `PresentationItemStatus` dropdown from the admin product form header and replace it with two checkboxes:
- **Art Received** (checked when artwork has been uploaded/provided)
- **Quantities Received** (checked when quantities have been entered)

The actual `status` field will be derived automatically:
- If both checked: `ready_for_client_input` (everything is ready)
- If neither checked: `draft`
- Otherwise: `draft` (still needs info)

On the public-facing side, the logic inverts: if a checkbox is unchecked, the client sees the corresponding input section (artwork upload or quantity matrix). If checked, that section is hidden/read-only since the admin already has the info.

### File: `src/components/projects/ProductSpecHeader.tsx`
- Remove the `Select` dropdown for status
- Add two checkboxes: "Art Received" and "Quantities Received"
- Change props: replace `status`/`onStatusChange` with `artReceived`/`onArtReceivedChange` and `quantitiesReceived`/`onQuantitiesReceivedChange`

### File: `src/components/projects/ProjectProductForm.tsx`
- Add two state variables: `artReceived` and `quantitiesReceived`
- Initialize from existing item data (e.g., `artReceived = !!item?.main_image_url`, `quantitiesReceived` from existing quantities toggle or item data)
- Derive `status` automatically from these flags before saving
- Pass the new props to `ProductSpecHeader`
- Remove direct `status`/`setStatus` state

### File: `src/pages/client/PublicClientProjectPage.tsx`
- Read the `artReceived`/`quantitiesReceived` flags from presentation item data
- If art is NOT received: show per-location artwork upload sections (one dropzone per decoration location)
- If quantities are NOT received: show the quantity matrix for client input
- If both are already received: show read-only summary, no input needed

### Database Migration
- Add two boolean columns to `presentation_items`:
  - `art_received` (boolean, default false)
  - `quantities_received` (boolean, default false)
- These persist the admin's checkbox selections independently of the status enum

---

## 4. Per-Location Artwork Upload on Public View

When artwork is not received, instead of a single generic "upload artwork" area, show one upload zone per decoration location so the client can provide art specific to each location (e.g., "Front Chest", "Back").

### File: `src/pages/client/PublicClientProjectPage.tsx`
- Change `artworkFiles` state from `Record<itemId, File[]>` to `Record<itemId, Record<locationId, File[]>>`
- Render one upload card per decoration location showing:
  - Location name and thumbnail placeholder
  - File dropzone
  - List of attached files with remove buttons
- On submission, files are organized into folders named "Client Provided - {ProductName} - {LocationName}"

---

## Technical Summary

### Migration SQL:
```sql
ALTER TABLE public.presentation_items
  ADD COLUMN art_received boolean NOT NULL DEFAULT false,
  ADD COLUMN quantities_received boolean NOT NULL DEFAULT false;
```

### Files to Modify:
1. `src/types/database.ts` - Add `art_received` and `quantities_received` to `PresentationItem` interface
2. `src/components/projects/ProductSpecHeader.tsx` - Replace status dropdown with checkboxes
3. `src/components/projects/ProjectProductForm.tsx` - New state for checkboxes, derive status automatically
4. `src/pages/client/PublicClientProjectPage.tsx` - Decoration thumbnails, transposed pricing, conditional sections based on flags, per-location artwork upload
5. `src/components/projects/ClientProductCard.tsx` - Transpose pricing grid layout
6. `src/components/projects/ProjectProductCard.tsx` - Update card to show checkbox indicators instead of status badge (optional enhancement)

### New Database Columns:
- `presentation_items.art_received` (boolean, default false)
- `presentation_items.quantities_received` (boolean, default false)
