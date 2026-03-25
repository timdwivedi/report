# Creative Brief — BrandOps

## Design Intelligence (Source of Truth)

- **UI Style**: Clean Enterprise Data Platform + Professional Authority — Shopify Admin meets Linear meets HubSpot. Light theme, blue-dominant, data-dense, zero marketing fluff. Think: B2B operations dashboard designed by someone who's actually managed 30 projects simultaneously while manually calculating pricing in 4 spreadsheets. Flat surfaces with strategic depth on interactive elements, crisp borders, generous white space between high-density data sections. This is NOT a lifestyle app — it's a command center for running a merch empire.
- **Style Effects**: Minimal shadow depth (`shadow-sm` on cards, `shadow-lg` on hover with blue-tinted halo `rgba(59,130,246,0.08)`), sharp `rounded-xl` corners on cards (modern but not playful — NOT rounded-3xl), 1px borders in `border-slate-200`, blue inner-glow on active Kanban cards (`box-shadow: inset 0 0 0 2px rgba(59,130,246,0.15)`), subtle amber pulse on revenue/commission badges, no glassmorphism (this is a data tool, not a consumer app), transition durations 200ms (`transition-all duration-200`). Kanban cards lift with blue-tinted shadow on drag. Product cards in catalog have image zoom on hover. Pricing matrices use monospace fonts with column alignment via `table-fixed`.
- **Anti-Patterns for This Style**: NO purple gradients. NO dark mode landing page (B2B enterprise credibility = light, transparent, open). NO heavy blur effects anywhere. NO decorative illustrations that don't serve the workflow (use FeatureVisual SVGs sparingly). NO "motivational" copy. NO rounded-full buttons (use rounded-[10px] for enterprise feel). NO small body text under 16px (Trevor is 40 and managing dense data). NO overly playful animations (bounce, elastic) — keep it mechanical and confident.
- **Design System Reference**: No persisted MASTER.md — using spec-defined Supply Blue/Slate/Amber palette directly from 01_project_spec.md. Blue = trust and enterprise credibility (matches Trevor's existing 85 Supply brand + Lovable app he built). Amber = money, urgency, commissions. Slate = neutral data foundation.

---

## Visual Identity

- **Primary palette emphasis**: Supply Blue (#3B82F6) is the enterprise backbone — navigation, CTAs, section headers, active states, primary buttons, Kanban column headers, selected rows. It's professional credibility without corporate stuffiness. Blue says "this is a serious tool that handles real money." Use it confidently on primary actions — the "Add Project" button, the "Generate Quote" CTA, the "Confirm Order" action. Amber (#F59E0B) is the money color — revenue badges, commission highlights, pricing tier indicators, "high-value deal" flags, margin calculations. It's the visual heartbeat of "this is about profit." Use amber sparingly — max 2-3 elements per viewport, always tied to financial metrics. Slate neutrals ground everything — backgrounds, body text, borders, muted cards. Emerald (#10B981) signals success/shipped/paid. Red (#EF4444) for overdue/cancelled/errors.
- **Visual mood**: Professional command center with hustle energy — the visual equivalent of a sales rep who just closed $131K in 9 days and wants to scale to $1M/month. Data-forward, zero hype, zero fluff. Not corporate-stuffy (Trevor hates Salesforce's 2003-era forms), not startup-playful (this is a real business tool), not consumer-slick (this is B2B). Think: Shopify Admin's information density + Linear's smooth interactions + HubSpot's sales-focused clarity.
- **Animation style**: Confident mechanical reveals — sections slide up with purpose (`ease-out`), counters tick up with urgency (like a commission tracker updating), Kanban cards lift and drop with satisfying weight. NO bounce/elastic anywhere — this is precision tooling, not a game. Use `ease-out` for reveals, `ease-in-out` for counters and sliders. Progress bars fill left-to-right with authority. Toasts slide in from top-right like real system notifications. Everything says "this is a professional tool that moves fast because you move fast."
- **Typography pairing**: Headings: **Plus Jakarta Sans** (600, 700, 800) — modern geometric authority, warm but confident, great for data-heavy dashboards without feeling cold. Body: **Inter** (400, 500, 600) — industry-standard readability, neutral, professional. Data/Pricing/Quantities: **JetBrains Mono** (400, 500) — monospace precision for pricing matrices, quantity breaks, commission calculations, SKU numbers. This pairing reads like: sales dashboard (headings) + professional docs (body) + spreadsheet precision (mono).
- **Typography feel**: Modern enterprise with data precision — headings feel like dashboard section titles, body text reads like clear instructions, numbers look authoritative and technical (like they came from a real pricing engine, not a designer).

---

## Premium Depth Layers (Agent 2 MUST Apply All 4)

- **Layer 1 (Dot Grid)**: Hero section only — use `dot-grid-light` (blue-tinted dots, NOT white dots) because Hero has light background (`bg-gradient-to-br from-primary-50 via-white to-slate-50`). Also apply `dot-grid` (white dots) to Final CTA section which uses `bg-primary-900` dark background.
- **Layer 2 (Glow Blobs)**: Hero section: `bg-primary-500/[0.07]` blob top-right behind the product screenshot/dashboard mockup (w-[520px] h-[520px] blur-[140px]). Second blob: `bg-accent-500/[0.05]` bottom-left (w-[400px] h-[400px] blur-[120px]) to add warmth. Solution section (white bg): `bg-primary-500/[0.06]` blob center-right (w-[480px] h-[480px] blur-[130px]). Final CTA (dark blue bg): `bg-accent-500/[0.12]` blob center (w-[600px] h-[600px] blur-[160px]). All blobs: `absolute inset-0 pointer-events-none`.
- **Layer 3 (Noise Overlay)**: Wrap entire landing page `<main>` in `noise-overlay` class, all section content in `relative z-10`. This prevents the Blue→White gradients from looking flat/digital — adds organic texture that says "this is a real platform built by real operators, not a template."
- **Layer 4 (Content Depth)**: `card-depth` on ALL testimonial cards, feature cards, pricing cards, and Solution/How It Works section cards. `text-gradient-headline` on section H2 headings in Problem, Solution, Proof, and Final CTA sections. `h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent` divider between EVERY landing page section (more prominent than 20% opacity — this is data-section rhythm). `text-glow-primary` (blue glow) on the hero headline numbers only — e.g., "From **30+ hours/week** of manual quoting to **instant pricing**" (the "30+ hours/week" gets the glow to emphasize the pain).

---

## Signature Element — Quoting Time ROI Calculator

### What It Is
An ROI calculator that shows promotional merchandise distributors **exactly how much revenue they're losing every month from slow manual quoting** — and what instant automated quoting would unlock in deal velocity and closed revenue. This is NOT a generic time-savings calculator. This is a revenue engine diagnostic that quantifies the invisible cost of spreadsheet-based quoting: the deals lost to faster competitors, the hours burned on math instead of selling, the pipeline stalled waiting for pricing.

### Details

- **Type**: Revenue Leak / Time-to-Revenue ROI Calculator — "Quoting Speed Revenue Impact Calculator"
- **Page**: Dedicated page at `/calculator` — linked from the landing page Hero section as a secondary CTA: "Calculate Your Quoting Cost" (outline button in blue, below the main "Start Free Trial" CTA). Also linked from the Solution section: "See how much manual quoting is costing you."
- **Title**: "Quoting Speed Revenue Impact Calculator"
- **Tagline** (shown under title): "Find out exactly how much revenue you're losing to slow quoting — and what instant pricing would unlock."

### Inputs — Clean Left Column Form (7 Inputs)

**Average projects per month**
- Slider, range 5–100, default 20, step 5
- Helper text: "Active quote requests you handle monthly"

**Average deal value (£)**
- Slider, range £1,000–£50,000, default £8,500, step £500
- Helper text: "Typical project revenue when closed"

**Current close rate (%)**
- Slider, range 5%–50%, default 22%, step 1%
- Helper text: "Percentage of quotes that turn into confirmed orders"

**Hours per quote (manual)**
- Slider, range 0.5–8 hours, default 3.5, step 0.5
- Helper text: "Time spent calculating pricing from spreadsheets per project"

**Your hourly value (£)**
- Slider, range £20–£150, default £65, step £5
- Helper text: "What you'd charge for 1 hour of your sales/consulting time"

**Current time-to-quote**
- Dropdown: "Same day", "24 hours", "48 hours", "3-5 days", "1 week+" — default "48 hours"
- Helper text: "How long from request to delivered pricing"

**Lost deals to speed (monthly estimate)**
- Slider, range 0–20, default 3, step 1
- Helper text: "Projects where client chose a competitor who quoted faster"

### Output — Right Column, Prominent Result Cards (5 Cards)

**Card 1: "Quoting Labor Cost" (Red/Orange Warning)**
- Formula: `projects_per_month × hours_per_quote × hourly_value`
- Display as: `£X,XXX/mo` in `font-mono text-4xl font-bold text-red-600`
- Subtext: "Burned on manual pricing calculations instead of selling"
- Icon: Clock with currency symbol

**Card 2: "Deals Lost to Slow Quoting" (Red)**
- Formula: `lost_deals_to_speed × deal_value`
- Display as: `£XX,XXX/mo` in `font-mono text-4xl font-bold text-red-500`
- Subtext: "Revenue that went to competitors who quoted faster"
- Icon: Trending down arrow

**Card 3: "Pipeline Velocity Lost" (Amber Warning)**
- Formula: Calculate days-in-pipeline based on time-to-quote. Map "Same day" = 2 days, "24 hours" = 3 days, "48 hours" = 5 days, "3-5 days" = 7 days, "1 week+" = 10 days. Then: `pipeline_days × projects_per_month × 0.15` (15% conversion drag from each day of delay).
- Display as: `X.X days avg` in `font-mono text-3xl font-bold text-amber-600` + `£X,XXX/mo in stalled revenue` below
- Subtext: "Average time deals spend waiting for pricing"
- Icon: Hourglass

**Card 4: "With BrandOps Instant Quoting" (Emerald Success — Big Punchline)**
- Projected close rate: `current_close_rate + 8%` (industry data: instant quoting adds 6-10% close rate lift)
- Projected monthly revenue: `projects_per_month × deal_value × new_close_rate`
- Quoting time saved: `projects_per_month × hours_per_quote` hours/mo
- Time-to-quote: "10 minutes" (from Decorator Matrix Engine)
- Display metrics with green up-arrows comparing to current state
- Use emerald border `border-2 border-emerald-500` and subtle green glow `shadow-[0_0_20px_rgba(16,185,129,0.15)]`
- Icon: Lightning bolt or speed gauge

**Card 5: "Annual Revenue Impact" (THE PUNCHLINE — Massive Number)**
- Formula: `(projected_monthly_revenue - current_monthly_revenue + labor_cost_saved + deals_recovered) × 12`
- Where:
  - `current_monthly_revenue = projects_per_month × deal_value × current_close_rate`
  - `projected_monthly_revenue = projects_per_month × deal_value × (current_close_rate + 0.08)`
  - `labor_cost_saved = projects_per_month × hours_per_quote × hourly_value`
  - `deals_recovered = lost_deals_to_speed × deal_value`
- Display in MASSIVE `font-mono text-5xl lg:text-6xl font-bold text-emerald-600` with AnimatedCounter counting up from 0
- Subtext: "Additional revenue in your first year with instant quoting"
- Below that, show ROI multiple: `annual_impact / (subscription_cost × 12)` where subscription_cost defaults to £499/mo (Growth tier from spec)
- Display as: "**XXx** return on your BrandOps subscription" in `text-xl font-bold text-slate-700`

### Revenue Problem Exposed

Most merch distributors don't realize that slow quoting is a **double revenue leak**: (1) they burn 10-20% of their weekly capacity doing manual spreadsheet math instead of prospecting new deals, and (2) they lose 15-25% of inbound leads to competitors who deliver instant pricing. A distributor quoting 20 projects/month at 3.5 hours/quote is spending 70 hours/month (17.5 hours/week) on math. At £65/hour value, that's **£4,550/month in opportunity cost** — plus whatever deals ghosted while waiting 48 hours for pricing.

The calculator makes this UNDENIABLE. When Trevor sees "£8,200/month burned on quoting + £25,500/month lost to speed = £404,400/year" on screen, the pain becomes impossible to ignore. The problem isn't abstract anymore — it's a specific dollar amount being bled every month he waits.

### Mock Data (defaults produce these results based on formulas above)

Using defaults:
- 20 projects/mo × 3.5 hrs/quote × £65/hr = **£4,550/mo in quoting labor**
- 3 lost deals × £8,500 = **£25,500/mo in lost revenue**
- 48-hour time-to-quote = 5 days avg pipeline time → `5 × 20 × 0.15 = 15% velocity drag` = **£5,610/mo in stalled revenue**
- Current monthly revenue: `20 × £8,500 × 0.22 = £37,400/mo`
- With BrandOps (30% close rate): `20 × £8,500 × 0.30 = £51,000/mo`
- Difference: `(£51,000 - £37,400) + £4,550 + £25,500 = £43,650/mo`
- **Annual impact: £523,800/year**
- ROI: `£523,800 / (£499 × 12) = 87x return`

### Why THIS Element

BrandOps is solving a **workflow bottleneck that bleeds revenue in two directions simultaneously**: time cost (hours burned) + opportunity cost (deals lost). Every competitor (CommonSkew, Liftoff, MerchAI) solves pieces of the workflow, but NONE of them have instant matrix-based quoting. This calculator exposes the ONE thing Trevor can't fix with better Salesforce discipline or harder hustle — **systemic speed**.

The calculator isn't measuring generic "productivity" — it's measuring **the exact number of hours per week Trevor spends in Google Sheets instead of closing deals, and the exact number of deals that went to competitors who quoted same-day**. This is his lived reality made quantifiable.

### Wow Factor

The specific moment: when the "Annual Revenue Impact" counter ticks up from £0 to £500K+ in 2 seconds and Trevor realizes that's **4x his current BrandOps subscription cost**. The ROI multiple (87x) makes the decision mathematically obvious. The calculator doesn't say "you should buy this" — it says "you're losing £43K/month right now, and here's the math." Undeniable.

---

## Animation Directives

### Landing Page Sections
- **Hero section**: No ScrollReveal (it's above the fold). Glow blobs animate with subtle pulse (`animate-pulse-slow` class, 6s duration). Product screenshot/dashboard mockup fades in with `animate-fade-in-up` on page load (delay 0.3s).
- **Problem section** ("The Manual Quoting Trap"): `<ScrollReveal direction="up" delay={0.1}>` — entire section slides up when scrolled into view.
- **Solution section** ("One Platform, Instant Pricing"): `<ScrollReveal direction="up" delay={0.2}>` — wraps the section. Feature grid inside uses `<StaggerContainer><StaggerItem>` for each feature card (3 cards stagger in left-to-right, 0.1s delay between each).
- **How It Works section**: `<ScrollReveal direction="up" delay={0.15}>` — wraps section. Use FeatureVisual SVGs: step 1 = `variant="form"`, step 2 = `variant="dashboard"`, step 3 = `variant="chart"`.
- **Social Proof / Testimonials**: `<ScrollReveal direction="up" delay={0.2}>` — wraps section title. Testimonial cards use `<StaggerContainer><StaggerItem>` (stagger delay 0.15s).
- **Pricing section**: `<ScrollReveal direction="up" delay={0.1}>` — wraps section. Pricing cards (3 tiers) use `<StaggerContainer><StaggerItem>` (0.12s stagger).
- **Final CTA**: `<ScrollReveal direction="up" delay={0.1}>` — entire section.

### Landing Page Stats / Metrics Bar
If there's a metrics bar (e.g., "Trusted by X distributors, $Y in merch tracked, Z hours saved"), ALL numbers use `<AnimatedCounter>`:
- Distributors count: `<AnimatedCounter end={847} duration={2000} />`
- Revenue tracked: `<AnimatedCounter end={4200000} prefix="$" duration={2500} />`
- Hours saved: `<AnimatedCounter end={12500} suffix="+" duration={2200} />`

### Dashboard Pages

**Dashboard Home (`/dashboard`)**
- ALL stat cards (revenue, projects, commissions, conversion rate) use `<AnimatedCounter>` on the numbers. Each counter should have realistic prefixes/suffixes:
  - Revenue: `prefix="£" end={137400}`
  - Projects: `end={23} suffix=" active"`
  - Commission: `prefix="£" end={68700}`
  - Close rate: `end={28} suffix="%"`
- Recent activity list: NO animation (just static list with hover states).
- Pipeline summary chart: Fade in with `animate-fade-in` on mount (delay 0.2s).

**Project Pipeline (`/dashboard/projects`)**
- Kanban board: NO scroll-triggered animation (it's the main content). Cards are draggable — use smooth `transition-transform duration-200` on drag.
- Table toggle view: ALL tables use `<DataTable>` with `onRowClick` handler that triggers `<DetailPanel>` slide-in from right. Detail panel shows project details via `<MockDetail>` layout.
- NO ClickReveal on `<tr>` elements (spec violation) — use `onRowClick` prop on DataTable instead.

**Client Management (`/dashboard/clients`)**
- Table with `<DataTable>` + `onRowClick` → `<DetailPanel>` slide-in.
- Detail panel shows client info (contacts, addresses, project history) via `<MockDetail>`.
- Top stats (total clients, active projects, total revenue) use `<AnimatedCounter>`.

**Order Tracking (`/dashboard/orders`)**
- Kanban board (same treatment as Projects — draggable cards, no scroll animation).
- Status badges use semantic colors from spec.

**Commission Dashboard (`/dashboard/commissions`)**
- ALL revenue numbers use `<AnimatedCounter>`:
  - Gross revenue: `prefix="£" end={274800}`
  - Your commission: `prefix="£" end={137400} suffix=" (50%)"`
  - Partner commission: `prefix="£" end={19236} suffix=" (7%)"`
  - Net to you: `prefix="£" end={118164}`
- Revenue projection slider: As user drags the slider to scale annual revenue (e.g., 1.5x, 2x, 3x), the projected commission number uses `<AnimatedCounter>` that re-animates to the new value on each slider change.
- Charts: Line chart for monthly revenue, bar chart for quarterly breakdown — both fade in with `animate-fade-in` on mount (delay 0.3s).

**Analytics (`/dashboard/analytics`)**
- Use `<LoadingSequence>` on initial page load with merch-specific messages:
  - Step 1: "Loading pipeline data..." (2s)
  - Step 2: "Calculating conversion metrics..." (1.5s)
  - Step 3: "Analyzing deal velocity..." (1s)
  - Step 4: "Ready" (0.5s fade to dashboard)
- ALL KPI stat cards use `<AnimatedCounter>`.
- Charts fade in after LoadingSequence completes.

### Interactive Directives

**Dashboard Layout (DemoToastProvider — REQUIRED)**
Wrap the entire dashboard layout (`web/components/layouts/DashboardLayout.tsx`) in `<DemoToastProvider>`. Toast messages should appear every 8-12 seconds with merch-specific activity:

**Toast Messages (8 messages, realistic merch activity):**
1. `{ type: 'project', title: 'New project request', message: 'Progressive Insurance submitted "Q2 Employee Uniforms"' }`
2. `{ type: 'order', title: 'Order shipped', message: '250 embroidered polos shipped to Vanderbilt Medical' }`
3. `{ type: 'client', title: 'New client added', message: 'Ascension Healthcare added to CRM' }`
4. `{ type: 'metric', title: 'Revenue milestone', message: 'Monthly revenue hit £45K — up 18% from last month' }`
5. `{ type: 'quote', title: 'Quote generated', message: 'Instant pricing generated for "Tech Conference Swag Bags"' }`
6. `{ type: 'approval', title: 'Artwork approved', message: 'Client approved final mockup for Bridgestone tees' }`
7. `{ type: 'commission', title: 'Commission updated', message: 'February commission: £8,247 confirmed' }`
8. `{ type: 'sync', title: 'Salesforce sync', message: '3 orders synced to Salesforce — ready for entry' }`

**Dashboard Header (DemoNotifications — REQUIRED)**
Include `<DemoNotifications>` component in the dashboard header (top-right, next to user profile). Notification messages:

**Notification Messages (5 messages):**
1. `{ type: 'project', title: 'Project moved to Client Review', message: 'Amazon Studios "Q3 Promo Kits" awaiting approval', time: '5m ago' }`
2. `{ type: 'order', title: 'Order delayed', message: 'Embroidery on "Nissan Dealer Polos" pushed to Friday', time: '1h ago' }`
3. `{ type: 'approval', title: 'Artwork revision needed', message: 'Truist Bank requested logo color adjustment', time: '2h ago' }`
4. `{ type: 'client', title: 'New contact added', message: 'Sarah Mitchell (Finance) added to HCA Healthcare', time: '3h ago' }`
5. `{ type: 'metric', title: 'Pipeline value update', message: 'Total pipeline value: £186K across 18 active projects', time: '5h ago' }`

**Action Buttons (Use `<ActionButton>` with realistic success messages):**
- **"Generate Quote" button** (project detail page): Success message = "Quote generated — ready to share with client"
- **"Export to CSV" button** (tables): Success message = "Exported 47 projects to CSV"
- **"Send Portal Link" button** (project detail): Success message = "Portal link sent to client via email"
- **"Mark as Shipped" button** (order detail): Success message = "Order marked shipped — client notified"
- **"Sync to Salesforce" button** (orders page): Success message = "3 orders queued for Salesforce entry"
- **"Save Changes" button** (settings pages): Success message = "Settings saved successfully"
- **"Add Client" button** (CRM): Success message = "Client added to CRM"

---

## Mock Data Personality

### Tone of Mock Names
- **Client companies**: Mix of Fortune 500 enterprise (Progressive Insurance, Vanderbilt Medical, Amazon Studios, Nissan, Truist Bank, HCA Healthcare, Bridgestone, Ascension Healthcare) + mid-market regional brands (local universities, healthcare systems, dealerships). Use REAL-sounding company names from Trevor's Nashville/Southeast US market.
- **Contact names**: Professional B2B names — "Sarah Mitchell", "David Chen", "Jennifer Williams", "Marcus Johnson", "Emily Rodriguez", "Michael O'Brien". Avoid overly trendy first names. These are corporate buyers and program managers, ages 35-60.
- **Product names**: Real promotional merch SKU language — "Bella+Canvas 3001 Unisex Tee", "Port Authority Polo K500", "Carhartt Duck Detroit Jacket", "YETI Rambler 20oz", "Moleskine Classic Notebook", "Nike Swoosh Cap". Use actual brand names distributors sell.

### Number Ranges
- **Deal values**: £1,200–£85,000 (most deals in £5K–£15K range, occasional enterprise program at £40K+)
- **Project quantities**: 25–5,000 units (most projects 100–500 units, programs can be 2,000+ with multi-location drop-ship)
- **Commission values**: £600–£42,000 per project (50% profit split with Boundless)
- **Close rates**: 18%–35% (industry avg is 20-25%, top performers hit 30%+)
- **Pipeline values**: £80K–£250K total across 12-30 active projects
- **Decoration costs**: £1.20–£18 per unit depending on method/colors (screen print 1-color = £1.50, embroidery 10K stitches = £5, full-color DTG = £8)

### Date Patterns
- **Heavy activity this week**: 40% of projects updated in last 7 days
- **Tapering last month**: 30% updated 8-30 days ago
- **Long-tail aging**: 20% in pipeline 30-60 days, 10% stalled 60+ days (these need follow-up)
- **Order production times**: 7-21 days from order entry to shipped (screen print = 7-10 days, embroidery = 10-14 days, complex = 14-21 days)

### Status Distributions
**Projects Pipeline:**
- Opportunity: 25%
- Qualifying: 15%
- Curating: 12%
- InDesign: 10%
- Presenting: 8%
- Client Review: 12%
- Confirmed: 10%
- Order Entry: 5%
- In Production: 2%
- Shipped: 1%

**Orders:**
- Order Entry Needed: 20%
- Entered: 15%
- In Production: 35%
- Shipped: 20%
- Ready for Invoicing: 7%
- Invoiced: 3%

### Industry-Specific Terminology
- **Blanks** — undecorated apparel/products before printing/embroidery
- **Decorator** — the vendor who applies the logo/design (screen printer, embroiderer, etc.)
- **Setup fee** — one-time charge for screen creation, digitizing, etc.
- **Color count** — number of ink colors in a design (affects pricing)
- **PMS color** — Pantone Matching System for exact brand color matching
- **Mockup** — digital proof showing what the decorated product will look like
- **Run charge** — per-unit decoration cost
- **Quantity break** — pricing tier (e.g., 1-24, 25-49, 50-99, 100-249, 250-499, 500+)
- **Drop-ship** — shipping individual orders to multiple locations from one production run
- **Program** — recurring or bulk ordering relationship (employee stores, uniform programs)
- **Spec sheet** — product specifications document
- **Overrun** — extra units produced beyond ordered quantity (industry standard 2-5%)

---

## Final Notes for Builder Agents

This is NOT a lifestyle app. This is NOT a consumer product. This is a **B2B operations platform for managing a merch empire**. Every design decision should optimize for:

1. **Information density without clutter** — Trevor manages 20+ projects with 100+ line items each. He needs to see critical data at a glance.
2. **Speed and efficiency** — The entire value prop is "instant quoting vs. 3-5 hour manual calculations." Every interaction should feel FAST.
3. **Professional credibility** — The client-facing portal (at `/portal/[projectId]`) is what replaces email chains with Fortune 500 clients. It must look enterprise-grade.
4. **Revenue-first mentality** — Blue for actions, Amber for money, Emerald for success. Everything ties back to commissions and closed deals.

**The Signature Element (Quoting Speed ROI Calculator) is the centerpiece.** It's the first thing prospects see after the hero CTA. It's how Trevor will pitch BrandOps to Aaron (Boundless CEO) and Nick (Threadbird, $20M company). Make the numbers BIG, make the math UNDENIABLE, make the ROI multiple IMPOSSIBLE to ignore.

Build this like you're building for a sales rep who just closed $131K in 9 days manually and wants to 10x that with automation. Professional, fast, data-dense, and unapologetically focused on revenue.
