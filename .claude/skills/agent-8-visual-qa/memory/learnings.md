# Agent 8 (Visual QA & Design Polish) — Accumulated Learnings

> **Read this file BEFORE starting work.** These lessons prevent recurring mistakes.

## Core Mission
- You receive screenshots of every page + the project spec + the implementation plan
- Your job: polish CSS/styling, fix visual bugs, and mock up vision elements from the implementation plan
- You make the prototype look like a premium demo, NOT a code exercise

## Rules
- ONLY make Tailwind CSS / styling changes — no functional code, no API routes, no business logic
- Every change must be a visual improvement visible in screenshots
- Don't add new pages or components — improve what exists
- Don't remove functionality — only enhance how it looks
- After your changes, `npm run build` must still pass

## Design Intelligence Cross-Check (MANDATORY Before Making Changes)

Before making ANY visual changes, read these files to understand what the design SHOULD look like:

### Reading Order
1. **`docs/CREATIVE_BRIEF.md`** — The Creative Director's vision. Contains:
   - **Design Intelligence section** — The chosen UI style (e.g., "Dark Premium + Glassmorphism"), specific CSS effects, anti-patterns to avoid
   - **Typography pairing** — Exact Google Fonts that should be used. If Agent 2 substituted with Inter/Roboto, **flag it as a deviation**.
   - **Depth Layer Directives** — Which sections should have dot grid, glow blobs, noise overlay, card depth
   - **Animation Directives** — Which sections get ScrollReveal, what directions, what delays
2. **`docs/founder/design-system/*/MASTER.md`** (if exists) — Industry-specific style data from ui-ux-pro-max search
3. **`docs/SAAS_DESIGN_SYSTEM.md`** — The baseline design bible with 4-layer depth system

### Anti-AI-Slop Audit (from `.agents/skills/frontend-design/SKILL.md`)
When reviewing screenshots, flag these generic AI aesthetics:
- [ ] **Generic fonts** — Is the page using Inter, Roboto, Arial, or system fonts when the Creative Brief specified distinctive fonts? Flag it.
- [ ] **Cliched color schemes** — Purple gradients on white backgrounds, default Tailwind blue-500 as primary. Check against the Creative Brief's palette.
- [ ] **Cookie-cutter layouts** — Every section is centered text + 3-column grid? Check if the Creative Brief called for asymmetry, overlap, or unexpected spatial composition.
- [ ] **Flat, lifeless backgrounds** — Solid colors without any of the 4 depth layers? The Creative Brief specifies which layers go where.
- [ ] **Predictable hover states** — Generic `hover:opacity-80` everywhere? Creative Brief may specify specific hover effects.

### Style Compliance Check
Compare the built page against the Creative Brief's **Design Intelligence** section:
- Does the page use the specified UI style effects (backdrop-blur values, shadow depths, gradient types)?
- Are the anti-patterns avoided (if brief says "no flat borders", check for flat borders)?
- Do cards match the specified style (glassmorphism? neumorphism? bento grid?)?
- Is the typography pairing correct (exact fonts, weights)?

## Common Improvements
- Hero sections: add gradient overlays, animated text, better spacing
- Dashboard cards: ensure consistent sizing, proper shadows, good contrast
- Dark theme: text must be readable without maxing brightness (min text-gray-300)
- Animations: use `transition-[specific-properties]` NOT `transition-all` — specify exact properties that change
- Empty states: make them look intentional, not broken
- Mobile: check if responsive classes are missing (sm:, md:, lg: prefixes)

## Implementation Plan Preview
- Read `docs/roadmap/03_implementation_plan.md` for the "Phase 1" features
- For features that have UI implications, add visual MOCK elements:
  - "Coming Soon" badges on nav items for planned features
  - Placeholder sections with blurred/grayed content hinting at future features
  - Dashboard widgets showing mock data for planned analytics
- These are VISUAL ONLY — no functional code behind them
- Label mocked elements clearly so Agent 6 / Welder don't try to "fix" them

## Premium Visual Depth Checklist (Landing Pages)
When reviewing landing page screenshots, check for these common issues:

### Depth & Texture
- [ ] Page has `noise-overlay` class and content has `relative z-10`
- [ ] Hero section has `dot-grid` pattern
- [ ] Each section has 1-2 ambient glow blobs at 0.08-0.15 opacity (NOT 0.02)
- [ ] Cards use `card-depth` class (inner top highlight + depth shadow)
- [ ] Section headlines use `text-gradient-headline` (white → zinc gradient)
- [ ] Gradient divider lines between sections (`h-px bg-gradient-to-r`)

### Common Visual Bugs to Check
- [ ] **Descender clipping**: Check any gradient text for g, y, p, q letters being cut off at bottom. Fix: ensure `.text-gradient-headline` is used (has `padding-bottom: 0.1em`)
- [ ] **Badge strikethrough**: Badges positioned at `-top-3` on cards — check if card border shows through the badge as a line. Fix: outer wrapper needs matching page background + padding
- [ ] **Top gaps from component nesting**: Check sections wrapped in ScrollReveal — look for unexpected spacing at top of sections. Fix: spacing should be on the section element, not the wrapper
- [ ] **Card inconsistency in grids**: All cards in a row should have identical base styling. Only icons/labels should differ in color
- [ ] **Invisible glow blobs**: If background looks flat black with no color variation, blobs are too faint. Boost to 0.08-0.15 opacity
- [ ] **Laggy transitions**: Check for `transition-all` (animates everything) — should be `transition-[specific-properties]`
