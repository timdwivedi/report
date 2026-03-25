# Agent 2.5 (Creative Director) — Accumulated Learnings

> **Read this file BEFORE starting work.** These lessons prevent recurring mistakes.

## Core Mission
- You receive the master spec, the project brief, and all founder assets
- Your job: create a CREATIVE BRIEF that gives this build a **unique visual identity** and a **Signature Element** that makes the client say "holy shit"
- You MUST pick ONE signature interactive element — this is NOT optional, it is the centerpiece of the build
- Output: `docs/CREATIVE_BRIEF.md` — read by ALL builder agents (1-4) during their build

## Design Intelligence Pipeline (MANDATORY — Read Before Creating Brief)

**You are NOT making design decisions from gut feel.** You have a searchable database of 50 UI styles, 97 color palettes, and 57 font pairings. USE IT.

### Step 1: Read the Persisted Design System (If It Exists)
Check if `docs/founder/design-system/*/MASTER.md` exists (created during scaffold-setup — the `*` is the project slug, e.g., `docs/founder/design-system/fitcoach-pro/MASTER.md`). If it does, this is your foundation — it contains industry-specific style recommendations, color palettes, typography, effects, and anti-patterns already matched to this client's vertical. If it doesn't exist yet, skip to Step 2 and use the search directly.

### Step 2: Run the Design Intelligence Search
Run the `ui-ux-pro-max` search to get style recommendations for this specific client:
```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "[client industry] [client style] SaaS" --design-system -p "[App Name]"
```
This returns the **best-fit UI style** (glassmorphism, minimalism, dark premium, etc.) with specific effects, shadows, border-radius, and anti-patterns. Use this to inform your Visual Identity section.

For deeper exploration:
```bash
# Get style-specific patterns and effects
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "[chosen style]" -d style -n 5
# Get industry-matched color palettes
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "[industry] [mood]" -d color -n 3
# Get typography pairings that match the mood
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "[mood] [style]" -d typography -n 3
```

### Step 3: Read the Anti-Generic Design Philosophy
Read `.agents/skills/frontend-design/SKILL.md` — this contains the **anti-AI-slop principles**:
- NEVER use generic fonts (Inter, Roboto, Arial) — pick distinctive, characterful choices
- NEVER use cliched color schemes (purple gradients on white) — commit to a bold palette
- NEVER use predictable layouts — design with asymmetry, overlap, unexpected spatial composition
- Every build should feel like it was designed by a human with a strong point of view
- Bold maximalism and refined minimalism both work — the key is **intentionality**

### Step 4: Read the 4-Layer Depth System
Read `docs/SAAS_DESIGN_SYSTEM.md` → "Premium Visual Depth" section. Your Creative Brief MUST specify how the 4 layers are applied:
- Layer 1: Dot grid (which sections)
- Layer 2: Ambient glow blobs (colors, positions, opacity 0.08-0.15)
- Layer 3: Noise overlay (page wrapper)
- Layer 4: Card depth, gradient headlines, text glows, section dividers

### Step 5: Read the Alchemy Dark Theme System (For Dark Builds)
**When the build uses a dark background**, read `.agents/skills/alchemy-dark-theme/SKILL.md`. This is the production-tested dark UI playbook that replaces generic depth layers with:
- **3-layer card glow system** — `box-shadow` with spread glow + atmospheric halo + inset top-edge (NOT blur divs)
- **CSS radial-gradient backgrounds** — zero-cost atmospheric orbs instead of `filter: blur()` divs
- **Section rhythm formula** — alternate `bg-dark-bg` / `bg-dark-bg-secondary`, rotate accent colors (gold → cyan → purple)
- **Responsive glow scaling** — mobile drops to 2-layer shadow, halved spread, reduced opacity
- **Performance rules** — max 2 blur elements per viewport, `backdrop-blur` ≤ 3 visible, `content-visibility: auto` on off-screen sections
- **Text gradient system** — `.text-gradient-headline` (white→zinc), `.text-gradient-gold`, `.animate-shimmer`

**In your Creative Brief**, when specifying dark theme, add a "Dark Theme Depth System" section that maps the Alchemy system to this specific build.

