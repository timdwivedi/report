# Bloom Agentic Build System

## For Developers: How This Whole Thing Works (ELI5)

> **Read this first.** This explains the entire system before you touch anything.

### What Is This?

This is a **fully automated AI build pipeline** that turns a client intake form into a working SaaS app. One bash command runs 9 AI agents that build the entire frontend, deploy it live, and generate an intelligence report. Zero manual coding needed for Phase 1.

### The Big Picture (Two Phases)

```
Phase 1: SHOWCASE (Automated — ~20-40 min)
  Client fills out intake form → You run one command → 9 AI agents build a complete
  frontend app with landing page, dashboard, auth pages, feature pages, mock data →
  Auto-deploys to Vercel → Client sees a live, clickable demo

Phase 2: ACTIVATE (Semi-Automated — hours/days)
  Client approves showcase → You refine the implementation plan together →
  Developer says "Activate" in their IDE → The Activator Agent builds real database,
  auth, payments, and live data — pausing at checkpoints for human verification
```

### Phase 1 Flow: What Happens When You Run The Command

```bash
bash bloom/scripts/ops/agentic-build.sh <submission-id>
```

This single command does EVERYTHING:

```
Step 1:  Reads Supabase credentials from web/.env.local
Step 2:  Fetches the client's intake form data from Supabase
Step 2b: Downloads any uploaded assets (logos, docs) into docs/founder/
Step 2c: Queries past build debriefs for cross-build learning

Step 3:  Launches 3 sequential AI agents:
         • Agent -1 (The Scout)     → Scrapes competitor/client websites for intel
         • Agent 0 (Enhancement)    → Transforms raw intake into elite business intel
         • Spec Agent               → Generates full project spec from all intel

Step 4:  Injects the app brief into this document (QUICK_START_AGENTS.md)
Step 5:  Runs npm install
Step 6:  Launches 4 AI agents IN PARALLEL:
         • Agent 1 (Blueprint)      → Types, mock data, DB schema
         • Agent 2 (Brand)          → Landing page, colors, marketing
         • Agent 3 (Shell)          → Dashboard, sidebar, nav, auth
         • Agent 4 (Pages)          → All feature pages

Step 7:  Waits for all 4 to finish (live status dashboard in terminal)
Step 8:  Agent 5 (The Welder)       → Wires everything together, gets build passing
Step 9:  Agent 6 (The Closer)       → QC review, build summary, implementation plan
Step 10: Runs verify.sh
Step 10b: Agent 7 (Auto-Debrief)    → Reads all logs, generates build intelligence report

Step 11: IF deploy is configured:
         • Pushes to GitHub (FULL version with all docs + Activate trigger)
         • Auto-Package: strips operator SOPs from local copy
         • Deploys CLEAN version to Vercel (no internal docs exposed)
         • Saves demo URL + debrief data to Supabase
```

### What You Get After Phase 1

```
~/Desktop/bloom-builds/company-name/
├── web/                          # Full Next.js 14 app
│   ├── app/                      # Pages (landing, dashboard, features, auth)
│   ├── components/               # All UI components
│   ├── lib/                      # Types, constants, mock data, utils
│   └── public/                   # Static assets
├── docs/
│   ├── QUICK_START_AGENTS.md     # ← You are here
│   ├── LAUNCH_GUIDE.md           # 10-phase deployment guide
│   ├── SAAS_DESIGN_SYSTEM.md     # Design system reference
│   ├── roadmap/
│   │   ├── 01_project_spec.md    # Full project spec (AI-generated)
│   │   ├── 02_build_summary.md   # What was built + QC findings
│   │   └── 03_implementation_plan.md  # Production expansion roadmap
│   └── founder/                  # Client uploads + AI intel reports
├── BUILD_DEBRIEF.md              # Auto-generated build intelligence
├── CLAUDE.md                     # AI project context
└── verify.sh                     # Build verification script
```

The live demo URL is saved to `bloom_submissions.demo_url` in Supabase and shown in the terminal output.

### Phase 2: Activate (Production Build)

After the client approves the showcase, a developer opens the project in Claude Code (or any AI IDE) and says **"Activate"**. The Activator Agent reads the refined implementation plan and builds production features sequentially, pausing at human checkpoints.

**Full Activate instructions are at the bottom of this document.**

### Cross-Build Learning

Every build generates a debrief (BUILD_DEBRIEF.md + structured JSON). This data is saved to Supabase. On the NEXT build, the pipeline queries the last 5 debriefs and injects lessons learned into the Spec Agent's prompt. The system gets smarter with every build.

### Key Files In The Pipeline Repo

| File | What It Does |
|------|-------------|
| `bloom/scripts/ops/agentic-build.sh` | The main pipeline script — runs all 9 agents |
| `bloom/docs/QUICK_START_AGENTS.md` | Agent instructions (this file — injected into each build) |
| `bloom/docs/LAUNCH_GUIDE.md` | Post-build deployment guide (10 phases) |
| `bloom/docs/SAAS_DESIGN_SYSTEM.md` | Design system for landing pages |
| `web/lib/bloom/bloom-build-generator.ts` | Scaffold generator (creates the starter project) |
| `web/lib/intelligence/` | Invisible Pipeline's distilled IP — scoring, profiling, voice DNA, conversion prediction, archetypes |
| `.claude/skills/intelligence-engine/SKILL.md` | Intelligence module catalog — detection rules, domain mapping, cleanup directives |
| `bloom/scaffold/` | Template files copied into each new build |
| `web/.env.local` | Supabase creds + BLOOM_GITHUB_ORG + VERCEL_TOKEN |

### Requirements

