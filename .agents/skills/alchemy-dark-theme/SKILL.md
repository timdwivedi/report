---
name: alchemy-dark-theme
description: "Premium UI design system — principles for making dark & light themes look Lovable-quality. 3-layer card glow system, radial-gradient atmospheres, section rhythm, text gradients, pricing dominance, hero media blending, skeleton loading, form inputs, toasts, modals, empty states, micro-interactions. Project-agnostic — uses CSS custom properties, not hardcoded colors."
---

# Premium UI Playbook — Dark & Light Theme Principles

Production-tested UI design principles extracted from Lovable-quality implementations. This skill teaches the TECHNIQUES and PATTERNS — not specific brand colors. Every code example uses CSS custom properties so it works with ANY brand palette.

## When to Use This Skill

- Building any page with a dark background
- Creating landing pages, sales pages, or premium marketing pages
- Designing card-heavy layouts that need depth and interactive glow
- Implementing section-based scroll pages with atmosphere
- Any time the UI looks "flat" or "bland" — dark or light
- Converting between dark and light themes

## Core Principle: Depth or Death

On a dark background, flat elements disappear. Every element must earn its visibility through one of three methods:
1. **Glow** — box-shadow with brand colors
2. **Gradient** — text or background
3. **Border luminance** — subtle colored borders that brighten on hover

Without these, dark UI looks like a broken page.

---

## 1. Color Architecture

Every dark UI needs these token categories defined. The specific hex values come from the project's brand — what matters is the STRUCTURE.

### Required Tokens
```css
:root {
  /* Background layers (darkest → lightest) */
  --bg: /* e.g. #0a0a0f */;
  --bg-secondary: /* slightly lighter, e.g. #0f0f1a */;
  --card-bg: /* translucent, e.g. rgba(26, 26, 35, 0.9) */;
  --border: /* subtle, e.g. #2a2a35 */;

  /* Brand accents — exactly 3 */
  --accent-primary: /* main CTA/premium color */;
  --accent-primary-bright: /* brighter variant for hover */;
  --accent-secondary: /* contrasting energy color */;
  --accent-tertiary: /* bridge between warm/cool */;

  /* Text hierarchy */
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-muted: rgba(255, 255, 255, 0.4);
}
```

### Color Roles
- **Primary accent** = premium, authority, CTAs, the "earned" color
- **Secondary accent** = energy, tech, speed, the "new" feeling
- **Tertiary accent** = bridges the other two, adds depth
- **Three colors max per page.** Each gets a semantic role.

### Contrast-Safe Text on Dark Backgrounds

| Lightness | Contrast on ~#0a0a0f | WCAG |
|-----------|----------------------|------|
| 98% | ~16.8:1 | AAA |
| 60% | ~5.2:1 | AA body text |
| 55% | ~4.5:1 | AA minimum |
| Below 55% | <3:1 | FAILS |

**Rule:** Never use text below 55% lightness for readable content. Tailwind `gray-400` (~60%) is the floor for body text. `gray-500` (~50%) is caption/meta only.

---

## 2. The 3-Layer Card Glow System

This is the single biggest visual differentiator. Every card uses layered `box-shadow`, NOT blurred `<div>` overlays.

### Base Card (at rest)
```css
.card {
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05),  /* Top edge highlight */
    0 0 0 1px rgba(0, 0, 0, 0.2),                 /* Outer ring */
    0 4px 24px rgba(0, 0, 0, 0.4);                /* Depth shadow */
}
```

### Card Hover — Primary Accent
```css
/* Replace rgba values with your brand's primary accent at these opacities */
.card:hover {
  transform: translateY(-4px);
  border-color: hsl(var(--accent-primary) / 0.4);
  box-shadow:
    0 10px 40px hsl(var(--accent-primary) / 0.15),   /* Spread glow */
    0 0 60px hsl(var(--accent-primary) / 0.1),        /* Atmospheric halo */
    inset 0 1px 0 hsl(var(--accent-primary) / 0.2);   /* Top edge turns accent */
}
```