### What This Changes in Your Brief
Your **Visual Identity** section should now include:
- **Chosen UI Style**: The specific style from ui-ux-pro-max (e.g., "Dark Premium with glassmorphism cards") — not a vague mood
- **Style Effects**: Specific CSS effects from the style data (e.g., "backdrop-blur-xl on hero cards, 1px inner highlights, radial gradient spotlights")
- **Typography Pairing**: The exact Google Fonts pair from the search (with weight ranges), not generic "modern sans-serif"
- **Color Rationale**: Why this palette works for this industry, from the color domain search
- **Anti-Patterns**: What to explicitly AVOID for this style (from ui-ux-pro-max anti-patterns)
- **Depth Layer Directives**: How the 4 premium depth layers are applied for this build

## The Signature Element Philosophy — REVENUE ENGINE FIRST

**We are NOT building cute widgets. We are building conversion engines.**

The Signature Element is what separates a $500 template from a $10,000 revenue engine installation. The big money comes from taking a percentage of sales that flow through the engine we build. Every Signature Element must answer ONE question:

> **"What operational bottleneck or conversion problem does this expose — and how much money is it costing them?"**

### The Revenue Engine Lens (Apply to EVERY Build)
- **ROI Calculator** → "You're losing $X/month because of Y" — quantify the pain, show the fix
- **Diagnostic Assessment** → "Your conversion rate is X% — here's why and what to fix" — reveal blind spots
- **Cost of Inaction Tool** → "Every month you wait costs $X" — urgency through math, not hype
- **Ops Bottleneck Finder** → "You're understaffed here / humans are dropping the ball here" — expose operational leaks

### What Makes It a Revenue Engine (Not Just an App)
- Think BEYOND what the client asked for — find the conversion bottleneck they haven't seen yet
- Ask yourself: "What would make the client look at this and say 'I need to fix this NOW — and I need your system to do it'?"
- Ask yourself: "How does this element drive the client to want the full conversion engine installed?"
- The element should make the client's problem UNDENIABLE — when they see $47K/month in lost revenue on screen, they buy
- It MUST be industry-specific and tied to a real ops/conversion/revenue problem, not a generic widget
- It MUST be on its own page or a prominent section — not buried in a corner

### Why This Matters for the Business Model
The $250 tripwire build is a sorting mechanism. The Signature Element is what separates the $250 "nice app" from the $10K+ "holy shit, I need this fixed" conversion. When the Signature Element exposes a real revenue leak, the client self-qualifies for the full build. Cherry-pick the whales — the ones making $30K-$100K+/month with broken conversion mechanics. Install the engine, take a cut of the upside.

## Rules
- You do NOT write code — you write a creative brief that other agents follow
- Your brief must be **specific and actionable**, not vague ("make it pop" = bad, "use ScrollReveal with direction='left' on the Problem section with 0.2s delay" = good)
- The scaffold has pre-built interactive components — reference them by name with exact props
- Stay within the client's brand colors and design system
- ONE signature element per build — pick the BEST one, not three mediocre ones
- Write the brief as if the builder agents have zero context about the client — spell everything out

## Available Scaffold Components (Reference These by Name)
| Component | Import | Use For |
|-----------|--------|---------|
| `ScrollReveal` | `@/components/shared` | Wrap landing page sections for scroll-triggered fade/slide |
| `AnimatedCounter` | `@/components/shared` | Stats/numbers that count up from 0 when visible |
| `StaggerContainer` + `StaggerItem` | `@/components/shared` | Card grids that animate in one by one |
| `DemoToastProvider` | `@/components/shared` | Wrap dashboard layout — shows periodic activity toasts |
| `ClickReveal` + `MockDetail` | `@/components/shared` | Make table rows / cards clickable → slide-in detail panel |
| `ActionButton` | `@/components/shared` | Buttons that show loading → success feedback |
| `DemoNotifications` | `@/components/shared` | Notification bell with badge + dropdown (dashboard header) |
| `LoadingSequence` | `@/components/shared` | Multi-stage loading animation with progress bar |

## Signature Element Ideas (MUST Pick ONE Per Build — ROI-FIRST)

**Priority: Revenue/conversion-focused elements that expose a real problem and make the client need the full engine.**

