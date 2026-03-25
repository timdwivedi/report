# BUILD_CONTEXT — BrandOps

> Quick-reference for any Claude Code session working on this build.
> Read this FIRST before touching any files.

## Identity

| Field | Value |
|-------|-------|
| **App Name** | BrandOps |
| **Slug** | `brandops` |
| **Industry** | Decorated promotional products / merch agencies |
| **Client** | Trevor Sarver — 85 Supply / Boundless Network |
| **Secondary** | Aaron (operator/partner), Kristen (project coordinator) |
| **Market Size** | $27.7B NA (2025), projected $36.98B by 2033 |
| **Primary Competitor** | commonsku ($1.8B+ processed, 900+ customers) |
| **Pricing Target** | $79–99/user/month |
| **Dev Port** | `3001` |

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Animation | Framer Motion |
| Icons | Lucide React |
| Database | Demo mode only (no Supabase, no real DB) |
| Auth | Demo mode (middleware guard, no real auth) |

## Critical Business Logic

### Contract vs All-In Products
- **Contract products**: Per-size pricing. Customer specifies quantities per size (S/M/L/XL/2XL). Price comes from decoration matrix tier lookups.
- **All-in products**: Flat per-unit price. Single quantity, no size breakdown. Price is `base_price + decoration_charges + fixed_charges`.
- These are **fundamentally different data structures** — never assume one pricing model.

### Pricing Formula
```
Blank cost + Decoration cost + Fixed charges + Run charges + Margin = Sell price
```
- **Spoilage**: 2–5% added to blank orders (industry standard)
- **Decoration matrices**: Vendor-specific, method-specific (screen print ≠ embroidery ≠ DTG)
- **Tier breaks**: Price per unit drops at quantity thresholds (e.g., 24/48/72/144/288)

### Bell Curve Size Distribution (Industry Standard)
```
S = 10%, M = 25%, L = 30%, XL = 25%, 2XL = 10%
```
Remainder always goes to L (most common size).

### Production Phases
```
Order Placed → Blank Sourcing → Art Approval → Decoration → QC → Ship
```

## Key Terminology (from copy-bank.md)
- **Blanks** = undecorated garments/products
- **Decoration** = printing/embroidery/heat transfer applied to blanks
- **PO** = Purchase Order (sent to vendor for blanks)
- **In-hands date** = deadline when client needs finished product
- **Ship date** = when product leaves decorator
- **Spoilage** = extra units ordered to cover defects (2-5%)
- **Run charge** = per-unit decoration fee
- **Setup charge** = one-time fee per decoration method/color

## Build Status

| Round | Status | Steps | Features |
|-------|--------|-------|----------|
| **Scaffold** | Complete | agentic-build.sh | 18+ pages, 21 API routes, full dashboard |
| **R1** | Complete | 20 steps, 6 phases | Data model, core UX, pricing engine, new modules, portals, polish |
| **R2 (Elite)** | Complete | 7 features | PDF export, smart split, reorder, CSV import, heatmap, scorecard, timeline |
| **R3 (Quality)** | Complete | 12 steps, 3 phases | PricingGrid 7-col, pricing override, CreativeRequestDetailPanel, ASI fields |
| **R4 (Product Experience)** | Complete | 16 steps, 5 phases | AI product scraper, dual add-ons, multi-image colors, decoration locations, creative page, inline address |
| **R4.5 (Elite)** | Complete | 7 features | Product compare, deco recommender, project templates, PO generation, margin ticker, portal art upload, Cmd+K command palette |

**Last verified:** 2026-03-03 — ALL CHECKS PASSED (verify.sh, 4 warnings)
**Last commit:** pending — not yet committed

## File Map (Key Files)

| File | What It Does |
|------|-------------|
| `web/lib/types/app.ts` | ~500-line type system — ALL entities defined here |
| `web/lib/demo/demo-data-provider.ts` | ~2000-line demo data factory — ALL mock data here |
| `web/lib/demo/quoting-engine.ts` | Pricing calculator — contract vs all-in logic |
| `web/lib/constants/app.ts` | Status labels, stage configs, decoration methods |
| `web/components/shared/` | Reusable components (DataTable, DetailPanel, PageHeader, etc.) |
| `web/app/dashboard/` | All dashboard pages (projects, clients, vendors, analytics, etc.) |
| `web/app/portal/[shareableLink]/` | Client-facing portal |
| `verify.sh` | Build verification (6 check categories + tsc + next build) |

## Intel Files

| File | Contents |
|------|----------|
| `docs/intel/extraction-summary-round-1.md` | 11 entities, 26 features, 17 business rules from Call 3 |
| `docs/intel/competitive-brief-round-1.md` | 9-competitor analysis, market sizing, pricing recs |
| `docs/intel/copy-bank.md` | 60+ industry terms, Trevor's exact phrases |
| `docs/intel/call3/` | Raw Call 3 transcript (177 min) |
| `docs/intel/trevor-85/` | Call 1 transcript, blueprint, strategy docs |

## What's NOT Built Yet (Future Rounds)
- Salesforce integration
- Floor stock / warehouse management
- AI agents (order entry, quoting, vendor intelligence)
- PromoStandards API
- Real database + Supabase schema
- Real auth + multi-tenancy
- Address book full CRUD
- Purchase order generation
