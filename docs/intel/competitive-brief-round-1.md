# Competitive Intelligence Brief -- Round 1
> Generated: 2026-02-23
> Context: BrandOps -- AI-powered merch agency management platform for 85 Supply (Trevor Sarver, Nashville TN)
> Scout Agent: Phase 0 of Post-Build Squad, BrandOps Round 1

---

## Market Overview

### Industry Size & Growth

The North American promotional products industry hit a **record $27.7 billion in 2025**, posting 4.2% sales growth and outperforming U.S. GDP growth (1.9%). The global market was $26.55B in 2025, projected to reach **$36.98B by 2033** (CAGR 3.75%).

The **decorated apparel sub-segment** is growing significantly faster: projected CAGR of **12.9% from 2023 to 2030**, expanding from $28.98B (2022) toward $64.60B by 2028. This is the exact segment BrandOps targets -- concert merch, corporate merch, sports merch, and branded apparel.

### Key Market Dynamics

- **Fragmented tech landscape**: No single platform owns the full workflow. Agencies cobble together 4-7 tools (CRM + order management + decorator pricing + client portals + accounting + project management + product search).
- **Manual data entry epidemic**: Trevor's team spends 4+ hours entering a single t-shirt order. This is industry-standard, not an outlier.
- **Apparel is #1**: 39% of end buyers prefer apparel promotional products; T-shirts alone represent 30%+ of the decorated apparel market.
- **AI adoption is early**: Only 25% of distributors report using AI in any capacity (per PPAI Counselor 2025 State of the Industry). Two-thirds of suppliers use it, mostly for basic tasks (ChatGPT for sourcing, AI chat on websites).
- **ERP upgrades dominate IT spend**: The most-cited IT initiative among top-100 promo companies in 2025 was ERP implementation/upgrade -- meaning the incumbents are modernizing but slowly.
- **Tariff volatility**: Margin pressure from tariffs is pushing companies to seek efficiency through technology and smarter sourcing.

### Industry Standards

**PromoStandards** is the open industry-standard API spec connecting suppliers and distributors. It covers product data, real-time inventory, pricing, electronic purchase orders, and order/shipment tracking. Any serious platform in this space must integrate with PromoStandards to access the supplier ecosystem.

---

## Competitor Analysis

### 1. commonsku (commonsku.com) -- PRIMARY COMPETITOR

- **What they do:** Cloud-based "Connected Workflow" platform unifying the entire promo order lifecycle -- CRM, order management, production tracking, client-facing portals, e-commerce shops, decorator pricing matrix. Born out of a real distributorship (RIGHTSLEEVE). Processes **$1.8B+ in industry sales**. 900+ distributor customers.
- **Pricing:**
  - Essentials: **$129/user/month** (min 2 users) -- presentations, shops, product search, order management, production tracking
  - Advanced: **$159/user/month** (min 2 users) -- adds client portals, sales tracking, dashboards, analytics, marketing integrations, automation
  - Enterprise: Custom pricing -- adds webhooks, API access, BI data export
  - Additional users: extra cost; 10% annual discount
  - Shop transaction fees: 2.5% declining to 1% at $100K+ lifetime sales
- **Strengths:**
  - Built BY distributors FOR distributors -- deep domain understanding
  - Decorator Matrix feature handles complex apparel pricing (colors, run charges, fixed charges)
  - PromoStandards integration for real-time supplier data
  - Strong community moat (skucon events, skummunity forum, skucast podcast)
  - AI Recommendations launched 2025 -- analyzes client purchase history to suggest products
  - 60+ features shipped in 2025 alone; high velocity roadmap
  - Approve & Pay workflow (PO + payment in one step)
  - Automated bill matching with Connected+ suppliers
  - Avalara tax automation integration
  - 2026 roadmap includes "AI that knows YOUR business" (AI chatbot trained on company data)
- **Weaknesses:**
  - Per-user pricing gets expensive fast for larger teams ($129-159/user = $1,548-1,908/user/year)
  - Transaction fees on shops (2.5% starting) eat into margins
  - Focused on distributor workflow -- not purpose-built for decorated apparel agencies that also DO the decorating
  - No warehouse/floor stock management
  - No concert merch or event-specific workflows
  - AI features are early-stage (recommendations only, no AI order entry or AI quoting)
  - No native integration with decoration production equipment
