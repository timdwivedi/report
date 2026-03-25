# BrandOps -- What's Left (Updated after Call 4)

> **Last updated:** 2026-02-25
> **Audience:** Trevor, Aaron, and anyone who needs the non-technical picture
> **Context:** After Call 4 (108 min) where Trevor showed us 32 screenshots from his Lovable-built reference app, and Aaron approved the 60/40 revenue split

---

## What Works Right Now

The app is fully navigable with realistic demo data across every section. Three rounds of building have produced:

- **Dashboard** with live stats: pipeline value, active projects, orders in production, monthly revenue
- **Projects pipeline** as a drag-and-drop kanban board AND a sortable table view
- **Project detail slide-out** (75% width panel) with 7-stage status stepper, two-column layout (client/shipping on left, timeline/financial on right), product list with thumbnails, creative request list, and a 6-tab file manager
- **Product detail** (nested 60% width panel) with catalog search, blank costs by size tier, dual notes (client-facing white + internal amber), decoration locations table, pricing grid, per-unit add-ons, quantities received matrix
- **Pricing engine** that handles both Contract products (blank + decoration + margin) and All-In products (vendor cost + margin), with decorator-specific matrices
- **Decoration management** with full price break matrices, run charges, and setup charges
- **Client list** with company info, contacts with role badges, address book with named folders, linked projects
- **Orders tracking** kanban from entry through invoicing
- **Products catalog** with images, color swatches, sizes, and pricing tiers in a 4-tab editor (Basics, Blank Costs, Variants, Decorations)
- **Vendor management** with supplier/decorator classification
- **Commission calculator** with animated revenue waterfall (gross revenue down to net owner take)
- **Analytics dashboard** with charts: pipeline by stage, conversion funnel, deal velocity, revenue forecast
- **Client portal** (shareable link, no login) where clients see their project, approve orders, track shipments
- **Client spend heatmap** (5 clients x 12 months, color-coded intensity)
- **Vendor scorecard** with letter grades, sparkline trends, 4 key metrics
- **Production timeline** with 6-phase Gantt bars per line item
- **Smart size split** calculator using the industry-standard bell curve (S=10%, M=25%, L=30%, XL=25%, 2XL=10%)
- **Reorder from history** flow in client detail
- **Bulk CSV import** with drag-drop, preview, and column mapping
- **Portal PDF download** with print-optimized CSS
- **X-ray feedback mode** where Trevor can click any section, leave voice notes, and export feedback
- **Super admin panel** for platform-level management with "View As" impersonation
- **21 API routes** ready to connect to a real database

**Bottom line:** The shell and the core workflows are built. Every button goes somewhere. The data model handles both contract and all-in products. The quoting math is correct. The question now is: does every pixel match what Trevor built in his reference app?

---

## What We Are Building Next (Round 3 -- The Quality Round)

Round 3 is NOT about new features. It is about making what we have match Trevor's Lovable reference app exactly. Trevor brought 32 screenshots. His #1 priority: "My objective one is to achieve what I have in my current app."

### 1. Fix the Pricing Grid (5 columns --> 7 columns)
The pricing grid -- what Trevor calls "the money shot" -- currently shows 5 quantity break columns. Trevor's app shows 7: 24-35, 36-49, 50-99, 100-199, 200-499, 500-999, and 1000+. We are matching these exactly because Trevor will manually enter decoration matrices and verify the math.

### 2. Hybrid Product Pricing
Trevor told us that a single product (like a t-shirt) can be priced as Contract (blank + decoration) with one vendor OR as All-In (single vendor price) with another vendor. We are adding a "Pricing Mode" toggle at the project level so Trevor can switch how a product is priced without changing the product itself.

### 3. Simplify Production Time
Trevor's app shows two options: Standard and Rush. Ours had five. We are simplifying to match.

### 4. Build Creative Request Detail View
Trevor's app has a full detail view for creative requests: status, assignee, due date, time tracking, version history, and edit requests. Our current build only shows a flat list. We are building the full detail panel matching his screenshot.

### 5. Add "Show on Website" Toggle to Products
The data field already exists, but there is no toggle in the product editor. Trevor: "I as a user can go, yes, show on website, yes, no." We are adding the toggle.

### 6. Add ASI Price Code Support
Trevor explained the industry pricing system where each code letter (like C or G) means a specific margin percentage. We are adding this field to all-in products so the system is ready when we connect the HIT catalog API.

