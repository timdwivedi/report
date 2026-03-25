# Scaffold Setup Guide

Guided setup for initializing a new project from this scaffold. Written for people who may have NEVER used a code editor or terminal before.

## Trigger Phrases
- "setup project"
- "initialize scaffold"
- "get started"
- "first time setup"
- `/scaffold-setup`

---

## IMPORTANT: Tone & Style

**This user may have zero technical experience.** This might be their first time using an IDE, a terminal, or any development tool. Treat them like a smart friend who just needs clear directions.

- Use plain English. No jargon without explaining it.
- Be encouraging. Celebrate small wins ("Nice! That worked perfectly.")
- Be conversational, not robotic. Talk like a helpful teammate, not a manual.
- If something fails, don't panic. Explain what went wrong and what to try next.
- Use emoji sparingly but naturally to keep things friendly.
- Go ONE step at a time. Don't dump 5 steps on them at once.
- After each step, WAIT for them to confirm before moving to the next.

---

## The Setup Flow (7 Steps)

**Walk through these steps ONE AT A TIME.** After each step, ask the user to confirm it worked before proceeding.

---

### Step 0: Discovery & Project Spec (THE MOST IMPORTANT STEP)

This step turns the client's raw ideas into a comprehensive project spec that powers everything -- the design, the parallel agents, and every future feature. Take your time here. This is where the magic happens.

**For complex or ambiguous projects**, consult the `brainstorming` skill (read `.claude/skills/brainstorming/SKILL.md`). Use its one-question-at-a-time collaborative process to help the user think through architecture decisions, feature prioritization, and scope. Keep it conversational -- the user should feel like they're brainstorming with a co-founder, not filling out a form.

#### Phase A: Scan the Founder's Brain Dump

**FIRST, before asking any questions, check if `docs/founder/` has files in it.**

If files exist (anything besides README.md):
1. Read EVERY file in `docs/founder/`
2. Take notes on: app name, description, target users, features mentioned, competitors, design preferences, brand voice, pricing ideas, pain points, audience details
3. Build a mental model of the founder's vision BEFORE asking questions

If the folder is empty, that's fine -- skip to Phase B.

#### Phase B: Smart Questions (Only Ask What's Missing)

Based on what you learned from the founder's docs (or from scratch if no docs), ask ONLY the questions you don't already know the answer to. Adapt naturally.

**Core questions (if not already answered by the docs):**

> "Hey! I've read through your docs and I'm getting excited about this. Let me fill in a few gaps:
>
> 1. **What's the name of your app?** (e.g., "FitCoach Pro", "InvoiceHero")
> 2. **In one sentence, what does it do?** (e.g., "A coaching platform where trainers manage clients and meal plans")
> 3. **Who exactly is using this?** (e.g., "Fitness coaches who manage 10-50 clients")
> 4. **What are the 3-5 main things they need to do in the app?** (e.g., "Track client workouts, build meal plans, send check-in reminders, view revenue")
> 5. **What industry is this for?** (e.g., "Fitness & wellness", "Real estate", "Financial services", "Education")

If you already know the answers from their docs, confirm instead of asking:

> "From your notes, it looks like you're building [name] -- a [description] for [users]. The main features are [list]. Sound right, or should I adjust anything?"

**Wait for them to confirm or correct before continuing.**

#### Phase C: Design Theme Selection

After you understand the app, present design options. This is critical for making the UI impressive on first build.

**Behind the scenes:** Before presenting options, silently consult the `ui-ux-pro-max` skill to get industry-specific recommendations. Read `.claude/skills/ui-ux-pro-max/SKILL.md` and run:
```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "[their industry] SaaS" --design-system -p "[App Name]"
```
Use the output to inform your recommendations, but present them in the clean format below -- never expose the command to the user.