### Card Hover — Secondary Accent
```css
.card-secondary:hover {
  border-color: hsl(var(--accent-secondary) / 0.4);
  box-shadow:
    0 10px 40px hsl(var(--accent-secondary) / 0.15),
    0 0 60px hsl(var(--accent-secondary) / 0.1),
    inset 0 1px 0 hsl(var(--accent-secondary) / 0.2);
}
```

### Card Hover — Tertiary Accent
```css
.card-tertiary:hover {
  border-color: hsl(var(--accent-tertiary) / 0.4);
  box-shadow:
    0 10px 40px hsl(var(--accent-tertiary) / 0.15),
    0 0 60px hsl(var(--accent-tertiary) / 0.1),
    inset 0 1px 0 hsl(var(--accent-tertiary) / 0.2);
}
```

### Featured/Premium Card (permanent glow)
```css
.card-featured {
  border: 2px solid hsl(var(--accent-primary) / 0.4);
  box-shadow:
    0 0 60px hsl(var(--accent-primary) / 0.2),
    0 0 100px hsl(var(--accent-primary) / 0.1);
}
```

### The Pattern (what matters)
- **3 layers:** spread glow → atmospheric halo → inset top-edge
- **Opacity levels:** 0.15 → 0.1 → 0.2
- **Spread sizes:** 40px → 60px → 1px inset
- **Border brightens** from 0.06 → 0.4 on hover
- **translateY(-4px)** lift on hover

### Responsive Scaling
```css
/* Mobile: cut to 2-layer, halve spread, reduce opacity 20% */
@media (max-width: 768px) {
  .card:hover {
    transform: translateY(-2px);
    box-shadow:
      0 5px 20px hsl(var(--accent-primary) / 0.12),
      inset 0 1px 0 hsl(var(--accent-primary) / 0.15);
    /* Drop the 60px atmospheric layer — bleeds on small screens */
  }
}
```

---

## 3. Background Atmosphere

### Section Backgrounds — Use CSS Radial Gradients, NOT Blur Divs

**NEVER** do this (kills scroll performance):
```html
<div class="absolute w-[600px] h-[600px] bg-accent/10 blur-[150px]" />
```

**ALWAYS** do this (zero performance cost):
```css
section {
  background:
    radial-gradient(600px 500px at 25% 25%, hsl(var(--accent-primary) / 0.10), transparent),
    radial-gradient(500px 400px at 66% 66%, hsl(var(--accent-tertiary) / 0.06), transparent);
}
```

### Page-Level Textures
Noise and dot-grid should be **single fixed instances** at the page level, not repeated per section:
```html
<div class="page-noise" aria-hidden="true" />
<div class="page-dots" aria-hidden="true" />
```

### Section Rhythm (6-Section Formula)
```
Section 1: bg-primary       + secondary accent  + primary orb (top-right)
Section 2: bg-secondary     + primary accent    + secondary orb (bottom-left)
Section 3: bg-primary       + tertiary accent   + tertiary orb (top-left)
Section 4: bg-secondary     + secondary accent  + primary orb (center)
Section 5: bg-primary       + primary accent    + no orb (breathing room)
Section 6: cta-gradient     + primary accent    + radial overlay
```

**Rules:**
- Alternate `--bg` and `--bg-secondary` backgrounds
- Rotate accent colors across sections
- No visible borders or `<hr>` — the background alternation is enough

---

## 4. Text Gradients

```css
/* Primary accent shimmer — CTAs, key phrases */
.text-gradient-primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-primary-bright));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Secondary accent — tech features */
.text-gradient-secondary {
  background: linear-gradient(135deg, var(--accent-secondary), /* lighter variant */);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Full spectrum — hero headlines */
.text-gradient-full {
  background: linear-gradient(90deg, var(--accent-secondary), var(--accent-tertiary), var(--accent-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Headline gradient — white fading to zinc (premium feel, works for ANY brand) */
.text-gradient-headline {
  background: linear-gradient(to bottom, #ffffff 0%, #a1a1aa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Shimmer Animation on Gradient Text
```html
<span class="text-transparent bg-clip-text bg-gradient-to-r from-[accent] via-[lighter] to-[accent] animate-shimmer bg-[length:200%_auto]">
  Highlighted Text