- **What BrandOps can steal:**
  - The "Decorator Matrix" concept -- but make it AI-powered (auto-suggest pricing based on historical data)
  - Client-facing portals with approval workflows
  - The community/education moat strategy (but for agencies, not just distributors)
  - PromoStandards integration as table stakes

### 2. OrderMyGear / OMG (ordermygear.com) -- E-COMMERCE FOCUS

- **What they do:** Technology platform specifically for branded merchandise industry. Primary value: custom online stores (Pop-up, Company, Redemption, Print-on-Demand). 4,000+ distributor clients. **$2B+ in online sales processed**. 735,000+ products from 500+ suppliers. 150+ employees.
- **Pricing:**
  - OMG Unlimited stores: **$2,999 one-time** + hosting ($119-199/month)
  - A la carte company stores: **$499/store one-time**
  - Presentations & Order Management: **$79/user/month** (min 2 users)
  - Pop-up store transaction fee: 3.95% on cart total
  - Stripe processing: 2.9% + $0.30 on top
  - Premium tier: $199/month for Punchout, Virtual Samples, Budgets, Zapier, SSO
- **Strengths:**
  - Best-in-class online store builder for branded merch
  - Virtual Samples -- add logos to product mockups
  - Multiple payment types (credit, gift cards, points, Apple/Google Pay, Klarna, PO, ACH)
  - Order approvals and budget tracking for corporate clients
  - PromoStandards supplier integration
  - Free product search and website tools
- **Weaknesses:**
  - Store-centric, not workflow-centric -- weak on production management, decoration tracking, CRM
  - High transaction fees (3.95% OMG + 2.9% Stripe = ~7% per order)
  - One-time license fees create upfront friction
  - No AI capabilities mentioned anywhere
  - No project management or team coordination features
  - No decorator pricing matrix
- **What BrandOps can steal:**
  - Virtual Samples feature (logo mockups on products)
  - Budget/approval workflows for corporate clients
  - The concept of Pop-up Stores for event-based merch (concerts, festivals)

### 3. SAGE (sageworld.com) -- INDUSTRY DATA BACKBONE

- **What they do:** The leading cloud-based product research and marketing platform. Industry's **largest database: 1.5M+ products**. Provides product search, order management, project management, e-commerce websites, and supplier connectivity. Also offers SAGE Chat (real-time messaging) and SAGE Virtual Design Studio with AI.
- **Pricing:** Membership-based (not publicly listed per-user pricing). Includes distributor and supplier tiers.
- **Strengths:**
  - Largest product database in the industry (1.5M+)
  - AI-powered Design Studio (smart eraser, magic upscaler, logo manipulation)
  - First in industry with real-time AI image generation for content
  - Full suite: CRM, order management, project tracking, e-commerce, chat
  - Deep supplier network and data relationships
  - Mobile app support
- **Weaknesses:**
  - Legacy platform feel -- built as a product search tool and expanded outward
  - Jack of all trades, master of none -- each module is adequate but not best-in-class
  - Not purpose-built for decorated apparel or merch agencies
  - Complex pricing structure tied to membership
  - No decorator pricing matrix or production floor management
- **What BrandOps can steal:**
  - The AI Design Studio concept (virtual sampling + AI image generation)
  - Product database integration approach (but via PromoStandards, not building a proprietary DB)

### 4. ASI / ESP+ (asicentral.com) -- INDUSTRY ASSOCIATION PLATFORM

- **What they do:** Advertising Specialty Institute's platform for the promo industry. ESP+ is their product search, CRM, and e-commerce platform. Access to **1M+ promotional products**. Recently launched ESP+ Stores (2025). Two ESP+ licenses included with distributor membership.
- **Pricing:** Bundled with ASI distributor membership (not transparent standalone pricing).
- **Strengths:**
  - Bundled with industry membership -- effectively "free" for ASI members
  - AI-fueled proposal generation (product summaries, email copy, personalized notes)
  - ESP+ Stores for curated e-commerce collections
  - Massive product catalog access
  - Industry conference and networking ecosystem
- **Weaknesses:**
  - Tied to ASI membership -- vendor lock-in
  - Platform is generalist, not specialized for merch agencies or decorators
  - AI features are limited to proposal content generation
  - No production management, decorator pricing, or warehouse tools
  - Legacy architecture being modernized (ESP+ is relatively new rebuild)
