# Partnership Roadmap: Trevor Sarver
> 85 Supply / Boundless | February 20, 2026

---

## The Situation

**85 Supply** is a $2-3M/year full-service merch agency based in Nashville, now acquired by **Boundless** — a $200-300M parent company with 200+ merch reps under its umbrella. Trevor is the CEO, former rock-and-roll touring musician, and now the "cool merch guy" inside a corporate machine.

**What changed since our first calls:**
- Boundless acquisition is **DONE** — Trevor is now operating under their umbrella
- Trevor did **$131K in his first 9 days** at Boundless — purely from personal network, manual Salesforce entry
- He's on a **financial leash** — capped salary + profit bucket instead of 50/50 split he expected
- CEO **Aaron Hamer** is interested in AI but needs to see proof before opening budget
- Trevor has **full liberty** (contractually) to build standalone SaaS applications for the merch industry
- **Derek** (mentor, sold $120M company Touchstone to Boundless) says "if you build this, you'll disrupt the entire industry" — his non-compete expires in 1 year

---

## What Trevor Has Built (Lovable)

### 1. Client Portal / Admin Hub (THE MAIN APP)
A comprehensive merch project management system built feature-by-feature in Lovable:

- **Client management** — create clients, contacts, billing/shipping addresses
- **Project pipeline** — Kanban board: Opportunity → Qualifying → Curating → InDesign → Presenting → Client Review
- **Product catalog** — manual product entry with color options, images, cost, SKUs
- **Quoting engine** — blank cost + decoration cost (from decorator matrix) + margin = sale price, with quantity breaks (50/100/200/500/1000)
- **Print locations** — front/back/sleeve, screen print/embroidery, color count per location
- **Client preview** — shareable link where client sees curated products, uploads artwork, enters quantities, confirms order
- **Proof & tech pack builder** — upload artwork, create proofs with placement indicators
- **Split shipment builder** — 1,263 shirts → 43 here, 2 there, 5 there
- **Event merch forecaster** — already live on 85supply.com/tools
- **Production time builder** — already live on 85supply.com/tools