</span>
```
**IMPORTANT:** `.animate-shimmer` must ONLY set `animation`, NOT `background`. The component's classes handle the gradient.

---

## 5. Typography Scale

```
Hero H1:  clamp(1.875rem, 1.5rem + 1.5vw, 3rem)     — or text-4xl sm:text-5xl md:text-7xl
Section H2: clamp(1.5rem, 1.2rem + 1.2vw, 2.5rem)   — or text-3xl sm:text-4xl md:text-5xl
Card H3:  text-lg (1.125rem)                           — static
Body:     text-base (1rem) or text-lg (1.125rem)       — static
Eyebrow:  text-[11px] font-bold uppercase tracking-[0.25em]
Caption:  text-sm text-muted
```

Hero headline trick: `leading-[1.1]` on main line, `pb-1` to prevent descender clipping.

---

## 6. Component Patterns

### Eyebrow Badge
```html
<div class="inline-flex items-center gap-2 px-5 py-2.5 bg-[accent]/10 border border-[accent]/25 rounded-full backdrop-blur-md shadow-[0_0_30px_hsl(accent/0.12)]">
  <Icon size="14" class="text-[accent] animate-pulse-subtle" />
  <span class="text-[11px] font-bold uppercase tracking-[0.25em] text-[accent]">
    Label
  </span>
</div>
```

### Icon Container
```html
<div class="w-11 h-11 rounded-xl bg-[accent]/12 border border-[accent]/25 flex items-center justify-center shadow-[0_0_20px_hsl(accent/0.15)]">
  <Icon size="18" class="text-[accent]" />
</div>
```

### Section Divider Line
```html
<div class="h-px bg-gradient-to-r from-transparent via-[accent]/40 to-transparent" />
```

### Gradient Border (padding-box technique)
```css
.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, var(--accent-primary), hsl(var(--accent-primary) / 0.3), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

### Blockquote Card — Primary Accent
```css
.quote-card {
  background: var(--card-bg);
  border: 1px solid hsl(var(--accent-primary) / 0.15);
  border-radius: 16px;
  box-shadow:
    0 0 40px hsl(var(--accent-primary) / 0.08),
    inset 0 1px 0 hsl(var(--accent-primary) / 0.1);
}
```

### Blockquote Card — Tertiary (with left accent)
```css
.quote-card-accent {
  background: var(--card-bg);
  border-left: 3px solid hsl(var(--accent-tertiary) / 0.5);
  border-radius: 0 12px 12px 0;
  box-shadow:
    0 0 30px hsl(var(--accent-tertiary) / 0.06),
    inset 0 1px 0 hsl(var(--accent-tertiary) / 0.08);
}
```

---

## 7. Animations & Motion Hierarchy

| Element | Effect | Purpose |
|---------|--------|---------|
| CTAs | shimmer + pulse-glow (3s) | Highest attention |
| Cards | hover glow + translateY(-4px) | Interactive feedback |
| Background orbs | slow float (8s) | Ambient, never distracting |
| Text | ScrollReveal (one-time entrance) | Staggered reveal |
| Badge icons | animate-pulse-subtle | Subtle life indicator |

**Rule:** Not everything moves. Only assign motion to elements that need attention.

### Key Animations
```css
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px hsl(var(--accent-primary) / 0.3); }
  50%      { box-shadow: 0 0 40px hsl(var(--accent-primary) / 0.5); }
}
```

---

## 8. Z-Index Hierarchy

```
z-0    — Background atmosphere (radial gradients)
z-[1]  — Page-level textures (noise, dot-grid)
z-[2]  — Section content wrapper
z-10   — Cards, text, images
z-20   — Sticky elements
z-30   — Navigation bar (fixed)
z-40   — Overlays/backdrops
z-50   — Modals
z-[9999] — Portal-rendered modals
```

---

## 9. Performance Rules