- **What BrandOps can steal:**
  - AI proposal generation (but go 10x deeper -- AI that writes full quotes, not just summaries)
  - Product catalog integration approach

### 5. PromoXcrm (promoxcrm.ai) -- AI-FIRST CRM

- **What they do:** CRM specifically designed for promotional products distributors. Integrates with QuickBooks, Mailchimp, Shopify. Includes branded webstores, automated quoting, inventory control, decoration cost calculators.
- **Pricing:** **$55/user/month** + $449 one-time setup fee
- **Strengths:**
  - Most aggressive AI positioning in the industry
  - Automated branded quotes and invoices in seconds
  - Bulk order pricing auto-adjusts
  - Decoration cost calculators
  - Blank vs. printed inventory tracking
  - Branded webstores with no coding and no added fees
  - Affordable pricing (cheapest per-user in the space)
- **Weaknesses:**
  - Newer entrant, smaller customer base
  - AI features appear to be basic automation, not deep intelligence
  - Limited integrations compared to commonsku or SAGE
  - No PromoStandards integration mentioned
  - No production floor or warehouse management
  - No event/concert merch workflows
- **What BrandOps can steal:**
  - Decoration cost calculator concept
  - Blank vs. printed inventory tracking is clever and relevant
  - Aggressive pricing model ($55/user undercuts everyone)

### 6. LeadLeaf (leadleaf.app) -- MARKETING-FIRST CRM

- **What they do:** CRM and sales automation platform for promo distributors. AI chatbot for lead engagement, AI appointment booking, AI website builder, automated workflows.
- **Pricing:** Not publicly listed.
- **Strengths:**
  - AI employee that handles routine tasks and books appointments
  - 24/7 AI chatbot for lead nurturing
  - Website and funnel builder included
  - Automated follow-up workflows
- **Weaknesses:**
  - Marketing/sales focused only -- no order management, production, or decoration features
  - AI features are generic (chatbot, website builder) not industry-specific
  - Not a serious contender for full workflow management
  - Appears to be a white-label CRM adapted for promo, not purpose-built
- **What BrandOps can steal:**
  - AI appointment booking could be useful for merch consultation calls
  - Automated follow-up sequences for client nurturing

### 7. Inktavo / Printavo / InkSoft (inktavo.com) -- DECORATOR-FOCUSED

- **What they do:** Industry-leading software for decorated apparel businesses. Inktavo is the parent company that merged Printavo (shop management), InkSoft (online stores), and GraphicsFlow (art/design collaboration). Covers quoting, approvals, payments, job scheduling, analytics, and production management.
- **Pricing:**
  - Printavo: Starting at **$99/month**
  - InkSoft: Separate pricing for e-commerce stores
  - shopVOX (competitor): **$199/month + $29/user/month**
- **Strengths:**
  - Purpose-built for the decoration side (screen printing, embroidery, DTG, DTF, sublimation)
  - Production workflow management (job scheduling, hot folders, production tracking)
  - Art/design collaboration tools (GraphicsFlow)
  - Online store builder for teams, schools, corporate (InkSoft)
  - Most complete suite for decorators specifically
- **Weaknesses:**
  - Focused on decorators/print shops, not on the agency/distributor side
  - No CRM or client relationship management
  - No vendor coordination across multiple suppliers
  - No PromoStandards integration
  - No AI features visible
  - Fragmented product suite (three separate products stitched together)
- **What BrandOps can steal:**
  - Production floor workflow concepts (job scheduling, status tracking)
  - Art approval workflows
  - The insight that decorators and distributors need ONE platform, not two separate ecosystems

### 8. Printful (printful.com) -- PRINT-ON-DEMAND (DIFFERENT MODEL)

- **What they do:** Print-on-demand fulfillment. No minimums. 472+ products. Fulfillment centers across NA and Europe. Integrates with 23 e-commerce platforms. MerchShare for employee/event merch distribution.
- **Pricing:** No upfront costs; markup-based. Bulk orders (25+ pieces): up to 55% savings. Enterprise plan for advanced branding.
- **Strengths:**
  - Zero inventory risk
  - Global fulfillment network
  - Easy to get started (no minimums)
  - Good for one-off or small-batch merch