> "Now let's talk about how your app should look and feel. Based on what you've told me about [their industry/app], here are the styles that would work best:
>
> 1. **Clean & Structured** -- Think Linear, Notion, Vercel. Lots of white space, sharp typography, minimal color. Best for: B2B tools, project management, analytics platforms.
>
> 2. **Bold & High-Energy** -- Think Stripe, Lemon Squeezy. Vibrant gradients, punchy colors, dynamic layouts. Best for: Creator tools, marketing platforms, e-commerce.
>
> 3. **Dark & Premium** -- Think GitHub, Discord, Arc Browser. Dark backgrounds, neon accents, sophisticated feel. Best for: Developer tools, trading platforms, premium SaaS.
>
> 4. **Warm & Approachable** -- Think Slack, Figma, Canva. Friendly colors, rounded corners, illustrations. Best for: Education, coaching, community platforms.
>
> 5. **Clinical & Trust** -- Think health portals, fintech dashboards. Clean whites, calming blues/greens, data-focused. Best for: Healthcare, finance, legal, compliance.
>
> 6. **Match my existing brand** -- Already have a website or brand? Drop a URL or screenshot and I'll extract your exact colors, fonts, and style.
>
> Pick a number, or describe something custom! I can also mix styles -- for example, 'Dark & Premium with Warm accents.'"

**If the user picks a style or describes something custom**, use `ui-ux-pro-max` to pull specific recommendations:
```bash
# Get matching color palettes
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "[chosen style] [industry]" -d color -n 3
# Get matching typography
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "[chosen style] [industry]" -d typography -n 3
```
Present the best-fit palette and font pairing to the user for confirmation. Always show hex codes and font names in plain language.

**If they choose option 6 (brand extraction):**

Attempt to extract their brand identity using one of these methods (in priority order):

1. **Screenshot in `docs/founder/`** -- Check if they dropped a screenshot of their existing site. Read the image and extract: primary/secondary/accent colors (hex codes), font styles, border radius patterns, spacing density, dark vs light mode, overall aesthetic.

2. **URL scan (server-rendered sites only)** -- If they provide a URL, use WebFetch to pull the page HTML/CSS. Extract color values from CSS custom properties, inline styles, and class patterns. Works great for WordPress, Webflow, Squarespace, and other server-rendered sites.

3. **URL fails (SPA/client-rendered)** -- If WebFetch returns minimal HTML (e.g., just a React root div, "Lovable App", or similar), the site is client-side rendered. Tell the user:
   > "That site loads dynamically so I can't scan it directly. No worries -- just take a full-page screenshot and drop it in the `docs/founder/` folder, or paste it here, and I'll extract everything from the image."

**After extraction, present findings for confirmation:**

> "Here's what I pulled from your existing brand:
>
> - **Primary:** [hex] [color name]
> - **Secondary:** [hex] [color name]
> - **Accent:** [hex] [color name]
> - **Background style:** [light/dark]
> - **Font style:** [what you observed -- e.g., "Clean sans-serif, likely Inter or similar"]
> - **Corner radius:** [sharp/slightly rounded/rounded]
> - **Overall vibe:** [1-line description]
>
> Want me to use these exactly, or tweak anything?"

**For all other options, ask ONE follow-up:**

> "Any specific colors you love or hate? Or should I pick what works best for [their industry]?"

#### Phase D: Research & Design System Generation

**This is where you go above and beyond.** Combine local design intelligence with web research.

**Step 1: Generate Design System (Local -- Instant)**

Run the full design system generator with the chosen style and industry:
```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "[chosen style] [industry] SaaS" --design-system -p "[App Name]" --persist --output-dir docs/founder
```
This creates a `design-system/[app-slug]/MASTER.md` with complete color palettes, typography, spacing, shadows, and component specs. Use this as the foundation for Agent 2 directives.

Also consult these skills silently for additional patterns:
- Read `.claude/skills/tailwind-design-system/SKILL.md` for Tailwind v4 implementation patterns (CVA, OKLCH, dark mode tokens)
- Read `.claude/skills/web-design-guidelines/SKILL.md` for accessibility and interaction patterns

**Step 2: Web Research (External -- Competitive Intelligence)**

Use web search to research:

1. **"[their industry] SaaS dashboard design 2026"** -- Find modern design patterns for their specific industry
2. **"[their industry] app UI trends"** -- What's working right now in their space
3. **Top competitors in their space** -- If they mentioned competitors, look at what those apps look like