| Rule | Why |
|------|-----|
| Use `box-shadow` for card glows, NOT `filter: blur()` on divs | box-shadow is GPU-composited; blur triggers repaint |
| Use CSS `radial-gradient()` for ambient orbs, NOT blurred divs | Zero performance cost vs filter operation per frame |
| Max 2 large blur elements per viewport | Each blur-[100px]+ div is GPU-heavy |
| `backdrop-blur` ≤ 3 visible elements at once | Expensive compositing |
| Keep `backdrop-blur` radius ≤ 8px where possible | Smaller radius = less GPU work |
| `content-visibility: auto` on off-screen sections | Browser skips rendering for non-visible sections |
| Page-level noise/dot-grid as `position: fixed` single instance | 1 element instead of N per section |
| `.shimmer` uses `transform: translateX()` | GPU-accelerated, cheap |
| Never use dynamic class interpolation | `bg-${color}` forces runtime generation |

---

## 10. The Iteration Loop

When something looks flat, follow this decision tree:

1. Identify the flattest element on screen
2. Add **ONE** layer (glow, gradient, or border luminance)
3. Check if it competes with adjacent elements
4. If yes → tone down the neighbor. If no → move to next flat element

The system compounds. Each layer makes the next layer's contrast easier to calibrate.

---

## 11. Light Theme Adaptation

When converting dark theme to light, every visual layer transforms — glows become shadows, backgrounds invert, glass becomes frosted white.

### Core Rule: Shadows Replace Glows

Dark mode uses `0 0 Xpx` (glow spread, no offset). Light mode uses `0 Ypx Zpx` (drop shadow with vertical offset):
```css
/* Dark: colored atmospheric glow */
box-shadow: 0 10px 40px hsl(var(--accent-primary) / 0.15),
            0 0 60px hsl(var(--accent-primary) / 0.1);

/* Light: neutral depth shadow with offset */
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08),
            0 1px 3px rgba(0, 0, 0, 0.06);
```

### Background Inversion
```css
/* Dark → Light token mapping */
--bg:          #0a0a0f    →  #ffffff;
--bg-secondary: #0f0f1a   →  #f8f9fa;
--card-bg:     rgba(dark)  →  rgba(255, 255, 255, 0.9);
--border:      #2a2a35     →  rgba(0, 0, 0, 0.08);
```

### Glass Cards Transform
```css
/* Dark: translucent dark bg + backdrop blur */
background: var(--card-bg); /* dark translucent */
backdrop-filter: blur(8px);
border: 1px solid rgba(255, 255, 255, 0.06);

/* Light: frosted white — higher opacity + shadow replaces glow */
background: rgba(255, 255, 255, 0.8);
backdrop-filter: blur(8px);
border: 1px solid rgba(0, 0, 0, 0.06);
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
```

### Text Gradient Fallback

White-to-zinc gradient becomes invisible on light backgrounds. Increase saturation +20% on brand gradients:
```css
/* Dark mode headline gradient */
background: linear-gradient(to bottom, #ffffff 0%, #a1a1aa 100%);

/* Light mode — dark text gradient instead */
background: linear-gradient(to bottom, #1a1a2e 0%, #4a4a5a 100%);
```

### Hover State Transformation
```css
/* Dark: colored glow on hover */
border-color: hsl(var(--accent-primary) / 0.4);
box-shadow: 0 10px 40px hsl(var(--accent-primary) / 0.15);

/* Light: elevated shadow on hover, muted brand accent */
border-color: hsl(var(--accent-primary) / 0.2);
box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12),
            0 0 0 1px hsl(var(--accent-primary) / 0.1);
```

### Background Atmosphere
```css
/* Dark: colored radial gradients at 6-10% opacity */
background: radial-gradient(600px at 25% 25%, hsl(var(--accent-primary) / 0.10), transparent);

/* Light: same gradients at 3-5% opacity */
background: radial-gradient(600px at 25% 25%, hsl(var(--accent-primary) / 0.04), transparent);
```

---

## 12. Pricing / Comparison Dominance

When building pricing cards or comparison tables, one option must visually dominate.

### Featured Card Rules
```css
.pricing-featured {
  /* Physically taller via negative margin */
  margin-top: -1rem;
  margin-bottom: 1rem;

  /* ONE extra visual layer — permanent glow */
  border: 2px solid hsl(var(--accent-primary) / 0.4);
  box-shadow:
    0 0 60px hsl(var(--accent-primary) / 0.15),
    0 0 100px hsl(var(--accent-primary) / 0.08);
}
```

