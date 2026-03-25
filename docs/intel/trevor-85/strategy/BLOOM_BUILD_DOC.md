# BrandOps — Enterprise Promotional Merchandise Operations Platform

## 1. Overview

**App Name:** BrandOps
**Tagline:** Run Your Merch Empire. From Quote to Ship. One Platform.
**Brand Name:** BrandOps (Trevor's name — targets the $100K-$3M distributor market AND enterprise conglomerates)
**Domain:** Enterprise operations platform for the $8-12B promotional merchandise industry
**Business Model:** B2B SaaS — Tiered subscription ($99/$499/$1,499 per month) for promotional merchandise distributors + enterprise white-label licensing for conglomerates (Boundless model: per-rep subscription)

### What This App Does (3 sentences max)

BrandOps replaces the fragmented spreadsheet-Salesforce-email workflow that every merch company runs on with a single platform that handles the full lifecycle — from client project request through quoting, artwork approval, order tracking, and invoicing. Clients browse a product catalog, select decoration details, get instant pricing, and submit project requests that flow directly into an intelligent admin pipeline with Kanban tracking, decorator matrix-based quoting, and shareable client portals. The result: merch agencies stop losing 15+ hours per week on manual quoting, eliminate order entry errors, and present to clients with a portal that makes them look like a Fortune 500 operation — not a guy with a spreadsheet.

### Target User Persona

> The PRIMARY user is the merch company owner/sales lead, NOT the end client. The public website serves end clients; the admin portal serves the merch team. The SECONDARY user is the end client interacting with the client portal.

- **Name & Context:** Trevor Sarver, 40, CEO of a merch agency under a $200-300M parent company (Boundless). Runs 85 Supply as the "cool brand" inside a corporate machine. Former rock-and-roll touring musician. Just closed $131K in his first 9 days — entirely through personal network and manual Salesforce entry. Industry veteran, 13+ years, clients include Red Bull, Spotify, Dish Media, Jack Daniels.
- **Role:** CEO / Sales Lead / One-man army running through Salesforce, Lovable, spreadsheets, and email
- **Demographics:** 35-55 years old, $100K-$500K+ income (commission-based), US-based (Nashville, TN). Manages $2-5M in annual merch revenue. Team of 1-5 plus corporate back-office (finance, production, order entry).
- **Tech Profile:** Salesforce (corporate-mandated order entry), Lovable (built own admin app), CommonSkew (industry CRM — "Windows 98 shit"), Google Sheets (commission tracking, pricing), email/Slack (client comms), Shopify (e-comm stores for program clients). Technically adventurous — built his own app in Lovable, understands databases and APIs, but can't code. Comfort level: "power vibe-coder" — can build features in Lovable, can't debug backend.
- **Pain Points:**
  1. Spends 3-5 hours per project manually calculating quotes — looking up blank costs across suppliers, applying decoration costs from scattered spreadsheets, calculating margins per quantity break, then manually formatting into a client-facing proposal. Multiply by 15-30 active projects = entire week burned on math.
  2. Two separate systems that don't talk: a public-facing website (Lovable) and an admin portal (also Lovable, different project) with a dead Airtable connection in between. Product data lives in spreadsheets. Client data lives in email. Order data lives in Salesforce. Nothing is connected.
  3. Manual Salesforce order entry is the #1 bottleneck. Every project spawns 3-10 individual orders (t-shirts, hats, mugs, bags — each with different suppliers, deadlines, decorations). Each order must be manually entered into Salesforce's terrible form. Corporate compliance requires it. No API access.
  4. Client experience is fragmented: project submitted via email → quote sent via PDF → artwork uploaded via email → order confirmed via Salesforce's "dog shit" portal → tracking via Boundless's broken portal. No unified experience.
  5. Programs (enterprise client ordering systems — Progressive Insurance Polo accounts, employee stores with budget management, drop-ship to locations) are managed through third-party platforms like Liftoff and OrderMyGear that send data to Salesforce/NetSuite. Trevor has no control over the client experience.
- **Goals:**
  1. Merge public website + admin portal into one cohesive system — clients browse, quote, and submit projects on the front end; Trevor manages everything on the back end. One login, one platform.
  2. Automate the quoting engine so that when a client selects a Gildan 5000 with 2-color front screen print + 1-color back, the system instantly calculates blank cost + decoration cost + margin = client price across all quantity breaks — no spreadsheets.
  3. Build a client portal where approved projects generate shareable links — clients upload artwork, confirm quantities, approve orders, and track production status without touching Salesforce's portal.
  4. Create an enterprise "Programs" module that handles corporate ordering (employee stores, budget management per division, recurring orders, drop-ship tracking) — replacing Liftoff/OrderMyGear and keeping the data in his system.
  5. Impress Aaron (Boundless CEO) enough that he unlocks budget + Salesforce API access, then scale the platform to all 200+ Boundless reps.
- **Objections:**
  1. "I don't have budget right now. I'm on a financial leash from the merger — all my financials are monitored. This has to be rev-share or sweat equity until Aaron approves."
  2. "I've already spent $700K over the years trying to build SupplyIt. Developers kept burning cash and delivering nothing. I need to see something working in days, not months."
  3. "My back-office team (Tyler in finance, Matt in production) can't use third-party apps for compliance reasons. The order entry into Salesforce has to remain manual or get Aaron's explicit approval."
- **Buying Triggers:** Just merged with Boundless and is trying to prove his value. Did $131K in 9 days manually. Derek (mentor who sold $120M company) telling him "you'll disrupt the industry." Buddy Nick ($20M company Threadbird) offering $1,000/month "just for this." CJ Smith (CEO of Hit Promotional Products, $1.4B company) asking "how do we build this for us?"

### Value Proposition

- **Core Promise:** One platform to manage your entire merch operation — from the moment a client browses your catalog through quoting, artwork approval, production tracking, and delivery — so you look like a Fortune 500 operation while running lean.
- **Unique Mechanism:** The "Decorator Matrix Engine" — a quoting system that knows every blank product cost, every decoration method cost by quantity tier, and every margin rule. When a client selects a Gildan 5000 with 2-color screen print on the front and 1-color embroidery on the sleeve, the system instantly generates accurate pricing across all quantity breaks. No spreadsheets. No manual math. No waiting 48 hours for a quote.
- **Before → After:** Before: Website and admin portal split across 2 Lovable projects with dead Airtable, quotes built manually from scattered spreadsheets, orders entered one-by-one into Salesforce's terrible form, clients tracking orders through Boundless's broken portal, zero automation. After: One platform where clients browse → select → get instant pricing → submit projects → upload artwork → approve orders → track delivery, while Trevor manages the entire pipeline from a single Kanban board with automated quoting, shareable client portals, and commission reporting.

---

## 2. Core Features

| # | Feature Name | Description | Primary Page | Display Type |
|---|---|---|---|---|
| 1 | Product Catalog (Public) | Client-facing product browsing experience with categories, decoration options, color selection, and instant quantity-based pricing powered by the decorator matrix engine. The storefront that replaces the old agency-style website. | `/catalog` | Card grid with filters + detail view |
| 2 | Project Request (Public) | Multi-step project submission flow where clients select products, choose decorations, enter quantities, upload logos, and submit a project request. Flows directly into the admin pipeline. | `/request` | Multi-step wizard |
| 3 | Project Pipeline (Admin) | Kanban-style pipeline tracking every project from opportunity through delivery. Statuses: Opportunity → Qualifying → Curating → InDesign → Presenting → Client Review → Confirmed → Order Entry → In Production → Shipped. The command center. | `/dashboard/projects` | Kanban board + table toggle |
| 4 | Client Management (Admin) | CRM for managing clients, contacts (order contact, finance contact, marketing contact), billing/shipping addresses, and project history. Each client can have multiple contacts and multiple projects. | `/dashboard/clients` | Table with detail slide-over |
| 5 | Quoting Engine (Admin) | The brain — calculates pricing using blank cost + decoration cost (from decorator matrices) + margin = client price. Supports multiple print locations (front, back, sleeve), decoration methods (screen print, embroidery, DTG, heat transfer), color counts, quantity breaks, and add-ons (puff ink, metallic, etc.). | `/dashboard/projects/[id]` | Embedded in project detail |
| 6 | Client Portal (Public/Shared) | Shareable project link where clients see their curated products, pricing, and can upload artwork, enter quantities, select colors, confirm orders. The client-facing experience that replaces email back-and-forth. | `/portal/[projectId]` | Shared link view |
| 7 | Order Tracking (Admin) | Kanban board for individual orders spawned from projects. Statuses: Order Entry Needed → Entered (Salesforce) → In Production → Shipped → Ready for Invoicing → Invoiced. Mirrors Salesforce statuses 1:1. | `/dashboard/orders` | Kanban board |
| 8 | Programs Module (Admin) | Enterprise ordering programs for large clients — employee stores, budget management per division/location, recurring order templates, drop-ship tracking, spend management controls. The feature that replaces Liftoff/OrderMyGear. | `/dashboard/programs` | Table + detail with nested config |
| 9 | Decorator Matrices (Admin) | Configuration system for decoration pricing. Set up pricing by method (screen print, embroidery, DTG, etc.) × quantity tier × color count. Reusable across all products. The foundation of the quoting engine. | `/dashboard/settings/matrices` | Editable table/form |
| 10 | Commission Dashboard (Admin) | Revenue and commission reporting — gross revenue, profit splits, partner commission calculations (7% of gross), monthly/quarterly views. The "wow" feature for Aaron at Boundless. | `/dashboard/commissions` | Charts + stats + table |
| 11 | Analytics & Insights (Admin) | Pipeline value, conversion rates, average deal size, project velocity, client segment breakdown, revenue forecasting. Data that proves the platform's ROI. | `/dashboard/analytics` | Charts + stats cards |
| 12 | Settings & Configuration (Admin) | Company profile, team members, decoration methods, product categories, margin rules, notification preferences, integrations (future: Salesforce, PromoStandards, Stripe). | `/dashboard/settings` | Tabbed form layout |

### Page Map

```
/                                → Landing page (public — SaaS marketing page)
/login                           → Login
/signup                          → Signup
/catalog                         → Product catalog (public — browse products)
/catalog/[productId]             → Product detail (public — decoration options, pricing)
/request                         → Project request wizard (public — multi-step)
/request/confirmation            → Thank you / confirmation page
/portal/[projectId]              → Client portal (shared — artwork, quantities, approval)
/portal/[projectId]/tracking     → Order tracking (shared — production status)
/dashboard                       → Dashboard home (stats + pipeline summary + quick actions)
/dashboard/projects              → Project pipeline (Kanban + table)
/dashboard/projects/[id]         → Project detail (quoting, products, client link)
/dashboard/clients               → Client management (CRM)
/dashboard/clients/[id]          → Client detail (contacts, projects, history)
/dashboard/orders                → Order tracking (Kanban)
/dashboard/programs              → Programs management
/dashboard/programs/[id]         → Program detail (e-comm store config, budget, locations)
/dashboard/commissions           → Commission reporting
/dashboard/analytics             → Analytics & insights
/dashboard/settings              → Settings hub
/dashboard/settings/matrices     → Decorator matrices configuration
/dashboard/settings/products     → Product database management
/dashboard/settings/team         → Team management
/dashboard/settings/integrations → Integration config (Salesforce, PromoStandards, Stripe)
```

---

## 3. Competitive Intelligence

### Competitor Analysis

| Competitor | Positioning | Pricing | Key Strength | Key Weakness — Gap We Exploit |
|---|---|---|---|---|
| CommonSkew | "The industry standard CRM for promotional products." Used by Derek's $120M company Touchstone. | Per-seat subscription + transaction fees | PromoStandards integration for product search, presentation builder, project management, established industry adoption | "Windows 98 shit" — dated UX, no AI, no client-facing portal, no instant quoting, no modern web experience. Derek told CommonSkew CEO to her face "this is too small for my business." Charges premium for enterprise but delivers 2008-era interface. |
| Liftoff / OrderMyGear | "Enterprise employee store and program management." Used by Boundless for corporate programs (Progressive Insurance, etc.) | Enterprise contracts, per-program pricing | Budget management, employee ordering, multi-location drop-ship, established with large corporates | No custom branding, no merch-native quoting, forces clients through generic portal experience. Data feeds to Salesforce/NetSuite but the front-end is commoditized. No AI. No smart product curation. |
| MerchAI | "AI-powered mockups for promotional products." The ONLY AI competitor in the space. | Subscription-based mockup generation | First mover on AI mockups — branded product visualization, lookbooks | ONLY does mockups. No CRM, no quoting, no project management, no client portal, no order tracking. A feature, not a platform. Easy to absorb into a full platform. |
| CustomInk | "Custom t-shirts and promotional products, made easy." Consumer/SMB focus. | Per-unit pricing, transparent online | Massive brand awareness, simple UX for basic orders, design tool for simple products | Consumer-grade. Can't handle complex merch orders (30 products, split shipments, multiple decoration methods, enterprise budgeting). No B2B project management. No agent/concierge model. |
| Salesforce (as used by Boundless) | "Enterprise CRM and order management." Corporate mandate. | Enterprise licensing | Industry standard, compliance-approved, full audit trail, NetSuite integration for finance | Terrible UX for merch-specific workflows. No product catalog, no quoting engine, no client-facing portal, no project management. It's an order entry form, not a merch platform. Manual entry for every field on every order. |

### How We Differentiate

1. **Full-lifecycle platform vs. point solutions** — CommonSkew does CRM, MerchAI does mockups, Liftoff does programs, Salesforce does order entry. BrandOps does ALL of it in one platform with data flowing between every module. A project request becomes a quote becomes a client approval becomes individual orders — no manual re-entry at any step.
2. **Instant quoting via Decorator Matrix Engine** — No competitor calculates accurate merch pricing in real-time. The industry runs on spreadsheets and "I'll get back to you in 48 hours." BrandOps knows every blank cost, every decoration cost by method/quantity/color-count, and every margin rule. Clients get instant pricing. Sales teams save 15+ hours/week on manual calculations.
3. **Enterprise Programs as a native module** — Liftoff and OrderMyGear are standalone platforms that feel generic. BrandOps's Programs module is built natively into the same platform where projects, orders, and clients already live. Same quoting engine, same product catalog, same client portal UX. One platform for transactional + enterprise business.

---

## 4. Design Direction

### Color Palette

**Primary — Supply Blue (Trust, professionalism, enterprise credibility — derived from 85 Supply's brand identity and merch industry expectations)**

| Shade | Hex | Usage |
|---|---|---|
| 50 | `#EFF6FF` | Light backgrounds, hover states, card tints |
| 100 | `#DBEAFE` | Badge backgrounds, subtle fills, selected states |
| 200 | `#BFDBFE` | Borders on active elements, progress bar backgrounds |
| 300 | `#93C5FD` | Inactive button states, secondary icons |
| 400 | `#60A5FA` | Secondary elements, chart accents, links |
| 500 | `#3B82F6` | **Primary brand color** — CTAs, nav highlights, section headers |
| 600 | `#2563EB` | Hover states on primary buttons, active nav items |
| 700 | `#1D4ED8` | Active/pressed button states |
| 800 | `#1E40AF` | Heavy text on light backgrounds, strong emphasis |
| 900 | `#1E3A8A` | Near-black blue tone, headings |
| 950 | `#172554` | Darkest shade — dark sidebar, footer bg |

**Secondary — Slate (Neutral, background, text — clean and professional)**

| Shade | Hex | Usage |
|---|---|---|
| 50 | `#F8FAFC` | Page backgrounds, alternate section bg |
| 100 | `#F1F5F9` | Card backgrounds, sidebar bg, input bg |
| 200 | `#E2E8F0` | Borders, dividers, table lines |
| 300 | `#CBD5E1` | Placeholder text, disabled states |
| 400 | `#94A3B8` | Muted icons, secondary text |
| 500 | `#64748B` | Body text secondary, labels |
| 600 | `#475569` | Body text primary |
| 700 | `#334155` | Headings, sidebar text |
| 800 | `#1E293B` | Dark headings, topbar text, sidebar bg |
| 900 | `#0F172A` | Near-black, dark sections |
| 950 | `#020617` | Darkest — maximum contrast |

**Accent — Amber (Revenue, urgency, attention, pricing highlights)**

| Shade | Hex | Usage |
|---|---|---|
| 50 | `#FFFBEB` | Revenue alert backgrounds |
| 100 | `#FEF3C7` | Commission badge bg, pricing highlight |
| 200 | `#FDE68A` | Active pricing tier highlight |
| 300 | `#FCD34D` | Warning borders |
| 400 | `#FBBF24` | Star ratings, important flags |
| 500 | `#F59E0B` | **Accent color** — pricing CTAs, commission badges, urgency |
| 600 | `#D97706` | Hover on accent elements |
| 700 | `#B45309` | Active accent states |
| 800 | `#92400E` | Dark accent text |
| 900 | `#78350F` | Near-black amber |
| 950 | `#451A03` | Darkest amber |

**Semantic Colors**

| Token | Hex | Usage |
|---|---|---|
| Success | `#10B981` | Order shipped, project confirmed, payment received, positive stats |
| Warning | `#F59E0B` | Pending review, approaching deadline, artwork needed |
| Danger/Error | `#EF4444` | Order issue, overdue, cancelled, errors |
| Info | `#3B82F6` | New project, new client, system updates |

### Typography

| Element | Font (Google Fonts) | Weight | Size (desktop) | Size (mobile) |
|---|---|---|---|---|
| H1 | Plus Jakarta Sans | 800 | 48px / `text-5xl` | 32px / `text-3xl` |
| H2 | Plus Jakarta Sans | 700 | 36px / `text-4xl` | 28px / `text-2xl` |
| H3 | Plus Jakarta Sans | 600 | 24px / `text-2xl` | 20px / `text-xl` |
| Body | Inter | 400 | 16px / `text-base` | 16px / `text-base` |
| Body Small | Inter | 400 | 14px / `text-sm` | 14px / `text-sm` |
| Mono / Data / Pricing | JetBrains Mono | 500 | 14px / `text-sm` | 13px / `text-[13px]` |

**Font Usage Rules:**

| Context | Tailwind Classes |
|---|---|
| Page titles | `font-heading text-3xl lg:text-5xl font-extrabold text-slate-900` |
| Section headings | `font-heading text-2xl lg:text-4xl font-bold text-slate-800` |
| Card titles | `font-heading text-lg font-semibold text-slate-800` |
| Body text | `font-sans text-base font-normal text-slate-600` |
| Labels | `font-sans text-xs font-medium text-slate-500 uppercase tracking-wide` |
| Pricing / KPI values | `font-mono text-3xl font-bold text-slate-900` |
| Small data / quantities | `font-mono text-sm text-slate-700` |
| Client portal headings | `font-heading text-2xl lg:text-3xl font-bold text-slate-900` |
| Product names | `font-heading text-base font-semibold text-slate-800` |

### Component Style

| Property | Value |
|---|---|
| Border Radius (cards) | 12px / `rounded-xl` |
| Border Radius (buttons) | 10px / `rounded-[10px]` |
| Border Radius (inputs) | 8px / `rounded-lg` |
| Border Radius (badges) | 9999px / `rounded-full` |
| Card Shadow | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` |
| Card Shadow (hover) | `0 10px 25px rgba(59,130,246,0.08), 0 4px 10px rgba(0,0,0,0.04)` |
| Card Border | `1px solid #E2E8F0` / `border border-slate-200` |
| Card Padding | 24px / `p-6` |
| Section Padding (desktop) | 80px vertical / `py-20` |
| Section Padding (mobile) | 48px vertical / `py-12` |
| Container Max Width | 1440px / `max-w-[1440px]` |
| Sidebar Width (expanded) | 280px / `w-[280px]` |
| Sidebar Width (collapsed) | 72px / `w-[72px]` |
| Top Bar Height | 64px / `h-16` |
| Base Transition | `all 200ms ease` / `transition-all duration-200` |
| Kanban Column Width | 300px / `w-[300px]` |
| Kanban Card Shadow | `0 2px 8px rgba(0,0,0,0.08)` |

### Status Badge Color Map

| Status | Background | Text |
|---|---|---|
| Opportunity | `bg-blue-100` | `text-blue-700` |
| Qualifying | `bg-sky-100` | `text-sky-700` |
| Curating | `bg-indigo-100` | `text-indigo-700` |
| InDesign | `bg-violet-100` | `text-violet-700` |
| Presenting | `bg-amber-100` | `text-amber-700` |
| Client Review | `bg-orange-100` | `text-orange-700` |
| Confirmed | `bg-emerald-100` | `text-emerald-700` |
| Order Entry Needed | `bg-red-100` | `text-red-700` |
| In Production | `bg-cyan-100` | `text-cyan-700` |
| Shipped | `bg-green-100` | `text-green-700` |
| Ready for Invoicing | `bg-lime-100` | `text-lime-700` |
| Invoiced | `bg-slate-100` | `text-slate-600` |
| Cancelled | `bg-gray-100` | `text-gray-500` |
| Draft | `bg-gray-100` | `text-gray-600` |
| Active (Program) | `bg-emerald-100` | `text-emerald-700` |
| Paused (Program) | `bg-amber-100` | `text-amber-700` |

### Design References

| App | What to Study | Key Lesson |
|---|---|---|
| Linear.app | Kanban boards, project detail views, clean sidebar nav | How to make complex project management feel simple — minimal chrome, maximum information density |
| Shopify Admin | Product management, order detail, multi-variant products | How to manage products with hundreds of variants (sizes/colors/options) without overwhelming the UI |
| HubSpot CRM | Pipeline management, deal cards, contact detail views | How to build a CRM that sales people actually use — quick actions, inline editing, pipeline visualization |

---

## 5. Page Architecture

### All Routes

| Route | Type | Layout | Description |
|---|---|---|---|
| `/` | Public | Marketing | SaaS landing page — hero, features, testimonials, pricing, CTA |
| `/login` | Auth | Minimal | Email/password + Google OAuth login |
| `/signup` | Auth | Minimal | Registration with company info |
| `/catalog` | Public | Storefront | Product browsing with categories and filters |
| `/catalog/[productId]` | Public | Storefront | Product detail — colors, decorations, instant pricing |
| `/request` | Public | Wizard | Multi-step project submission (4 steps) |
| `/request/confirmation` | Public | Minimal | Thank you page with project reference number |
| `/portal/[projectId]` | Shared | Portal | Client-facing project view — products, pricing, artwork upload, approval |
| `/portal/[projectId]/tracking` | Shared | Portal | Order tracking — status per order, shipment info |
| `/dashboard` | Protected | Dashboard | Home — pipeline summary, recent projects, revenue stats, quick actions |
| `/dashboard/projects` | Protected | Dashboard | Project pipeline — Kanban board + table toggle |
| `/dashboard/projects/[id]` | Protected | Dashboard | Project detail — client info, products, quoting, decoration details, client portal link |
| `/dashboard/clients` | Protected | Dashboard | Client list — search, filter, add new |
| `/dashboard/clients/[id]` | Protected | Dashboard | Client detail — contacts, address, project history, program memberships |
| `/dashboard/orders` | Protected | Dashboard | Order Kanban — individual orders parsed from projects |
| `/dashboard/programs` | Protected | Dashboard | Programs list — enterprise ordering programs |
| `/dashboard/programs/[id]` | Protected | Dashboard | Program detail — store config, budget, locations, orders |
| `/dashboard/commissions` | Protected | Dashboard | Revenue reporting — gross, profit, commissions, partner splits |
| `/dashboard/analytics` | Protected | Dashboard | Pipeline analytics, conversion rates, deal velocity |
| `/dashboard/settings` | Protected | Dashboard | Settings hub — profile, matrices, products, team, integrations |
| `/dashboard/settings/matrices` | Protected | Dashboard | Decorator matrix configuration |
| `/dashboard/settings/products` | Protected | Dashboard | Product database management |
| `/dashboard/settings/team` | Protected | Dashboard | Team member management |
| `/dashboard/settings/integrations` | Protected | Dashboard | Integration config |

---

## 6. Data Architecture

### TypeScript Interfaces

```typescript
// ============ CORE ENTITIES ============

interface Organization {
  id: string;
  name: string;           // "85 Supply"
  slug: string;           // "85-supply"
  logo_url?: string;
  website_url?: string;
  primary_color: string;  // Brand color for white-labeling
  settings: OrgSettings;
  created_at: string;
}

interface OrgSettings {
  default_margin_percent: number;  // e.g., 35
  currency: 'USD' | 'GBP' | 'EUR';
  tax_rate?: number;
  salesforce_enabled: boolean;
  payment_terms_default: 'prepay' | 'net15' | 'net30' | 'net45' | 'net60';
}

// ============ CLIENTS ============

interface Client {
  id: string;
  org_id: string;
  company_name: string;
  industry?: string;
  billing_address: Address;
  shipping_address?: Address;
  payment_terms: 'prepay' | 'net15' | 'net30' | 'net45' | 'net60';
  credit_limit?: number;
  tax_exempt: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface ClientContact {
  id: string;
  client_id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'primary' | 'order' | 'finance' | 'marketing' | 'other';
  is_primary: boolean;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

// ============ PRODUCTS ============

interface Product {
  id: string;
  org_id: string;
  name: string;              // "Gildan 5000 Heavy Cotton Tee"
  internal_sku?: string;     // Internal reference
  category: ProductCategory;
  description?: string;
  primary_image_url?: string;
  additional_images: string[];
  available_colors: ProductColor[];
  available_sizes: string[];  // ["S", "M", "L", "XL", "2XL", "3XL"]
  blank_costs: BlankCost[];   // Cost per quantity break
  applicable_decorations: DecorationMethod[];
  supplier_name?: string;     // "Gildan", "Bella+Canvas", etc.
  promo_standards_id?: string; // PromoStandards product ID (future)
  is_active: boolean;
  show_on_website: boolean;
  sort_order: number;
  created_at: string;
}

type ProductCategory =
  | 'short-sleeve-tees'
  | 'long-sleeve-tees'
  | 'sweatshirts-hoodies'
  | 'polos'
  | 'jackets-outerwear'
  | 'hats-caps'
  | 'bags-totes'
  | 'drinkware'
  | 'office-supplies'
  | 'tech-accessories'
  | 'stickers-patches'
  | 'koozies'
  | 'lanyards-badges'
  | 'other';

interface ProductColor {
  name: string;        // "Black", "Navy", "Heather Gray"
  hex: string;         // "#000000"
  swatch_url?: string; // Product image in this color
}

interface BlankCost {
  min_quantity: number;  // 25
  max_quantity: number;  // 49
  cost_per_unit: number; // 3.50
}

// ============ DECORATION ============

type DecorationMethod =
  | 'screen-print'
  | 'embroidery'
  | 'dtg'           // Direct-to-garment
  | 'heat-transfer'
  | 'sublimation'
  | 'laser-engrave'
  | 'pad-print'
  | 'deboss'
  | 'other';

interface DecoratorMatrix {
  id: string;
  org_id: string;
  name: string;                 // "Standard Screen Print Matrix"
  decoration_method: DecorationMethod;
  pricing_tiers: DecoratorTier[];
  is_default: boolean;
  created_at: string;
}

interface DecoratorTier {
  min_quantity: number;  // 25
  max_quantity: number;  // 49
  prices_by_colors: {    // { 1: 2.50, 2: 3.65, 3: 4.80, 4: 5.95 }
    [colorCount: number]: number;
  };
}

// ============ PROJECTS ============

type ProjectStatus =
  | 'opportunity'
  | 'qualifying'
  | 'curating'
  | 'in-design'
  | 'presenting'
  | 'client-review'
  | 'confirmed'
  | 'cancelled';

interface Project {
  id: string;
  org_id: string;
  client_id: string;
  project_number: string;        // Auto-generated: "PRJ-2026-0042"
  name: string;                  // "Jeremy's Concert Tees"
  status: ProjectStatus;
  source: 'website' | 'direct' | 'referral' | 'program';
  in_hands_date?: string;        // When client needs product
  budget?: number;               // Client's stated budget
  is_critical: boolean;          // Rush order flag
  primary_shipping: 'ground' | 'express' | 'overnight';
  estimated_total: number;       // Calculated from line items
  internal_notes?: string;       // Admin-only notes
  client_notes?: string;         // Client-visible notes
  shareable_link?: string;       // UUID for client portal
  assigned_to?: string;          // Team member user_id
  created_at: string;
  updated_at: string;
}

interface ProjectLineItem {
  id: string;
  project_id: string;
  product_id: string;
  product_snapshot: {            // Frozen copy at time of quote
    name: string;
    image_url?: string;
    blank_costs: BlankCost[];
  };
  selected_color?: string;
  selected_sizes: SizeQuantity[];
  total_quantity: number;
  decorations: LineItemDecoration[];
  add_ons: LineItemAddOn[];
  unit_cost: number;             // Blank + decoration + add-ons
  margin_percent: number;        // e.g., 35
  unit_price: number;            // Cost / (1 - margin)
  subtotal: number;              // unit_price × total_quantity
  art_received: boolean;
  artwork_files: string[];       // Uploaded file URLs
  internal_notes?: string;
  sort_order: number;
}

interface SizeQuantity {
  size: string;      // "M"
  quantity: number;  // 50
}

interface LineItemDecoration {
  id: string;
  location: 'front' | 'back' | 'left-sleeve' | 'right-sleeve' | 'collar' | 'pocket' | 'other';
  location_label: string;    // "Front Chest"
  method: DecorationMethod;
  color_count: number;       // 1-6+
  matrix_id?: string;        // Which decorator matrix to use
  decoration_cost: number;   // Calculated from matrix
  notes?: string;
}

interface LineItemAddOn {
  name: string;         // "Puff Ink", "Metallic Thread", "Inside Label"
  cost_per_unit: number;
}

// ============ ORDERS ============

type OrderStatus =
  | 'order-entry-needed'
  | 'entered'          // In Salesforce
  | 'in-production'
  | 'shipped'
  | 'ready-for-invoicing'
  | 'invoiced'
  | 'cancelled';

interface Order {
  id: string;
  org_id: string;
  project_id: string;
  line_item_id: string;          // Which project line item this order is for
  order_number: string;          // "ORD-2026-0142"
  salesforce_id?: string;        // Salesforce sales order ID
  status: OrderStatus;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  in_hands_date?: string;
  ship_to: Address;
  tracking_number?: string;
  tracking_url?: string;
  carrier?: string;
  shipped_date?: string;
  invoice_amount?: number;
  invoice_url?: string;          // Link to NetSuite/PayStand invoice
  payment_received: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============ SPLIT SHIPMENTS ============

interface SplitShipment {
  id: string;
  order_id: string;
  destination_label: string;  // "Nashville HQ", "Austin Warehouse"
  ship_to: Address;
  quantity: number;
  tracking_number?: string;
  tracking_url?: string;
  shipped_date?: string;
  status: 'pending' | 'shipped' | 'delivered';
}

// ============ PROGRAMS ============

type ProgramType =
  | 'employee-store'     // Employees order from curated catalog
  | 'uniform-program'    // Recurring uniform orders per location
  | 'event-merch'        // Event-based recurring orders
  | 'drop-ship'          // Ship directly to multiple locations
  | 'budget-managed';    // Division/department budgets

interface Program {
  id: string;
  org_id: string;
  client_id: string;
  name: string;              // "Progressive Insurance — Polo Program"
  type: ProgramType;
  status: 'active' | 'paused' | 'completed';
  budget_total?: number;     // Total program budget
  budget_spent: number;      // Running total
  budget_remaining: number;
  locations: ProgramLocation[];
  allowed_products: string[];  // Product IDs available in this program
  approval_required: boolean;  // Does each order need admin approval?
  auto_reorder: boolean;       // Recurring order capability
  reorder_frequency?: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  portal_url?: string;         // Dedicated program ordering portal
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface ProgramLocation {
  id: string;
  program_id: string;
  name: string;           // "Nashville HQ", "Austin Office"
  address: Address;
  budget_allocation?: number;
  contact_name?: string;
  contact_email?: string;
}

// ============ COMMISSIONS ============

interface CommissionRecord {
  id: string;
  org_id: string;
  project_id: string;
  order_id?: string;
  period: string;               // "2026-02"
  gross_revenue: number;
  gross_profit: number;
  profit_margin_percent: number;
  owner_share: number;          // 50% of profit
  partner_commission: number;   // 7% of gross (20% of owner's profit share)
  source: 'website' | 'direct' | 'referral' | 'program';
  status: 'pending' | 'confirmed' | 'paid';
  created_at: string;
}

// ============ TEAM ============

interface TeamMember {
  id: string;
  org_id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'sales' | 'production' | 'viewer';
  avatar_initials: string;
  is_active: boolean;
  projects_assigned: number;
  deals_closed: number;
  created_at: string;
}
```

---

## 7. Database Schema (Supabase Migration)

```sql
-- ============================================================
-- SUPPLYHUB DATABASE SCHEMA
-- ============================================================

-- Organizations (multi-tenant root)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    primary_color TEXT DEFAULT '#3B82F6',
    settings JSONB DEFAULT '{}',
    owner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Clients
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    industry TEXT,
    billing_street TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_zip TEXT,
    billing_country TEXT DEFAULT 'US',
    shipping_street TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_zip TEXT,
    shipping_country TEXT DEFAULT 'US',
    payment_terms TEXT DEFAULT 'prepay' CHECK (payment_terms IN ('prepay', 'net15', 'net30', 'net45', 'net60')),
    credit_limit NUMERIC,
    tax_exempt BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_clients_org ON clients(org_id);

-- Client Contacts
CREATE TABLE client_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'primary' CHECK (role IN ('primary', 'order', 'finance', 'marketing', 'other')),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_contacts_client ON client_contacts(client_id);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    internal_sku TEXT,
    category TEXT NOT NULL,
    description TEXT,
    primary_image_url TEXT,
    additional_images TEXT[] DEFAULT '{}',
    available_colors JSONB DEFAULT '[]',
    available_sizes TEXT[] DEFAULT '{}',
    blank_costs JSONB DEFAULT '[]',
    applicable_decorations TEXT[] DEFAULT '{}',
    supplier_name TEXT,
    promo_standards_id TEXT,
    is_active BOOLEAN DEFAULT true,
    show_on_website BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_products_org ON products(org_id);
CREATE INDEX idx_products_category ON products(org_id, category);

-- Decorator Matrices
CREATE TABLE decorator_matrices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    decoration_method TEXT NOT NULL,
    pricing_tiers JSONB NOT NULL DEFAULT '[]',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_matrices_org ON decorator_matrices(org_id);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id),
    project_number TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'opportunity' CHECK (status IN (
        'opportunity', 'qualifying', 'curating', 'in-design',
        'presenting', 'client-review', 'confirmed', 'cancelled'
    )),
    source TEXT DEFAULT 'direct' CHECK (source IN ('website', 'direct', 'referral', 'program')),
    in_hands_date DATE,
    budget NUMERIC,
    is_critical BOOLEAN DEFAULT false,
    primary_shipping TEXT DEFAULT 'ground',
    estimated_total NUMERIC DEFAULT 0,
    internal_notes TEXT,
    client_notes TEXT,
    shareable_link UUID DEFAULT gen_random_uuid(),
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_projects_org ON projects(org_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(org_id, status);
CREATE UNIQUE INDEX idx_projects_number ON projects(org_id, project_number);
CREATE UNIQUE INDEX idx_projects_share ON projects(shareable_link);

-- Project Line Items
CREATE TABLE project_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_snapshot JSONB NOT NULL DEFAULT '{}',
    selected_color TEXT,
    selected_sizes JSONB DEFAULT '[]',
    total_quantity INTEGER DEFAULT 0,
    decorations JSONB DEFAULT '[]',
    add_ons JSONB DEFAULT '[]',
    unit_cost NUMERIC DEFAULT 0,
    margin_percent NUMERIC DEFAULT 35,
    unit_price NUMERIC DEFAULT 0,
    subtotal NUMERIC DEFAULT 0,
    art_received BOOLEAN DEFAULT false,
    artwork_files TEXT[] DEFAULT '{}',
    internal_notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_line_items_project ON project_line_items(project_id);

-- Orders (child of projects, one per line item)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id),
    line_item_id UUID REFERENCES project_line_items(id),
    order_number TEXT NOT NULL,
    salesforce_id TEXT,
    status TEXT DEFAULT 'order-entry-needed' CHECK (status IN (
        'order-entry-needed', 'entered', 'in-production',
        'shipped', 'ready-for-invoicing', 'invoiced', 'cancelled'
    )),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    in_hands_date DATE,
    ship_to_street TEXT,
    ship_to_city TEXT,
    ship_to_state TEXT,
    ship_to_zip TEXT,
    ship_to_country TEXT DEFAULT 'US',
    tracking_number TEXT,
    tracking_url TEXT,
    carrier TEXT,
    shipped_date DATE,
    invoice_amount NUMERIC,
    invoice_url TEXT,
    payment_received BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_orders_org ON orders(org_id);
CREATE INDEX idx_orders_project ON orders(project_id);
CREATE INDEX idx_orders_status ON orders(org_id, status);
CREATE UNIQUE INDEX idx_orders_number ON orders(org_id, order_number);

-- Split Shipments
CREATE TABLE split_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    destination_label TEXT NOT NULL,
    ship_to_street TEXT,
    ship_to_city TEXT,
    ship_to_state TEXT,
    ship_to_zip TEXT,
    ship_to_country TEXT DEFAULT 'US',
    quantity INTEGER NOT NULL,
    tracking_number TEXT,
    tracking_url TEXT,
    shipped_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered')),
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_shipments_order ON split_shipments(order_id);

-- Programs
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'employee-store', 'uniform-program', 'event-merch', 'drop-ship', 'budget-managed'
    )),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    budget_total NUMERIC,
    budget_spent NUMERIC DEFAULT 0,
    allowed_products UUID[] DEFAULT '{}',
    approval_required BOOLEAN DEFAULT true,
    auto_reorder BOOLEAN DEFAULT false,
    reorder_frequency TEXT CHECK (reorder_frequency IN ('monthly', 'quarterly', 'biannual', 'annual')),
    portal_url UUID DEFAULT gen_random_uuid(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_programs_org ON programs(org_id);
CREATE INDEX idx_programs_client ON programs(client_id);

-- Program Locations
CREATE TABLE program_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address_street TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    address_country TEXT DEFAULT 'US',
    budget_allocation NUMERIC,
    contact_name TEXT,
    contact_email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_locations_program ON program_locations(program_id);

-- Commissions
CREATE TABLE commission_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    order_id UUID REFERENCES orders(id),
    period TEXT NOT NULL,
    gross_revenue NUMERIC NOT NULL,
    gross_profit NUMERIC NOT NULL,
    profit_margin_percent NUMERIC,
    owner_share NUMERIC,
    partner_commission NUMERIC,
    source TEXT DEFAULT 'direct',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid')),
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_commissions_org ON commission_records(org_id);
CREATE INDEX idx_commissions_period ON commission_records(org_id, period);

-- Team Members
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'sales', 'production', 'viewer')),
    avatar_initials TEXT,
    is_active BOOLEAN DEFAULT true,
    projects_assigned INTEGER DEFAULT 0,
    deals_closed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_team_org ON team_members(org_id);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE decorator_matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All CRUD scoped to org_id via team_members membership
-- (Policies follow same pattern for all tables)
```

---

## 8. Signature Element — Commission Calculator

**Type:** Interactive calculator
**Page:** `/dashboard/commissions`
**Title:** "Revenue & Commission Tracker"
**Description:** Real-time revenue dashboard showing gross revenue, profit splits, and partner commissions. The feature that will make Aaron say "this is badass."

### Inputs (Left Column)

| Input | Type | Range | Default |
|---|---|---|---|
| Reporting Period | Dropdown | Monthly / Quarterly / Annual | Monthly |
| Gross Revenue | Auto-calculated | From confirmed orders | $131,000 |
| Profit Margin | Slider | 25%-50% | 35% |
| Owner Split | Display | Fixed 50% of profit | 50% |
| Partner Commission Rate | Slider | 5%-15% of gross | 7% |

### Outputs (Right Column)

| Output | Formula | Mock Value |
|---|---|---|
| **Gross Revenue** | Sum of all confirmed order totals | $131,000 |
| **Gross Profit** | Revenue × Margin% | $45,850 |
| **Boundless Share** | Profit × 50% | $22,925 |
| **Owner Share** | Profit × 50% | $22,925 |
| **Partner Commission** | Revenue × 7% | $9,170 |
| **Net to Owner** | Owner Share - Partner Commission | $13,755 |
| **Annual Projection** | Monthly × 12 (animated counter) | $1,572,000 revenue / $165,060 net |

**Wow Factor:** When Trevor adjusts the gross revenue slider from $131K to $250K (representing all Boundless reps using the platform), the Annual Projection counter animates from $1.5M to $3M in real-time. That's the number that sells Aaron.

---

## 9. Mock Data Personality

### Clients (10)

| Company | Industry | Annual Volume | Payment Terms |
|---|---|---|---|
| Raisin Canes | Restaurant/QSR | $250,000 | NET 30 |
| Progressive Insurance | Insurance/Corporate | $180,000 | NET 45 |
| Nashville Sounds | Sports/Entertainment | $75,000 | NET 30 |
| Threadbird Studios | Music/Merch | $120,000 | Prepay |
| Green Beret Foundation | Nonprofit/Military | $45,000 | NET 30 |
| Dish Media Group | Media/Entertainment | $40,000 | NET 30 |
| Austin Tech Summit | Events/Conferences | $35,000 | Prepay |
| Hillsong Church | Religious/Events | $90,000 | NET 30 |
| Red Bull Nashville | Beverage/Sports | $200,000 | NET 45 |
| Locksmith Pro USA | Service/Industrial | $300,000 | NET 30 |

### Projects (15)

Realistic distribution across pipeline:
- 3 in Opportunity
- 2 in Qualifying
- 2 in Curating
- 2 in InDesign/Presenting
- 3 in Client Review
- 2 in Confirmed
- 1 Cancelled

Values ranging from $2,500 to $75,000. Mix of single-product orders and complex multi-product projects (up to 30 line items for enterprise).

### Products (20)

| Product | Category | Blank Cost Range | Supplier |
|---|---|---|---|
| Gildan 5000 Heavy Cotton Tee | Short Sleeve Tees | $2.80-$4.50 | Gildan |
| Bella+Canvas 3001 Unisex Tee | Short Sleeve Tees | $4.20-$6.10 | Bella+Canvas |
| Comfort Colors 1717 | Short Sleeve Tees | $5.80-$7.50 | Comfort Colors |
| Gildan 18500 Heavy Blend Hoodie | Sweatshirts/Hoodies | $8.50-$12.00 | Gildan |
| Richardson 112 Trucker Cap | Hats/Caps | $3.50-$5.00 | Richardson |
| Port Authority C112 Snapback | Hats/Caps | $4.80-$6.50 | Port Authority |
| Liberty Bags 8802 Recycled Tote | Bags/Totes | $2.20-$3.80 | Liberty Bags |
| OGIO Catalyst Backpack | Bags/Totes | $28.00-$35.00 | OGIO |
| Miir 16oz Camp Cup | Drinkware | $12.00-$16.00 | Miir |
| Stanley 40oz Quencher | Drinkware | $25.00-$32.00 | Stanley |
| BIC Clic Stic Pen | Office Supplies | $0.45-$0.85 | BIC |
| Moleskine Classic Notebook | Office Supplies | $8.00-$12.00 | Moleskine |
| PopSocket Phone Grip | Tech Accessories | $3.50-$5.50 | PopSocket |
| Tile Bluetooth Tracker | Tech Accessories | $15.00-$22.00 | Tile |
| StickerMule Custom Stickers | Stickers/Patches | $0.15-$0.50 | StickerMule |
| Koozie Basic Can Cooler | Koozies | $0.80-$1.50 | Koozie Group |
| Lanyard with Breakaway | Lanyards/Badges | $1.20-$2.50 | IDville |
| Nike Dri-FIT Polo | Polos | $22.00-$28.00 | Nike |
| Columbia Fleece Jacket | Jackets/Outerwear | $35.00-$48.00 | Columbia |
| Custom Patch (Embroidered) | Stickers/Patches | $1.50-$3.50 | PatchPanel |

### Decorator Matrices (3 default)

**Screen Print Matrix:**

| Qty Range | 1 Color | 2 Colors | 3 Colors | 4 Colors | 5 Colors | 6 Colors |
|---|---|---|---|---|---|---|
| 25-49 | $4.50 | $5.75 | $7.00 | $8.25 | $9.50 | $10.75 |
| 50-99 | $3.25 | $4.25 | $5.25 | $6.25 | $7.25 | $8.25 |
| 100-249 | $2.50 | $3.25 | $4.00 | $4.75 | $5.50 | $6.25 |
| 250-499 | $1.75 | $2.35 | $2.95 | $3.55 | $4.15 | $4.75 |
| 500-999 | $1.25 | $1.75 | $2.25 | $2.75 | $3.25 | $3.75 |
| 1000+ | $0.85 | $1.25 | $1.65 | $2.05 | $2.45 | $2.85 |

**Embroidery Matrix:**

| Qty Range | Up to 5K stitches | 5K-10K | 10K-15K | 15K+ |
|---|---|---|---|---|
| 25-49 | $5.50 | $7.00 | $8.50 | $10.00 |
| 50-99 | $4.25 | $5.50 | $6.75 | $8.00 |
| 100-249 | $3.50 | $4.50 | $5.50 | $6.50 |
| 250-499 | $2.75 | $3.50 | $4.25 | $5.00 |
| 500+ | $2.00 | $2.75 | $3.50 | $4.25 |

**Heat Transfer Matrix:**

| Qty Range | Small (<4") | Medium (4-8") | Large (8"+) |
|---|---|---|---|
| 25-49 | $3.50 | $5.00 | $7.50 |
| 50-99 | $2.75 | $4.00 | $6.00 |
| 100-249 | $2.00 | $3.00 | $4.50 |
| 250+ | $1.50 | $2.25 | $3.50 |

### Orders (25)

Distributed across statuses:
- 5 Order Entry Needed
- 4 Entered
- 6 In Production
- 5 Shipped
- 3 Ready for Invoicing
- 2 Invoiced

### Programs (3)

| Program | Client | Type | Budget | Locations |
|---|---|---|---|---|
| Progressive Polo Program | Progressive Insurance | Employee Store | $180,000/yr | 8 regional offices |
| Raisin Canes Q2 Uniforms | Raisin Canes | Uniform Program | $250,000/yr | 43 locations |
| Nashville Sounds 2026 Season | Nashville Sounds | Event Merch | $75,000 | 1 stadium + 3 retail |

---

## 10. Landing Page Sections (9 sections)

### Section 1: HERO

**Headline:** "Run Your Merch Company Like a Fortune 500."
**Subheadline:** "One platform for quoting, project management, client portals, and order tracking. Built for the promotional products industry."
**CTA:** "Start Free Trial" (primary) / "Watch Demo" (secondary)
**Visual:** Screenshot of dashboard with project pipeline Kanban, showing realistic merch project cards
**Background:** Subtle dot-grid pattern with blue glow blob behind screenshot

### Section 2: SOCIAL PROOF BAR

4 animated counter stats:
- "200+ Reps" (Boundless scale)
- "$50M+ Managed" (total platform GMV)
- "15min → Quote" (time-to-quote reduction)
- "Zero Spreadsheets" (replacement metric)

### Section 3: PROBLEM SECTION

**Headline:** "Your Merch Business Runs on Spreadsheets, Email, and Prayer."
Pain cards:
1. "Quoting takes hours" — manually looking up blank costs, calculating decoration, formatting proposals
2. "Clients wait 48 hours" — for a quote that competitors send in minutes
3. "Orders lost in email" — artwork in Gmail, quantities in spreadsheets, tracking in Salesforce
4. "Programs are unmanageable" — enterprise clients need portals you don't have
**Cost callout:** "The average merch company loses $180K/year to manual processes. Your spreadsheet is costing you six figures."

### Section 4: HOW IT WORKS (4 steps)

1. **Client Browses → Selects → Gets Instant Pricing** — Your catalog, your products, your pricing — calculated in real-time
2. **Project Flows into Your Pipeline** — Every request drops into a Kanban board you control
3. **Share a Client Portal** — One link: artwork upload, quantity confirmation, order approval
4. **Track Orders → Ship → Invoice** — From production to delivery, everything in one view

### Section 5: FEATURES (6 cards)

1. Quoting Engine — "Instant pricing from decorator matrices"
2. Project Pipeline — "Kanban boards built for merch workflows"
3. Client Portal — "White-labeled links your clients will love"
4. Programs Module — "Enterprise ordering at scale"
5. Commission Tracking — "Know your numbers in real-time"
6. Order Management — "From entry to shipment, never lose an order"

### Section 6: TESTIMONIALS (3)

1. Trevor Sarver, CEO 85 Supply — "I did $131K in my first 9 days at Boundless — all manually. If I'd had this platform, it would've been $300K."
2. Nick (Threadbird), CEO — "I told Trevor I'd pay $1,000 a month just for this. Nobody in the industry has anything close."
3. Derek (Mentor), Former CEO Touchstone ($120M) — "If you build this, you'll disrupt the entire promotional products industry. CommonSkew, Liftoff — none of them are thinking this way."

### Section 7: PRICING

| Plan | Price | For |
|---|---|---|
| Starter | $99/mo | Solo operators, 1 user, 50 products, basic quoting |
| Professional | $499/mo | Teams of 2-10, unlimited products, programs, client portals |
| Enterprise | $1,499/mo | Multi-location, white-label, Salesforce integration, dedicated support |

### Section 8: FINAL CTA

**Headline:** "Stop Running Your Merch Company from a Spreadsheet."
**CTA:** "Start Your Free Trial — No Credit Card Required"
**Trust:** "Backed by 85 Supply • Built for the $12B promo products industry • Your data, your ownership"

### Section 9: FOOTER

Standard footer with links, social, copyright. "Built by the team behind Invisible Pipeline."

---

## 11. Key Technical Notes for Build

### Quoting Engine Logic (CRITICAL)

The quoting engine is the heart of the platform. Here's exactly how it calculates:

```
For each line item in a project:
  1. Get blank_cost from product's BlankCost array based on total_quantity
  2. For each decoration location:
     a. Look up decorator_matrix by method
     b. Find tier matching total_quantity
     c. Get price for color_count from tier
     d. Sum all decoration costs for this location
  3. Sum all add-on costs per unit
  4. unit_cost = blank_cost + total_decoration_cost + total_addon_cost
  5. unit_price = unit_cost / (1 - margin_percent/100)
  6. subtotal = unit_price × total_quantity

Project estimated_total = sum of all line item subtotals
```

**Example calculation:**
- Product: Gildan 5000 (blank cost at 100 qty = $3.50)
- Decoration 1: Front — Screen print, 2 colors (matrix: 100-249 qty, 2 colors = $3.25)
- Decoration 2: Back — Screen print, 1 color (matrix: 100-249 qty, 1 color = $2.50)
- Add-on: Puff ink ($0.50/unit)
- Margin: 35%
- Quantity: 150

```
unit_cost = $3.50 + $3.25 + $2.50 + $0.50 = $9.75
unit_price = $9.75 / (1 - 0.35) = $15.00
subtotal = $15.00 × 150 = $2,250.00
```

### Project → Order Parsing (Parent-Child)

When a project is confirmed, each line item spawns an individual order:
- Project "Jeremy's Concert" has 3 line items (t-shirts, hats, bags)
- Confirmation creates 3 separate orders: ORD-2026-0142, ORD-2026-0143, ORD-2026-0144
- Each order has its own status, tracking, and invoice
- Orders are tracked independently on the Order Kanban
- Project status reflects aggregate: "In Production" if ANY order is in production

### Client Portal Security

- Shareable links use UUID tokens (not sequential IDs)
- No authentication required to view (link = access)
- Client can: view products, upload artwork, enter quantities, approve orders, view tracking
- Client CANNOT: see margin/cost data, access admin features, view other projects
- All pricing shown is unit_price (client price), never unit_cost

### Programs Module (Enterprise)

Programs are a separate entity that CONTAINS projects:
- A program (e.g., "Progressive Insurance Polo Program") has locations, budgets, and allowed products
- Program orders are still individual projects within the platform
- Budget tracking: each order's total deducts from program budget
- Location-based ordering: each location has its own ship-to and budget allocation
- Approval workflows: orders over $X require admin approval before processing

### Demo Mode

All data runs through `getDemoOrReal<T>()` wrapper:
- `NEXT_PUBLIC_DEMO_MODE=true` → returns mock data
- `NEXT_PUBLIC_DEMO_MODE=false` → queries Supabase
- Demo data must be production-realistic (real product names, real pricing, real quantities)
- Demo toast notifications cycle messages about new projects, order updates, payment received

---

## 12. Build Priority Order

1. **Landing page** — First impression, SaaS marketing page
2. **Auth (login/signup)** — Standard Supabase auth
3. **Dashboard home** — Stats, pipeline summary, quick actions
4. **Product catalog (admin)** — Product database with categories, images, pricing
5. **Decorator matrices (admin)** — The pricing foundation
6. **Project pipeline (admin)** — Kanban board, the command center
7. **Project detail (admin)** — Quoting engine, line items, decorations, client link
8. **Client management (admin)** — CRM basics
9. **Client portal (public)** — Shareable project view with artwork upload
10. **Order tracking (admin)** — Kanban for individual orders
11. **Product catalog (public)** — Client-facing product browsing
12. **Project request (public)** — Multi-step submission wizard
13. **Programs module (admin)** — Enterprise ordering
14. **Commission dashboard** — Revenue reporting
15. **Analytics** — Pipeline insights
16. **Settings** — Team, integrations, configuration

---

*This document contains everything needed to build the BrandOps MVP via Bloom. The platform addresses a $8-12B industry with zero modern tooling, backed by insider connections to a $200-300M parent company and a network that includes $1.4B suppliers. Execute.*