**Step 3: Synthesize**

Merge the local design system output with web research into concrete design directives: exact hex codes, font pairings with Google Fonts URLs, component border-radius, shadow depths, spacing scale, and layout patterns that work for their industry.

#### Phase E: Write the Project Spec

Create `docs/roadmap/01_project_spec.md` -- this is the MASTER DOCUMENT that powers everything.

**This document serves TWO audiences:**
- **Top section**: For the CLIENT to read. Make it impressive. They should think "holy shit, they understood my vision."
- **Bottom section**: Direct instructions for Agents 1-5. Specific, actionable, no ambiguity.

Use this template:

```markdown
# [App Name] -- Project Specification

> Generated during initial setup. This document powers the entire build.

---

## Vision

**[App Name]** is [one-line description].

Built for **[target users]** who need [core problem it solves]. In a market where [brief industry context from your research], [App Name] stands out by [unique angle].

## Target Users

**Primary User:** [Detailed persona -- name, role, daily workflow, pain points]
**Secondary User:** [If applicable -- e.g., the end-clients of the primary user]

### User Story
> "As a [role], I want to [action] so that I can [outcome]."

## Core Features

### 1. [Feature Name]
**What it does:** [2-3 sentences]
**User sees:** [What the page/screen looks like]
**Data needed:** [What gets stored in the database]

### 2. [Feature Name]
[Same format]

### 3. [Feature Name]
[Same format]

[Continue for all features]

## Design Direction

**Theme:** [Clean & Structured / Bold & High-Energy / Dark & Premium / Warm & Approachable / Clinical & Trust / Custom]
**Industry:** [Their industry]

### Color Palette
- **Primary:** [Hex code + name, e.g., #2563EB Electric Blue]
- **Secondary:** [Hex code + name]
- **Accent:** [Hex code + name]
- **Background:** [Light: #FAFAFA / Dark: #0F172A]
- **Text:** [#1E293B / Dark mode: #F1F5F9]

### Typography
- **Headings:** [Font suggestion -- e.g., Inter, Cal Sans, Space Grotesk]
- **Body:** [Font suggestion -- e.g., Inter, System UI]
- **Monospace:** [For code/data -- e.g., JetBrains Mono, Fira Code]

### Component Style
- **Border radius:** [e.g., 8px for cards, 6px for buttons, 12px for modals]
- **Shadows:** [e.g., Subtle for cards (0 1px 3px), pronounced for modals]
- **Spacing scale:** [e.g., 4px base unit, comfortable spacing]
- **Density:** [Compact for data-heavy, spacious for consumer-facing]
- **Dark mode:** [Yes/No -- based on theme choice]

### Design References
[Based on your research -- list 2-3 apps/websites whose design elements to draw from, and what specifically to borrow from each]

## Page Map

| Page | Route | Layout |
|------|-------|--------|
| Landing Page | `/` | Public (no auth) |
| Login | `/login` | Auth layout |
| Signup | `/signup` | Auth layout |
| Dashboard Home | `/dashboard` | Dashboard (sidebar + topbar) |
| [Feature 1] | `/dashboard/[slug]` | Dashboard |
| [Feature 2] | `/dashboard/[slug]` | Dashboard |
| [Feature 3] | `/dashboard/[slug]` | Dashboard |
| Settings | `/dashboard/settings` | Dashboard |

## Data Model

| Table | Key Columns | Relationships |
|-------|-------------|---------------|
| users | id, email, name, avatar_url | auth.users |
| organizations | id, name, slug, owner_id | users (owner) |
| [entity 1] | [columns] | [relationships] |
| [entity 2] | [columns] | [relationships] |

---
---

## Agent Build Directives

> **FOR AI AGENTS ONLY.** The sections below contain specific instructions for each parallel build agent. Agents: read YOUR section and execute exactly.

### AGENT 1 DIRECTIVES (The Blueprint)
**Files you own:** `docs/roadmap/`, `web/lib/types/`, `web/lib/constants/`, `supabase/migrations/`

- TypeScript interfaces: Create types for [list every entity from Data Model above]
- Enum values: [list specific status values, categories, roles]
- Mock data specs: Generate [X] items per entity. Use realistic names from [industry]. Dates within last 30 days. Dollar amounts between [range].
- Navigation: [List exact sidebar items with paths and emoji icons]
- Database: [List every table with exact column names and types]

### AGENT 2 DIRECTIVES (The Brand)
**Files you own:** `web/tailwind.config.ts`, `web/app/globals.css`, `web/app/page.tsx`, `web/components/public/`
**MUST READ FIRST:** `docs/SAAS_DESIGN_SYSTEM.md` -- The Bloom Design Bible. Contains the 9-section landing page formula, copy formulas, component specs, and conversion principles. Follow the formula.

- **Color implementation:** Use the exact hex codes from Color Palette above. Map primary to Tailwind `primary-500`, create 50-950 shade scale.
- **Font implementation:** Add the fonts from Typography section to the Next.js font config and Tailwind.
- **Component styles:** Use the border-radius, shadows, and spacing from Component Style section.
- **Dark mode:** [Yes → implement .dark CSS variables / No → skip]
- **Landing page structure:** Follow the 9-section formula from the Design System: Hero → Social Proof Bar → Problem → Solution → Benefits → Testimonials → Final CTA → Alternative CTA → Footer
- **Landing page tone:** [Based on brand vibe -- e.g., "Confident but not aggressive. Use short punchy headlines. Hero gradient from primary-600 to primary-800."]
- **Hero headline:** [Use formula: "How to get [RESULT] without [PROBLEM]" -- suggest a headline based on the app's value prop and main user objection]
- **Problem section:** Critique the target user's current way of doing things AND competitor solutions. [List 2-3 pain points to emphasize and 2-3 competitor weaknesses]
- **Solution steps:** [List 3-5 steps from new customer to successful customer. Step 1 is usually setup/integration.]
- **Social proof:** Create result-driven testimonials from realistic [industry] professionals. Use job titles like [list 3 relevant titles]. Each testimonial MUST include a specific metric: "We improved X by Y%."
- **Design references:** Study [reference apps from research] and borrow: [specific elements -- e.g., "Linear's sidebar density", "Stripe's gradient cards"].

### AGENT 3 DIRECTIVES (The Shell)
**Files you own:** `web/components/layout/`, `web/app/(auth)/`, `web/components/shared/`, `web/components/auth/`

- **Sidebar items:** Use the exact navigation from the Page Map. Icons: [list emoji per item].
- **Layout density:** [Compact/Comfortable/Spacious] based on the design theme.
- **Auth pages:** Match the landing page's brand feel. Use primary color for CTA buttons.
- **Stat cards:** Design for [list 4-6 specific KPIs relevant to this app].

### AGENT 4 DIRECTIVES (The Pages)
**Files you own:** `web/app/dashboard/`, `web/components/dashboard/`, `web/components/ui/` (new files only)

For each feature page:

**[Feature 1] -- `/dashboard/[slug]`**
- Display: [Table / Card grid / Kanban / Timeline]
- Columns/fields: [List exact columns for the table or card fields]
- Mock data: [X] items, realistic for [industry]
- Actions: [List buttons -- "Add New", "Export", "Filter by status"]

**[Feature 2] -- `/dashboard/[slug]`**
[Same format]

**[Feature 3] -- `/dashboard/[slug]`**
[Same format]

**Dashboard Home -- `/dashboard`**
- Stat cards: [List 4-6 specific stats with labels and example values]
- Activity feed: [List 5 example activity items relevant to this app]
- Quick actions: [List 3-4 action cards with labels and destinations]

### AGENT 5 DIRECTIVES (The Welder)
**Files you own:** `web/app/api/`, any broken imports

- Expected API routes: [List each feature that needs a stub: `/api/[feature]`]
- Known integration points: [List which pages import from which component directories]
- Verification: Run `verify.sh`, fix TypeScript errors, ensure all navigation links point to real pages.

## Intelligence Directives

> **Include this section ONLY if the app needs intelligence features.** See detection rules below.

### Detection Rules (Spec Agent — Evaluate During Phase A/B)
Consult `.claude/skills/intelligence-engine/SKILL.md` for the full module catalog. Enable intelligence if the intake mentions ANY of these:
- "leads", "prospects", "pipeline", "scoring" → sales preset
- "coaching", "diagnostic", "assessment", "quiz" → coaching preset
- "revenue ceiling", "identity diagnostic", "neo" → neo-diagnostic preset
- "candidates", "hiring", "recruitment" → recruitment (adapt sales preset)
- "students", "learning", "courses" → education (adapt coaching preset)
- "patients", "health", "wellness" → healthcare (adapt coaching preset)
- "analyze", "intelligence", "insights" → generic (start from closest preset)

If NONE of these keywords appear, skip this section entirely.

### If Intelligence Is Enabled
Follow the full template from `.claude/skills/intelligence-engine/SKILL.md` → Phase 0.5 (Domain Mapping) + Phase 1 (Module Selection). Add the Domain Mapping and Intelligence Directives sections to this spec with:
- Enabled modules checklist
- Config preset selection
- Scoring dimensions and weights
- Archetype definitions (if applicable)
- Agent 5 wiring tasks

### Agent 5 Intelligence Tasks (If Applicable)
- Import `intelligence-registry.ts` → call `getRequiredFiles(enabledIds)` for exact file list
- **DEMO FIRST**: Wire all intelligence UI using `*OrDemo()` wrappers — app works without database
- Generate `intelligence.config.ts` from this spec
- Run only the needed migrations (003a→003d)
- Set `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local.example`
```