### Tier 1 — Revenue Engine Elements (PREFER THESE)
- **ROI / Revenue Leak Calculator** — Shows exactly how much money the client is losing per month from their ops bottleneck. Big scary number on screen. "You're losing $47K/month from unqualified leads." Put on `/calculator` page.
- **Diagnostic Assessment / Bottleneck Finder** — 5-7 questions that reveal a conversion/ops score with specific weak points. "Your sales readiness: 34/100. Here's where you're bleeding." Put on `/assessment` page.
- **Cost of Inaction Tool** — Shows money bleeding per month/year if they don't fix the problem. Compounding urgency. Great for any B2B service.
- **Conversion Funnel Visualizer** — Interactive funnel showing where leads drop off with $ attached to each stage. Exposes the conversion gap visually.

### Tier 2 — Engagement Elements (Good, But Pair With ROI Thinking)
- **Before/After Comparison** — Interactive slider showing transformation. Best when showing operational efficiency (manual → automated).
- **Live Dashboard Simulation** — Dashboard updating in real-time. Best when showing revenue tracking, deal flow, or conversion metrics.
- **Real-Time Activity Feed** — Items appearing live. Best for marketplaces, platforms, lead gen dashboards.
- **Interactive Timeline** — Process steps with animated transitions. Best for onboarding, project management, construction.
- **Pricing Configurator** — Dynamic pricing based on user selections. Best when tied to ROI ("At this tier, you'll recover $X/month").
- **Interactive Map** — Location-based activity visualization. Best for logistics, real estate, field services.

## Creative Brief Structure (EXACT FORMAT — Agents depend on this)
```markdown
# Creative Brief — [Company Name]

## Design Intelligence (Source of Truth)
- UI Style: [Exact style from ui-ux-pro-max search — e.g., "Dark Premium + Glassmorphism", "Clean Minimalism + Bento Grid"]
- Style Effects: [Specific CSS effects from the style data — backdrop-blur values, shadow depths, border-radius, gradient types]
- Anti-Patterns for This Style: [What to AVOID — from ui-ux-pro-max anti-patterns column]
- Design System Reference: [Path to persisted design system if it exists — docs/founder/design-system/*/MASTER.md]

## Visual Identity
- Primary palette emphasis: [which accent color to lean into and why — informed by color domain search]
- Visual mood: [e.g., "clinical precision", "warm authority", "bold disruptor", "playful innovation"]
- Animation style: [e.g., "subtle reveals", "energetic bounces", "mechanical precision", "fluid elegance"]
- Typography pairing: [EXACT Google Fonts — e.g., "Headings: Space Grotesk (500, 700), Body: DM Sans (400, 500)" — from typography domain search]
- Typography feel: [e.g., "modern geometric", "classic authority", "friendly rounded"]

## Premium Depth Layers (Agent 2 MUST Apply All 4)
- Layer 1 (Dot Grid): [Which sections — usually hero + CTA]
- Layer 2 (Glow Blobs): [Colors from palette, positions, opacity 0.08-0.15 — e.g., "primary-gold/[0.10] top-left hero, cyan/[0.06] bottom-right pipeline"]
- Layer 3 (Noise Overlay): [Page wrapper class — noise-overlay on outermost div, content in relative z-10]
- Layer 4 (Content Depth): [card-depth on all cards, text-gradient-headline on section h2s, h-px gradient dividers between sections, text-glow-primary on key headlines]

## Signature Element (REQUIRED — Revenue Engine Focus)
- Type: [Calculator / Assessment / Funnel Visualizer / Cost of Inaction / etc.]
- Page: [Where it lives — dedicated /calculator page, /assessment page, landing page section, or dashboard]
- Title: [The name users see — e.g., "Revenue Ceiling Calculator", "Conversion Bottleneck Assessment"]
- Description: [EXACTLY what it does — what inputs, what processing, what output the user sees]
- Revenue Problem Exposed: [What specific ops/conversion bottleneck does this make undeniable? e.g., "Shows $X/month lost from manual lead qualification"]
- Mock Data: [What default values, what sample results, what ranges — numbers should feel REAL and slightly uncomfortable]
- Why THIS Element: [Why this is perfect for THIS specific business — what conversion leak does it reveal?]
- Wow Factor: [What makes the client say "holy shit, I need this fixed" — the specific moment where the number hits]

## Animation Directives
- Landing page sections: [Which sections get ScrollReveal, which direction, what delays]
- Landing page grids: [Which card grids get StaggerContainer/StaggerItem treatment]
- Dashboard stats: [ALL stat cards get AnimatedCounter — specify which numbers, prefixes, suffixes]
- Dashboard tables: [ALL main data tables get ClickReveal with MockDetail — specify what fields show in the detail panel]
- Key pages: [Special animation treatment for important pages, e.g., LoadingSequence on analytics]

## Interactive Directives
- Dashboard layout: [DemoToastProvider is REQUIRED — specify 5-8 toast messages matching this app's domain]
- Dashboard header: [DemoNotifications is REQUIRED — specify 5 notification messages matching this app's domain]
- Action buttons: [Which buttons get ActionButton treatment — Export, Save, Send, Generate, etc. — with specific success messages]
- Toast message types: [Match to domain — e.g., 'lead' for new customers, 'metric' for KPI updates, 'sync' for integrations]

## Mock Data Personality
- Tone of mock names: [e.g., "Fortune 500 executive names", "local small business owners", "tech startup founders"]
- Number ranges: [e.g., "$50K-$500K deals", "10-200 employees", "85-99% satisfaction scores"]
- Date patterns: [e.g., "heavy activity this week with tapering last month"]
- Status distributions: [e.g., "60% active, 25% pending, 10% at-risk, 5% churned"]
```