- **Weaknesses:**
  - Not designed for agencies managing complex, multi-vendor orders
  - Limited product catalog vs. PromoStandards ecosystem
  - No CRM, project management, or client portal
  - Quality varies (network model, not in-house manufacturing)
  - Higher per-unit costs than bulk decorated apparel
  - Cannot handle concert merch at scale (thousands of units, tight timelines)
- **What BrandOps can steal:**
  - MerchShare concept (direct links for employee/event attendee self-service)
  - Integration with Printful AS A VENDOR within BrandOps (offer POD as one fulfillment option alongside traditional decoration)

### 9. Boundless Network (boundlessnetwork.com) -- ENTERPRISE MERCH

- **What they do:** Enterprise branded merchandise solutions with company stores at scale. Punchout integration for ERPs. Managed service model.
- **Pricing:** Enterprise/custom (not publicly listed).
- **Strengths:**
  - Enterprise-grade: Punchout integration, SSO, ERP connectivity
  - Managed service approach (they handle fulfillment)
  - Strong reporting and order tracking
  - Proven at scale with large corporations
- **Weaknesses:**
  - Enterprise-only -- not accessible to $250K-$20M merch agencies
  - Managed service, not software -- they ARE the agency, not a tool for agencies
  - Not available as SaaS for independent merch shops
  - Acquired/legacy technology stack
- **What BrandOps can steal:**
  - Punchout integration concept for enterprise clients
  - The idea that large corporations WANT self-service portals with approval workflows and budget controls

---

## Feature Gap Analysis

### Features Competitors Have That BrandOps Must Match (Table Stakes)

| Feature | Who Has It | Priority |
|---------|-----------|----------|
| PromoStandards integration (product data, inventory, pricing) | commonsku, OMG, SAGE, ASI, MPower | CRITICAL |
| Client-facing approval portals | commonsku, OMG, Boundless | HIGH |
| Decorator pricing matrix (colors, run charges, quantity breaks) | commonsku, PromoXcrm | HIGH |
| Virtual samples / logo mockups | OMG, SAGE | HIGH |
| Online stores (pop-up, company, event) | OMG, commonsku, InkSoft, MPower | HIGH |
| Order management (quote to invoice) | Everyone | CRITICAL |
| Product search across suppliers | SAGE, ASI, commonsku, OMG | HIGH |
| Tax calculation automation | commonsku (Avalara) | MEDIUM |
| Shipping integration (FedEx, UPS, USPS) | MPower, OMG | MEDIUM |
| Accounting integration (QuickBooks) | PromoXcrm, MPower | MEDIUM |

### Features NO Competitor Has (BrandOps Differentiation Opportunities)

| Feature | Why It Matters |
|---------|---------------|
| **AI order entry from natural language** | Trevor's team spends 4+ hours on one t-shirt order. AI that ingests an email or call transcript and auto-populates the entire order would be transformative. NOBODY does this. |
| **Unified agency + decorator workflow** | Every tool is either for distributors OR decorators. Nobody serves agencies that do BOTH (source AND decorate). |
| **Concert/event merch module** | Tight deadlines, massive quantities, venue-specific logistics, day-of inventory tracking. Zero solutions address this. |
| **Floor stock / warehouse management for merch** | Agencies holding blank inventory need warehouse visibility. Current tools don't handle this. |
| **AI-powered vendor recommendation** | Given an order spec, AI suggests the best vendor based on price, lead time, quality history, and current inventory. Nobody does this at the AI level. |
| **Multi-brand client dashboards** | One agency managing merch for 50+ corporate clients needs per-client dashboards with brand guidelines enforcement. Weak or absent in all competitors. |
| **AI quote generation from brief** | Client sends "I need 500 polos for a golf tournament in 3 weeks, budget $15/unit" -- AI generates a full quote with product options, decoration specs, and vendor selection. |
| **Predictive reorder intelligence** | AI analyzes client ordering patterns and proactively suggests reorders before they run out. |

---

## AI Opportunity

### Where AI Gives BrandOps an Unfair Advantage