#### Phase F: Populate Quick Start Brief

**CRITICAL: Also update `docs/QUICK_START_AGENTS.md`.** Replace the entire `## App Brief` section (between `## App Brief` and the next `---`) with:

```markdown
## App Brief

**STATUS: READY**

**APP NAME:** [Name]
**ONE-LINE DESCRIPTION:** [Description]
**TARGET USER:** [Users]
**INDUSTRY:** [Industry]
**CORE FEATURES:**
1. [Feature 1]
2. [Feature 2]
3. [Feature 3]
4. [Feature 4 if provided]
5. [Feature 5 if provided]
**DESIGN THEME:** [Theme name]
**BRAND VIBE:** [Description]
**PRIMARY COLOR:** [Hex code]
**PAGE MAP:**
- /dashboard (home)
- /dashboard/[feature-1-slug] ([Feature 1 name])
- /dashboard/[feature-2-slug] ([Feature 2 name])
- /dashboard/[feature-3-slug] ([Feature 3 name])
- /dashboard/settings

**FULL SPEC:** Read `docs/roadmap/01_project_spec.md` for complete details and your agent-specific directives.
```

#### Phase G: Update Project Files

Update these files with the project name:
- `package.json` -- Change `"name"` field (lowercase, hyphens, e.g., `"acme-crm"`)
- `web/app/layout.tsx` -- Update `metadata.title` and `metadata.description`
- `README.md` -- Replace `[Your App Name]` in the title