### Floating Badge (outside the card)
```html
<div class="relative">
  <div class="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1 bg-gradient-to-r from-[accent-primary] to-[accent-bright] rounded-full text-xs font-bold text-black shadow-[0_0_20px_hsl(accent/0.3)]">
    Most Popular
  </div>
  <div class="pricing-featured p-8 rounded-2xl ...">
    <!-- Card content -->
  </div>
</div>
```

### The "ONE Extra Layer" Rule

Featured gets exactly ONE extra visual element the others don't have. Pick one:
- **Shimmer border** — animate-shimmer on a gradient border
- **Permanent glow** — box-shadow at 0.15 opacity
- **Floating badge** — positioned above the card

Never stack all three. That's noise, not hierarchy.

### Non-Featured Cards
Intentionally muted. Lower border opacity, no glow:
```css
.pricing-standard {
  border: 1px solid rgba(255, 255, 255, 0.06);
  opacity: 0.85;
}
.pricing-standard:hover {
  opacity: 1;
  border-color: rgba(255, 255, 255, 0.12);
}
```

---

## 13. Hero Media Blending

Three patterns for integrating screenshots, videos, or images into dark hero sections.

### Pattern 1: Bottom Fade (Screenshot floats into background)
```css
.hero-media-bottom-fade::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 40%;
  background: linear-gradient(to top, var(--bg), transparent);
  pointer-events: none;
}
```

### Pattern 2: Vignette (Video centered, edges dissolve)
```css
.hero-media-vignette::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, var(--bg) 100%);
  pointer-events: none;
}
```

### Pattern 3: Side Fade (Media on one side, content on other)
```css
.hero-media-side-fade::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, var(--bg), transparent 30%, transparent 70%, var(--bg));
  pointer-events: none;
}
```

### Atmosphere Behind Media
Place a blurred orb behind the media using the media's dominant color:
```html
<div class="relative">
  <div class="absolute inset-0 -z-10"
    style="background: radial-gradient(500px 400px at 50% 50%, hsl(var(--accent-primary) / 0.12), transparent)">
  </div>
  <img src="..." class="relative rounded-2xl hero-media-bottom-fade" />
</div>
```

---

## 14. Dark Skeleton Loading

Brand-colored shimmer for loading states. Uses the project's accent colors at 6% opacity.

### Skeleton Shimmer Animation
```css
@keyframes skeleton-shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.skeleton-dark {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
}

.skeleton-dark::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    hsl(var(--accent-primary) / 0.06),
    hsl(var(--accent-secondary) / 0.06),
    transparent
  );
  animation: skeleton-shimmer 1.8s ease-in-out infinite;
}
```

### Usage Pattern
```html
<!-- Text skeleton -->
<div class="skeleton-dark h-6 w-3/4"></div>
<div class="skeleton-dark h-4 w-full"></div>

<!-- Card skeleton -->
<div class="card rounded-2xl p-7">
  <div class="skeleton-dark h-11 w-11 rounded-xl mb-4"></div>
  <div class="skeleton-dark h-5 w-2/3 mb-3"></div>
  <div class="skeleton-dark h-3 w-full"></div>
  <div class="skeleton-dark h-3 w-4/5"></div>
</div>
```

---

## 15. Dark Form Inputs

Premium form inputs with accent-colored focus glow and brand-colored validation states.

### Focus Glow
```css
.input-dark {
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #ffffff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-dark:focus {
  outline: none;
  border-color: hsl(var(--accent-primary) / 0.4);
  box-shadow:
    0 0 0 3px hsl(var(--accent-primary) / 0.1),
    0 0 20px hsl(var(--accent-primary) / 0.05);
}

/* Labels brighten on focus */
.input-group:focus-within label {
  color: rgba(255, 255, 255, 0.9);
}
```

### Validation States
```css
/* Success — use success/green color */
.input-dark.valid {
  border-color: hsl(var(--success) / 0.4);
  box-shadow: 0 0 0 3px hsl(var(--success) / 0.1);
}

/* Error — use destructive/red color */
.input-dark.error {
  border-color: hsl(var(--destructive) / 0.5);
  box-shadow: 0 0 0 3px hsl(var(--destructive) / 0.1);
}
```

