# Agent 2 (Brand) — Accumulated Learnings

> **Read this file BEFORE starting work.** These lessons are extracted from past builds to prevent recurring mistakes.

## Color System
- Generate full 50-950 shade scales from the primary color — don't just use one shade
- NEVER use dynamic Tailwind classes: `bg-${color}-500` will be purged. Use static class maps instead
- Test color contrast: primary text on white must pass WCAG AA (4.5:1 ratio minimum)
- Dark backgrounds for sections: use gray-900 or the primary-900 shade, never pure black (#000)

## Typography
- Always specify Google Font with weight ranges: `Inter:wght@400;500;600;700` — not just the name
- Import fonts via `next/font/google` in layout.tsx, not via CSS @import (performance)
- Hero headlines: 48-64px desktop, 32-40px mobile. Body: 16-18px. Never go below 14px.

## Landing Page (9-Section Formula)
- Problem section is MOST IMPORTANT — skip or weaken it and the whole page fails
- Testimonials MUST include metrics: "Increased demos by 180%", not "Great tool!"
- CTA buttons need shadow + hover lift effect — flat buttons don't convert
- Social proof bar: grayscale logos that color on hover, "Trusted by X+ [user type]"
- Hero image/screenshot needs `shadow-2xl` + slight rotation or perspective for premium feel
- AlternativeCTA section is CRITICAL — most visitors aren't ready to buy NOW

## Mobile
- Test every component at 375px width — this is the minimum viewport
- Hero: stack to single column on mobile, image below text
- Navigation: collapse to hamburger at `md` breakpoint
- Touch targets: minimum 44x44px for all interactive elements

## Next.js 14 Server/Client Rules
- Any file using `<style jsx>` MUST have `"use client"` as the very first line — styled-jsx is a client-side feature
- Any file using onClick, onChange, useState, useEffect, useRef, useRouter, usePathname MUST have `"use client"`
- Layout files (`layout.tsx`) that use styled-jsx or React hooks MUST be client components
- When in doubt, add `"use client"` — it's safer than a broken build

## Theme Mode Awareness (CRITICAL — Read the Spec)
- **Read the Creative Brief's Design Intelligence section** to determine if the app is light mode or dark mode BEFORE writing any CSS or Tailwind classes
- If the spec says "light mode" or "flat + warm corporate" → do NOT use dark backgrounds, dark-mode Tailwind classes, or dark theme variables on ANY component
- If the spec says "dark premium" or "alchemy dark" → use the alchemy-dark-theme skill
- **Stat card values MUST match the spec exactly** — don't invent numbers. Read `docs/roadmap/01_project_spec.md` for the exact KPI values the client expects to see
- The scaffold's `next-themes` defaultTheme should match the spec: set `defaultTheme="light"` for light-mode apps, `defaultTheme="dark"` for dark-mode apps

### From Build: MT Promo B2B Merchandise Platform (2026-02-16)
Agent 2 used dark-mode stat card values that didn't match the spec. Agent 3 set `defaultTheme="dark"` on a light-mode app and used dark Tailwind classes (dark:bg-slate-800, dark:border-slate-700) on shared components. Agent 6 had to fix 5 shared components + the root layout. Always check the spec's design direction FIRST.

## Performance
- Landing page images: use `next/image` with proper width/height to prevent layout shift
- Lazy-load anything below the fold: testimonials, footer, alternative CTA
- Don't import heavy icon libraries — use inline SVGs or emoji for section icons
- `transition-all` is an anti-pattern — specify exact properties: `transition-[border-color,background-color,box-shadow]`
- `backdrop-blur-xl` on lists with 5+ items causes lag — reduce to `backdrop-blur-sm`

## Premium Visual Depth (4 Layers — MANDATORY on Landing Pages)
- **Read `docs/SAAS_DESIGN_SYSTEM.md` → "Premium Visual Depth" section** for full documentation
- Layer 1: Add `<div className="dot-grid" />` to hero section (spatial context)
- Layer 2: Ambient glow blobs at **0.08–0.15 opacity** (NOT 0.02–0.04 — those are invisible)
- Layer 3: Wrap page in `noise-overlay` class, content in `relative z-10`
- Layer 4: `card-depth` on all cards, `text-gradient-headline` on section h2s, `h-px` gradient dividers

### Traps to Avoid
- **Gradient text descender clipping**: ALWAYS use `.text-gradient-headline` class (has `padding-bottom: 0.1em`). NEVER apply raw `background-clip: text` + `-webkit-text-fill-color: transparent` without padding — letters g, y, p, q get cut off at the bottom.
- **Badge strikethrough on cards**: When a badge (e.g. "RECOMMENDED") straddles a card border using `-top-3`, the outer wrapper background MUST exactly match the page background. Use `bg-[var(--background)]` not a custom class. Add `px-2 py-0.5` padding to fully cover the border line.
- **Component nesting creates top gaps**: When wrapping sections in `<ScrollReveal>` or other animation wrappers, DO NOT add padding/margin to both the wrapper AND the inner section. Put `py-24` on the section element, not the wrapper. ScrollReveal should have no spacing classes.
- **Per-card styling causes visual inconsistency**: All cards in a grid MUST use identical base styles (bg, border, shadow). Only small accent elements (icon backgrounds, label colors) should vary. NEVER give individual cards different `bgColor`, `borderColor`, or `shadow` — it looks broken.

## Design Intelligence Pipeline (MANDATORY — Read Before Building)

> **Full pipeline details are in the project CLAUDE.md.** Below is your agent-specific checklist.

### Reading Order (Top to Bottom, Each Overrides the Previous)
1. **`docs/SAAS_DESIGN_SYSTEM.md`** — Baseline for ALL builds (9-section formula, 4-layer depth, component specs)
2. **`docs/founder/design-system/*/MASTER.md`** (if exists) — Industry-specific overrides from `ui-ux-pro-max` search
3. **`docs/CREATIVE_BRIEF.md`** — **Your north star.** Follow it exactly: UI style, effects, typography, depth layer directives, anti-patterns
4. **`.agents/skills/alchemy-dark-theme/SKILL.md`** — **When Creative Brief specifies dark background.** Contains the 3-layer card glow system, radial-gradient atmosphere, section rhythm (6-section formula), responsive glow scaling, and GPU performance rules. This replaces the generic "blur-div" approach with production-tested box-shadow glows.

### Fallback: If No Creative Brief Exists
```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "[industry] SaaS" --design-system -p "[App Name]"
```
Also read `.agents/skills/frontend-design/SKILL.md` for anti-generic design principles.

### Anti-AI-Slop Rules
- NEVER default to Inter/Roboto/Arial — use fonts from Creative Brief
- NEVER use cliched purple-gradient-on-white — commit to client's palette
- NEVER use cookie-cutter layouts — vary sections, use asymmetry
- If making a "safe" generic choice, stop and check the Creative Brief

### From Build: EliteFlame Coaching (2026-02-17)
**Hero missing secondary CTA to Signature Element** — The Creative Brief specified `/assessment` as the Signature Element but the Hero section only had the primary CTA. Agent 6.5 had to add "Discover Why You're Plateaued →" ghost button. **ALWAYS include a secondary CTA in the Hero linking to the Signature Element page** — this is a spec requirement, not optional.

**Dot-grid invisible on white Hero background** — The Hero used white dots (`dot-grid`) on a white background = invisible depth layer. Added `.dot-grid-light` with orange-tinted dots. **Rule: `dot-grid` = white dots (dark backgrounds only). `dot-grid-light` = primary-tinted dots (light/white backgrounds). Always match the variant to the background.**

**Smart/curly quotes in Problem.tsx** — Copy-paste from the spec introduced curly quotes (`'`, `'`) in JSX string literals, breaking the parser. **After writing any component, verify no curly quotes exist in string literals.** This is invisible in most fonts but fatal to the build.

### Scroll Animations (MANDATORY on Landing Page)
Import from `@/components/shared`:
- **`ScrollReveal`** — Wrap EVERY landing page section (Hero, Problem, Solution, Benefits, etc.) for scroll-triggered fade/slide-in
  - Props: `direction` ('up'|'down'|'left'|'right'), `delay`, `duration`
  - Use `direction="up"` for most sections, `direction="left"`/`"right"` for alternating content
  - Stagger delays within a section: first element `delay={0}`, second `delay={0.1}`, third `delay={0.2}`
- **`StaggerContainer` + `StaggerItem`** — Wrap card grids (Benefits, Testimonials) for staggered entrance
  - Wrap the grid in `<StaggerContainer>`, each card in `<StaggerItem>`
  - Cards animate in one-by-one automatically

### Example Usage
```tsx
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/shared'

// Section wrapper
<ScrollReveal direction="up">
  <section className="py-20">...</section>
</ScrollReveal>

// Card grid
<StaggerContainer className="grid grid-cols-3 gap-6">
  {benefits.map(b => (
    <StaggerItem key={b.id}>
      <div className="p-6 rounded-xl border">...</div>
    </StaggerItem>
  ))}
</StaggerContainer>
```

## FeatureVisual — Solution/How It Works Illustrations (MANDATORY)

**DO NOT use bland icon-in-circle placeholders for step illustrations.** Use the `FeatureVisual` shared component which renders rich inline SVG compositions (browser mockups, dashboard previews, chart graphics, form layouts) with zero external images.

```tsx
import { FeatureVisual } from '@/components/shared'

// Pick the variant that matches each step:
<FeatureVisual variant="form" />      // "Fill out assessment/quiz"
<FeatureVisual variant="dashboard" /> // "View your dashboard/results"
<FeatureVisual variant="chart" />     // "Track progress/growth"
<FeatureVisual variant="report" />    // "Get your score/report"
<FeatureVisual variant="speed" />     // "Instant response/speed"
<FeatureVisual variant="funnel" />    // "Conversion funnel/pipeline"
```

**Layout pattern:** Alternating 2-column grid (visual left / text right, then swap). Wrap each step in `ScrollReveal` + `StaggerItem`.

**Color adaptation:** FeatureVisual uses CSS custom properties and `color-mix()` to adapt to any brand palette. The `accent` prop defaults to `hsl(var(--primary))` — override it with a hex value if your build uses Tailwind token classes (e.g., `accent="#2563eb"`).

### From Build: HomeServices Capital (2026-02-21)
- Solution.tsx shipped with bland number-in-circle placeholders (just "01", "02", "03", "04" circles with text). Replaced with FeatureVisual variants: form → report → dashboard → chart. Visual quality went from generic to premium instantly.
- **Lesson:** Always check if the spec's Solution/How It Works section uses FeatureVisual. If the spec doesn't mention it, use it anyway — it's always better than icon placeholders.

## Cross-Build Learnings (auto-pulled from Supabase)
> These were extracted from past builds. Apply them proactively.

- **[optimization]** Quote style for directives must be explicitly specified in agent prompts → _Prevention: Add directive format to CLAUDE.md: always use double-quoted "use client"_ _(source: Rocksolideleadgeneration OÜ)_
- **[error]** Landing page components are independently creatable and don't depend on other agents → _Prevention: Landing components could be pre-cached or generated from templates_ _(source: Rocksolideleadgeneration OÜ)_
