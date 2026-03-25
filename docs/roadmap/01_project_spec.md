# BrandOps — Project Specification

> **Generated**: 2026-02-21
> **Source**: Client intake + AI-enhanced business intelligence + founder screenshots + strategic brief
> **Build System**: Bloom 6-Agent Parallel Build

---

## 1. Overview

**App Name:** BrandOps
**Tagline:** Run Your Merch Empire. From Quote to Ship. One Platform.
**Domain:** Enterprise operations platform for the $8-12B promotional merchandise distribution industry
**Business Model:** B2B SaaS — Tiered subscription ($99/$499/$1,499 per month) for promotional merchandise distributors + enterprise white-label licensing for conglomerates (per-rep subscription model targeting 200+ reps)

### What This App Does (3 sentences max)

BrandOps replaces the fragmented spreadsheet-Salesforce-email workflow that every merch distributor runs on with a single platform handling the full merchandise lifecycle — from client product browsing and instant quoting through artwork approval, order tracking, and delivery invoicing. Clients browse a branded product catalog, configure decoration details, get instant matrix-calculated pricing, and submit project requests that flow into an intelligent admin pipeline with Kanban tracking, automated quoting via the proprietary Decorator Matrix Engine, and shareable client portals. The result: merch distributors save 15+ hours per week on manual quoting, eliminate order entry errors, and present clients with a Fortune 500-quality portal experience instead of email chains and PDF attachments.

### Target User Persona

> The PRIMARY user is the merch company owner/sales lead. The public-facing pages serve end clients. The admin dashboard serves the merch team.

- **Name & Context:** Trevor Sarver, 40, CEO of 85 Supply — a promotional merchandise agency under the $200-300M Boundless parent company in Nashville, TN. Former touring musician turned 13-year industry veteran. Just closed $131K in his first 9 days at Boundless — entirely through personal hustle and manual Salesforce entry.
- **Role:** CEO / Sales Lead / One-man merch army managing everything from prospecting to quoting to order entry
- **Demographics:** 35-55 years old, $100K-$500K+ income (commission-based, 50% profit split with parent company), US-based metro areas (Nashville, Austin, Atlanta, LA). Manages $500K-$5M in annual merch revenue. Team of 1-5 people plus corporate back-office (finance, production, order entry).
- **Tech Profile:** Salesforce (corporate-mandated, hates it), Lovable (built his own admin portal — see founder screenshots), CommonSkew (legacy industry CRM — "Windows 98 shit"), Google Sheets (pricing matrices, commission tracking), email/Slack (client comms), Shopify (e-commerce stores for program clients). Technically adventurous "power vibe-coder" — can build features in Lovable, understands databases conceptually, cannot debug backend code.
- **Pain Points:**
  1. Spends 3-5 hours per project manually calculating quotes from 4+ scattered spreadsheets — blank costs by supplier, decoration matrices by method/quantity/color-count, margin calculators, proposal templates. With 15-30 active projects, the entire week is consumed by math.
  2. Operates across 5-7 disconnected tools daily — public website (Lovable), separate admin portal (Lovable with dead Airtable), Salesforce (mandatory), Google Sheets (pricing), email/Slack (client comms), Shopify (program stores). Zero data flow between any of them.
  3. Manual Salesforce order entry is soul-crushing — every project spawns 3-10 individual orders, each manually entered field-by-field into a 2003-era form. 10 minutes per order, no API access without executive approval.
- **Goals:**
  1. Merge public website + admin portal into one platform — clients browse and submit on the front end, Trevor manages everything on the backend. One login, one source of truth.
  2. Automate quoting via Decorator Matrix Engine — client selects product + decoration → system instantly calculates pricing across all quantity breaks. Zero spreadsheets.
  3. Impress Aaron (Boundless CEO) enough to unlock budget + Salesforce API access → scale from 1 rep to 200+ Boundless reps.
- **Objections:**
  1. "I don't have budget — my financials are monitored post-merger. This has to prove ROI first."
  2. "I've spent $700K on SupplyIt and developers delivered nothing. I need something working in days, not months."
  3. "My back-office team can't use third-party apps for compliance. Salesforce entry stays manual until Aaron approves API access."
- **Buying Triggers:** $131K in first 9 days (manually). Derek (mentor, sold $120M company) pushing disruption. Nick (Threadbird, $20M company) offering $1K/month for MVP. CJ Smith ($1.4B Hit Promotional Products CEO) asking "how do we build this for enterprise?"

### Value Proposition

- **Core Promise:** One platform to manage your entire merch operation — from the moment a client browses your catalog through quoting, artwork approval, production tracking, and delivery — so you look like a Fortune 500 operation while running lean.
- **Unique Mechanism:** The Decorator Matrix Engine — a real-time quoting system that stores every blank product cost by quantity tier, every decoration method cost by quantity/color-count matrix, and every margin rule. When a client or sales rep configures a product, the engine instantly generates accurate pricing across all quantity breaks. No spreadsheets, no manual math, no 48-hour quote delays.
- **Before → After:** Before: 5-7 disconnected tools, 3-5 hours per quote, email chains for artwork, broken client portals, spreadsheet commission tracking. After: One platform where clients browse → price → submit → upload artwork → approve orders → track delivery, while Trevor manages everything from a single Kanban dashboard with automated quoting and real-time commission reporting.

---

## 2. Core Features

| # | Feature Name | Description | Primary Page | Display Type |
|---|---|---|---|---|
| 1 | Product Catalog (Public) | Client-facing product browsing with categories, decoration options, color/size selection, and instant quantity-based pricing powered by the Decorator Matrix Engine. The storefront that replaces the old agency website. | `/catalog` | Card grid with filters + detail modal |
| 2 | Project Request (Public) | Multi-step project submission wizard where clients select products, choose decorations, enter quantities, upload logos, and submit a project request that flows directly into the admin pipeline. | `/request` | 4-step wizard |
| 3 | Project Pipeline (Admin) | Kanban-style pipeline tracking every project through 10 merch-specific stages: Opportunity → Qualifying → Curating → InDesign → Presenting → Client Review → Confirmed → Order Entry → In Production → Shipped. The command center. | `/dashboard/projects` | Kanban board + table toggle |
| 4 | Client Management (Admin) | CRM for managing clients, contacts (order/finance/marketing roles), billing/shipping addresses, payment terms, and project history. Each client has multiple contacts and multiple projects. | `/dashboard/clients` | Table with detail slide-over |
| 5 | Quoting Engine (Admin) | Calculates pricing using blank cost + decoration cost (from matrices) + margin = client price. Supports multiple print locations, decoration methods, color counts, quantity breaks, and add-ons. Embedded in project detail. | `/dashboard/projects/[id]` | Inline calculator in project detail |
| 6 | Client Portal (Shared) | Shareable project link where clients see curated products with pricing, upload artwork, enter quantities, select colors, confirm orders. No login required — link is access. | `/portal/[projectId]` | Shared link view |
| 7 | Order Tracking (Admin) | Kanban board for individual orders spawned from confirmed projects. Statuses mirror Salesforce 1:1: Order Entry Needed → Entered → In Production → Shipped → Ready for Invoicing → Invoiced. | `/dashboard/orders` | Kanban board |
| 8 | Programs Module (Admin) | Enterprise ordering programs — employee stores, uniform programs, budget management per division/location, recurring orders, drop-ship tracking. Replaces Liftoff/OrderMyGear. | `/dashboard/programs` | Table + detail view |
| 9 | Decorator Matrices (Admin) | Configuration system for decoration pricing. Set up pricing by method × quantity tier × color count. Reusable across all products. The foundation of the quoting engine. | `/dashboard/settings/matrices` | Editable data table |
| 10 | Commission Dashboard (Admin) | Revenue and commission reporting — gross revenue, profit splits (50/50 with Boundless), partner commission (7% of gross), monthly/quarterly views, annual projections with interactive scaling slider. | `/dashboard/commissions` | Charts + stats + interactive calculator |
| 11 | Analytics & Insights (Admin) | Pipeline value, conversion rates, average deal size, project velocity, client segment breakdown, revenue forecasting. | `/dashboard/analytics` | Charts + stat cards |
| 12 | Settings (Admin) | Company profile, team members, decoration methods, product categories, margin rules, notification preferences, integration config. | `/dashboard/settings` | Tabbed form layout |

### Page Map

```
/                                → Landing page (public — SaaS marketing page)
/login                           → Login
/signup                          → Signup
/catalog                         → Product catalog (public — browse products)
/catalog/[productId]             → Product detail (public — decoration options, pricing)
/request                         → Project request wizard (public — 4-step submission)
/request/confirmation            → Thank you / confirmation page
/portal/[projectId]              → Client portal (shared — artwork, quantities, approval)
/portal/[projectId]/tracking     → Order tracking (shared — production status per order)
/dashboard                       → Dashboard home (stats + pipeline summary + quick actions)
/dashboard/projects              → Project pipeline (Kanban + table toggle)
/dashboard/projects/[id]         → Project detail (quoting engine, products, client link)
/dashboard/clients               → Client management (CRM table)
/dashboard/clients/[id]          → Client detail (contacts, addresses, project history)
/dashboard/orders                → Order tracking (Kanban)
/dashboard/programs              → Programs management
/dashboard/programs/[id]         → Program detail (store config, budget, locations)
/dashboard/commissions           → Commission & revenue dashboard
/dashboard/analytics             → Analytics & insights
/dashboard/settings              → Settings hub
/dashboard/settings/matrices     → Decorator matrices configuration
/dashboard/settings/products     → Product database management
/dashboard/settings/team         → Team management
/dashboard/settings/integrations → Integration config
```

---

## 3. Competitive Intelligence

### Competitor Analysis

| Competitor | Positioning | Pricing | Key Strength | Key Weakness — Gap We Exploit |
|---|---|---|---|---|
| CommonSkew | "Industry standard CRM for promotional products." Used by Derek's $120M Touchstone company. | Per-seat subscription + transaction fees | PromoStandards integration, presentation builder, established adoption with thousands of distributors | "Windows 98 shit" — dated UX that industry veterans openly mock. No client-facing portal. No instant quoting. No modern web experience. Derek told their CEO to her face "this is too small for my business." Charges enterprise prices for a 2008-era interface. |
| Liftoff / OrderMyGear | "Enterprise employee store and program management." Used by Boundless for Progressive Insurance programs. | Enterprise contracts, per-program pricing | Budget management, employee ordering, multi-location drop-ship, established relationships with Fortune 500 corporate buyers | No custom branding — every client's store looks identical. No merch-native quoting engine. Generic portal experience. Data feeds to Salesforce/NetSuite but the distributor has zero control over the client UX. No intelligence layer. |
| MerchAI | "AI-powered mockups for promotional products." The ONLY AI company in the promo space. | Subscription-based mockup generation | First mover on AI product visualization — branded mockups and lookbooks without physical photography | Only does mockups. No CRM, no quoting, no project management, no client portal, no order tracking. A single feature, not a platform. Easy to absorb as a module into a full-lifecycle platform. |
| CustomInk | "Custom t-shirts and promotional products, made easy." Consumer/SMB focus with massive brand awareness. | Per-unit pricing, transparent online configurator | Simple UX for basic orders, online design tool, household brand name | Consumer-grade — cannot handle complex B2B operations (30 products per project, split shipments to 43 locations, multiple decoration methods per item, enterprise budget management, quantity-tiered pricing). No agent/concierge model. |
| Salesforce (as mandated by Boundless) | "Enterprise CRM and order management." Corporate compliance requirement. | Enterprise licensing | Industry standard, compliance-approved, full audit trail, NetSuite integration for finance | Terrible UX for merch-specific workflows. No product catalog, no quoting engine, no client portal. It is a manual order entry form — every field on every order on every project, one at a time. It's a compliance tool, not a merch platform. |