**1. AI Order Entry (The $4-Hour Problem)**
The single biggest pain point: manual data entry. Trevor described spending 4+ hours entering one t-shirt order across multiple systems. BrandOps can build AI that:
- Ingests order requests from email, call transcripts, or client portal submissions
- Auto-populates order forms with product specs, quantities, sizes, colors, decoration details
- Cross-references against PromoStandards data for real-time pricing and inventory
- Flags conflicts or missing information for human review
- **Impact**: Turn a 4-hour task into a 10-minute review. This alone justifies the platform.

**2. AI Quoting Engine**
Nobody in this space has an AI that can take a client brief and generate a complete quote. BrandOps can:
- Parse natural language briefs ("500 polos, golf tournament, 3 weeks, $15/unit budget")
- Search across suppliers via PromoStandards for matching products
- Apply decorator pricing matrices automatically
- Generate tiered quote options (good/better/best)
- Include decoration mockups via AI-assisted virtual sampling

**3. AI Vendor Intelligence**
With order history data, BrandOps can build a vendor intelligence engine that:
- Recommends optimal vendors based on product type, quantity, timeline, and quality history
- Predicts delivery timelines based on historical vendor performance
- Alerts when preferred vendors have inventory issues
- Suggests alternative vendors when primary is unavailable

**4. AI Client Insights**
Commonsku is heading this direction (AI Recommendations based on purchase history) but BrandOps can go further:
- Predict client reorder timing based on historical patterns
- Suggest upsell opportunities based on industry trends and peer ordering behavior
- Auto-generate client review reports with spend analytics and ROI metrics
- Proactive outreach triggers when seasonal ordering windows approach

**5. AI Production Scheduling**
For agencies that handle decoration in-house:
- Optimize production floor scheduling based on order deadlines, machine capacity, and material availability
- Predict bottlenecks before they happen
- Auto-route jobs to the optimal decoration method (screen print vs. embroidery vs. DTG) based on specs

### Competitive AI Landscape (Current State)

| Competitor | AI Maturity | What They Have |
|-----------|------------|----------------|
| commonsku | Early | Product recommendations from purchase history, planned AI chatbot (2026) |
| SAGE | Early | AI Design Studio (image editing, logo removal), AI image generation |
| ASI/ESP+ | Early | AI proposal content generation (summaries, email copy) |
| PromoXcrm | Marketing | Claims "AI-powered" but appears to be basic automation |
| LeadLeaf | Generic | White-label AI chatbot and website builder (not industry-specific) |
| Inktavo/Printavo | None | No AI features visible |
| OrderMyGear | None | No AI features visible |

**Bottom line:** The industry is in AI kindergarten. Everyone is doing basic content generation or product recommendations. NOBODY is doing AI order entry, AI quoting, AI vendor intelligence, or AI production scheduling. BrandOps has a **24-month window** to establish dominance before incumbents catch up.

---

## Recommendations for the Architect

### 1. Build the AI Order Entry Engine First -- It Is the Killer Feature

The 4-hour manual entry problem is universal. If BrandOps can reduce order entry to 10 minutes of human review, it will sell itself through word-of-mouth alone. This should be the centerpiece of the MVP demo and the primary sales narrative. No competitor has this. No competitor is close.

### 2. Integrate PromoStandards from Day One

This is non-negotiable table stakes. Without PromoStandards integration, BrandOps cannot access real-time product data, inventory, and pricing from the 500+ supplier ecosystem. Commonsku, OMG, SAGE, and ASI all have this. Building without it makes BrandOps a toy. PSRESTful (psrestful.com) offers a REST API wrapper around PromoStandards that could accelerate integration.

### 3. Target the "Agency in the Middle" Gap

Every competitor is built for either distributors (commonsku, SAGE, ASI) OR decorators (Printavo, shopVOX). Nobody serves the full-service merch agency that sources, coordinates vendors, manages decoration, AND handles client relationships. 85 Supply is exactly this type of business. There are thousands like them. Own the middle.

### 4. Price Below commonsku, Above PromoXcrm

Commonsku charges $129-159/user/month. PromoXcrm charges $55/user/month. BrandOps should target **$79-99/user/month** with AI features that justify the premium over PromoXcrm while undercutting commonsku by 25-40%. At the target market ($250K-$20M revenue agencies with 3-15 users), this positions BrandOps as the high-value choice.

### 5. Build the Event/Concert Merch Module as a Differentiator