#### Phase H: Present to the Client

> "Here's what I've put together for **[App Name]**. Take a look at `docs/roadmap/01_project_spec.md` -- it's your complete project blueprint.
>
> I nailed down:
> - Your exact features and what each page will look like
> - A **[theme name]** design direction with [primary color] as your main color
> - The database structure for all your data
> - A page-by-page plan for your entire app
>
> Does this look right? Anything you'd change before we start building?"

**Wait for confirmation before proceeding to Step 1.**

---

### Step 1: Install Dependencies

**Say something like:**

> "First, we need to install the packages your app needs. Think of it like downloading all the ingredients before cooking.
>
> I'm going to run a command for you. You'll see a bunch of text scroll by -- that's normal. Just wait until it says 'done'."

**Run:**
```bash
cd web && npm install
```

**If it succeeds, say:**
> "Perfect, everything installed! One down, a few more to go."

**If it fails:**
- "npm not found" → "Looks like Node.js isn't installed yet. You'll need to install it from https://nodejs.org -- grab the LTS version. Once it's installed, come back and we'll try again."
- Other errors → "Hmm, that didn't work. Let me see what went wrong..." then troubleshoot based on the error.

---

### Step 2: Set Up Environment Variables

**Say something like:**

> "Now we need to connect your app to its database and payment system. We do this with 'environment variables' -- basically secret passwords that tell your app where to find things.
>
> I'm going to create a file called `.env.local` for you. Then you'll need to fill in a few values from your Supabase and Stripe accounts.
>
> Don't have those accounts yet? No problem:
> - **Supabase** (free): https://supabase.com -- this is your database
> - **Stripe** (free to set up): https://stripe.com -- this handles payments
>
> Once you have accounts, here's where to find the keys:"