---

## 16. Dashboard Data Visualization

### Grid Lines & Axes
```css
/* Keep grid lines barely visible on dark backgrounds */
.recharts-cartesian-grid line { stroke: rgba(255, 255, 255, 0.06); }
.recharts-cartesian-axis-tick text { fill: rgba(255, 255, 255, 0.4); font-size: 11px; }
```

### Data Series Colors (in priority order)
1. **Secondary accent** — primary metric (high-energy color)
2. **Primary accent** — secondary metric
3. **Tertiary accent** — tertiary metric
4. **Green (#22C55E)** — positive delta

Area fills: Same color at 0.08 opacity. Never solid fills on dark — they overwhelm.

### Stat Cards
```html
<div class="card/40 border border-[border]/30 rounded-xl p-5">
  <p class="text-3xl font-bold text-white">2,847</p>
  <p class="text-sm text-muted mt-1">Total Leads</p>
  <span class="inline-flex px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400">+12.3%</span>
</div>
```

### Chart Tooltips
```css
/* Tooltips float higher than cards — increased shadow depth */
.chart-tooltip {
  background: var(--bg);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
}
```

---

## 17. Toast / Notification System

### Base Toast
```css
.toast-base {
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border-radius: 12px;
}
```

### Differentiation — Colored Left Border
```css
.toast-success { border-left: 3px solid var(--success); }
.toast-error   { border-left: 3px solid var(--destructive); }
.toast-warning { border-left: 3px solid var(--accent-primary); }
.toast-info    { border-left: 3px solid var(--accent-secondary); }
```

Why left-border over icon-background: subtler, doesn't compete with message text, scales to any width. Icon gets matching color but no background fill.

### Toast Animation
```css
@keyframes toast-in {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
@keyframes toast-out {
  from { transform: translateX(0); opacity: 1; }
  to   { transform: translateX(30%); opacity: 0; }
}
/* Quick in (250ms expo), gentle out (200ms ease-in) */
.toast-enter { animation: toast-in 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-exit  { animation: toast-out 0.2s ease-in; }
```

---

## 18. Dark Modal / Dialog System

### Overlay
```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.8);  /* Dark: 80%. Light: 50%. */
  backdrop-filter: blur(4px);       /* Optional — premium depth, costs GPU */
}
```

### Modal Card
```css
.modal-card {
  background: var(--bg);  /* NOT --card — modals need maximum contrast */
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.03),   /* crisp edge */
    0 16px 48px -8px rgba(0, 0, 0, 0.6),   /* deep elevation */
    0 0 80px -20px hsl(var(--accent-secondary) / 0.05);  /* subtle brand atmosphere */
}
```

### Close Button
```html
<button class="opacity-70 hover:opacity-100 hover:bg-white/5 rounded-full p-1 transition-all">
  <X size="18" />
</button>
```

---

## 19. Empty States

### The "Premium Empty" Formula
```
[Ghost icon]  ← 64px, stroke-only, opacity 0.2
"No X yet"    ← text-foreground, text-lg, font-medium
"Description" ← text-muted, text-sm
[ + CTA ]     ← Primary button, default size
```

### Rules
- **Icon:** Lucide outline, 64px, opacity 0.2. Never use illustrations — they date fast and clash with dark UI.
- **Headline:** Short, factual. "No X yet" — not "Oops!" or "Nothing here!"
- **Subtext:** One line. What to do next.
- **CTA:** Standard button. Don't overscale — empty state shouldn't scream.
- **Container:** NO card/border. The emptiness IS the design.
- **Optional atmosphere:** Radial-gradient at 0.03 opacity behind icon to prevent feeling dead.

---

## 20. Micro-Interactions & State Transitions

### Easing Curves
```css
:root {
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);    /* Snappy deceleration — buttons, modals */
  --ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1);      /* Smooth — toggles, tabs */
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);  /* Overshoot — checkboxes, switches */
}
```

### Timing Reference

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Button hover | 150ms | ease-out-expo |
| Button press | 50ms | linear |
| Toggle snap | 200ms | spring |
| Checkbox check | 200ms | spring |
| Card hover | 200ms | ease-out-expo |
| Modal enter | 250ms | ease-out-expo |
| Modal exit | 200ms | ease-in |
| Toast enter | 250ms | ease-out-expo |
| Toast exit | 200ms | ease-in |
| Tab indicator | 250ms | ease-in-out |

### Button States
```css
/* Idle → Hover: 150ms, brightness(1.1) + translateY(-1px) */
/* Hover → Press: 50ms, scale(0.97) + brightness(0.95) */
/* Fast press, slow release — feels physical */
/* Focus: ring-2 ring-[accent]/50 ring-offset-2 ring-offset-background */
```

### Toggle Switches
```css
/* Thumb: 200ms spring ease (overshoot = satisfying "snap") */
/* Track: 150ms ease-in-out */
/* OFF: bg-muted, thumb left. ON: bg-[accent-primary], thumb right */
```

### Checkbox Animation
```css
@keyframes check-in {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
/* animation: check-in 200ms var(--ease-spring); */
```

---

## 21. Quick Reference: Building a New Section

```html
<section
  class="relative py-28 overflow-hidden"
  style="background:
    radial-gradient(600px 500px at 25% 25%, hsl(var(--accent-primary) / 0.10), transparent),
    radial-gradient(500px 400px at 75% 75%, hsl(var(--accent-secondary) / 0.06), transparent)
  "
>
  <!-- Section divider -->
  <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[accent-primary]/40 to-transparent" />

  <div class="max-w-5xl mx-auto px-6 relative">
    <!-- Eyebrow badge -->
    <!-- Headline with text-gradient-headline + shimmer span -->
    <!-- Content -->
    <!-- Cards using the 3-layer glow system -->
  </div>

  <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
</section>
```

---

## 22. CSS Utility Classes Reference

When implementing in a project, define these utility classes in your global CSS. Replace accent colors with your project's brand tokens.

### Card Classes
- `.card-glow` — Primary accent hover glow (3-layer)
- `.card-glow-secondary` — Secondary accent hover glow
- `.card-glow-tertiary` — Tertiary accent hover glow
- `.card-featured` — Permanent primary glow (premium/featured)
- `.quote-card` — Primary accent blockquote card
- `.quote-card-accent` — Tertiary left-border blockquote

### Text Classes
- `.text-gradient-headline` — White → zinc gradient (brand-agnostic)
- `.text-gradient-primary` — Primary accent shimmer
- `.text-gradient-secondary` — Secondary accent shimmer
- `.text-gradient-full` — Full spectrum (secondary → tertiary → primary)
- `.text-glow-primary` — Primary accent text-shadow
- `.text-glow-secondary` — Secondary accent text-shadow

### Animation Classes
- `.animate-shimmer` — Background position slide (3s)
- `.animate-float` — Gentle up/down (3s)
- `.animate-breathe` — Opacity pulse (4s)
- `.animate-pulse-glow` — Primary accent box-shadow pulse (2s)
- `.animate-check` — Checkbox check animation (200ms spring)

### Page Textures
- `.page-noise` — Fixed noise overlay (single instance per page)
- `.page-dots` — Fixed dot grid with radial mask

### Skeleton Loading
- `.skeleton-dark` — Brand-colored accent shimmer (6% opacity)

### Form Inputs
- `.input-dark` — Dark input with accent focus glow
- `.input-dark.valid` — Success glow for valid state
- `.input-dark.error` — Error glow for error state
- `.textarea-dark` — Dark textarea with accent focus glow
- `.input-group` — Wrapper; labels brighten on focus-within

### Hero Media Blending
- `.hero-media-bottom-fade` — Bottom 40% gradient fade into background
- `.hero-media-vignette` — Radial vignette, edges dissolve to background
- `.hero-media-side-fade` — Left/right fade for side-placed media

### Toast / Notifications
- `.toast-base` — Dark toast card with elevated shadow
- `.toast-success` — Success left-border
- `.toast-error` — Error left-border
- `.toast-warning` — Primary accent left-border
- `.toast-info` — Secondary accent left-border
- `.toast-enter` / `.toast-exit` — Slide-in/out animations

### Performance
- `.section-lazy` — content-visibility: auto for off-screen rendering skip