Zero competitors address the unique needs of concert, festival, and live event merchandise. This includes: venue-specific logistics, day-of inventory tracking, rapid turnaround production, on-site POS integration, and post-event analytics. 85 Supply does this. It is a high-margin, high-loyalty niche that would create an unassailable wedge for BrandOps.

---

## Appendix: Competitor Pricing Summary

| Competitor | Per-User/Month | Model | Transaction Fees |
|-----------|---------------|-------|-----------------|
| commonsku | $129-159 | Per user, min 2 | 1-2.5% on shops |
| OrderMyGear | $79 (order mgmt) | Per user + one-time license | 3.95% + Stripe |
| PromoXcrm | $55 | Per user + $449 setup | Not listed |
| SAGE | Membership-based | Tiered by capabilities | Varies |
| ASI/ESP+ | Bundled w/ membership | Association membership | Not listed |
| Printavo | $99/month | Flat (not per-user) | None listed |
| shopVOX | $199 + $29/user | Base + per user | None listed |
| MPower | Not public | Not public | Not public |
| LeadLeaf | Not public | Not public | Not public |

---

## Sources

- [commonsku Pricing](https://commonsku.com/pricing)
- [commonsku AI & Innovation Update](https://commonsku.com/articles/the-future-of-promotional-products-commonskus-ai-innovation-update)
- [commonsku 2025 Year in Review](https://commonsku.com/articles/2025-year-in-review-every-feature-that-made-your-workflow-easier)
- [The Silicon Review: commonsku Profile](https://thesiliconreview.com/magazine/profile/promotional-products-workflow-platform-software)
- [OrderMyGear](https://www.ordermygear.com/)
- [OrderMyGear Pricing](https://www.ordermygear.com/pricing/)
- [SAGE World](https://www.sageworld.com/)
- [SAGE Distributor Overview](https://www.sageworld.com/distributor/overview.html)
- [ASI Central Technology](https://asicentral.com/technology/)
- [ASI Launches ESP+ Stores (2025)](https://members.asicentral.com/news/press/press-releases/january-2025/asi-launches-espplus-stores-and-unveils-promo-s-first-end-to-end-e-commerce-solution/)
- [PromoXcrm](https://promoxcrm.ai/)
- [PromoStandards](https://promostandards.org/)
- [PSRESTful](https://psrestful.com/)
- [LeadLeaf](https://www.leadleaf.app/promoindustry)
- [Inktavo](https://www.inktavo.com/)
- [Printavo Pricing](https://www.printavo.com/pricing/)
- [shopVOX](https://shopvox.com/)
- [Printful Branded Merchandise](https://www.printful.com/branded-merchandise)
- [Boundless Network](https://www.boundlessnetwork.com/)
- [PPAI: North American Industry Hits Record $27.7B in 2025](https://www.prnewswire.com/news-releases/north-american-promotional-products-industry-hits-record-27-7-billion-in-2025--outperforming-us-economic-growth-302665941.html)
- [PPAI: Outlook 2025 Sales Growth](https://www.ppai.org/media-hub/outlook-2025-promo-firms-expect-sales-growth/)
- [PPAI: Technology Standouts 2025](https://www.ppai.org/media-hub/technology-standouts-for-2025/)
- [PPAI: 2025 Innovation Research](https://www.ppai.org/media-hub/2025-ppai-100-innovation-research-shows-how-promo-is-evolving-digitally/)
- [ASI: 10 Promo Pros Using AI & Automation](https://members.asicentral.com/news/strategy/september-2025/10-promo-pros-reveal-how-they-re-using-ai-automation/)
- [Cognitive Market Research: Promotional Products Market](https://www.cognitivemarketresearch.com/promotional-products-market-report)
- [Decorated Apparel Industry Statistics](https://rawshot.ai/statistic/decorated-apparel-industry)
- [Promotional Products Market Report (Metastat)](https://www.metastatinsight.com/report/promotional-products-market)
- [G2: Best Promotional Product Management Software](https://www.g2.com/categories/promotional-product-management)
- [DecoNetwork](https://www.deconetwork.com/)
- [Single Serve Merch: Distributor Pain Points](https://singleservemerch.com/the-biggest-pain-points-promotional-product-distributors-face-with-company-stores/)