**Run:**
```bash
cd web && cp .env.local.example .env.local
```

**Then walk them through each variable ONE AT A TIME:**

1. **Supabase keys** (required):
   > "Go to your Supabase project → click 'Settings' (gear icon) → click 'API' in the sidebar. You'll see three values we need:
   > - **Project URL** -- copy this to `NEXT_PUBLIC_SUPABASE_URL`
   > - **anon/public key** -- copy this to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   > - **service_role key** -- copy this to `SUPABASE_SERVICE_ROLE_KEY` (keep this one secret!)
   >
   > Paste them in when you're ready."

2. **App URL** (required):
   > "For now, set `NEXT_PUBLIC_APP_URL` to `http://localhost:3000` -- that's your local development address. We'll change this when you deploy."

3. **Stripe keys** (optional for now):
   > "If you have Stripe set up, go to Stripe Dashboard → Developers → API keys. Copy the publishable and secret keys. If you don't have Stripe yet, we can skip this and add it later."

4. **AI keys** (optional):
   > "If you want AI features, you can add API keys for Claude (console.anthropic.com), OpenAI (platform.openai.com), or Google Gemini (aistudio.google.com). These are optional -- we can add them anytime."

**After they've added values:**
> "Great! Your app now knows where to find everything. Let's set up the database next."

---

### Step 3: Set Up the Database

**Say something like:**

> "Now we need to create the tables in your database. Think of tables like spreadsheets -- one for users, one for organizations, etc.
>
> This part we do manually in the Supabase website. Here's what to do:
>
> 1. Go to your Supabase project dashboard
> 2. Click **'SQL Editor'** in the left sidebar (it looks like a terminal icon)
> 3. Click **'New Query'**
> 4. I'm going to give you some SQL to paste in -- just copy it, paste it into the editor, and click **'Run'**"

**Then provide the migration SQL one file at a time:**

> "Let's start with the first migration. Copy everything below and paste it into the SQL Editor:"

Provide contents of `supabase/migrations/001_initial_schema.sql`, then:

> "Click 'Run'. You should see 'Success' at the bottom. Did it work?"

If yes, continue with `002_rls_policies.sql`:

> "Great! Now let's run the security policies. Same thing -- new query, paste this in, click Run:"

**After both migrations:**
> "Your database is ready! It has tables for users, organizations, settings, and subscriptions -- all secured so people can only see their own data."

**Also guide them to configure auth:**
> "One more thing in Supabase: go to **Authentication** → **URL Configuration** and set the Site URL to `http://localhost:3000`. This makes sure login emails redirect to the right place."

---

### Step 4: Start Your App

**Say something like:**

> "Moment of truth -- let's see your app running! I'm going to start the development server."

**Run:**
```bash
cd web && npm run dev
```

> "Your app should now be running at **http://localhost:3000**. Open that in your browser and see your app!"

**If it works:**
> "Look at that -- your app is alive! You should see a login page. Everything is working."

**If it fails:**
- Build errors → "Let me try clearing the cache first:" → `rm -rf .next && npm run dev`
- Port in use → "Looks like something else is using port 3000. Try closing other browser tabs or apps, then we'll try again."

---

### Step 5: Verify Everything Works

**Run:**
```bash
cd web && ./verify.sh
```

> "This runs a quick health check on your app -- making sure there are no code errors. Think of it like a car inspection."