- **Claude Code CLI**: `npm install -g @anthropic-ai/claude-code`
- **Claude Max plan** ($200/month) → $0 per-token cost for all agents
- **jq**: `brew install jq`
- **GitHub CLI**: `brew install gh` (for auto-deploy)
- **Vercel CLI**: `npm install -g vercel` (for auto-deploy)
- **web/.env.local** with: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BLOOM_GITHUB_ORG`, `VERCEL_TOKEN`

### 9 Agents At A Glance

| # | Agent | Model | What It Does | Runs |
|---|-------|-------|-------------|------|
| -1 | **The Scout** | opus | Scrapes competitor + client websites for intel | Sequential |
| 0 | **Enhancement Engine** | opus | Turns raw intake into elite business intelligence | Sequential |
| — | **Spec Agent** | opus | Generates full project spec from all intel | Sequential |
| 2.5 | **Creative Director** | opus | Creates CREATIVE_BRIEF.md — visual identity, signature element, animation directives | Sequential |
| 1 | **Blueprint** | opus | Types, mock data, DB schema, constants | Parallel |
| 2 | **Brand** | opus | Landing page, colors, fonts, marketing sections | Parallel |
| 3 | **Shell** | opus | Dashboard layout, sidebar, nav, auth pages | Parallel |
| 4 | **Pages** | opus | All feature pages with stats, tables, cards | Parallel |
| 5 | **The Welder** | opus | Wires everything together, gets `npm run build` passing | Sequential |
| 6 | **The Closer** | opus | QC review, build summary, implementation plan | Sequential |
| 7 | **Auto-Debrief** | opus | Reads all logs, generates build intelligence report | Sequential |

### Auto-Package (What Gets Stripped Before Vercel Deploy)

GitHub gets the FULL version (all docs, Activate trigger, agent instructions). Before deploying to Vercel, the pipeline strips:
- `docs/QUICK_START_AGENTS.md`, `LAUNCH_GUIDE.md`, `SAAS_DESIGN_SYSTEM.md`, `DEVELOPER_GUIDE.md`
- All `.bloom-*.json`, `.bloom-*.md`, `agent-*.log` files
- Agent directives from the project spec
- Agent System + Activate sections from CLAUDE.md
- The `.claude/skills/scaffold-setup` directory

This means the live demo URL shows a clean app with no internal docs exposed.

---
---

## App Brief

<!-- POPULATED BY SCAFFOLD-SETUP or by the agentic-build.sh pipeline. -->
<!-- When agents read this document, they use this brief to know what to build. -->

**STATUS: NOT YET CONFIGURED**

Run the initial setup first, or let the agentic build pipeline populate this section automatically.

---

## How Agents Work (Manual Mode)

> **Note:** If you ran `agentic-build.sh`, all of this happens automatically. This section is for understanding what each agent does, or for running agents manually.

Each agent works on **different files**. No conflicts. No coordination needed.

| Agent | What It Builds | Time |
|-------|---------------|------|
| **Agent 1** (Blueprint) | Types, mock data, DB schema, project spec | ~2 min |
| **Agent 2** (Brand) | Landing page, brand colors, marketing sections | ~3 min |
| **Agent 3** (Shell) | Dashboard layout, sidebar, nav, auth pages | ~3 min |
| **Agent 4** (Pages) | All feature pages with stats, tables, cards | ~4 min |
| **Agent 5** (Welder) | Wires everything together, fixes imports/types, gets build passing | ~3 min |
| **Agent 6** (Closer) | Quality review, verify.sh, build summary, implementation plan | ~4 min |

---

## Golden Rule: Show Everything, Connect Later

**ALL AGENTS MUST FOLLOW THIS RULE:**

This build is a **frontend showcase**. The goal is to show the client (or investor, or audience) what the finished product LOOKS like. Every UI element that would exist in the final app must be VISIBLE, even if it doesn't work yet.

**What this means in practice:**
- **Auth pages**: Include Google Sign-In button, GitHub login, "Forgot Password" link -- all styled and visible, even though they won't fire. Add `onClick={() => {}}` or a subtle toast: "Coming soon!"
- **Dashboard**: Show notification badges with counts, search bars with placeholder text, filter dropdowns that open but don't filter
- **Feature pages**: Include "Export CSV" buttons, "Invite Team Member" modals, "Upgrade to Pro" banners -- all the final-product UI
- **Settings**: Show connected integrations (Slack, Zapier, etc.) as toggle cards, even if they're just visual
- **Mobile-responsive**: Every page MUST look great at mobile width (375px). The client will see this in Chrome DevTools mobile view. Use responsive Tailwind breakpoints throughout.
- **Empty states**: When a feature has "no data yet", show a beautiful empty state with illustration/icon and CTA -- not just a blank page

**Think of it like a model home** -- the faucets don't need to have plumbing yet, but they need to look like real faucets in the right places.

---

## Founder Assets (docs/founder/)

Check `docs/founder/` before you start building. It may contain files uploaded by the client or operator:

- **Logo** (logo.png/svg) -- use this for the navbar, auth pages, and landing page header
- **Screenshots** -- design inspiration, competitor UIs, or existing product shots
- **Documents** (PDFs, docs, text files) -- brand guidelines, feature specs, business plans, research notes
- **Other files** -- anything that helps you understand the client's brand, voice, and vision

**All agents should reference these files** when making design, copy, and feature decisions. If there's a logo, use it. If there's a brand doc, follow its guidelines. If there are competitor screenshots, make your design better than what you see.

---

## Agent 1: The Blueprint

> **Creates**: Project spec, TypeScript types, constants, mock data, DB migration
> **Files owned**: `docs/roadmap/`, `web/lib/types/`, `web/lib/constants/`, `supabase/migrations/`

### Instructions

0. **FIRST: Read `.claude/skills/agent-1-blueprint/memory/learnings.md`** — contains lessons from past builds. Apply these proactively.
1. Read the **App Brief** at the top of this document for the overview.
2. **Read `docs/CREATIVE_BRIEF.md`** — Agent 2.5 creates this before you run. It specifies a Signature Element that you MUST create types and mock data for.
3. **CRITICAL: Read `docs/roadmap/01_project_spec.md`** -- scroll to the **AGENT 1 DIRECTIVES** section. It contains your exact types, entity names, mock data specs, and database schema. Follow those directives precisely.

You own these files ONLY:

- `docs/roadmap/` (project spec -- do NOT modify 01_project_spec.md, only create new files)
- `web/lib/types/` (TypeScript interfaces)
- `web/lib/constants/` (app constants + mock data)
- `supabase/migrations/` (database schema)

DO NOT create or edit any files outside these directories.

### Tasks (in order)

**1. Project Spec**

Create `docs/roadmap/01_project_spec.md` with:
- App name and description (from the brief)
- Target user persona
- Core features list (from the brief)
- Page map (which pages the app needs)
- Data model overview (which tables, which relationships)

**2. TypeScript Types**

Create `web/lib/types/app.ts` with:
- Interfaces for every data entity (users, the core domain objects)
- Enum types for statuses, categories, roles
- Component prop types for stat cards, tables, list items
- Export everything as named exports

**3. Constants & Navigation**

Create `web/lib/constants/app.ts` with:
- Navigation items array (sidebar links with icons, labels, paths)
- Status/category options
- Domain-specific constants (label maps, style maps, category definitions)
- Export everything as named exports
- **DO NOT put mock data arrays here** — mock data goes in the Demo Data Provider (Task 5)

Also create `web/lib/constants/navigation.ts` with:
- Sidebar navigation config: `{ label, href, icon_name }[]`
- Make paths match the page structure: `/dashboard`, `/dashboard/[feature]`, etc.

**4. Database Migration**

Create `supabase/migrations/003_app_schema.sql` with:
- CREATE TABLE statements for every entity
- Proper foreign keys (user_id references auth.users)
- org_id column on every table (multi-tenant)
- RLS policies (enable RLS, basic org-level isolation)
- Indexes on foreign keys
- created_at/updated_at timestamps

**5. Demo Data Provider (MANDATORY)**

Create the demo data layer in `web/lib/demo/`. This is the SINGLE SOURCE OF TRUTH for all mock data. Agent 4 will import from here — no inline mock arrays in any page.

a) `web/lib/demo/demo-data-provider.ts`:
- `isDemoMode()` — checks `NEXT_PUBLIC_DEMO_MODE=true` env var OR `?demo=true` URL param
- Label lookups: status labels, category labels, style maps (shared across pages)
- Getter functions for each data type: `getDemoStats()`, `getDemoSessions()`, `getDemoLeads()`, etc.
- 5-10 realistic items per entity (real names, real numbers, dates within last 30 days)
- Export TypeScript types for each entity: `DemoSession`, `DemoLead`, etc.
- IDs should be simple strings ('1', '2', '3') — these are demo-only

b) `web/lib/demo/demo-data-wrapper.ts`:
- `getDemoOrReal<T>(demoFn, realFn)` — generic async wrapper that routes based on `isDemoMode()`
- `getDemoOrRealSync<T>(demoFn, realFn)` — sync version
- Pre-wired wrappers for each data type: `getStatsOrDemo(realFn?)`, `getSessionsOrDemo(filters?, realFn?)`, etc.
- When `realFn` is not provided, defaults to demo data (showcase mode)
- When `realFn` IS provided, routes based on demo mode (production mode)

c) `web/lib/demo/index.ts`:
- Barrel exports: `isDemoMode`, `getDemoOrReal`, all `*OrDemo()` wrappers, all label maps, all types

**Why this pattern:**
- Agent 4 imports `getStatsOrDemo()` — pages have zero inline mock data
- Client opens app with `NEXT_PUBLIC_DEMO_MODE=true` — full working dashboard, zero database
- When real Supabase ships (Activate phase), pass `realFn` to the wrappers — zero page changes needed
- One env var flips between demo and production

### Rules
- Use the app brief to name everything correctly (not generic)
- Mock data should look REAL (real names, real numbers, realistic dates)
- Types should be strict (no `any`, use proper enums)
- Navigation paths must follow Next.js App Router conventions: `/dashboard/feature-name`
- ALL mock data lives in `web/lib/demo/` — NEVER in constants or page files
- DO NOT install packages or modify package.json
- **Signature Element mock data**: If the Creative Brief specifies a Signature Element (assessment, calculator, diagnostic), you MUST create the full mock data for it: questions with ALL options (match the exact count from the spec — if it says 4 options, create 4), scoring maps, result objects, and diagnostic thresholds. Include the scoring pseudo-code as comments in the demo-data-provider so Agent 4 can implement it precisely.
- **Non-dashboard routes in navigation**: If the spec includes routes outside `/dashboard/` (e.g., `/onboarding`, `/assessment`), include them in `constants/navigation.ts` with a clear `isExternal: true` flag or group them separately so Agent 3 knows which go in the sidebar vs. which are standalone pages.

---

## Agent 2: The Brand

> **Creates**: Landing page, brand colors, marketing sections, visual identity
> **Files owned**: `web/tailwind.config.ts`, `web/app/globals.css`, `web/app/page.tsx`, `web/components/public/`

### Instructions

0. **FIRST: Read `.claude/skills/agent-2-brand/memory/learnings.md`** — contains lessons from past builds. Apply these proactively.
1. Read the **App Brief** at the top of this document for the overview.
2. **Read `docs/CREATIVE_BRIEF.md`** — Agent 2.5 creates this before you run. Follow its visual identity, animation directives, and animation style exactly. Use `ScrollReveal` and `StaggerContainer`/`StaggerItem` from `@/components/shared` as directed.
3. **CRITICAL: Read `docs/SAAS_DESIGN_SYSTEM.md`.** This is the Bloom Design Bible. It contains the proven 9-section landing page formula, copywriting formulas, component specifications, and conversion principles. Follow this system.
4. **Then read `docs/roadmap/01_project_spec.md`** -- scroll to the **AGENT 2 DIRECTIVES** section. It contains your exact color codes, font choices, component styles, design references, and landing page tone.
5. **Study founder screenshots**: Use Glob to check `docs/founder/` for any `.png` or `.jpg` files (screenshots, brand assets, design references). READ any images you find. These are design references the client uploaded — existing products, competitor UIs, or mockups they want you to study. Analyze color palettes, typography choices, layout density, border-radius patterns, shadow depth, and visual language. Your design should be BETTER than what you see — elevate, don't copy.
6. **Design Intelligence (auto-consult silently):**
   - Read `.claude/skills/tailwind-design-system/SKILL.md` for Tailwind v4 patterns (CVA components, OKLCH colors, dark mode tokens). Apply these patterns when setting up `tailwind.config.ts` and `globals.css`.
   - Read `.claude/skills/web-design-guidelines/SKILL.md` for accessibility and interaction patterns. Apply to all components (focus states, touch targets, animations, semantic HTML).
   - Read `.claude/skills/page-cro/SKILL.md` for conversion optimization. Apply to CTA placement, social proof, and section ordering.
   - If the project spec includes a `design-system/` folder, read the `MASTER.md` inside it for pre-generated style recommendations.

The Design System tells you HOW to build a converting page. The Directives tell you WHAT specific colors, fonts, and content to use. The Design Intelligence skills provide the implementation patterns and quality standards.

You own these files ONLY:

- `web/tailwind.config.ts` (brand colors)
- `web/app/globals.css` (theme variables)
- `web/app/page.tsx` (landing page)
- `web/components/public/` (landing page sections)

DO NOT create or edit any files outside these directories.

### Tasks (in order)

**1. Brand Colors & Typography**

Edit `web/tailwind.config.ts`:
- Implement the EXACT color palette from the Agent 2 Directives (hex codes are provided)
- Map primary color to `primary` with 50-950 shades (generate from the provided hex)
- Add secondary and accent palettes the same way
- Add the font families from the Directives
- Keep the existing "bloom" palette as fallback

**2. Theme Variables**

Edit `web/app/globals.css`:
- Set root CSS variables to match the Directives' colors
- Set dark mode variables if Directives specify dark mode
- Implement the border-radius, shadow, and spacing values from Component Style
- Keep the existing scrollbar and base styles

**3. Landing Page Sections (Follow the 9-Section Formula)**

Create these components in `web/components/public/`, following the exact structure from `docs/SAAS_DESIGN_SYSTEM.md`:

a) `Header.tsx` - Sticky navigation header
   - Height: 80px, sticky top-0 z-50
   - Logo/app name left, CTA button right
   - Background: white, add shadow on scroll
   - CTA matches the hero CTA (consistency)

b) `Hero.tsx` - Section 1: Hero (create curiosity, NOT explain everything)
   - **Headline formula:** "How to get [RESULT] without [PROBLEM/OBJECTION]"
   - Use the hero headline from the Directives OR write one using the formula above
   - Subheadline: one sentence on HOW (creates curiosity, doesn't overexplain)
   - Primary CTA button (large, accent color, shadow, hover lift)
   - Optional secondary CTA (border style, lower commitment)
   - Right side: product screenshot/mockup with shadow-2xl and border
   - Layout: 2-column on desktop (60% text / 40% image), stack on mobile
   - **DO NOT** list features here. Only the outcome and curiosity.

c) `SocialProofBar.tsx` - Section 2: Instant credibility
   - Light gray background (#F9FAFB)
   - "Trusted by X+ [target user type]" or usage stat
   - Logo grid: 4-6 company logos in grayscale, color on hover
   - If no real logos, use placeholder company names from the target industry

d) `Problem.tsx` - Section 3: Pain amplification (the most important section)
   - **Part A: Critique their current way**
     - Headline: "Honestly, Is This The Way To [Fix Problem]?"
     - 3 bullet points with X icons showing why their current method sucks
     - Cost callout box: "How Much Is This Costing You?" with quantified pain
     - bg-red-50, border-l-4 border-red-500 for the cost callout
   - **Part B: Critique competitors**
     - 2-3 bullet points with X icons showing why other tools fall short
     - Why alternatives aren't built for their specific niche
   - Transition paragraph leading into the solution
   - **This section creates the investment mindset BEFORE showing the product.**

e) `Solution.tsx` - Section 4: How it works (3-5 steps)
   - Headline: "This Is How [Product] Fixes All Of That"
   - 3-5 steps in ORDER (new customer -> successful customer)
   - Step 1 is usually Integration/Setup (addresses switching objection)
   - Each step: badge number + title + 2-3 sentences + rich visual
   - Alternate layout: image left/text right, then flip
   - **Step visuals: Use `<FeatureVisual>` from `@/components/shared` — NOT icon-in-circle placeholders.**
     Pick the variant that best matches each step's content:
     - `variant="dashboard"` — stat cards + bar chart (overview, analytics)
     - `variant="chart"` — area chart with gradient fill (tracking, growth)
     - `variant="form"` — assessment/quiz mockup (onboarding, intake)
     - `variant="report"` — score report with breakdown bars (results, scoring)
     - `variant="speed"` — speed-to-lead phone visual (response time, notifications)
     - `variant="funnel"` — conversion funnel bars (pipeline, sales)
     You can pass `accent="hsl(var(--primary))"` to match the brand color.
     These render rich inline SVG compositions inside a browser frame — no external images needed.
   - After each step, implicitly answer an objection

f) `Benefits.tsx` - Section 5: What makes switching easy
   - Grid: 4-col desktop, 2-col tablet, 1-col mobile
   - Each benefit: green checkmark icon in circle + title + one-line description
   - Focus on: fast setup, easy integrations, great support, low risk

g) `Testimonials.tsx` - Section 6: Result-driven social proof
   - Headline: "This Is Why X+ Customers Love [Product]"
   - 3 testimonial cards in a grid
   - Each: avatar + name + title/company + quote with specific metric highlighted in bold
   - Use job titles from the target industry (from Directives)
   - Testimonials MUST include specific results: "We improved X by 40%"
   - Do NOT use generic praise like "Great tool!" -- always include metrics

h) `FinalCTA.tsx` - Section 7: Close the deal
   - Background: primary color gradient, white text
   - Headline with urgency: "These Companies Are Already Getting [RESULT], When Will You?"
   - Risk reversal paragraph (2-3 sentences)
   - Large CTA button (white bg, primary text for contrast against dark bg)
   - Trust elements below button: checkmarks with "14-day free trial", "No credit card", "Cancel anytime"

i) `AlternativeCTA.tsx` - Section 8: Capture the not-ready visitors
   - White background, border-top in primary color
   - Headline: "Not Ready To Commit? No Problem."
   - 2-3 lower-commitment options: demo video, newsletter, case study
   - **This is critical.** Most visitors aren't ready to buy NOW. Capture them or lose them forever.

j) `Footer.tsx` - Section 9: Clean close
   - Dark background (#1F2937), light text
   - App name + copyright
   - Links: Privacy Policy, Terms of Service, Contact
   - Social media placeholders
   - Simple, professional

**4. Landing Page Assembly**

Rewrite `web/app/page.tsx` to:
- Import and render ALL sections in the 9-section order:
  `Header -> Hero -> SocialProofBar -> Problem -> Solution -> Benefits -> Testimonials -> FinalCTA -> AlternativeCTA -> Footer`
- Pricing section is optional (add between Benefits and Testimonials if relevant)
- NO authentication required (public page)
- Section backgrounds alternate: white -> gray-50 -> white -> gradient -> white -> gray-50 -> primary gradient -> white -> dark
- Fully mobile-responsive (every component must stack cleanly at 375px width)
- The page should look like a real, funded startup's landing page. Not a template. Not a school project.

**5. PWA & Mobile Meta Tags**

In `web/app/layout.tsx` (only the metadata/head section, do NOT change providers):
- Add viewport meta: `width=device-width, initial-scale=1, maximum-scale=1`
- Add theme-color meta tag matching the primary color
- Add apple-mobile-web-app-capable: yes
- Add apple-mobile-web-app-status-bar-style: default
- These make the app look native when viewed in Chrome DevTools mobile mode

### Rules
- **Read `docs/SAAS_DESIGN_SYSTEM.md` FIRST.** The 9-section formula is mandatory. Don't skip sections or improvise the structure.
- **Follow your Agent 2 Directives in the spec.** They have exact colors, fonts, and style specs.
- **Headlines use formulas, not generic text.** "How to get [RESULT] without [PROBLEM]" -- not "Welcome to Our Product."
- **Testimonials have metrics.** "We increased demos by 180%" -- not "Great tool, love it!"
- **Problem section creates pain.** Critique their current way AND competitors. Don't skip this.
- Make it look like a real, funded startup's landing page. Not a template. Not a school project.
- All Tailwind classes must be static strings (no dynamic `bg-${color}-500`)
- Use the existing Button component from `web/components/ui/button.tsx`
- DO NOT install packages or modify package.json
- If the spec references design inspiration from specific apps, study those patterns
- **Mobile-first**: Every component must look great at 375px width. Use `sm:`, `md:`, `lg:` breakpoints
- **Use the component specs** from the Design System for exact padding, shadows, border-radius, and typography sizes
- **`"use client"` MUST use DOUBLE QUOTES and be the VERY FIRST LINE** of any file that needs it. Before any comments, imports, or blank lines. Single quotes will break the build. This is non-negotiable.
- **Hero MUST include a secondary CTA to the Signature Element** (e.g., `/assessment`). If the Creative Brief defines a Signature Element, add a ghost/outline button below the primary CTA linking to it. This CTA gets missed every build if not explicitly included.
- **Dot-grid variant for light backgrounds**: If the Hero section uses a light/white background, use `dot-grid-light` (orange/primary-tinted dots). Only use `dot-grid` (white dots) on dark backgrounds. White dots on white = invisible. Add the `.dot-grid-light` class to `globals.css` if it doesn't exist.
- **Only use color tokens defined in `tailwind.config.ts`**. Before using any color class (e.g., `dark-bg`, `dark-border`), verify it exists in the Tailwind config. If Agent 1's Directives reference colors you haven't defined, ADD them to the config. Undefined classes silently fail — no error, just broken styling.

---

## Agent 3: The Shell

> **Creates**: Dashboard layout, sidebar navigation, top bar, auth pages
> **Files owned**: `web/components/layout/`, `web/app/(auth)/`, `web/components/shared/`, `web/components/auth/`

### Instructions

0. **FIRST: Read `.claude/skills/agent-3-shell/memory/learnings.md`** — contains lessons from past builds. Apply these proactively.
1. Read the **App Brief** at the top of this document for the overview.
2. **Read `docs/CREATIVE_BRIEF.md`** — Agent 2.5 creates this before you run. Follow its interactive directives: wrap dashboard layout in `DemoToastProvider`, add `DemoNotifications` to the top bar. Both from `@/components/shared`.
3. **CRITICAL: Read `docs/roadmap/01_project_spec.md`** -- scroll to the **AGENT 3 DIRECTIVES** section. It contains your exact sidebar items, layout density, stat card KPIs, and auth page specs. Also read the **Design Direction** section for colors and component styles. Follow those directives precisely.
3. **Design Intelligence (auto-consult silently):**
   - Read `.claude/skills/web-design-guidelines/SKILL.md` -- apply accessibility rules to navigation (keyboard nav, focus trapping in modals, ARIA labels on sidebar), auth forms (proper input types, autocomplete attributes), and layout (semantic HTML, skip links).
   - Read `.claude/skills/vercel-composition-patterns/SKILL.md` -- use proper server/client component boundaries for the dashboard layout. Layout shell can be server component, interactive sidebar is client component.
   - Read `.claude/skills/onboarding-cro/SKILL.md` -- apply to login/signup pages for conversion optimization (social login prominence, field reduction, trust signals).

You own these files ONLY:

- `web/components/layout/` (dashboard layout, sidebar, topbar)
- `web/app/(auth)/` (login + signup pages)
- `web/components/shared/` (shared UI pieces like modals)
- `web/components/auth/` (auth form components)

DO NOT create or edit any files outside these directories.

### Tasks (in order)

**1. Dashboard Layout**

Rewrite `web/components/layout/DashboardLayout.tsx` to include:

a) **Sidebar** (left side, collapsible on mobile):
   - App logo/name at top
   - Navigation links based on the app's features:
     - Dashboard (home)
     - One link per core feature from the brief
     - Settings
   - Use simple text labels + emoji icons (no icon library needed)
   - Active state highlighting (use pathname matching)
   - Collapse to icon-only on mobile

b) **Top Bar** (across the top):
   - Page title (dynamic based on route)
   - User avatar circle (placeholder initials)
   - Notification bell (static, just visual)
   - Settings gear icon link

c) **Main Content Area**:
   - Scrollable content area
   - Proper padding (p-6)
   - Takes {children} prop

Use `usePathname()` from `next/navigation` for active link detection.
Use the existing AuthProvider's `useAuth()` hook for user data.

**2. Auth Pages**

Rewrite both auth pages:

a) `web/app/(auth)/login/page.tsx`:
   - Clean centered card on a subtle gradient or split-screen background
   - Email + password fields with proper labels and focus states
   - Primary-colored "Log In" button (full width)
   - **Social login buttons** (these won't work yet, but MUST be visible):
     - "Continue with Google" button (with Google icon/SVG)
     - "Continue with GitHub" button (optional, based on audience)
     - Divider line: "or continue with email"
   - "Forgot password?" link
   - "Don't have an account? Sign up" link
   - App logo at top of the card

b) `web/app/(auth)/signup/page.tsx`:
   - Same card layout + background as login
   - Full name + email + password + confirm password fields
   - **Same social login buttons** as login page
   - "Create Account" button (primary color, full width)
   - Terms checkbox: "I agree to the Terms of Service and Privacy Policy"
   - "Already have an account? Log in" link

**For non-functional buttons** (Google, GitHub), use: `onClick={() => alert('Social login will be connected during setup')}` or a toast notification. They must LOOK real -- proper brand colors, proper icons, proper sizing.

Both pages should feel like a premium SaaS product. Reference the Design Direction from the spec for exact colors and component styles.

**3. Shared Components**

Create in `web/components/shared/`:

a) `PageHeader.tsx` - Reusable page header
   - Title (h1), optional subtitle, optional action button
   - Props: `{ title: string; subtitle?: string; action?: ReactNode }`

b) `StatCard.tsx` - Dashboard stat card
   - Value (big number), label, optional trend indicator (up/down %)
   - Props: `{ label: string; value: string; trend?: number }`

c) `EmptyState.tsx` - Empty state placeholder
   - Icon, title, description, optional CTA button
   - Props: `{ title: string; description: string; action?: ReactNode }`

### Rules
- Sidebar nav items should match the core features from the app brief
- **`"use client"` MUST use DOUBLE QUOTES and be the VERY FIRST LINE** of any file that needs it. Before any comments, imports, or blank lines. Single quotes will break the build. This is non-negotiable.
- Use Tailwind only. No CSS modules, no styled-components.
- Import from existing providers: `useAuth` from `@/components/providers/AuthProvider`
- DO NOT install packages or modify package.json
- **DemoToastProvider and DemoNotifications MUST use domain-specific messages.** Read the Creative Brief's `§DemoToastProvider` and `§DemoNotifications` sections. Replace ALL default/generic CRM messages (e.g., "Lead submitted", "Meeting booked") with the domain-specific messages from the Creative Brief (e.g., real client names, industry terminology, domain-specific actions). Generic messages make the demo feel fake.
- **Only use color tokens defined in `tailwind.config.ts`**. Before using any class like `dark-bg`, `dark-border`, or custom palette names, verify they exist in the Tailwind config. If they don't exist, use standard Tailwind colors (e.g., `slate-900`, `slate-800`) or add the missing tokens to the config. Undefined classes silently fail.

---

## Agent 4: The Pages

> **Creates**: All dashboard feature pages with stats, tables, mock data
> **Files owned**: `web/app/dashboard/`, `web/components/dashboard/`, new files in `web/components/ui/`

### Instructions

0. **FIRST: Read `.claude/skills/agent-4-pages/memory/learnings.md`** — contains lessons from past builds. Apply these proactively.
1. Read the **App Brief** at the top of this document for the overview.
2. **Read `docs/CREATIVE_BRIEF.md`** — Agent 2.5 creates this before you run. Follow its animation/interactive directives: use `AnimatedCounter` on stat cards, `ClickReveal` on tables, `ActionButton` on actions, `LoadingSequence` on feature pages. All from `@/components/shared`. You MUST also build the **Signature Element** specified in the brief.
3. **CRITICAL: Read `docs/roadmap/01_project_spec.md`** -- scroll to the **AGENT 4 DIRECTIVES** section. It contains per-page wireframes: what display type (table/cards/kanban), exact columns, mock data specs, and action buttons. Also read the **Design Direction** section for colors and component styles. Follow those directives precisely.
3. **Design Intelligence (auto-consult silently):**
   - Read `.claude/skills/vercel-react-best-practices/SKILL.md` -- follow React performance patterns (proper key usage, avoid inline objects in JSX, co-locate state, use composition over prop drilling).
   - Read `.claude/skills/vercel-composition-patterns/SKILL.md` -- use proper component composition (compound components for complex UI, slots pattern for customizable layouts, render props for data tables).
   - Read `.claude/skills/web-design-guidelines/SKILL.md` -- apply interaction patterns to tables (sortable headers with ARIA), cards (proper focus order), and forms (validation, error messages).

You own these files ONLY:

- `web/app/dashboard/` (all pages and sub-routes)
- `web/components/dashboard/` (dashboard-specific components)
- New files in `web/components/ui/` (do NOT modify existing button.tsx, card.tsx, badge.tsx, tabs.tsx)

DO NOT create or edit any files outside these directories.

### Tasks

**1. Dashboard Home**

Rewrite `web/app/dashboard/page.tsx` with:
- Welcome message: "Good [morning/afternoon], [User]"
- 4-6 stat cards in a grid (use inline StatCard or import from ui/)
- Recent activity feed (5-8 mock items with timestamps)
- Quick action buttons for common tasks
- **Import ALL data from `@/lib/demo`** — use `getStatsOrDemo()`, `getRecentActivityOrDemo()`, `getQuickActionsOrDemo()` at the top of the file
- **NEVER define inline mock data arrays** — Agent 1 already created the demo provider

**2. Feature Pages**

For EACH core feature from the app brief, create a page:

`web/app/dashboard/[feature-name]/page.tsx`

Each page should include:
- Page title and description
- A data table OR card grid showing mock items (5-10 rows)
- Filter/search bar (visual only, doesn't need to work)
- "Add New" button (visual only)
- Status badges where relevant
- **Import data from `@/lib/demo`** — use the appropriate `*OrDemo()` wrapper (e.g., `getSessionsOrDemo()`, `getLeadsOrDemo()`)
- **NEVER define inline const arrays of mock data** — all data comes from the demo provider that Agent 1 created

Example: If a feature is "Client Dashboard", create `web/app/dashboard/clients/page.tsx` with a table of mock clients.

**3. Non-Dashboard Pages (CRITICAL — DON'T MISS THESE)**

The following pages live OUTSIDE `/dashboard/`. They are top-level routes. Check the Creative Brief and Spec for any of these:

- **Signature Element page** (e.g., `/assessment`, `/calculator`, `/diagnostic`) — If the Creative Brief defines a Signature Element, YOU must build it. This is typically an interactive quiz, calculator, or diagnostic tool at a standalone route like `/assessment`. Read the Creative Brief's Signature Element section for exact questions, scoring logic, and output format. **Include pseudo-code scoring if provided in the spec.**
- **Onboarding page** (`/onboarding`) — If the spec includes an onboarding flow, create `web/app/onboarding/page.tsx`. This is NOT under `/dashboard/`. It's a multi-step wizard (typically 3-5 steps) that collects user profile data before they reach the dashboard.
- **Any other non-dashboard routes** mentioned in the spec (e.g., `/pricing`, `/demo`, `/invite`)

**Signature Element Scoring Rule:** When the Creative Brief or Spec provides scoring logic (question weights, score labels, diagnostic thresholds), implement it EXACTLY as specified. Do NOT simplify or approximate. If the spec says "Q6 answer maps to months lost", use Q6's answer — not the total score. If it says "4 options per question", use 4 — not 3. Match the spec character for character.

**4. Settings Page**

Create `web/app/dashboard/settings/page.tsx` with:
- Profile section (name, email, avatar)
- Notification preferences (toggle switches, visual only)
- Billing section (current plan display)
- Danger zone (delete account button, visual only)
- Use tabs from existing `web/components/ui/tabs.tsx`

**4. Dashboard Components**

Create reusable pieces in `web/components/dashboard/`:

a) **DataTable — USE THE SHARED SCAFFOLD COMPONENT. DO NOT CREATE YOUR OWN.**
   - Import: `import { DataTable, Column } from '@/components/shared'`
   - Define typed columns with explicit widths:
     ```tsx
     const columns: Column<MyRow>[] = [
       { key: 'name', header: 'Name', width: '30%', render: (row) => row.name },
       { key: 'status', header: 'Status', width: '15%', render: (row) => <Badge>{row.status}</Badge> },
       { key: 'value', header: 'Value', width: '20%', align: 'right', render: (row) => row.value },
     ]
     ```
   - Render: `<DataTable columns={columns} data={rows} onRowClick={(row) => setSelected(row)} />`
   - The shared DataTable uses `table-fixed` + `<colgroup>` for bulletproof column alignment.
   - **NEVER create a DataTable.tsx in `web/components/dashboard/` — the shared one handles all cases.**
   - For interactive detail panels, use `DetailPanel` from `@/components/shared` (NOT ClickReveal — ClickReveal wraps children in a `<div>` which breaks `<tbody> → <tr>` and causes column misalignment):
     ```tsx
     const [selected, setSelected] = useState<MyRow | null>(null)
     <DataTable columns={columns} data={rows} onRowClick={setSelected} />
     <DetailPanel isOpen={!!selected} onClose={() => setSelected(null)} title="Details">
       {selected && <MockDetail fields={[...]} />}
     </DetailPanel>
     ```
   - **ClickReveal is ONLY for cards and non-table elements.** Tables MUST use DataTable + DetailPanel.

b) `ActivityFeed.tsx` - Recent activity list
   - Timestamp + action + user
   - Props: `{ items: { action: string; user: string; time: string }[] }`

c) `QuickActions.tsx` - Action button grid
   - 3-4 colorful action cards
   - Props: `{ actions: { label: string; description: string; href: string }[] }`

### Rules
- Every dashboard page is a SEPARATE file in its own folder under `web/app/dashboard/`
- Non-dashboard pages (`/assessment`, `/onboarding`, etc.) go under `web/app/` directly — NOT under `/dashboard/`
- **`"use client"` MUST use DOUBLE QUOTES and be the VERY FIRST LINE** of any file that needs it. Before any comments, imports, or blank lines. Single quotes will break the build. This is non-negotiable.
- **ALL data comes from the demo provider (`@/lib/demo`). No database calls. No API calls. No inline mock arrays.**
  - Import `*OrDemo()` wrappers and label maps from `@/lib/demo` — Agent 1 created these for you
  - **VERIFICATION:** After writing each page, search your own code for `const MOCK_`, `const DEMO_`, `const mock`, or any hardcoded array of objects. If found, STOP and refactor to use `@/lib/demo` imports instead. This is the #1 cause of data inconsistency.
  - If Agent 1 didn't create a getter for your data, add it to `demo-data-provider.ts` and `demo-data-wrapper.ts` yourself — do NOT inline the data in the page
- Use existing UI components (Card, Button, Badge, Tabs) where they fit
- DO NOT install packages or modify package.json
- **Show Everything principle**: Include all final-product UI elements even if non-functional:
  - "Export CSV" buttons, "Invite Member" buttons, "Upgrade Plan" banners
  - Search bars with placeholder text, filter dropdowns that open but don't filter
  - Notification badges, status indicators, progress bars
  - Beautiful empty states with icons and CTAs (not blank pages)
- **Mobile-first**: Every page must look great at 375px width

---

## Agent 5: The Welder

> **Role**: Integration specialist — wires everything together so it compiles and runs.
> **Files owned**: `web/app/api/` (new routes only), any file that needs import/type fixes
> **Runs after Agents 1-4 finish.** The agentic build script handles timing automatically.

**FIRST: Read `.claude/skills/agent-5-welder/memory/learnings.md`** — contains critical lessons from past builds. The #1 build breaker is documented there. Read it before touching any code.

You are the integration engineer. Four agents just built different parts of an app in complete isolation — different types, different components, different pages. Your ONLY job is to wire everything together so the app compiles, runs, and renders without errors.

You do NOT review code quality, write documentation, or create plans. That's Agent 6's job. Your exit criteria is simple: **`npm run build` passes with zero errors.**

### Instructions

1. Read the **App Brief** at the top of this document for the overview.
2. **Read `docs/roadmap/01_project_spec.md`** -- scroll to the **AGENT 5 DIRECTIVES** section for expected integration points and API routes.

### Tasks (in order)

**1. Quick Scan**

Read these files to understand what the other agents created:
- List all files in `web/app/dashboard/` (see what pages exist)
- List all files in `web/components/` (see what components exist)
- List all files in `web/lib/types/` and `web/lib/constants/`
- Read `web/components/layout/DashboardLayout.tsx` (check navigation links)

**2. Fix Navigation**

Check that the sidebar navigation links in DashboardLayout.tsx match the actual pages that exist in `web/app/dashboard/`. Fix any mismatches.

**3. Stub API Routes**

For each core feature, create a minimal API route in `web/app/api/`:

```typescript
// web/app/api/[feature]/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ data: [], message: "API stub - connect to database" });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ success: true, data: body });
}
```

**4. Fix Import Errors**

Run the TypeScript compiler to find errors:
- Run: `npx tsc --noEmit` from the project root
- Fix any import errors (missing files, wrong paths)
- Fix any type errors (missing props, wrong types)
- Do NOT rewrite working code. Only fix what's broken.

**5. "use client" Directive Audit**

Search EVERY `.tsx` file in `web/components/` and `web/app/` for usage of:
- `onClick`, `onChange`, `onSubmit`, `onFocus`, `onBlur` (event handlers)
- `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo` (React hooks)
- `usePathname`, `useRouter`, `useSearchParams` (Next.js client hooks)

Any file using ANY of these MUST have `"use client"` as the very first line of the file — **DOUBLE QUOTES ONLY** (not single quotes). Check BOTH conditions:
1. The directive exists in files that need it
2. The directive uses double quotes: `"use client"` not `'use client'`
3. The directive is on LINE 1 (not after comments or blank lines)

This is the #1 build breaker — fix ALL instances before moving on.

**5b. Smart Quote / Curly Quote Detection**

Search all `.tsx` and `.ts` files for curly/smart quotes (`'`, `'`, `"`, `"`) in string literals. These are invisible parser killers — they look identical to straight quotes in some fonts but break the JS parser completely. Replace ALL with straight ASCII quotes (`'`, `"`). Common source: copy-paste from spec documents or PDFs.