### 7. Project Source Badge
Aaron needs to see at a glance whether a project came from the website (new revenue) or from an existing client (existing revenue). We are adding a badge.

### 8. Keep the 7-Stage Stepper
There was a question about whether the project status stepper should have 6 or 7 stages. Trevor's app has 7. Ours already has 7. Confirmed correct, no change needed.

---

## What Changed in the Business (Call 4 News)

Three major things happened:

1. **Aaron approved the revenue split.** 60% goes to Boundless, 40% to Trevor on all website orders. Trevor proposes splitting his 40% share 50-50 with Vitaliy and Jeremy. BrandOps is now a revenue-generating platform, not just a demo.

2. **HIT Promotional Products API access confirmed.** CJ (CEO of HIT) connected Trevor with Raj (CTO). This will be the foundation for the all-in product catalog -- a one-time annual pull, not the industry's notoriously unreliable PromoStandards API.

3. **Trevor wants to vibe-code.** He wants to use the X-ray feedback tool and make UI tweaks himself. This means the code must be modular, well-named, and easy for a non-developer to iterate on.

---

## What's NOT Being Built This Round

We are being very deliberate about scope. These are deferred:

- **Public website / e-commerce** -- Too big. Needs Stripe, card capture, the whole wizard. Gets its own round.
- **HIT API integration** -- Needs real API credentials from Raj. Not available yet.
- **Stripe payment processing** -- Depends on website e-commerce being built first.
- **Referral codes** -- Depends on website being live.
- **Boundless order entry bridge** -- Needs Salesforce access and Kristen's workflow documentation.
- **AI email inbox** -- Future feature. Needs real email infrastructure.
- **Revenue reporting for Aaron/Kevin** -- Needs real order data. Demo reports add no value.
- **Real database / real login** -- This round is demo-only. Database comes when core UX is approved.
- **Salesforce integration** -- Waiting on Trevor's documentation.
- **PromoStandards API** -- Trevor rejected it. "It's API slop." Going direct to suppliers.

---

## What's Coming After Round 3

### Round 4: Website E-Commerce + Database
- Build the public website ordering flow (product browsing, add to project, Stripe card capture)
- HIT API integration for all-in product catalog
- Connect to a real database (Supabase) so Trevor can enter his own data
- Real login and authentication
- Revenue reporting for Aaron/Kevin

### Round 5: Boundless Bridge + Integrations
- Boundless order entry bridge (Salesforce connection for Kristen's workflow)
- Referral code system
- Client portal refinement (login-based, reorder capability)
- AI email inbox for parsing Boundless notifications

### Round 6: AI Agents
- AI-powered order entry (turning hours of manual data entry into 10-minute review)
- AI quoting from client briefs
- AI vendor recommendations

### Round 7+: Scale
- Boundless co-brand toggle (simplified flow for Boundless reps)
- SaaS multi-tenant rollout (beta with $10M+ companies like Threadbird, Culture Studio)
- White-label option
- Floor stock / warehouse management
- Third-party shipping integrations

---

## Timeline Estimate

| Phase | What | Relative Effort |
|-------|------|-----------------|
| **Round 3 (now)** | Quality matching to Trevor's reference app | 2-4 work sessions |
| **Round 4** | Website e-commerce + HIT API + real database | 6-10 work sessions |
| **Round 5** | Boundless bridge + integrations | 5-8 work sessions |
| **Round 6** | AI agent capabilities | 6-10 work sessions |
| **Round 7+** | Platform scale + SaaS distribution | Ongoing |

Trevor's target: "I bet three weeks from now, we're just like, holy ..." (mid-March 2026). Round 3 positions us to hit that mark.

---

## What We Need from Trevor

1. **Review Round 3 output** -- Open BrandOps side-by-side with your Lovable app. Flag any remaining differences.
2. **Confirm pricing grid math** -- Enter real decoration matrices and verify the calculations at all 7 quantity break points.
3. **HIT API credentials** -- Follow up with Raj to get API access. We have the data model ready.
4. **Salesforce documentation** -- The Loom videos, screenshots, and voice notes for Kristen's workflow.
5. **Aaron demo date** -- When does Aaron want to see the full platform? This sets the priority for Round 4.
6. **Confirm hybrid pricing scenarios** -- Which specific products/vendors use the all-in override on normally-contract products? We need real examples for demo data.