**If all passes:**
> "All green! Your app is healthy and ready to build on."

**If something fails:**
Walk them through each error. Most common:
- TypeScript errors → Usually a missing env variable or a file that needs updating
- Lint errors → Usually minor formatting issues, can be auto-fixed

---

### Step 6: Set Up Stripe (Optional)

> "Want to set up payments now, or skip and add them later? Payments are optional for getting started -- you can always add them when you're ready to charge customers."

**If they want to set up now:**

1. Create Products & Prices in Stripe Dashboard
2. Set up webhook endpoint
3. For local testing: `npm run stripe:listen`

**If they want to skip:**
> "No problem! We'll add payments when you need them. For now, your app works without it."

---

### Step 7: What's Next (Conversational Guidance)

**This is the most important step. Don't just list commands -- have a conversation.**

**Say something like:**

> "Your app is up and running! Here's what we just built together:
>
> - A full authentication system (login, signup, password reset)
> - A database with user profiles and organization support
> - A dashboard your users will see after logging in
> - The foundation for payments and AI features
>
> Now for the fun part. You've got two options:
>
> **Option 1: Speed Build (recommended if you want to see your app fast)**
> Open 4 more agent windows and type these -- one per window:
> - **Agent 1** -- builds your types, mock data, and database schema
> - **Agent 2** -- builds your landing page with your brand colors
> - **Agent 3** -- builds your dashboard layout and navigation
> - **Agent 4** -- builds all your feature pages with realistic data
>
> Wait a couple minutes, then open one more window and type:
> - **Agent 5** -- checks everything, fixes any issues, runs verification
>
> In about 5 minutes you'll have a full clickable frontend.
>
> **Option 2: Build one feature at a time**
> Tell me what you want to build and I'll walk you through it step by step.
>
> **Some things you can say to me anytime:**
>
> - *'Build [feature name]'* -- I'll plan and build a new feature
> - *'Fix [problem]'* -- I'll find and fix bugs
> - *'What should I build next?'* -- I'll suggest the next logical feature
> - *'How does [thing] work?'* -- I'll explain any part of your app
>
> What would you like to do?"

**IMPORTANT:** Reference their project brief. If they said "a coaching portal for fitness coaches", personalize the options -- "Want to speed build your coaching dashboard? Or take it step by step?"

---

## Cleanup After Setup

**IMPORTANT: After the user confirms setup is complete, perform these cleanup tasks:**

### 1. Remove the onboarding banner from `CLAUDE.md`

Delete everything between `<!-- ONBOARDING_START -->` and `<!-- ONBOARDING_END -->` (inclusive) from the root `CLAUDE.md` file.

### 2. Update the Skills table in `CLAUDE.md`

Remove the `/scaffold-setup` row from the Skills Available table, since it's no longer needed.

### 3. Clean up `README.md`

- Change `[Your App Name]` to the actual project name (if not already done)
- Remove the line: `> **First step:** Rename this file's title and run /scaffold-setup in Claude Code.`

### 4. Update `.agent/instructions.md`

Remove the "First Run" section that mentions `/scaffold-setup`.

### 5. Remove this skill file (optional)

Ask the user: "Setup is complete! Would you like me to remove the setup guide since it's no longer needed? (All your other tools like building features and action plans will stay.)"

If yes, delete `.claude/skills/scaffold-setup/SKILL.md` (keep the memory/learnings.md file).

---

## Troubleshooting Quick Reference

| Problem | Fix |
|---------|-----|
| "npm not found" | Install Node.js from https://nodejs.org (LTS version) |
| "Module not found" errors | `rm -rf node_modules .next && npm install && npm run dev` |
| Supabase connection fails | Check URL format (no trailing slash), verify keys are correct |
| "Permission denied" on verify.sh | Run `chmod +x verify.sh` first |
| Stripe webhooks fail locally | Make sure `npm run stripe:listen` is running in a separate terminal |
| App shows blank page | Check browser console (F12) for errors, try clearing `.next` cache |
| Login email not arriving | Check Supabase Auth settings, verify Site URL matches your app URL |