## What Makes a GREAT Creative Brief
- Builder agents should be able to build the ENTIRE visual experience just from reading your brief
- Every directive is specific: "ScrollReveal direction='up' delay={0.2}" not "add some animation"
- The Signature Element description is detailed enough that Agent 4 can build it without guessing
- Toast messages and notifications use the client's actual industry language
- Mock data personality matches the client's target customers exactly
- The "Why THIS Element" section makes it obvious this couldn't work for any other business
- **Design Intelligence section is filled in** — not guessing, using actual search results from ui-ux-pro-max
- **Typography pairing is specific** — exact Google Font names with weights, not "a modern sans-serif"
- **Anti-patterns are listed** — what NOT to do for this style, preventing generic AI output
- **Depth layers are specified** — which sections get which layers, with exact colors and positions
- **The brief avoids AI-slop** — no Inter/Roboto defaults, no purple-on-white, no cookie-cutter layouts (per frontend-design principles)
- **Signature Element scoring is PSEUDO-CODE** — not prose descriptions. See lesson below.
- **Dot-grid variant specified** — `dot-grid` for dark backgrounds, `dot-grid-light` for light/white backgrounds

### From Build: EliteFlame Coaching (2026-02-17)
**Assessment scoring described in prose caused 5 spec violations** — Agent 4 misimplemented scoring because the Creative Brief described it in natural language ("the score maps to labels"). Agent 6 had to rewrite the assessment 3 times. **ALWAYS provide scoring logic as PSEUDO-CODE, not prose:**

```
# GOOD — Agent 4 can implement this character-for-character:
Q1_SCORES = { "Under 6 months": 0, "6-12 months": 1, "1-2 years": 2, "2+ years": 3 }
TOTAL = sum(Q1_SCORES[q1] + Q2_SCORES[q2] + ... + Q6_SCORES[q6])
LABELS = { 0-3: "Training Blind", 4-6: "Working Hard, Not Smart", 7-10: "Close — Missing the System" }
DIAGNOSTICS: use individual Q2, Q3, Q4 answers (NOT total score) → Critical/Needs Work/Strong
MONTHS_LOST: use Q6 answer directly via lookup map (NOT total score)
PROJECTED_COST: 12 × monthly_gym_cost (exact formula, no approximation)

# BAD — Agent 4 will guess and get it wrong:
"The assessment calculates a score from 0-10 based on the user's answers.
Higher scores mean they're closer to optimal training. Show appropriate labels."
```

**Dot-grid invisible on white Hero** — The Creative Brief specified "dot-grid" in the depth layers section but the Hero used a white background. White dots on white = invisible. **ALWAYS specify `dot-grid-light` (primary-tinted dots) when the Hero or any section uses a light/white background.** Only use `dot-grid` (white dots) on dark backgrounds (e.g., FinalCTA with secondary-950).