### 2. Public Website (85supply.com)
Currently Lovable + was connected to Airtable (NOW DISCONNECTED). Trevor wants it to shift from agency-style to SaaS-style product browsing:
- Browse catalog → select products → decoration details → instant quote → submit project request
- Model: Threadbird.com (his mentor Derek's company)

### 3. BrandOps (Separate SaaS Concept — $99/mo)
Targets smaller merch distributors ($100K-$3M annual) with standalone tools:
- Simple CRM, presentation builder, order tracker, shipment tracker
- Design request builder, split shipment builder, production time builder, PO creator
- Derek's quote: "If you get this in the hands of distributors, you'll make millions"
- Trevor's buddy Nick (Threadbird, $20M company): "I'll pay you $1,000/month just for this"

---

## The Technical Landscape

| System | Status | Problem |
|--------|--------|---------|
| **Lovable** (website + admin portal) | Two separate projects, disconnected | Can't merge, component limits, credit costs |
| **Airtable** (old database) | DISCONNECTED 2 days ago | Performance issues, sloppy data, Lovable can't cleanly separate |
| **Salesforce** (Boundless order entry) | Required for all orders | Manual entry, "dog shit" UX, no API access yet |
| **NetSuite** (Boundless finance) | Invoicing system | Corporate login, Tyler manually approves invoices |
| **CommonSkew** (industry CRM) | Trevor's current tool | "Windows 98 shit" — but has PromoStandards integration |
| **PromoStandards** (industry API) | Industry product database | The key integration — search 1000s of suppliers, products, inventory, pricing |
| **MerchAI** | Only AI competitor | Only doing mock-ups, no ops platform |

---

## Commission / Deal Structure

**For outbound leads (Jeremy's flow):**
- 35% gross profit margin on all orders (Trevor's floor)
- Boundless takes 50% of profit, Trevor gets 50%
- Jeremy gets 20% of Trevor's profit = **7% of gross revenue**
- Simplified: any lead from the website/outbound → 7% of gross to us

**For the app build:**
- Revenue-share model (Trevor can't pay upfront — "financial leash")
- Sweat equity from both sides
- Phase 1: build MVP → show Aaron → get Boundless budget unlocked
- Phase 2: subscription model for all Boundless reps
- Data ownership stays with us — Boundless gets access, not ownership

---

## What We're Building

### Phase 1: MVP (Quick Win) — Build for Trevor
Rebuild Trevor's Lovable apps into one cohesive system on our stack (Supabase + Next.js + Vercel):

**Public Website:**
- Product catalog with browsing, filtering, decoration details
- Instant quoting engine (blank + decoration + margin = price with quantity breaks)
- Project request form → flows into admin pipeline
- AI-powered mock-ups (logo upload → instant product renders via Gemini Vision)
- SaaS-style UX (not agency brochure)

**Admin Portal:**
- Client management (contacts, billing, shipping)
- Project pipeline (Kanban: Opportunity → Qualifying → Curating → InDesign → Presenting → Client Review → Confirmed)
- Product database with decorator matrices
- Quoting engine with print locations, color counts, margin calculator
- Client-facing preview links (shareable)
- Proof & tech pack builder
- Split shipment builder
- Order tracking (Kanban: Order Entry Needed → Entered → In Production → Shipped → Ready for Invoicing)

**Key differentiator from Lovable version:**
- Single system (not split between two projects)
- Real database (Supabase, not Airtable)
- Full code ownership (not locked in Lovable)
- Multi-tenant architecture from day one

### Phase 2: Aaron Sell — Boundless Enterprise
Once Trevor's version is working → present to Aaron Hamer:
- Commission reporting built into the app (Trevor's request for the "wow" moment)
- Show the workflow: website → project request → quoting → client portal → order entry → production tracking
- Pitch: subscription model for all Boundless reps
- Unlock: Salesforce API access for automated order entry
- Unlock: budget allocation for development

### Phase 3: PromoStandards Integration
The game-changer that puts us ahead of CommonSkew:
- PromoStandards API integration (industry product database)
- AI-powered product search across hundreds of suppliers
- Real-time inventory checks, pricing, availability
- Derek has direct contact with PromoStandards CTO (cell phone)
- "If an AI model could scoop through all the slop and bring it back... oh my God"

### Phase 4: BrandOps — SaaS for the Industry
Scale the tool suite to the broader market:
- Target: $100K-$3M annual promotional products distributors
- 15,000-member Facebook group (Promotional Products Professionals) as launch audience
- $99/month subscription
- Self-serve tools: CRM, presentation builder, order tracker, design request builder
- Trevor's network = distribution (CJ at Hit Promotional Products — $1.4B company, Derek's connections)

### Phase 5: Enterprise White-Label
- All 200+ Boundless reps get the platform
- Custom features per organization
- Derek's non-compete expires → potential re-entry with this tool
- Industry disruption play (CommonSkew replacement)

---

## Key People

| Person | Role | Importance |
|--------|------|------------|
| **Trevor Sarver** | CEO 85 Supply, industry insider, domain expert | The brain — knows every nook and cranny of the industry |
| **Aaron Hamer** | CEO Boundless ($200-300M) | The gatekeeper — needs to approve budget and Salesforce API access |
| **Derek** | Trevor's mentor, sold Touchstone ($120M) to Boundless | The validator — "if you build this, you'll disrupt the industry." Non-compete up in 1 year |
| **Nick** | CEO Threadbird ($20M company) | Early adopter — "I'll pay $1,000/month just for this" |
| **CJ Smith** | CEO Hit Promotional Products ($1.4B) | Network connector — already interested in Trevor's app builds |
| **Jeremy (Shopify)** | Trevor's friend, builds Shopify-to-Printful stores | Potential referral partner, charges $10K setup + 10% rev |

---

## Bloom Build: What to Extract from MT Promo

The existing Bloom build (MT Promo / Maple Tree) maps directly to Trevor's needs:

| MT Promo Component | Trevor's Version | Adaptation Needed |
|-------------------|-----------------|-------------------|
| Quiz funnel | Project request form | Reframe: product selection → decoration details → quote → submit |
| Lead scoring (15 signals) | Project qualification | Reframe: scoring = deal size + urgency + client tier |
| AI mockup generation | Logo-to-product renders | Direct match — Gemini Vision, grid placement system |
| Proposal engine | Quoting engine | Major rebuild: decorator matrices, quantity breaks, print locations |
| Dashboard + analytics | Admin portal | Major rebuild: Kanban pipeline, client management, order tracking |
| ROI calculator | Commission calculator | New: 7% gross revenue calculation for partner reporting |
| Demo mode | Aaron demo | Perfect: show him a working demo without live data |
| Multi-tenant (org_id) | Enterprise accounts | Already architected — each Boundless rep = org |

**New components needed (not in MT Promo):**
- Decorator matrix system (blank cost + decoration cost + margin per print location)
- Split shipment builder
- Proof & tech pack builder
- Client portal (shareable links for artwork upload, quantity confirmation, order approval)
- PromoStandards API integration (Phase 3)
- Salesforce bridge (Phase 2 — Chrome extension or email scraping as interim)

---

## Immediate Next Steps

1. **WhatsApp group created** — Trevor + Jeremy + Vitaliy (done on call)
2. **Lovable access granted** — editor access to all 3 projects (done on call)
3. **Trevor brain dumps** — voice notes, screenshots, Lovable walkthrough
4. **Extract Lovable source code** — download from source control
5. **Build MVP via Bloom** — use MT Promo as skeleton, Trevor's data as spec
6. **Trevor keeps vibe coding** — finishes mapping out project-level features over the weekend
7. **Review call** — present MVP, iterate, get Trevor's approval
8. **Aaron presentation** — commission report + working demo

---

## Key Quotes from Trevor

> "Not a single person in this 8-12 billion dollar industry has actually successfully built a relevant, forward-thinking, customizable product solution."

> "If Derek is saying, Trev, if you did this, you'd disrupt the whole industry — he means it."

> "I just went from being the CEO of my own multi-million dollar company to essentially being an employee with not really much of a budget. All I got is dreams and ideas and connections."

> "What if Boundless isn't a business in two years? What if when my non-compete is up, we need this application?" — Derek (wink wink)

> "I have people in my network that I can go to and be like, yo, CJ, what do you need built? I'll direct them straight to you guys."

---

*The opportunity is clear. The industry has zero modern tooling. Trevor has the connections, the domain knowledge, and the insider position. We have the build capability. Let's execute.*