**6. Demo Layer Verification**

Verify the demo data layer is properly wired:
- Check that `web/lib/demo/` exists with: `demo-data-provider.ts`, `demo-data-wrapper.ts`, `index.ts`
- Grep all `web/app/dashboard/` pages — NO page should have inline `const MOCK_*` or `const DEMO_*` arrays. All data must be imported from `@/lib/demo`
- If any page has inline mock arrays, refactor: move the data to `demo-data-provider.ts`, create a getter function, add a `*OrDemo()` wrapper, update the page to import from `@/lib/demo`
- Verify `isDemoMode()` works: check it reads `NEXT_PUBLIC_DEMO_MODE` env var and `?demo=true` URL param

**7. TypeScript Compilation**

Run: `cd web && npx tsc --noEmit`

Fix every error:
- Missing imports → add the import or create a type stub
- Wrong types → align with what Agent 1 defined in `lib/types/`
- Missing props → add required props with sensible defaults
- Unresolved paths → fix the import path

Re-run until zero errors.

**8. Production Build (Exit Gate)**

Run: `cd web && npm run build`

This is your EXIT GATE. You are NOT done until this command passes with zero errors.

- If it fails, read the errors carefully, fix them, and run again
- Common fixes: missing "use client", broken imports, type mismatches, undefined Tailwind classes
- Do NOT claim success without seeing the actual passing output
- If stuck in a loop (same error won't resolve), try a different fix approach

**After `npm run build` passes, you are DONE.** Do not write documentation, summaries, or plans — Agent 6 handles that.

### Common Pitfalls to Watch For

1. **Missing or single-quoted `"use client"`** — The #1 build breaker. Any component using `onClick`, `onChange`, `useState`, `useEffect`, or `useRef` MUST have `"use client"` (DOUBLE QUOTES) as the very first line. Search for `onClick` across all `.tsx` files and verify each one has the directive. Also search for `'use client'` (single quotes) and replace with double quotes — single quotes silently fail in some Next.js versions.

2. **Smart/curly quotes in JSX** — Copy-paste from specs or PDFs often introduces `'`, `'`, `"`, `"` (curly quotes) into string literals. These look identical to straight quotes but break the parser. Search for them and replace with ASCII `'` and `"`.

3. **Supabase env vars crash** — The scaffold's `lib/supabase.ts` and `middleware.ts` already have demo-mode fallbacks. Do NOT change these to use `process.env.X!` (non-null assertion). The placeholder approach lets the app render without a real database.

4. **tsconfig.json paths** — `web/tsconfig.json` must have `"paths": { "@/*": ["./*"] }`. Without this, every `@/` import fails. Verify this exists.

5. **Import paths** — When Agent 2 creates landing page components and Agent 3 creates layout components, they may reference each other's files. Verify all cross-agent imports resolve correctly.

6. **Tailwind custom classes** — If the spec defines custom colors like `primary-500`, verify they exist in `tailwind.config.ts`. Agent 2 defines the theme, but Agents 3 and 4 use it. If classes are undefined, the styling silently fails (no error, just broken styles). Grep for `dark-` prefixed classes — these are commonly used but often undefined.

### Rules
- You are the INTEGRATION agent, NOT the quality reviewer. Your ONLY job is making the build pass.
- Make MINIMAL changes — fix what's broken, don't refactor working code.
- Your exit criteria is ONE thing: `npm run build` passes with zero errors.
- Do NOT write documentation, summaries, or plans — that's Agent 6's job.
- Do NOT review code quality, accessibility, or design — that's Agent 6's job.
- When fixing other agents' code, change as few lines as possible.
- If you can't resolve a type error, stub it with `// TODO: fix type` and move on — getting the build to pass is more important than perfect types.

---

## Agent 6: The Closer

> **Role**: Quality control, verification, build summary, and implementation planning.
> **Files owned**: `docs/roadmap/02_build_summary.md`, `docs/roadmap/03_implementation_plan.md`, any file that needs QC fixes
> **Runs after Agent 5 (The Welder) finishes.** The agentic build script handles timing automatically.

**FIRST: Read `.claude/skills/agent-6-closer/memory/learnings.md`** — contains lessons from past builds about QC patterns, implementation plan structure, and verification protocol.

You are the quality gatekeeper and strategic planner. Agent 5 just wired everything together so the app compiles. Your job is to:
1. Review ALL code for quality, accessibility, and correctness
2. Verify the build passes all checks
3. Document what was built and what needs attention
4. Create a comprehensive implementation plan that turns this showcase into a production app

### Instructions

1. Read the **App Brief** at the top of this document for the overview.
2. **Read `docs/roadmap/01_project_spec.md`** -- scroll to the **AGENT 5 DIRECTIVES** section for QC checklists and expected quality standards.
3. **Quality Intelligence (auto-consult silently):**
   - Read `.claude/skills/vercel-react-best-practices/SKILL.md` -- check React performance patterns
   - Read `.claude/skills/web-design-guidelines/SKILL.md` -- check accessibility standards
   - Read `.claude/skills/page-cro/SKILL.md` -- check landing page conversion optimization
   - Read `.claude/skills/seo-audit/SKILL.md` -- check SEO fundamentals

### Tasks (in order)

**1. Quality Control Review**

This is your most critical task. Review ALL code the other agents created. Read each file and check for:

**CRITICAL — Demo Readiness (these BLOCK localhost preview):**
- [ ] Every component with `onClick`, `onChange`, `onSubmit`, `useState`, `useEffect`, or `useRef` MUST have `"use client"` at the top of the file. Check EVERY file in `components/` — missing this causes "Event handlers cannot be passed to Client Component props" crash.
- [ ] `web/tsconfig.json` has `"paths": { "@/*": ["./*"] }` — without this, all `@/` imports break
- [ ] `web/middleware.ts` has the demo mode guard at the top (skip auth when env vars missing)
- [ ] `web/lib/supabase.ts` uses placeholder fallbacks, NOT `process.env.X!` assertions
- [ ] `npm run build` (from project root) passes with zero errors — run this BEFORE claiming done

**React & Performance (from vercel-react-best-practices):**
- [ ] No barrel file imports (`import { X } from '@/components'`) -- import directly from source
- [ ] No inline object/array literals in JSX props (causes re-renders)
- [ ] `"use client"` only where actually needed (not on every component)
- [ ] No `useEffect` for derived state (compute during render instead)
- [ ] Conditional rendering uses ternary (`x ? <A/> : null`), not `&&`
- [ ] Static JSX extracted outside component bodies where possible
- [ ] No async waterfalls (parallel fetches where possible)

**Accessibility (from web-design-guidelines):**
- [ ] All images have meaningful `alt` text
- [ ] All form inputs have associated `<label>` elements
- [ ] Interactive elements have visible focus states
- [ ] Touch targets are at least 44x44px
- [ ] Color is not the only way information is conveyed
- [ ] Semantic HTML used (proper headings, nav, main, section)
- [ ] ARIA labels on icon-only buttons

**Landing Page (from seo-audit + page-cro):**
- [ ] `<title>` tag is unique and descriptive
- [ ] Meta description exists
- [ ] Open Graph tags present (og:title, og:description, og:image)
- [ ] One `<h1>` per page
- [ ] Heading hierarchy is logical (h1 > h2 > h3, no skips)
- [ ] CTA is visible above the fold

**Tailwind & Styling:**
- [ ] No dynamic Tailwind classes (`bg-${color}-500` -- use class maps instead)
- [ ] Consistent use of design tokens (colors from tailwind config, not hardcoded hex)
- [ ] All color classes used in components actually exist in `tailwind.config.ts` — grep for `dark-`, custom palette names, and verify they're defined. Undefined classes silently fail with zero errors, broken styling only.
- [ ] Mobile-responsive at 375px width

**Signature Element & Non-Dashboard Pages:**
- [ ] If Creative Brief specifies a Signature Element, verify the page EXISTS (e.g., `/assessment`, `/calculator`) — Agent 4 sometimes misses non-dashboard routes
- [ ] If spec includes `/onboarding`, verify `web/app/onboarding/page.tsx` EXISTS (NOT under `/dashboard/`)
- [ ] Signature Element scoring matches Creative Brief EXACTLY: correct number of options per question, correct score labels, correct per-question diagnostic logic, correct formulas. Compare character-for-character.
- [ ] Hero section includes a secondary CTA linking to the Signature Element page
- [ ] DemoToastProvider messages are domain-specific (NOT generic "Lead submitted", "Meeting booked" CRM messages)
- [ ] DemoNotifications messages are domain-specific (NOT generic CRM messages)
- [ ] Dot-grid uses correct variant: `dot-grid` on dark backgrounds, `dot-grid-light` on light/white backgrounds
- [ ] `"use client"` directives use DOUBLE QUOTES and are on LINE 1 (before any comments or imports)

**Fix anything you find.** For each fix, make the minimal change needed. If a file needs more than 5 fixes, note it in the summary as needing a deeper refactor later.

**2. Verify**

Run the verification script:
- Run: `bash verify.sh`
- If it passes, continue
- If it fails, fix the errors and run again
- Per `verification-before-completion`: do NOT claim "passes" until you see the actual output

**3. Build Summary**

Create `docs/roadmap/02_build_summary.md` with:
- List of all pages created
- List of all components created
- List of any known issues or TODOs
- **QC findings**: What you fixed, what you flagged for future improvement
- **Quality score**: Rate each agent's output 1-5 on correctness, accessibility, and code quality
- What to build next (database connections, real auth, etc.)

**4. Implementation Plan (The Expansion Doc)**

This is the highest-value deliverable you produce. After QC and summary, generate `docs/roadmap/03_implementation_plan.md` — a comprehensive, developer-ready implementation plan that turns this showcase app into a production SaaS.

**How to build it:** Read everything — `01_project_spec.md`, `02_build_summary.md`, all pages, components, API stubs, types, mock data, tailwind config, and the database schema. You need the full picture before you write a single line of this plan.

**Structure:**

```markdown
# {App Name} — Implementation Plan

> Generated after build review. This document is your roadmap from working
> showcase to million-dollar production app.

---

## The Vision: How This Becomes a Million-Dollar App

> This section is the FIRST thing the client sees. It answers: "Where can
> this go?" before diving into how to get there. Write this like a strategist,
> not a developer. Use the client's language, their industry, their outcomes.

### What You Have Right Now
One paragraph: The showcase app is live. Here's what it does today. (Reference
the actual pages and features the client just saw on localhost.)

### Where This Goes
Think deeply about the client's domain, their target user persona (from the
spec), and their business model. Then write 3-5 "million-dollar moves" —
features, pivots, or capabilities that would make this app category-defining.

These are NOT generic SaaS features. These are specific to THIS app, THIS
industry, THIS user persona. Each one should make the client think "I never
thought of that, but yes — that's exactly what my users need."

For each opportunity:

### {Opportunity Name}
**The insight:** One sentence explaining WHY this matters to their specific
users. Tie it to a real pain point or aspiration.
**What it looks like:** Describe the user experience — what do they see, what
do they do, what result do they get?
**Revenue impact:** How does this move the needle? New revenue stream,
higher retention, upsell opportunity, competitive moat?
**Build complexity:** Low / Medium / High — and a 1-2 sentence technical
summary of what's involved.

### Quick Wins That Compound

Ranked list of high-impact, low-effort improvements that make the app feel
dramatically more polished and valuable. These are things that can be done
in a single session:

1. ...
2. ...
3. ...
4. ...
5. ...

---

## Phase 1: Foundation (Database + Auth)

### 1.1 Supabase Project Setup
- Create project, configure auth providers (list which ones based on the spec)
- Environment variables needed (.env.local template)

### 1.2 Database Schema
- For each table in the migration file, explain:
  - What it stores
  - Key relationships (foreign keys)
  - RLS policies needed (who can read/write)
  - Indexes for performance
- Flag any schema gaps — tables the app needs but the migration doesn't cover

### 1.3 Authentication Flow
- Which auth methods (email/password, Google, Microsoft, etc.)
- Middleware behavior (redirect rules, protected routes)
- Session management approach

---

## Phase 2: Core Features (Replace Mock Data)

For EACH dashboard feature (interviews, candidates, roles, etc.):

### 2.X {Feature Name}
**Current state:** Mock data in `lib/constants/app.ts`, stub API at `/api/{feature}`
**Target state:** Real CRUD operations with Supabase

**Implementation steps:**
1. API route: Replace stub with real Supabase queries
2. Types: Align TypeScript interfaces with actual DB schema
3. Client hook: Create `use{Feature}` hook for data fetching
4. Component updates: Wire components to real data (list specific files)
5. Real-time: Does this feature need live updates? (Supabase subscriptions)

**Bug projection:**
| Risk | Scenario | Prevention |
|------|----------|------------|
| (anticipate real issues based on the feature's complexity) |

---

## Phase 3: Integrations & Payments

### 3.1 Stripe / Billing
- Pricing tiers from the spec (list them with prices)
- Webhook setup
- Checkout flow
- Subscription management

### 3.2 Third-Party Integrations
- List any integrations mentioned in the spec
- API approach for each (REST, webhooks, OAuth)

---

## Phase 4: Polish & Launch

### 4.1 SEO & Performance
- Meta tags, OG images, sitemap
- Image optimization, lazy loading
- Core Web Vitals targets

### 4.2 Email System
- Transactional emails (signup, password reset)
- Notification emails (feature-specific)

### 4.3 Deployment
- Vercel setup (env vars, domain)
- CI/CD considerations
- Monitoring & error tracking

---

## Known Risks & Edge Cases

### Data Integrity
| Risk | Scenario | Prevention |
|------|----------|------------|

### State & Caching
- What happens with stale data?
- Concurrent user operations?
- Offline/reconnection handling?

### Security Considerations
- RLS policies that need testing
- Input validation gaps
- API rate limiting needs

---

## File Inventory (What Exists → What Changes)

| File | Current State | Phase | Changes Needed |
|------|---------------|-------|----------------|
| (list every key file with what needs to happen to it) |
```

**Key principles for this document:**
- **Vision FIRST.** The "Million Dollar" section is the opening act. It sells the client on where this goes before talking about databases. Write it like a strategist presenting to a CEO, not a developer writing a spec.
- **Be specific, not generic.** Reference actual file paths, actual component names, actual API routes. A developer should be able to open this doc and start coding immediately.
- **Think beyond what the client asked.** The client described their current pain. You should identify opportunities they haven't imagined yet — features that would make their users say "how did I live without this?" and make competitors say "how did they think of that?"
- **Bug projection is mandatory.** For every Phase 2 feature, include at least one realistic bug scenario with prevention strategy. These aren't hypothetical — they're the bugs that WILL happen if the dev doesn't plan for them.
- **Respect the showcase.** The mock data and stub APIs are intentional. The plan should describe how to evolve them, not rip them out. The client just saw this app working — the plan should feel like a natural continuation, not a rewrite.

### Rules
- You are the LAST agent. Your job is quality control, documentation, and forward planning.
- Create new files for: build summary (`02_build_summary.md`) and implementation plan (`03_implementation_plan.md`).
- When fixing other agents' code, make MINIMAL changes -- fix the issue, not the style.
- The goal is: QC checklist is clean, app renders without errors, AND the implementation plan is comprehensive enough for a developer to start building from.
- **Document everything you fix.** Each fix teaches the system. Over time, your QC findings get consolidated into `memory/learnings.md` so future builds avoid the same mistakes.


## After All Agents Finish

You now have a clickable frontend with:
- A branded landing page (9-section conversion formula)
- Login/signup pages
- A dashboard with sidebar navigation
- Feature pages with realistic mock data
- TypeScript types and DB schema ready to go
- **A comprehensive implementation plan** (`docs/roadmap/03_implementation_plan.md`) mapping out every step from showcase to production

### Next Steps
1. **Preview it**: `npm run dev` then open `localhost:3000`
2. **Show the client**: Walk them through the working app — this is the "wow" moment
3. **Review the implementation plan**: Open `docs/roadmap/03_implementation_plan.md` — this is the "what's next" conversation
4. **Say "Launch"**: When ready to go to production, this triggers the Launch Guide below

---

## Launch (Post-Build Deployment Guide)

> **Trigger:** Type **"Launch"** in a new agent window after the 6 agents finish.
> Claude reads `docs/LAUNCH_GUIDE.md` and becomes your deployment sidekick.

**When the user says "Launch", you MUST:**
1. Read `docs/LAUNCH_GUIDE.md` -- the complete post-build deployment walkthrough
2. Walk the user through each phase in order, asking questions and verifying their work
3. Do NOT skip phases or rush ahead. Each step builds on the previous one.

The Launch Guide covers 10 phases:

| Phase | What It Does | Time |
|-------|-------------|------|
| 1. Pre-Flight | Verify build is clean | ~2 min |
| 2. GitHub | Create repo, push code | ~5 min |
| 3. Supabase | Create project, run migrations, configure auth | ~15 min |
| 4. Database Hygiene | Clean naming, RLS, prevent future bugs | ~10 min |
| 5. Vercel | Connect GitHub, auto-deploy, env vars | ~10 min |
| 6. Stripe | Products, prices, webhooks (if needed) | ~15 min |
| 7. Connect Real Data | Replace mock data with Supabase queries | ~20 min |
| 8. Add Features | Templates for new migrations, API routes, pages | As needed |
| 9. QA Checklist | Auth, mobile, security, performance | ~10 min |
| 10. Client Handoff | Deliver the app, set up retainer | ~5 min |

**The goal:** Even without watching the training videos, an operator can follow the Launch Guide and go from a local frontend to a live production app on a custom domain.

---

## Package (Client Handoff Cleanup)

> **Trigger:** Type **"Package"** in a terminal when you're ready to hand the app to a client.
> This strips all operator SOPs and produces a clean zip file.

**When to use:** After the app is built, launched, and ready to hand off. The client gets a working codebase with AI-assisted dev tools but NONE of the Bloom build system, conversion formulas, or deployment SOPs.

### Usage

```bash
# From the project root (the directory with CLAUDE.md)
bash scripts/ops/package-for-client.sh acme
# Output: ../acme-app-delivery.zip
```

### What It Does

| Phase | Action |
|-------|--------|
| 1. Strip operator docs | Removes QUICK_START_AGENTS.md, LAUNCH_GUIDE.md, SAAS_DESIGN_SYSTEM.md, VERSION |
| 2. Remove scaffold skill | Deletes .claude/skills/scaffold-setup/ |
| 3. Clean project spec | Strips Agent Build Directives section from 01_project_spec.md |
| 4. Clean CLAUDE.md | Removes Parallel Build Agents, Scaffold Versioning, and operator references |
| 5. Create zip | Generates a clean zip excluding node_modules, .next, .env files |
| 6. Self-delete | The packaging script itself doesn't ship |

### What the Client Keeps

- All app code (pages, components, API routes, lib/)
- `docs/founder/` (their brand data, strategy, positioning)
- Feature builder, self-correction, product lifecycle, action-plan, strategy-brief skills
- Sub-agents (code review, migration validation)
- All migrations and database schema
- A clean CLAUDE.md with dev tools (just no operator SOPs)

### Important

- Run from the **project root** (the directory containing CLAUDE.md)
- Requires typing `PACKAGE` to confirm (safety check)
- The zip is created one level UP from the project root: `../clientname-app-delivery.zip`
- **Always verify the build still works** after packaging: `cd web && npm run build`

---

## Debrief (Post-Build Intelligence Report)

> **Trigger:** Type **"Debrief"** after a build is complete.
> Claude scans the entire project and generates a structured build report.

**When to use:** After every build -- before Launch, after Launch, or after Package. The debrief captures what worked, what broke, and what should be improved. These reports accumulate and become the data that makes every future build better.

### What It Produces

A `BUILD_DEBRIEF.md` file in the project root containing:

| Section | What It Captures |
|---------|-----------------|
| What Was Built | Pages, components, API routes, migrations -- full inventory |
| What Broke | Every error with file path, root cause, and fix |
| What Took Long | Friction points that slowed the build |
| Client Gaps | Features requested that weren't in the scaffold |
| Scaffold Suggestions | Specific improvements for the next build |
| Agent Performance | Per-agent time, quality score (1-5), issues |
| Build Status | verify.sh, TypeScript, rendering, mobile, design formula |
| One-Line Summary | The single biggest improvement opportunity |

### The Flywheel

```
Build #1 → Debrief #1
Build #2 → Debrief #2
Build #3 → Debrief #3
         ↓
Analyze all 3 debriefs together
         ↓
Improve scaffold (new components, better agent instructions, fix patterns)
         ↓
Build #4 is faster and better
         ↓
Repeat forever
```

### How to Use the Reports

After collecting 3-5 debriefs, bring them to a Claude session and say:

> "Here are 5 build debrief reports. Analyze them together. What patterns do you see? What scaffold improvements would have the biggest impact across all builds?"

This is the cross-build learning system. Every build makes the next one faster.

---

## Deploy Demo (Zoomless Sales)

> **Trigger:** Type **"Deploy Demo"** after a build is complete.
> Pushes the app to a live Vercel preview URL that prospects can click and share.

**When to use:** After building an app for a prospect -- instead of scheduling a Zoom call, send them a link to their own app. They click around on their phone, share with their team, and come back ready to buy.

### One-Time Setup (Do Once)

1. **Create a GitHub repo** for demos (e.g., `simplapp-demos`)
2. **Connect to Vercel:** Import the repo in Vercel Dashboard
3. **(Optional) Wildcard domain:** Add `*.demo.yourdomain.com` in Vercel Domains
4. **Configure the script:** Edit `scripts/ops/deploy-demo.sh` and set `DEMO_REPO_URL`

That's it. Everything else is automated.

### Usage

```bash
# From the project root (after the build is complete)
bash scripts/ops/deploy-demo.sh acme
# Output: https://acme.demo.yourdomain.com
```

### What Happens

| Phase | Action |
|-------|--------|
| 1. Clone demo repo | Pulls your demo repo to a temp directory |
| 2. Create branch | `demo/acme` (orphan branch, clean history) |
| 3. Copy project | Copies the built app, strips all SOPs |
| 4. Clean CLAUDE.md | Removes operator sections (same as Package) |
| 5. Push | Commits and pushes to the demo branch |
| 6. Vercel deploys | Auto-deploys the branch to a preview URL |

### The Sales Motion

**Before (Zoom-bound):**
```
Prospect interested → Schedule Zoom → Build on call → Show localhost → "Let me think about it"
```

**After (Demo Factory):**
```
Prospect fills intake → You build async → Deploy Demo → Send link
→ Prospect clicks around their app at 11pm
→ Shows their business partner
→ "Let's do this"
```

### Managing Demos

```bash
# Remove a demo (Vercel auto-removes the deployment)
git push origin --delete demo/acme

# List all active demos
git branch -r | grep demo/
```

### Clean Demo URLs

| Setup | URL Format |
|-------|------------|
| No custom domain | `simplapp-demos-git-demo-acme-yourname.vercel.app` |
| Wildcard domain | `acme.demo.simplapp.com` |

For clean URLs, add a wildcard domain (`*.demo.yourdomain.com`) in Vercel.

---

## Activate (Phase 2 — Production Build)

> **Trigger:** Type **"Activate"** in an IDE session (Claude Code, Antigravity, or any AI IDE) after the client has approved the showcase and refined the implementation plan.
> This turns the frontend showcase into a production app with real database, auth, payments, and live data.

### Prerequisites

Before saying "Activate", you should have:
1. A completed Phase 1 build (Agents 1-6 finished, demo is live)
2. A refined `docs/roadmap/03_implementation_plan.md` — reviewed and approved by you AND the client on a call
3. External accounts ready: Supabase project created, Stripe account set up (if needed)
4. Environment variables in `web/.env.local` (Supabase URL, anon key, service role key)

### What Happens

When you say **"Activate"**, Claude becomes the Activator Agent — a single, context-aware agent that reads the implementation plan and builds the production features sequentially, pausing at checkpoints for human verification.

**The Activator reads:**
- `docs/roadmap/03_implementation_plan.md` — your master blueprint (refined with the client)
- `docs/LAUNCH_GUIDE.md` — deployment patterns and templates
- `docs/roadmap/01_project_spec.md` — original spec for context
- `docs/roadmap/02_build_summary.md` — what was built in Phase 1
- `web/lib/intelligence/` — Invisible Pipeline's distilled intelligence services (scoring, profiling, voice DNA, conversion prediction). Scan these to understand which modules to wire into production features.
- `.claude/skills/intelligence-engine/SKILL.md` — Module catalog with detection rules and domain mapping
- All existing code (types, components, API stubs, mock data)

**When the user says "Activate", you MUST:**
1. Read ALL five files listed above — you need the full picture
2. Read `docs/LAUNCH_GUIDE.md` for database patterns, auth setup, and deployment templates
3. Work through the implementation plan phase by phase
4. At each checkpoint, output a clear **CHECKPOINT** block telling the human what to verify
5. Do NOT proceed past a checkpoint until the human confirms

### Activator Phases

```
┌──────────────────────────────────────────────────────┐
│              THE ACTIVATOR AGENT                      │
│                                                       │
│  Phase A: Foundation (Database + Auth)                │
│    → Write/update migration SQL files                 │
│    → Create Supabase client helpers                   │
│    → Create auth callback route                       │
│    → Update middleware for real auth                   │
│    → Wire login/signup forms to real Supabase auth     │
│    ⏸️ CHECKPOINT: "Run supabase db push,              │
│       verify auth works in browser"                   │
│                                                       │
│  Phase B: Core Features (Replace Mock Data)           │
│    → Replace every stub API with real Supabase queries │
│    → Create useFeature hooks for client-side data      │
│    → Rewire every component from mock → real data      │
│    → Add loading states, error handling, empty states  │
│    ⏸️ CHECKPOINT: "Start dev server, verify            │
│       data loads on each page"                        │
│                                                       │
│  Phase C: Payments & Integrations                     │
│    → Create Stripe checkout route + webhook handler    │
│    → Build billing/settings page with real plans       │
│    → Wire any third-party APIs from the spec           │
│    ⏸️ CHECKPOINT: "Create Stripe products,             │
│       test checkout in test mode"                     │
│                                                       │
│  Phase D: Polish & Deploy                             │
│    → SEO meta tags, OG images                         │
│    → Email templates (signup, notifications)           │
│    → Final verify.sh pass                             │
│    → Production deployment to Vercel                  │
│                                                       │
│  Output: Production-ready app                         │
└──────────────────────────────────────────────────────┘
```

### Checkpoint Protocol

At each checkpoint, output this exact format:

```
═══════════════════════════════════════════
⏸️  CHECKPOINT: Phase [A/B/C/D] Complete
═══════════════════════════════════════════

What I just did:
- [list of changes made]

What you need to verify:
1. [specific action — e.g., "Run: supabase db push"]
2. [specific action — e.g., "Open localhost:3000/login and create an account"]
3. [specific action — e.g., "Check that the dashboard loads with your user data"]

Files changed:
- [list of files modified]

Say "continue" when verified, or describe any issues.
═══════════════════════════════════════════
```

### Rules

- **Follow the implementation plan.** It was refined with the client. Don't improvise.
- **Use LAUNCH_GUIDE.md patterns.** The migration templates, API route templates, and auth setup patterns are all documented there. Follow them.
- **Respect the showcase.** Don't rip out working UI. Replace mock data sources with real queries, but keep the components intact.
- **One phase at a time.** Complete Phase A fully before starting Phase B. Each phase depends on the previous.
- **Checkpoint is mandatory.** Never skip a checkpoint. The human needs to verify external services (database, auth, Stripe) before you continue.
- **Minimal changes principle.** Change the data source, not the UI. If a component renders mock data from a const array, replace the const array with a hook/query — don't rewrite the component.
- **Test after every phase.** Run `npm run build` at the end of each phase. Don't accumulate errors.