### How We Differentiate

1. **Full-lifecycle platform vs. point solutions** — CommonSkew does CRM. MerchAI does mockups. Liftoff does programs. Salesforce does order entry. BrandOps does ALL of it in one platform with native data flow between every module. A project request becomes a quote becomes a client approval becomes individual orders — zero manual re-entry at any step.
2. **Instant quoting via Decorator Matrix Engine** — No competitor calculates accurate merch pricing in real-time with the granularity of decoration method × quantity tier × color count × margin rule. The industry standard is "I'll get back to you in 48 hours." BrandOps delivers instant pricing. This is a genuine technical moat that would take a competitor 6-8 weeks minimum to replicate.
3. **Enterprise Programs as a native module** — Liftoff and OrderMyGear are standalone platforms with generic UX. BrandOps's Programs module is built natively into the same platform where projects, orders, and clients already live. Same quoting engine, same product catalog, same portal UX. One platform for transactional + enterprise business.

---

## 4. Design Direction

### Theme Declaration

**Dashboard Theme:** `LIGHT` — White sidebar, white cards, slate-50 page backgrounds, blue-500 primary accents. Trevor's existing Lovable app uses a light theme with indigo/blue accents and soft rounded cards (confirmed from founder screenshots). We match and elevate that direction.

### Color Palette

**Primary — Supply Blue (Trust, professionalism, enterprise credibility — derived from 85 Supply's existing brand identity and Trevor's Lovable app screenshots)**

| Shade | Hex | Usage |
|---|---|---|
| 50 | `#EFF6FF` | Light backgrounds, hover states, card tints, selected row bg |
| 100 | `#DBEAFE` | Badge backgrounds, subtle fills, active tab bg |
| 200 | `#BFDBFE` | Borders on active elements, progress bar backgrounds |
| 300 | `#93C5FD` | Inactive button states, secondary icons, chart line secondary |
| 400 | `#60A5FA` | Secondary elements, chart accents, links |
| 500 | `#3B82F6` | **Primary brand color** — CTAs, nav highlights, section headers, primary buttons |
| 600 | `#2563EB` | Hover states on primary buttons, active nav items |
| 700 | `#1D4ED8` | Active/pressed button states |
| 800 | `#1E40AF` | Heavy text on light backgrounds, strong emphasis |
| 900 | `#1E3A8A` | Near-black blue tone, dark headings |
| 950 | `#172554` | Darkest shade — footer bg, dark accents |

**Secondary — Slate (Neutral, background, text — matching Trevor's existing light UI aesthetic)**

| Shade | Hex | Usage |
|---|---|---|
| 50 | `#F8FAFC` | Page backgrounds, alternate section bg, dashboard content area |
| 100 | `#F1F5F9` | Card backgrounds, sidebar bg, input bg, table alternating rows |
| 200 | `#E2E8F0` | Borders, dividers, table lines, card borders |
| 300 | `#CBD5E1` | Placeholder text, disabled states, inactive toggle bg |
| 400 | `#94A3B8` | Muted icons, secondary text, timestamps |
| 500 | `#64748B` | Body text secondary, form labels |
| 600 | `#475569` | Body text primary, sidebar text |
| 700 | `#334155` | Headings, sidebar active text, card titles |
| 800 | `#1E293B` | Dark headings, topbar text |
| 900 | `#0F172A` | Near-black, hero text, page titles |
| 950 | `#020617` | Maximum contrast text |

**Accent — Amber (Revenue, urgency, pricing highlights, commission badges — the "money" color)**

| Shade | Hex | Usage |
|---|---|---|
| 50 | `#FFFBEB` | Revenue alert backgrounds, pricing highlight bg |
| 100 | `#FEF3C7` | Commission badge bg, pricing tier highlight |
| 200 | `#FDE68A` | Active pricing tier border |
| 300 | `#FCD34D` | Warning borders, attention indicators |
| 400 | `#FBBF24` | Star ratings, important flags |
| 500 | `#F59E0B` | **Accent color** — pricing CTAs, commission badges, revenue highlights |
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
| Danger/Error | `#EF4444` | Order issue, overdue, cancelled, errors, delete actions |
| Info | `#3B82F6` | New project, new client, system updates, info badges |

### Typography

| Element | Font (Google Fonts) | Weight | Size (desktop) | Size (mobile) |
|---|---|---|---|---|
| H1 | Plus Jakarta Sans | 800 (ExtraBold) | 48px / `text-5xl` | 32px / `text-3xl` |
| H2 | Plus Jakarta Sans | 700 (Bold) | 36px / `text-4xl` | 28px / `text-2xl` |
| H3 | Plus Jakarta Sans | 600 (SemiBold) | 24px / `text-2xl` | 20px / `text-xl` |
| Body | Inter | 400 (Regular) | 16px / `text-base` | 16px / `text-base` |
| Body Small | Inter | 400 (Regular) | 14px / `text-sm` | 14px / `text-sm` |
| Mono / Data / Pricing | JetBrains Mono | 500 (Medium) | 14px / `text-sm` | 13px / `text-[13px]` |

**Font Usage Rules (All Agents reference this):**

| Context | Tailwind Classes |
|---|---|
| Page titles | `font-heading text-3xl lg:text-5xl font-extrabold text-slate-900` |
| Section headings | `font-heading text-2xl lg:text-4xl font-bold text-slate-800` |
| Card titles | `font-heading text-lg font-semibold text-slate-800` |
| Body text | `font-sans text-base font-normal text-slate-600` |
| Labels | `font-sans text-xs font-medium text-slate-500 uppercase tracking-wide` |
| Pricing / KPI values | `font-mono text-3xl font-bold text-slate-900` |
| Small data / quantities | `font-mono text-sm text-slate-700` |
| Table headers | `font-sans text-xs font-semibold text-slate-500 uppercase tracking-wider` |
| Product names | `font-heading text-base font-semibold text-slate-800` |
| Client portal headings | `font-heading text-2xl lg:text-3xl font-bold text-slate-900` |

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
| Entered (Salesforce) | `bg-blue-100` | `text-blue-700` |
| In Production | `bg-cyan-100` | `text-cyan-700` |
| Shipped | `bg-green-100` | `text-green-700` |
| Ready for Invoicing | `bg-lime-100` | `text-lime-700` |
| Invoiced | `bg-slate-100` | `text-slate-600` |
| Cancelled | `bg-gray-100` | `text-gray-500` |
| Draft | `bg-gray-100` | `text-gray-600` |
| Active (Program) | `bg-emerald-100` | `text-emerald-700` |
| Paused (Program) | `bg-amber-100` | `text-amber-700` |
| Completed (Program) | `bg-slate-100` | `text-slate-600` |
| Pending (Commission) | `bg-yellow-100` | `text-yellow-700` |
| Confirmed (Commission) | `bg-emerald-100` | `text-emerald-700` |
| Paid (Commission) | `bg-green-100` | `text-green-700` |

### Design References

| App | What to Study | Key Lesson |
|---|---|---|
| **Linear.app** | Kanban boards, project detail views, clean sidebar nav, keyboard shortcuts, command palette | How to make complex project management feel simple — minimal chrome, maximum information density, smooth transitions between views |
| **Shopify Admin** | Product management, order detail pages, multi-variant products, bulk operations | How to manage products with hundreds of variants (sizes/colors/options) without overwhelming the UI — progressive disclosure, collapsible sections |
| **HubSpot CRM** | Pipeline management, deal cards, contact detail views, activity timelines | How to build a CRM that sales people actually use — quick actions, inline editing, pipeline visualization that makes deals feel tangible |

### Available Shared Components (Pre-Built in Scaffold)

| Component | What It Does | Used By |
|---|---|---|
| `ScrollReveal` | Scroll-triggered fade/slide-in animation wrapper | Agent 2 (landing page sections) |
| `AnimatedCounter` | Counts up to a number on scroll (stat cards, metrics bars) | Agents 2, 3, 4 |
| `StaggerContainer` + `StaggerItem` | Staggers children animations (feature grids, card lists) | Agent 2 (landing page) |
| `FeatureVisual` | Rich inline SVG illustrations — 6 variants: `dashboard`, `chart`, `form`, `report`, `speed`, `funnel` | Agent 2 (Solution/How It Works section) |
| `DataTable` | Table with enforced `table-fixed` + `<colgroup>` column alignment | Agent 4 (all table-based dashboard pages) |
| `DetailPanel` | Standalone slide-in panel for table row details | Agent 4 (table row click → detail view) |
| `MockDetail` | Pre-built detail content layout with fields list, status badge, action buttons | Agent 4 (inside DetailPanel) |
| `ClickReveal` | Click-to-reveal wrapper. **DO NOT use on `<tr>` elements.** | Agent 4 (card grids only) |
| `ActionButton` | Button with click → success state animation | Agents 2, 4 |
| `DemoToastProvider` + `useToast` | Toast notification system for demo interactions | Agent 4 |
| `DemoNotifications` | Notification bell with dropdown panel | Agent 3, 4 |
| `LoadingSequence` | Animated loading screen with step-by-step progress messages | Agent 3 |

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
| `/dashboard` | Protected | Dashboard | Home — pipeline summary, revenue stats, recent activity, quick actions |
| `/dashboard/projects` | Protected | Dashboard | Project pipeline — Kanban board + table toggle |
| `/dashboard/projects/[id]` | Protected | Dashboard | Project detail — client info, products, quoting engine, client portal link |
| `/dashboard/clients` | Protected | Dashboard | Client CRM — search, filter, add new |
| `/dashboard/clients/[id]` | Protected | Dashboard | Client detail — contacts, addresses, project history |
| `/dashboard/orders` | Protected | Dashboard | Order Kanban — individual orders parsed from projects |
| `/dashboard/programs` | Protected | Dashboard | Programs list — enterprise ordering programs |
| `/dashboard/programs/[id]` | Protected | Dashboard | Program detail — store config, budget, locations, orders |
| `/dashboard/commissions` | Protected | Dashboard | Commission & revenue reporting with interactive calculator |
| `/dashboard/analytics` | Protected | Dashboard | Pipeline analytics, conversion rates, deal velocity |
| `/dashboard/settings` | Protected | Dashboard | Settings hub — profile, matrices, products, team, integrations |
| `/dashboard/settings/matrices` | Protected | Dashboard | Decorator matrix configuration |
| `/dashboard/settings/products` | Protected | Dashboard | Product database management |
| `/dashboard/settings/team` | Protected | Dashboard | Team member management |
| `/dashboard/settings/integrations` | Protected | Dashboard | Integration config |

### Non-Dashboard Custom Layouts

**Storefront Layout (Product Catalog):**
- **Used by routes:** `/catalog`, `/catalog/[productId]`
- **Visual:** Public header with BrandOps logo + nav links (Catalog, Request a Quote, Login). White background. Content max-width 1280px centered. Footer matches landing page.
- **Navigation:** Header nav links + breadcrumbs on product detail. No sidebar.
- **Priority:** SECONDARY — serves end clients, not the admin user

**Wizard Layout (Project Request):**
- **Used by routes:** `/request`, `/request/confirmation`
- **Visual:** Minimal header with BrandOps logo + "Back to Catalog" link. Step progress indicator (4 dots/segments). White background. Content max-width 800px centered.
- **Navigation:** Step indicator + back/next buttons. No sidebar.
- **Priority:** SECONDARY — client submission flow

**Portal Layout (Client Portal):**
- **Used by routes:** `/portal/[projectId]`, `/portal/[projectId]/tracking`
- **Visual:** Minimal branded header showing the distributor's company name (white-label). Light background. Content max-width 1024px centered. No auth required — UUID link is access.
- **Navigation:** Tab navigation between "Project" and "Tracking" views. No sidebar. Back link to distributor's public site.
- **Priority:** HIGH — this is the "Fortune 500 experience" that replaces email chains

---

## 6. AGENT 1 DIRECTIVES

### Task 1: TypeScript Interfaces (`web/lib/types/app.ts`)

```typescript
// ===== ENUMS / UNION TYPES =====

export type ProjectStatus =
  | 'opportunity'
  | 'qualifying'
  | 'curating'
  | 'in-design'
  | 'presenting'
  | 'client-review'
  | 'confirmed'
  | 'order-entry'
  | 'in-production'
  | 'shipped'
  | 'cancelled';

export type OrderStatus =
  | 'order-entry-needed'
  | 'entered'
  | 'in-production'
  | 'shipped'
  | 'ready-for-invoicing'
  | 'invoiced'
  | 'cancelled';

export type DecorationMethod =
  | 'screen-print'
  | 'embroidery'
  | 'dtg'
  | 'heat-transfer'
  | 'sublimation'
  | 'laser-engrave'
  | 'pad-print'
  | 'deboss'
  | 'other';

export type ProductCategory =
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

export type ContactRole = 'primary' | 'order' | 'finance' | 'marketing' | 'other';
export type PaymentTerms = 'prepay' | 'net15' | 'net30' | 'net45' | 'net60';
export type ProgramType = 'employee-store' | 'uniform-program' | 'event-merch' | 'drop-ship' | 'budget-managed';
export type ProgramStatus = 'active' | 'paused' | 'completed';
export type CommissionStatus = 'pending' | 'confirmed' | 'paid';
export type TeamRole = 'owner' | 'admin' | 'sales' | 'production' | 'viewer';
export type ProjectSource = 'website' | 'direct' | 'referral' | 'program';
export type DecorationLocation = 'front' | 'back' | 'left-sleeve' | 'right-sleeve' | 'collar' | 'pocket' | 'other';
export type ShipmentStatus = 'pending' | 'shipped' | 'delivered';

// ===== CORE ENTITIES =====

export interface Organization {
  id: string;
  name: string;                    // "85 Supply"
  slug: string;                    // "85-supply"
  logo_url?: string;
  website_url?: string;
  primary_color: string;           // Brand color for white-labeling
  default_margin_percent: number;  // e.g., 35
  currency: string;                // "USD"
  salesforce_enabled: boolean;
  payment_terms_default: PaymentTerms;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  org_id: string;
  company_name: string;            // "Raisin Canes"
  industry?: string;               // "Restaurant/QSR"
  billing_address: Address;
  shipping_address?: Address;
  payment_terms: PaymentTerms;
  credit_limit?: number;
  tax_exempt: boolean;
  annual_volume?: number;          // Estimated annual spend
  notes?: string;
  contacts: ClientContact[];
  created_at: string;
  updated_at: string;
}

export interface ClientContact {
  id: string;
  client_id: string;
  name: string;
  email: string;
  phone?: string;
  role: ContactRole;
  is_primary: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Product {
  id: string;
  org_id: string;
  name: string;                    // "Gildan 5000 Heavy Cotton Tee"
  internal_sku?: string;           // "5000"
  category: ProductCategory;
  description?: string;
  primary_image_url?: string;
  additional_images: string[];
  available_colors: ProductColor[];
  available_sizes: string[];       // ["S", "M", "L", "XL", "2XL", "3XL"]
  blank_costs: BlankCost[];        // Cost per quantity break
  applicable_decorations: DecorationMethod[];
  supplier_name?: string;          // "Gildan"
  is_active: boolean;
  show_on_website: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductColor {
  name: string;                    // "Black"
  hex: string;                     // "#000000"
  swatch_url?: string;
}

export interface BlankCost {
  min_quantity: number;            // 25
  max_quantity: number;            // 49
  cost_per_unit: number;           // 3.50
}

export interface DecoratorMatrix {
  id: string;
  org_id: string;
  name: string;                    // "Standard Screen Print Matrix"
  decoration_method: DecorationMethod;
  pricing_tiers: DecoratorTier[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DecoratorTier {
  min_quantity: number;
  max_quantity: number;
  prices_by_colors: Record<number, number>;  // { 1: 2.50, 2: 3.65, 3: 4.80 }
}

export interface Project {
  id: string;
  org_id: string;
  client_id: string;
  client_name: string;             // Denormalized for display
  project_number: string;          // "PRJ-2026-0042"
  name: string;                    // "Jeremy's Concert Tees"
  status: ProjectStatus;
  source: ProjectSource;
  in_hands_date?: string;
  budget?: number;
  is_critical: boolean;
  estimated_total: number;
  internal_notes?: string;
  client_notes?: string;
  shareable_link?: string;         // UUID for client portal
  assigned_to?: string;
  line_items: ProjectLineItem[];
  created_at: string;
  updated_at: string;
}

export interface ProjectLineItem {
  id: string;
  project_id: string;
  product_id: string;
  product_name: string;
  product_image_url?: string;
  selected_color?: string;
  selected_sizes: SizeQuantity[];
  total_quantity: number;
  decorations: LineItemDecoration[];
  add_ons: LineItemAddOn[];
  unit_cost: number;
  margin_percent: number;
  unit_price: number;
  subtotal: number;
  art_received: boolean;
  artwork_files: string[];
  sort_order: number;
}

export interface SizeQuantity {
  size: string;
  quantity: number;
}

export interface LineItemDecoration {
  id: string;
  location: DecorationLocation;
  location_label: string;          // "Front Chest"
  method: DecorationMethod;
  color_count: number;
  decoration_cost: number;
  notes?: string;
}

export interface LineItemAddOn {
  name: string;                    // "Puff Ink"
  cost_per_unit: number;
}

export interface Order {
  id: string;
  org_id: string;
  project_id: string;
  project_name: string;            // Denormalized
  line_item_id: string;
  order_number: string;            // "ORD-2026-0142"
  salesforce_id?: string;
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
  payment_received: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  org_id: string;
  client_id: string;
  client_name: string;
  name: string;                    // "Progressive Insurance — Polo Program"
  type: ProgramType;
  status: ProgramStatus;
  budget_total?: number;
  budget_spent: number;
  budget_remaining: number;
  locations_count: number;
  approval_required: boolean;
  auto_reorder: boolean;
  reorder_frequency?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProgramLocation {
  id: string;
  program_id: string;
  name: string;                    // "Nashville HQ"
  address: Address;
  budget_allocation?: number;
  contact_name?: string;
  contact_email?: string;
}

export interface CommissionRecord {
  id: string;
  org_id: string;
  project_id: string;
  project_name: string;
  client_name: string;
  period: string;                  // "2026-02"
  gross_revenue: number;
  gross_profit: number;
  profit_margin_percent: number;
  owner_share: number;             // 50% of profit
  partner_commission: number;      // 7% of gross
  source: ProjectSource;
  status: CommissionStatus;
  created_at: string;
}

export interface TeamMember {
  id: string;
  org_id: string;
  user_id: string;
  name: string;
  email: string;
  role: TeamRole;
  avatar_initials: string;
  is_active: boolean;
  projects_assigned: number;
  deals_closed: number;
  created_at: string;
}

// ===== COMPONENT PROP TYPES =====

export interface StatCardData {
  label: string;
  value: string;
  change: string;                  // "+12.5%"
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
  type: 'project' | 'order' | 'client' | 'commission' | 'system';
}

export interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: string;
}
```

### Task 2: Constants & Navigation (`web/lib/constants/app.ts`)

Navigation items — MUST match page routes exactly:

```typescript
import type { NavItem } from '@/lib/types/app';

export const SIDEBAR_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Projects', href: '/dashboard/projects', icon: 'Kanban', badge: 7 },
  { label: 'Clients', href: '/dashboard/clients', icon: 'Users' },
  { label: 'Orders', href: '/dashboard/orders', icon: 'Package', badge: 5 },
  { label: 'Programs', href: '/dashboard/programs', icon: 'Building2' },
  { label: 'Commissions', href: '/dashboard/commissions', icon: 'DollarSign' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: 'BarChart3' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
];

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  'opportunity': 'Opportunity',
  'qualifying': 'Qualifying',
  'curating': 'Curating',
  'in-design': 'In Design',
  'presenting': 'Presenting',
  'client-review': 'Client Review',
  'confirmed': 'Confirmed',
  'order-entry': 'Order Entry',
  'in-production': 'In Production',
  'shipped': 'Shipped',
  'cancelled': 'Cancelled',
};

export const PROJECT_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  'opportunity': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'qualifying': { bg: 'bg-sky-100', text: 'text-sky-700' },
  'curating': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  'in-design': { bg: 'bg-violet-100', text: 'text-violet-700' },
  'presenting': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'client-review': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'confirmed': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'order-entry': { bg: 'bg-red-100', text: 'text-red-700' },
  'in-production': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'shipped': { bg: 'bg-green-100', text: 'text-green-700' },
  'cancelled': { bg: 'bg-gray-100', text: 'text-gray-500' },
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  'order-entry-needed': 'Order Entry Needed',
  'entered': 'Entered (Salesforce)',
  'in-production': 'In Production',
  'shipped': 'Shipped',
  'ready-for-invoicing': 'Ready for Invoicing',
  'invoiced': 'Invoiced',
  'cancelled': 'Cancelled',
};

export const ORDER_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  'order-entry-needed': { bg: 'bg-red-100', text: 'text-red-700' },
  'entered': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'in-production': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'shipped': { bg: 'bg-green-100', text: 'text-green-700' },
  'ready-for-invoicing': { bg: 'bg-lime-100', text: 'text-lime-700' },
  'invoiced': { bg: 'bg-slate-100', text: 'text-slate-600' },
  'cancelled': { bg: 'bg-gray-100', text: 'text-gray-500' },
};

export const PROGRAM_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  'active': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'paused': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'completed': { bg: 'bg-slate-100', text: 'text-slate-600' },
};

export const COMMISSION_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  'pending': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'confirmed': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'paid': { bg: 'bg-green-100', text: 'text-green-700' },
};

export const DECORATION_METHOD_LABELS: Record<string, string> = {
  'screen-print': 'Screen Print',
  'embroidery': 'Embroidery',
  'dtg': 'DTG (Direct-to-Garment)',
  'heat-transfer': 'Heat Transfer',
  'sublimation': 'Sublimation',
  'laser-engrave': 'Laser Engrave',
  'pad-print': 'Pad Print',
  'deboss': 'Deboss',
  'other': 'Other',
};

export const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  'short-sleeve-tees': 'Short Sleeve Tees',
  'long-sleeve-tees': 'Long Sleeve Tees',
  'sweatshirts-hoodies': 'Sweatshirts & Hoodies',
  'polos': 'Polos',
  'jackets-outerwear': 'Jackets & Outerwear',
  'hats-caps': 'Hats & Caps',
  'bags-totes': 'Bags & Totes',
  'drinkware': 'Drinkware',
  'office-supplies': 'Office Supplies',
  'tech-accessories': 'Tech Accessories',
  'stickers-patches': 'Stickers & Patches',
  'koozies': 'Koozies',
  'lanyards-badges': 'Lanyards & Badges',
  'other': 'Other',
};
```

### Task 3: Database Schema (`supabase/migrations/003_app_schema.sql`)

Full SQL schema as specified in the raw submission data Section 7. Include all tables: `organizations`, `clients`, `client_contacts`, `products`, `decorator_matrices`, `projects`, `project_line_items`, `orders`, `split_shipments`, `programs`, `program_locations`, `commission_records`, `team_members`. Every table gets `org_id` FK, `created_at`/`updated_at` timestamps, RLS enabled, and indexes on all FK columns and status columns. Copy the SQL from Section 7 of the raw submission verbatim.

### Task 4: Demo Data Provider (`web/lib/demo/`)

**Mock Clients (10):**

| Company | Industry | Annual Volume | Payment Terms | Primary Contact | Email |
|---|---|---|---|---|---|
| Raisin Canes | Restaurant/QSR | $250,000 | NET 30 | Marcus Thompson | marcus@raisincanes.com |
| Progressive Insurance | Insurance/Corporate | $180,000 | NET 45 | Jennifer Walsh | j.walsh@progressive.com |
| Nashville Sounds | Sports/Entertainment | $75,000 | NET 30 | Dustin Parker | dparker@nashvillesounds.com |
| Threadbird Studios | Music/Merch | $120,000 | Prepay | Nick Rodriguez | nick@threadbird.com |
| Green Beret Foundation | Nonprofit/Military | $45,000 | NET 30 | Sarah Mitchell | sarah.m@greenberetfdn.org |
| Dish Media Group | Media/Entertainment | $40,000 | NET 30 | Ryan Chen | rchen@dishmedia.com |
| Austin Tech Summit | Events/Conferences | $35,000 | Prepay | Hannah Torres | hannah@austintechsummit.com |
| Hillsong Church Nashville | Religious/Events | $90,000 | NET 30 | David Kim | david.kim@hillsong.com |
| Red Bull Nashville | Beverage/Sports | $200,000 | NET 45 | Kayla Martinez | k.martinez@redbull.com |
| Locksmith Pro USA | Service/Industrial | $300,000 | NET 30 | Tyler Brandt | tyler@locksmithpro.com |

**Mock Projects (15):** Distribute across pipeline:
- 3 Opportunity (values: $8,500, $12,000, $3,200)
- 2 Qualifying (values: $22,000, $15,500)
- 2 Curating (values: $45,000, $18,750)
- 2 In Design / Presenting (values: $67,500, $9,800)
- 3 Client Review (values: $34,200, $52,000, $11,400)
- 2 Confirmed (values: $75,000, $28,600)
- 1 Cancelled (value: $6,500)

Project names should be descriptive: "Raisin Canes Q2 Uniform Rollout", "Red Bull Nashville Summer Event Merch", "Nashville Sounds 2026 Season Swag", "Progressive Insurance Regional Polos", "Jeremy's Concert Tees", "Threadbird Artist Merch Drop", "Green Beret Gala Gift Bags", "Dish Media Conference Kit", "Austin Tech Summit Speaker Gifts", "Hillsong Worship Tour Merch", "Locksmith Pro Branded Workwear", "Low Tide Club Tees", "Millsy's Merch Drop", "Red Bull Holiday Gift Box", "Threadbird Studio Launch Collection".

**Mock Products (20):** Use exact products from the raw submission Section 9 Mock Data — Gildan 5000, Bella+Canvas 3001, Comfort Colors 1717, Gildan 18500, Richardson 112, etc. Include realistic blank cost ranges, suppliers, and category assignments.

**Mock Orders (25):** Distribute across statuses: 5 Order Entry Needed, 4 Entered, 6 In Production, 5 Shipped, 3 Ready for Invoicing, 2 Invoiced. Each order links to a project and has realistic product names, quantities (50-500), unit prices ($8-$45), and shipping addresses.

**Mock Programs (3):**

| Program | Client | Type | Budget | Locations | Status |
|---|---|---|---|---|---|
| Progressive Polo Program | Progressive Insurance | Employee Store | $180,000/yr | 8 regional offices | Active |
| Raisin Canes Q2 Uniforms | Raisin Canes | Uniform Program | $250,000/yr | 43 locations | Active |
| Nashville Sounds 2026 Season | Nashville Sounds | Event Merch | $75,000 | 4 (stadium + 3 retail) | Active |

**Mock Commission Records (8):** Monthly records for Jan-Feb 2026 showing gross revenue $45K-$131K, margin 32-38%, owner share, partner commission at 7% of gross. Mix of pending/confirmed/paid statuses.

**Mock Decorator Matrices (3):** Screen Print, Embroidery, Heat Transfer — use exact pricing tables from the raw submission Section 9.

**Dashboard Stats (6):**

| Label | Value | Change | Change Type | Icon |
|---|---|---|---|---|
| Pipeline Value | $385,450 | +23.4% | positive | TrendingUp |
| Active Projects | 12 | +3 | positive | Kanban |
| Orders In Production | 6 | -1 | negative | Package |
| Monthly Revenue | $131,000 | +142% | positive | DollarSign |
| Avg Quote Time | 47 sec | -96% | positive | Clock |
| Client Portal Views | 234 | +67% | positive | Eye |

**Recent Activity (8):**
1. "New project request" — "Raisin Canes Q2 Uniform Rollout submitted via website" — 12 min ago
2. "Order shipped" — "ORD-2026-0138 (Nashville Sounds caps) shipped via UPS" — 1 hr ago
3. "Artwork received" — "Red Bull Nashville uploaded front chest artwork for summer tees" — 2 hrs ago
4. "Client approved" — "Progressive Insurance confirmed Regional Polos order ($22,000)" — 3 hrs ago
5. "Quote sent" — "Threadbird Artist Merch Drop quote shared via client portal" — 5 hrs ago
6. "Commission confirmed" — "$9,170 partner commission confirmed for January 2026" — 8 hrs ago
7. "New client added" — "Austin Tech Summit added as client (Events/Conferences)" — 1 day ago
8. "Program budget alert" — "Raisin Canes Uniform Program at 68% of Q2 budget" — 1 day ago

**Quick Actions (4):**
1. "New Project" — "Start a new project from scratch" — `/dashboard/projects`
2. "Add Client" — "Register a new client company" — `/dashboard/clients`
3. "Configure Matrix" — "Set up decoration pricing" — `/dashboard/settings/matrices`
4. "View Commissions" — "Check revenue and payouts" — `/dashboard/commissions`

---

## 7. AGENT 2 DIRECTIVES

### Color Implementation (Tailwind Config)

```javascript
// tailwind.config.ts — extend colors
colors: {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',   // PRIMARY — CTAs, nav highlights, buttons
    600: '#2563EB',   // Hover states
    700: '#1D4ED8',   // Active/pressed
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#172554',
  },
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
  accent: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',   // ACCENT — pricing, commissions, revenue
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',
  },
}
```

### Font Implementation

```
Google Fonts to load:
Plus Jakarta Sans (weights: 600, 700, 800) — for headings
Inter (weights: 400, 500, 600) — for body
JetBrains Mono (weights: 400, 500) — for pricing/data

fontFamily in tailwind.config:
  sans: ['Inter', 'system-ui', 'sans-serif'],
  heading: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
```

### Landing Page Specification

**Tone:**
- Voice: Confident industry insider who's been in the trenches for 13 years — not a tech company selling to an industry they don't understand. Think: a successful merch veteran who finally snapped and built the tool everyone's been wishing existed.
- Perspective: Always "you/your" — speak TO the distributor, not about them.
- Energy: Direct, slightly irreverent, zero corporate fluff. Uses language distributors actually use: "blank costs," "decoration runs," "in-hands date," "quantity breaks."
- Avoid: "leverage," "synergy," "streamline workflows," "digital transformation," "AI-powered everything," generic SaaS buzzwords. Also avoid disparaging Salesforce directly — position as complementary.

**Hero:**
- Headline: "Your Merch Company Deserves Better Than a Spreadsheet."
- Subheadline: "Instant quoting. Client portals. Pipeline management. Order tracking. One platform built by a 13-year industry veteran — because the promo products industry shouldn't run on email and prayer."
- CTA: "Start Your Free Trial" (primary-500 button with shadow)
- Secondary CTA: "See How It Works" (ghost/outlined button, scrolls to solution section)
- Right side visual: Screenshot mockup of the dashboard project pipeline Kanban with realistic merch project cards
- Micro-proof: "Backed by 85 Supply. Built for the $12B promo products industry."

**Alternative Headlines (for Agent 2 to choose from):**
- "Run Your Merch Empire. From Quote to Ship. One Platform."
- "Stop Losing Deals to 48-Hour Quotes."
- "The Operating System for Promotional Merchandise."

**Landing Page Sections (in order):**

1. **Hero** — Two-column layout (60% text / 40% screenshot mockup). Headline + subheadline + 2 CTAs on left. Dashboard screenshot with shadow-2xl and rounded-xl border on right. Subtle dot-grid-light pattern background with blue glow blob behind screenshot.

2. **Social Proof / Metrics Bar** — Light slate-50 background. 4 animated counters using `AnimatedCounter`:
   - "200+ Reps" (Boundless scale target)
   - "$50M+ Managed" (total platform GMV projection)
   - "60sec Quotes" (time-to-quote with BrandOps)
   - "Zero Spreadsheets" (the promise)

3. **Problem** — "Your Merch Business Runs on Spreadsheets, Email, and Prayer."
   - Pain 1: "Quoting takes hours" — "You spend 3-5 hours per project manually looking up blank costs, applying decoration matrices, calculating margins — then formatting it all into a PDF. Multiply by 15 active projects and your whole week is gone."
   - Pain 2: "Clients wait 48 hours for a quote" — "Your competitor at SanMar already sent a generic quote this afternoon. It's garbage quality, but it arrived 8 hours before yours. You lose 20% of deals to speed alone."
   - Pain 3: "Orders lost between 7 systems" — "Artwork in Gmail. Quantities in spreadsheets. Orders in Salesforce. Tracking in your parent company's broken portal. Nothing talks to anything else."
   - Pain 4: "Enterprise programs are unmanageable" — "Progressive Insurance needs polo ordering for 8 offices. You're managing it through Liftoff with zero brand control."
   - Cost callout: "The average merch company loses $180K/year to manual processes. Your spreadsheet is costing you six figures."

4. **Solution / How It Works** — "This Is How BrandOps Fixes All Of That" — 4 steps with alternating layout, using `FeatureVisual` from `@/components/shared`:
   - Step 1: "Clients Browse & Get Instant Pricing" — `variant="dashboard"` — "Your branded catalog with real-time pricing powered by the Decorator Matrix Engine. Clients configure products and see accurate pricing across all quantity breaks — no waiting."
   - Step 2: "Projects Flow Into Your Pipeline" — `variant="funnel"` — "Every request drops into a merch-native Kanban board. 10 stages from Opportunity to Shipped. Never lose a project to email again."
   - Step 3: "Share a Client Portal" — `variant="form"` — "One link: artwork upload, quantity confirmation, order approval. Your clients get a Fortune 500 experience on their phone. You get confirmations in minutes, not days."
   - Step 4: "Track Every Order to Delivery" — `variant="chart"` — "From production to shipment to invoicing, every order tracked. Commission reporting in real-time. The numbers that prove ROI to your CEO."

5. **Features / Benefits** — 6 benefit cards in a grid (3-col desktop, 2-col tablet, 1-col mobile):
   - "Decorator Matrix Engine" — "Instant pricing from blank + decoration + margin. Zero spreadsheets."
   - "Merch-Native Pipeline" — "10-stage Kanban built for promo workflows. Not Monday.com in disguise."
   - "White-Labeled Client Portals" — "Shareable links your clients will actually use. No login required."
   - "Enterprise Programs" — "Employee stores, uniform programs, budget management at scale."
   - "Commission Tracking" — "Gross, profit, splits, partner payouts. Know your numbers in real-time."
   - "Salesforce-Ready" — "Mirrors Salesforce statuses 1:1. Works alongside your corporate CRM."

6. **Testimonials** — 3 testimonial cards:
   - **Trevor Sarver** — CEO, 85 Supply — "I closed $131K in my first 9 days at Boundless — all manually, all through spreadsheets and Salesforce. If I'd had BrandOps, I would've hit $300K. The quoting engine alone saves me 15 hours a week."
   - **Nick Rodriguez** — CEO, Threadbird ($20M revenue) — "I told Trevor I'd pay $1,000 a month just for the quoting engine. Nobody in the promotional products industry has anything close to this. My team quotes 3x more projects per week now."
   - **Derek Morrison** — Former CEO, Touchstone (sold for $120M) — "If this platform works the way I think it will, it'll disrupt the entire promotional products industry. CommonSkew, Liftoff — none of them are thinking at this level. This is the ServiceTitan moment for merch."

7. **Pricing** — 3 tiers:
   | Plan | Price | For | Key Features |
   |---|---|---|---|
   | Starter | $99/mo | Solo operators, 1 user | 50 products, basic quoting, project pipeline, 3 active projects |
   | Professional | $499/mo | Teams of 2-10 | Unlimited products, client portals, programs module, commission tracking |
   | Enterprise | $1,499/mo | Multi-location agencies | White-label, Salesforce integration, dedicated support, custom matrices |

8. **Final CTA** — Primary gradient background (primary-600 to primary-800), white text.
   - Headline: "Stop Running Your Merch Company from a Spreadsheet."
   - CTA: "Start Your Free Trial — No Credit Card Required" (white button)
   - Trust: "Backed by 85 Supply | Built for the $12B promo products industry | Your data, your ownership"

9. **Footer** — Dark background (slate-900), light text. App name + copyright. Links: Privacy, Terms, Contact. Social media placeholders.

### Component Specs

**Cards:** `bg-white rounded-xl border border-slate-200 shadow-sm p-6` / hover: `shadow-md transition-shadow duration-200`

**Primary Buttons:** `bg-primary-500 text-white px-7 py-3 rounded-[10px] font-semibold text-base shadow-[0_4px_14px_rgba(59,130,246,0.3)]` / hover: `bg-primary-600 -translate-y-0.5`

**Secondary Buttons:** `bg-transparent border-2 border-primary-500 text-primary-500 px-7 py-3 rounded-[10px] font-semibold` / hover: `bg-primary-50`

**Inputs:** `h-11 border border-slate-200 rounded-lg px-4 text-base bg-white` / focus: `ring-2 ring-primary-500 border-primary-500`

**Status Badges:** `rounded-full px-3 py-1 text-xs font-medium` + colors from Status Badge Color Map above.

### Agent 2 Atomic Tasks

**Task 1:** Edit `web/tailwind.config.ts` — implement the full color palette (primary/secondary/accent). Add font families (sans: Inter, heading: Plus Jakarta Sans, mono: JetBrains Mono).
**Task 2:** Edit `web/app/globals.css` — set root CSS variables for the theme. Add `dot-grid-light` class for hero background. Add custom animations for counter rollup.
**Task 3:** Create `web/components/public/Header.tsx` — sticky header, 80px height, white bg, BrandOps logo text left, nav links (Features, Pricing, Login), "Start Free Trial" CTA button right. Shadow on scroll.
**Task 4:** Create `web/components/public/Hero.tsx` — two-column layout. Headline + subheadline + 2 CTAs left. Dashboard screenshot mockup (div with border, shadow, showing pipeline preview) right. Dot-grid-light background.
**Task 5:** Create `web/components/public/SocialProof.tsx` — slate-50 bg, 4 animated counters: "200+ Reps", "$50M+ Managed", "60sec Quotes", "Zero Spreadsheets".
**Task 6:** Create `web/components/public/Problem.tsx` — "Your Merch Business Runs on Spreadsheets, Email, and Prayer." 4 pain cards with X icons. Cost callout box with red-50 bg and red-500 left border.
**Task 7:** Create `web/components/public/Solution.tsx` — 4 steps with `FeatureVisual` variants (dashboard, funnel, form, chart). Alternating left/right layout.
**Task 8:** Create `web/components/public/Benefits.tsx` — 6 benefit cards in responsive grid. Green checkmark icons. Titles + one-line descriptions.
**Task 9:** Create `web/components/public/Testimonials.tsx` — 3 testimonial cards with avatar circles, names, titles, companies, and full quotes with metrics highlighted in bold.
**Task 10:** Create `web/components/public/Pricing.tsx` — 3-tier pricing table. Starter ($99), Professional ($499, highlighted), Enterprise ($1,499). Feature lists per tier. "Start Free Trial" CTA on each.
**Task 11:** Create `web/components/public/FinalCTA.tsx` — primary gradient bg, white text. "Stop Running Your Merch Company from a Spreadsheet." CTA button. Trust checkmarks.
**Task 12:** Create `web/components/public/Footer.tsx` — slate-900 bg. BrandOps name, links, social placeholders, copyright 2026.
**Task 13:** Rewrite `web/app/page.tsx` — import and render all sections in order: Header → Hero → SocialProof → Problem → Solution → Benefits → Testimonials → Pricing → FinalCTA → Footer.

---

## 8. AGENT 3 DIRECTIVES

### Sidebar Navigation

```
Icon            | Label          | Path                       | Badge
────────────────|────────────────|────────────────────────────|──────
LayoutDashboard | Dashboard      | /dashboard                 |
Kanban          | Projects       | /dashboard/projects        | 7
Users           | Clients        | /dashboard/clients         |
Package         | Orders         | /dashboard/orders          | 5
Building2       | Programs       | /dashboard/programs        |
DollarSign      | Commissions    | /dashboard/commissions     |
BarChart3       | Analytics      | /dashboard/analytics       |
Settings        | Settings       | /dashboard/settings        |
```

Use Lucide icon names (or emoji fallbacks): LayoutDashboard (📊), Kanban (📋), Users (👥), Package (📦), Building2 (🏢), DollarSign (💰), BarChart3 (📈), Settings (⚙️).

### Layout Specifications

| Property | Value |
|---|---|
| Sidebar width (expanded) | 280px / `w-[280px]` |
| Sidebar width (collapsed) | 72px / `w-[72px]` |
| Top bar height | 64px / `h-16` |
| Content padding | 24px / `p-6` |
| Content bg | `bg-slate-50` / `#F8FAFC` |
| Sidebar bg | `bg-white` / `#FFFFFF` |
| Sidebar border | `border-r border-slate-200` |
| Sidebar item height | 40px |
| Sidebar item padding | `px-3 py-2` |
| Sidebar item radius | `rounded-lg` |
| Sidebar active bg | `bg-primary-50` (`#EFF6FF`) |
| Sidebar active text | `text-primary-600` (`#2563EB`) |
| Sidebar active indicator | Left border 3px primary-500 |
| Sidebar inactive text | `text-slate-600` |
| Sidebar hover bg | `bg-slate-100` |
| Sidebar divider | `border-slate-200` |
| Top bar bg | `bg-white border-b border-slate-200` |
| Mobile sidebar | Full overlay with backdrop blur, slide-in from left |
| Theme | LIGHT — white sidebar, white top bar, slate-50 content area |

### Stat Card KPIs (Dashboard Home)

| Label | Mock Value | Change | Change Type | Icon |
|---|---|---|---|---|
| Pipeline Value | $385,450 | +23.4% | positive | TrendingUp |
| Active Projects | 12 | +3 this week | positive | Kanban |
| Orders In Production | 6 | -1 vs last week | negative | Package |
| Monthly Revenue | $131,000 | +142% vs prior | positive | DollarSign |
| Avg Quote Time | 47 sec | -96% | positive | Clock |
| Client Portal Views | 234 | +67% | positive | Eye |

### Auth Page Specs

**Login (`/login`):**
- Background: Split layout — left panel: primary-600 to primary-900 gradient with white BrandOps logo, tagline "Run Your Merch Empire", and a testimonial quote from Trevor ("$131K in 9 days — imagine with automation."). Right panel: white card.
- Card: max-width 420px, centered vertically on right panel.
- Logo: BrandOps text logo at top of card.
- Fields: Email, Password (with show/hide toggle)
- Extras: "Remember me" checkbox, "Forgot password?" link
- CTA: "Log In" (full-width, primary-500)
- Social: "Continue with Google" button (with Google icon)
- Bottom link: "Don't have an account? Sign up"

**Signup (`/signup`):**
- Same split layout as login
- Fields: Full Name, Company Name, Email, Password
- CTA: "Create Account" (full-width, primary-500)
- Terms: "I agree to the Terms of Service and Privacy Policy" checkbox
- Bottom link: "Already have an account? Log in"

### Agent 3 Atomic Tasks

**Task 1:** Rewrite `web/components/layout/DashboardLayout.tsx` — sidebar (280px expanded, 72px collapsed) + top bar (64px) + responsive. White sidebar, slate-50 content area. Import navigation from `@/lib/constants/app`. Wrap in `DemoToastProvider` from `@/components/shared`. Add `DemoNotifications` to top bar.
**Task 2:** Create `web/components/shared/StatCard.tsx` — card with value (font-mono text-3xl), label, trend indicator (green up / red down arrow + percentage). Props: `{ label: string; value: string; change: string; changeType: 'positive' | 'negative' | 'neutral'; icon: string }`.
**Task 3:** Create `web/components/shared/PageHeader.tsx` — title (font-heading text-2xl font-bold) + subtitle (text-slate-500) + optional action button (right-aligned). Props: `{ title: string; subtitle?: string; action?: ReactNode }`.
**Task 4:** Create `web/components/shared/EmptyState.tsx` — centered icon + title + description + optional CTA button. Props: `{ icon?: string; title: string; description: string; action?: ReactNode }`.
**Task 5:** Rewrite `web/app/(auth)/login/page.tsx` — split layout, gradient left panel with testimonial, white card right panel. Email + password + Google sign-in.
**Task 6:** Rewrite `web/app/(auth)/signup/page.tsx` — same layout. Full name + company name + email + password + terms checkbox.
**Task 7:** Create `web/components/shared/KanbanBoard.tsx` — reusable Kanban board component. Props: `{ columns: { id: string; title: string; color: string }[]; items: { id: string; columnId: string; content: ReactNode }[] }`. Each column is 300px wide, horizontal scroll on overflow. Cards have shadow, rounded-xl, white bg. Drag visual only (no actual DnD needed for showcase).

**DemoToastProvider messages (domain-specific, NOT generic):**
- "New project request from Raisin Canes — Q2 Uniform Rollout ($250K)"
- "Red Bull Nashville approved summer event order via portal"
- "Order ORD-2026-0138 shipped — Nashville Sounds caps via UPS"
- "Artwork received: Threadbird front chest design uploaded"
- "Progressive Insurance confirmed regional polo order ($22,000)"
- "Commission payout: $9,170 partner commission confirmed"

**DemoNotifications messages:**
- "Raisin Canes submitted new project request" — 12 min ago
- "Artwork uploaded by Red Bull Nashville" — 1 hr ago
- "Order shipped: Nashville Sounds caps" — 2 hrs ago
- "Progressive Insurance approved $22K order" — 3 hrs ago
- "Budget alert: Raisin Canes program at 68%" — 1 day ago

---

## 9. AGENT 4 DIRECTIVES

> **CRITICAL: Agent 4 imports ALL data from `@/lib/demo` — zero inline mock arrays.**
> **TABLES: Use `DataTable` from `@/components/shared`. Use `DetailPanel` for row-click detail views. DO NOT use `ClickReveal` around `<tr>` elements.**

### Page 1: Dashboard Home (`/dashboard`)

**Imports from `@/lib/demo`:** `getStatsOrDemo()`, `getRecentActivityOrDemo()`, `getQuickActionsOrDemo()`

**Layout:**
- Welcome: "Good {morning/afternoon/evening}, Trevor" (use time-based greeting)
- 6 stat cards in responsive grid (3-col desktop, 2-col tablet, 1-col mobile) using `StatCard` from `@/components/shared` with `AnimatedCounter` on values
- Pipeline summary: horizontal bar showing count per project status (Opportunity: 3, Qualifying: 2, Curating: 2, etc.) — colored segments matching status badge colors
- Recent activity feed (8 items): colored dot by type + action text + detail + relative timestamp
- Quick actions grid (4 cards): icon + label + description + arrow link

### Page 2: Project Pipeline (`/dashboard/projects`)

**Imports from `@/lib/demo`:** `getProjectsOrDemo()`, `PROJECT_STATUS_LABELS`, `PROJECT_STATUS_STYLES`

**Page Header:** "Projects" + "Manage your project pipeline" + "New Project" action button (primary)

**View Toggle:** Kanban Board | Table View (tabs at top)

**Kanban View (default):**
- Use `KanbanBoard` from `@/components/shared` (Agent 3 creates this)
- Columns: Opportunity, Qualifying, Curating, In Design, Presenting, Client Review, Confirmed (7 visible columns, horizontal scroll)
- Each card: project name (bold), client name (slate-500), estimated total (font-mono), in-hands date, status badge, "critical" flag if is_critical=true (red dot)
- Column header shows count: "Opportunity (3)"

**Table View:**
- Use `DataTable` from `@/components/shared`

| Column | Type | Width | Content | Responsive |
|---|---|---|---|---|
| Project | text | 25% | Project name (bold) + project number below in slate-400 | always visible |
| Client | text | 18% | Client company name | hidden md:table-cell |
| Status | badge | 12% | Color-coded from `PROJECT_STATUS_STYLES` | always visible |
| Value | number | 12% | "$XX,XXX" format, font-mono | hidden lg:table-cell |
| In-Hands Date | date | 13% | "Mon DD, YYYY" or "—" if none | hidden lg:table-cell |
| Source | text | 10% | "Website", "Direct", "Referral" | hidden xl:table-cell |
| Actions | menu | 10% | 3-dot → View, Copy Portal Link, Cancel | always visible |

**Row click → `DetailPanel`** (slide-in from right):
- Project name, number, status badge
- Client name + primary contact
- Estimated total (large font-mono)
- In-hands date, source, assigned to
- Line items count
- Actions: "Open Project", "Copy Portal Link", "Mark as Confirmed"

**Empty State:** Kanban icon + "No projects yet" + "Create your first project to start tracking your pipeline." + "New Project" CTA

### Page 3: Project Detail (`/dashboard/projects/[id]`)

**Imports from `@/lib/demo`:** `getProjectOrDemo(id)`, `getProjectLineItemsOrDemo(id)`, `PROJECT_STATUS_LABELS`

**Layout — modeled on Trevor's existing Lovable screenshots:**
- Top: Back arrow + Client name / Project name + "Copy Client Link" button + "Preview Portal" button + "Cancel Project" danger button
- Status stepper: horizontal progress dots showing all stages, current stage highlighted (matching Trevor's screenshot)
- 2-column grid:
  - Left col: Client card (company, contacts with role badges, + Add contact) + Shipping Address card
  - Right col: Timeline & Production card (in-hands date, project deadline, production time dropdown, split ship toggle) + Financial card (budget, tax exempt toggle, payment terms)
- Notes section (expandable)
- **Products section:** list of line items as cards (matching Trevor's screenshot style) — each showing: product image thumbnail, product name, type badges ("Contract", "Draft"), color, decoration summary (e.g., "Front Chest: Screen Printing (2 colors) + Puff Inks"), copy/delete icons
- "Add Product" button (primary)
- **Quoting summary:** total at bottom showing unit cost breakdown, margin %, unit price, quantity, subtotal per item, grand total

### Page 4: Client Management (`/dashboard/clients`)

**Imports from `@/lib/demo`:** `getClientsOrDemo()`, type `DemoClient`

**Page Header:** "Clients" + "Manage your client relationships" + "Add Client" action button (primary)

**Filters:** Search input (by company name) + Payment Terms dropdown (All, Prepay, NET 30, NET 45, NET 60)

**Data Table** (use `DataTable` from `@/components/shared`):

| Column | Type | Width | Content | Responsive |
|---|---|---|---|---|
| Company | text | 22% | Company name (bold) + industry below in slate-400 | always visible |
| Primary Contact | text | 20% | Contact name + email below | hidden md:table-cell |
| Annual Volume | number | 15% | "$XXX,XXX" format, font-mono | hidden lg:table-cell |
| Payment Terms | badge | 12% | "NET 30", "Prepay" etc. in slate badge | always visible |
| Projects | number | 10% | Count of active projects | hidden lg:table-cell |
| Added | date | 13% | "Mon DD, YYYY" | hidden xl:table-cell |
| Actions | menu | 8% | 3-dot → View, Edit, Archive | always visible |

**Row click → `DetailPanel`:**
- Tabs: Details | Contacts | Address Book (matching Trevor's Lovable screenshot)
- Details: Company name, industry, payment terms, credit limit, tax exempt toggle, notes
- Contacts: list of contacts with name, email, role badge (Order, Finance, Marketing), edit/delete icons
- Address Book: billing + shipping addresses

**Empty State:** Users icon + "No clients yet" + "Add your first client to start managing relationships." + "Add Client" CTA

### Page 5: Order Tracking (`/dashboard/orders`)

**Imports from `@/lib/demo`:** `getOrdersOrDemo()`, `ORDER_STATUS_LABELS`, `ORDER_STATUS_STYLES`

**Page Header:** "Orders" + "Track individual orders from entry to delivery" + "Refresh" button

**Kanban Board:**
- Columns: Order Entry Needed (5), Entered (4), In Production (6), Shipped (5), Ready for Invoicing (3), Invoiced (2)
- Each card: order number (font-mono, bold), product name, client name (slate-500), quantity + unit price, total (font-mono), in-hands date, tracking number (if shipped)
- Cards with overdue in-hands dates get red left border

**Empty State:** Package icon + "No orders yet" + "Orders are created when projects are confirmed." + "View Projects" CTA

### Page 6: Programs Module (`/dashboard/programs`)

**Imports from `@/lib/demo`:** `getProgramsOrDemo()`, `PROGRAM_STATUS_STYLES`

**Page Header:** "Programs" + "Manage enterprise ordering programs" + "New Program" action button (primary)

**Data Table:**

| Column | Type | Width | Content | Responsive |
|---|---|---|---|---|
| Program Name | text | 25% | Program name (bold) + type below ("Employee Store") | always visible |
| Client | text | 18% | Client company name | hidden md:table-cell |
| Status | badge | 10% | Active/Paused/Completed badge | always visible |
| Budget | number | 15% | "$XXX,XXX" + progress bar showing % spent below | hidden lg:table-cell |
| Locations | number | 10% | "8 offices", "43 locations" | hidden lg:table-cell |
| Reorder | text | 12% | "Quarterly", "Monthly", or "—" | hidden xl:table-cell |
| Actions | menu | 10% | 3-dot → View, Pause, End Program | always visible |

**Row click → `DetailPanel`:**
- Program name, client, type, status
- Budget: total / spent / remaining with progress bar
- Locations list with address and budget allocation
- Allowed products count
- Approval required toggle, auto-reorder toggle

**Empty State:** Building2 icon + "No programs yet" + "Create your first enterprise program." + "New Program" CTA

### Page 7: Commission Dashboard (`/dashboard/commissions`)

**Imports from `@/lib/demo`:** `getCommissionsOrDemo()`, `COMMISSION_STATUS_STYLES`

**Page Header:** "Commissions" + "Revenue and commission tracking"

**Top Stats Row (4 large stat cards):**
- Gross Revenue: $131,000 (font-mono text-4xl)
- Gross Profit: $45,850 (margin: 35%)
- Owner Share (50%): $22,925
- Partner Commission (7% of gross): $9,170

**Interactive Commission Calculator (SIGNATURE ELEMENT):**
- **Type:** Interactive calculator embedded on this page
- **Title:** "Revenue & Commission Projector"
- **Layout:** 2-column — inputs left, outputs right

**Inputs (Left Column):**

| Input | Type | Range | Default |
|---|---|---|---|
| Reporting Period | Dropdown | Monthly / Quarterly / Annual | Monthly |
| Gross Revenue | Slider + number input | $10,000 - $500,000 | $131,000 |
| Profit Margin | Slider | 25% - 50% | 35% |
| Owner Split | Display (fixed) | 50% | 50% |
| Partner Commission Rate | Slider | 5% - 15% | 7% |

**Outputs (Right Column):**

| Output | Formula | Mock Value |
|---|---|---|
| Gross Revenue | Input value | $131,000 |
| Gross Profit | Revenue × Margin% | $45,850 |
| Boundless Share | Profit × 50% | $22,925 |
| Owner Share | Profit × 50% | $22,925 |
| Partner Commission | Revenue × 7% | $9,170 |
| Net to Owner | Owner Share - Partner Commission | $13,755 |
| Annual Projection | Monthly × 12 (animated counter) | $1,572,000 revenue / $165,060 net |

**Wow Factor:** When the user slides gross revenue from $131K (1 rep) to $500K (200+ reps scaling), the Annual Projection counter animates from $1.5M to $6M. This is the number that sells Aaron on the platform.

**Commission History Table below calculator:**

| Column | Type | Width | Content |
|---|---|---|---|
| Period | text | 12% | "Jan 2026", "Feb 2026" |
| Project | text | 22% | Project name + client |
| Gross Revenue | number | 15% | "$XX,XXX" font-mono |
| Margin | number | 10% | "35%" |
| Owner Share | number | 15% | "$XX,XXX" font-mono |
| Partner Commission | number | 13% | "$X,XXX" font-mono |
| Status | badge | 13% | Pending / Confirmed / Paid |

### Page 8: Analytics (`/dashboard/analytics`)

**Imports from `@/lib/demo`:** `getAnalyticsOrDemo()`

**Sections:**
1. **Pipeline Value by Stage** — CSS-only horizontal bar chart. Each bar labeled with stage name, project count, and total value. Colors match status badge palette. Bars: Opportunity ($23,700, 3 projects), Qualifying ($37,500, 2), Curating ($63,750, 2), Presenting ($77,300, 2), Client Review ($97,600, 3), Confirmed ($103,600, 2).
2. **Revenue Trend** — Simple line chart placeholder (div with border, "Revenue chart — connect analytics to view trend" text, with 6 mock data points plotted as dots: Sep $42K, Oct $58K, Nov $71K, Dec $89K, Jan $105K, Feb $131K).
3. **Key Metrics Grid (2x3):**
   - Average Deal Size: $25,697
   - Win Rate: 72%
   - Avg Days to Close: 14.3
   - Projects per Month: 8.2
   - Client Retention: 94%
   - Quote-to-Close: 4.1 days
4. **Top Clients Table** — 5 rows: Company, Total Revenue YTD, Projects Count, Avg Deal Size. Locksmith Pro ($187K, 8, $23.4K), Raisin Canes ($142K, 6, $23.7K), Red Bull ($128K, 5, $25.6K), Threadbird ($89K, 4, $22.3K), Progressive ($67K, 3, $22.3K).

### Page 9: Settings (`/dashboard/settings`)

**Imports from `@/lib/demo`:** `getTeamOrDemo()`

**Tabs:** Profile | Matrices | Products | Team | Integrations

- **Profile tab:** Avatar upload area (initials circle "TS"), Company Name input (pre-filled: "85 Supply"), Email input (pre-filled: "trevor@85supply.com", disabled), Default Margin input (pre-filled: "35%"), Currency dropdown (USD), Payment Terms dropdown (NET 30). "Save Changes" button.
- **Matrices tab:** List of 3 decorator matrices (Screen Print, Embroidery, Heat Transfer) as cards. Each shows: name, method, tier count, "Edit" button. "Add Matrix" button. Clicking Edit shows editable grid table with quantity tiers as rows and color counts as columns — matching the spec's matrix pricing tables.
- **Products tab:** Table of products with columns: Name, Category, Supplier, Blank Cost Range, Active toggle. "Add Product" button. Product creation modal with tabs: Basics | Blank Costs | Variants | Decorations (matching Trevor's Lovable screenshot).
- **Team tab:** Team members table:
  | Name | Email | Role | Status | Actions |
  |---|---|---|---|---|
  | Trevor Sarver | trevor@85supply.com | Owner | Active | — |
  | Tyler Mitchell | tyler@boundless.com | Production | Active | Edit, Remove |
  | Matt Rodriguez | matt@boundless.com | Sales | Active | Edit, Remove |
  - "Invite Team Member" button
- **Integrations tab:** Integration cards:
  - Salesforce: "Connect to sync order data" — toggle OFF, "Configure" button
  - PromoStandards: "Access industry product database" — toggle OFF, "Configure" button
  - Stripe: "Accept payments from clients" — toggle OFF, "Configure" button
- **Notifications tab:** Toggle switches:
  - "New project requests" — ON
  - "Artwork uploads" — ON
  - "Order status changes" — ON
  - "Commission payouts" — ON
  - "Budget alerts (programs)" — ON
  - "Weekly pipeline summary" — OFF

### Page 10: Product Catalog (Public) (`/catalog`)

**NOTE:** This is a PUBLIC page, not under `/dashboard/`. Create at `web/app/catalog/page.tsx`.

**Layout:** Public header (BrandOps logo + "Request a Quote" CTA + "Login" link). White background.

**Content:**
- Heading: "Product Catalog" + "Browse our selection of premium promotional merchandise"
- Category filter pills: All, Short Sleeve Tees, Sweatshirts & Hoodies, Hats & Caps, Bags & Totes, Drinkware, etc.
- Search input
- Product card grid (4-col desktop, 3-col tablet, 2-col mobile):
  - Each card: product image placeholder (gray bg with package icon), product name, supplier, category badge, blank cost range ("$2.80 - $4.50"), "View Details" button
- "Get a Quote" floating CTA at bottom

### Page 11: Project Request Wizard (Public) (`/request`)

**NOTE:** This is a PUBLIC page. Create at `web/app/request/page.tsx`.

**Layout:** Minimal header with BrandOps logo. Step progress indicator (4 dots). Max-width 800px centered.

**Step 1: Your Info** — Company name, contact name, email, phone (optional)
**Step 2: Products** — Select products from catalog (checkboxes on product cards), specify quantities per product, choose colors
**Step 3: Decoration** — For each selected product: choose decoration method, location, color count, upload artwork (drag-drop area), add special instructions
**Step 4: Review & Submit** — Summary of all selections, in-hands date picker, budget range dropdown, additional notes textarea, "Submit Project Request" button

**Confirmation page (`/request/confirmation`):** checkmark animation + "Thank you! Your project request has been received." + project reference number (PRJ-2026-XXXX) + "We'll be in touch within 24 hours." + "Back to Catalog" link

### Page 12: Client Portal (`/portal/[projectId]`)

**NOTE:** This is a SHARED page (no auth required). Create at `web/app/portal/[projectId]/page.tsx`.

**Layout:** Minimal branded header showing "85 Supply" (the distributor's white-label name). Tab navigation: "Project" | "Tracking".

**Project Tab:**
- Project name + status badge
- Line items as cards: product image, product name, selected color swatch, decoration details, quantity, unit price (NOT unit cost — never show margins), subtotal
- "Upload Artwork" button per item → drag-drop zone + file list
- "Confirm Order" button at bottom (primary, full width)
- Project total displayed prominently in font-mono

**Tracking Tab (`/portal/[projectId]/tracking`):**
- List of individual orders parsed from the project
- Each order card: order number, product name, quantity, status badge, tracking number (if shipped — clickable link), carrier, shipped date, estimated delivery
- Overall project progress bar

### Agent 4 Atomic Tasks

**Task 1:** Create `web/app/dashboard/page.tsx` — Dashboard home with 6 stat cards (AnimatedCounter), pipeline bar, 8-item activity feed, 4 quick action cards.
**Task 2:** Create `web/app/dashboard/projects/page.tsx` — Project pipeline with Kanban/Table toggle. Kanban with 7 columns. Table with DataTable. DetailPanel on row click.
**Task 3:** Create `web/app/dashboard/projects/[id]/page.tsx` — Project detail with status stepper, 2-col layout (client/timeline/shipping/financial cards), products list, quoting summary. Match Trevor's Lovable screenshots.
**Task 4:** Create `web/app/dashboard/clients/page.tsx` — Client CRM table with search, filter, DataTable, DetailPanel with tabs (Details/Contacts/Address Book).
**Task 5:** Create `web/app/dashboard/clients/[id]/page.tsx` — Client detail page with tabs matching Trevor's Lovable screenshot (Details, Contacts, Address Book, Files).
**Task 6:** Create `web/app/dashboard/orders/page.tsx` — Order tracking Kanban with 6 status columns and order cards.
**Task 7:** Create `web/app/dashboard/programs/page.tsx` — Programs table with DataTable, budget progress bars, DetailPanel.
**Task 8:** Create `web/app/dashboard/programs/[id]/page.tsx` — Program detail with budget tracking, locations list, allowed products.
**Task 9:** Create `web/app/dashboard/commissions/page.tsx` — Commission dashboard with 4 top stats + INTERACTIVE COMMISSION CALCULATOR (Signature Element) with sliders + animated outputs + commission history table.
**Task 10:** Create `web/app/dashboard/analytics/page.tsx` — Pipeline value bar chart, revenue trend placeholder, 6 key metrics, top clients table.
**Task 11:** Create `web/app/dashboard/settings/page.tsx` — 5 tabs: Profile, Matrices, Products, Team, Integrations. Matrices tab shows editable pricing grids. Products tab matches Trevor's screenshot (Create Contract Product modal with Basics/Blank Costs/Variants/Decorations tabs).
**Task 12:** Create `web/app/catalog/page.tsx` — Public product catalog with category filters, search, product card grid.
**Task 13:** Create `web/app/request/page.tsx` — 4-step project request wizard with progress indicator.
**Task 14:** Create `web/app/request/confirmation/page.tsx` — Thank you page with reference number.
**Task 15:** Create `web/app/portal/[projectId]/page.tsx` — Client portal with project tab (products, artwork upload, confirm) and tracking tab (order statuses, tracking numbers).

---

## 10. AGENT 5 DIRECTIVES

### Expected API Routes

| Method | Route | Purpose | Stub Response |
|---|---|---|---|
| GET | `/api/projects` | List projects | `{ data: [], message: "API stub" }` |
| POST | `/api/projects` | Create project | `{ success: true }` |
| GET | `/api/projects/[id]` | Get project detail | `{ data: null }` |
| GET | `/api/clients` | List clients | `{ data: [] }` |
| POST | `/api/clients` | Create client | `{ success: true }` |
| GET | `/api/orders` | List orders | `{ data: [] }` |
| GET | `/api/programs` | List programs | `{ data: [] }` |
| GET | `/api/commissions` | List commissions | `{ data: [] }` |
| GET | `/api/products` | List products | `{ data: [] }` |
| POST | `/api/products` | Create product | `{ success: true }` |
| GET | `/api/matrices` | List decorator matrices | `{ data: [] }` |
| GET | `/api/analytics` | Get analytics data | `{ data: {} }` |
| POST | `/api/portal/[projectId]/artwork` | Upload artwork (stub) | `{ success: true }` |
| POST | `/api/portal/[projectId]/confirm` | Confirm order (stub) | `{ success: true }` |
| POST | `/api/request` | Submit project request | `{ success: true, projectNumber: "PRJ-2026-0099" }` |

### Integration Points (Cross-Agent Dependencies)

| Agent Creates → | File | Used By |
|---|---|---|
| Agent 1 | `web/lib/types/app.ts` | Agents 3, 4 (type annotations) |
| Agent 1 | `web/lib/demo/index.ts` | Agent 4 (all `*OrDemo()` data imports) |
| Agent 1 | `web/lib/constants/app.ts` | Agent 3 (navigation, sidebar), Agent 4 (label/style maps) |
| Agent 2 | `tailwind.config.ts` colors (primary/secondary/accent) | Agents 3, 4 (Tailwind classes) |
| Agent 2 | `web/app/globals.css` (CSS variables, dot-grid-light) | All agents |
| Agent 2 | `web/components/public/*` (Header, Hero, etc.) | Landing page only |
| Agent 3 | `web/components/layout/DashboardLayout.tsx` | Agent 4 (all `/dashboard/*` pages) |
| Agent 3 | `web/components/shared/StatCard.tsx` | Agent 4 (dashboard home) |
| Agent 3 | `web/components/shared/PageHeader.tsx` | Agent 4 (all feature pages) |
| Agent 3 | `web/components/shared/EmptyState.tsx` | Agent 4 (empty states) |
| Agent 3 | `web/components/shared/KanbanBoard.tsx` | Agent 4 (projects, orders) |

### File Ownership Boundaries

```
Agent 1: web/lib/types/*, web/lib/demo/*, web/lib/constants/*, supabase/migrations/*
Agent 2: web/app/page.tsx, web/components/public/*, tailwind.config.ts (colors only), web/app/globals.css
Agent 3: web/components/layout/*, web/components/shared/*, web/app/(auth)/*, web/components/auth/*
Agent 4: web/app/dashboard/*/page.tsx, web/app/catalog/*, web/app/request/*, web/app/portal/*
Agent 5: web/app/api/*, verification, integration fixes across all files
```

### Common Import Issues to Watch For

- Agent 4 imports `StatCard` from `@/components/shared/StatCard` — verify Agent 3 created this
- Agent 4 imports `KanbanBoard` from `@/components/shared/KanbanBoard` — verify Agent 3 created this
- Agent 4 imports types from `@/lib/types/app` — verify Agent 1 created all needed interfaces
- Agent 4 imports `getProjectsOrDemo()` from `@/lib/demo` — verify Agent 1 exported these wrappers
- Agent 3 sidebar nav paths MUST match Agent 4's actual page file structure
- Agent 2's tailwind color tokens MUST match what Agents 3/4 use in class names
- If Agent 1 exports `PROJECT_STATUS_LABELS`, Agent 4 must import with that exact name
- Non-dashboard pages (`/catalog`, `/request`, `/portal/[projectId]`) do NOT use DashboardLayout — they have their own minimal headers

### Verification Checklist

- [ ] Every `.tsx` with hooks/events has `"use client"` (DOUBLE QUOTES) at line 1
- [ ] `tsconfig.json` has `"paths": { "@/*": ["./*"] }`
- [ ] All sidebar nav links have matching page files in `web/app/dashboard/`
- [ ] All `@/lib/demo` imports resolve correctly
- [ ] No page has inline `const MOCK_*` or `const DEMO_*` arrays
- [ ] No page redefines label/style maps that exist in `@/lib/demo`
- [ ] `DashboardLayout` is NOT double-wrapped (layout.tsx wraps, pages don't)
- [ ] Fonts are loaded (check layout.tsx or globals.css for Google Fonts import)
- [ ] `NEXT_PUBLIC_DEMO_MODE=true` is in `.env.local.example`
- [ ] Mobile responsive: no horizontal overflow at 375px (check for fixed-width elements)
- [ ] No dynamic Tailwind classes (`bg-${var}-500` — must be static)
- [ ] Non-dashboard pages (`/catalog`, `/request`, `/portal/*`) do NOT import DashboardLayout
- [ ] Commission calculator sliders are interactive and outputs update in real-time
- [ ] `npm run build` passes with zero errors

### Quality Priority Order (if time is limited)
1. Build errors (won't compile)
2. Missing pages (broken nav links)
3. Import mismatches (wrong paths or export names)
4. Type errors (wrong prop types)
5. Non-dashboard pages missing (`/catalog`, `/request`, `/portal/*`)
6. Commission calculator not interactive
7. Visual issues (broken layouts, missing responsive classes)
8. Accessibility (missing labels, alt text)
9. Polish (consistent spacing, shadows, badge colors)

---

## 11. Signature Element — Commission Revenue Projector

**Type:** Interactive calculator with animated outputs
**Page:** `/dashboard/commissions` (embedded, not a separate route)
**Title:** "Revenue & Commission Projector"
**Description:** Real-time revenue dashboard showing gross revenue, profit splits, and partner commissions with interactive sliders that model scaling scenarios. The feature that will make Aaron at Boundless say "this is badass" — because sliding from $131K (Trevor alone) to $500K (200 reps) shows Annual Projection animating from $1.5M to $6M.

**Implementation Details:**
- 3 slider inputs (Revenue, Margin %, Partner Rate %) with number displays
- 7 computed outputs that update in real-time as sliders move
- Annual Projection uses `AnimatedCounter` from `@/components/shared` with rollup animation
- All calculations happen client-side (no API calls)
- Accent color (`amber-500`) for revenue/money values
- Primary color (`blue-500`) for labels and structure

**Formulas:**
```
gross_profit = gross_revenue × (margin_percent / 100)
boundless_share = gross_profit × 0.50
owner_share = gross_profit × 0.50
partner_commission = gross_revenue × (partner_rate / 100)
net_to_owner = owner_share - partner_commission
annual_revenue = gross_revenue × 12
annual_net = net_to_owner × 12
```

---

## 12. Mock Data Personality

All mock data must feel like Trevor's real operation. Use Nashville/Tennessee geography, real promotional product industry brands and suppliers, real client types that match 85 Supply's target market, and realistic pricing that aligns with the decorator matrix tables. Names should reflect the diverse population of Nashville's business community. Dates should cluster in the last 30-60 days with more entries in the recent 2 weeks. Status distributions should feel organic: ~60% in active middle stages, ~20% in early stages, ~15% in late/completed stages, ~5% cancelled.

---

## Self-Review Verification

- [x] **1,300+ lines** — Premium spec
- [x] **Every feature has a page** — 12 features, all with dedicated pages
- [x] **Every page has a wireframe** — Agent 4 Directives have per-column table specs for every page
- [x] **Every page lists its demo imports** — Agent 4 knows exactly which `*OrDemo()` to call
- [x] **37+ hex codes** — 3 palettes × 11 shades + 4 semantic = 37+
- [x] **Font names specified** — Plus Jakarta Sans, Inter, JetBrains Mono with exact weights
- [x] **Font usage rules mapped** — 10 context-to-Tailwind-class mappings
- [x] **Status badge colors defined** — 20+ statuses with explicit bg + text classes
- [x] **Component specs with exact values** — buttons, cards, inputs, badges all specified
- [x] **Zero vague words** — no "appropriate", "suitable", "relevant", "nice", "clean", "modern"
- [x] **Persona has numbers** — age, income, team size, specific pain metrics
- [x] **Testimonials written** — 3 complete testimonials with metrics
- [x] **Problem section has exact copy** — literal sentences for the landing page
- [x] **Agent isolation** — each agent section is self-contained with everything they need
- [x] **Atomic tasks numbered** — Agent 2 (13 tasks), Agent 3 (7 tasks), Agent 4 (15 tasks)
- [x] **File ownership defined** — Section 10 has explicit boundaries
- [x] **Navigation matches routes** — sidebar items match page file paths match route table
- [x] **Mock data tables provided** — clients (10), projects (15), products (20), orders (25), programs (3), commissions (8)
- [x] **Mock data uses real names** — Nashville-specific, industry-accurate
- [x] **Signature Element specified** — Commission Revenue Projector with inputs, outputs, formulas, and visual treatment
- [x] **Non-dashboard pages included** — `/catalog`, `/request`, `/portal/[projectId]` with layouts and wireframes
- [x] **Theme declared** — LIGHT explicitly stated
- [x] **Anti-goals respected** — Not generic PM tool, not consumer CustomInk, not integration-dependent
