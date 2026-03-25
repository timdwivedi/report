# Agent 3 (Shell) — Accumulated Learnings

> **Read this file BEFORE starting work.** These lessons are extracted from past builds to prevent recurring mistakes.

## FAST PATH
1. Read `docs/CREATIVE_BRIEF.md` — dashboard interactivity directives, toast message content
2. Create `dashboard/layout.tsx` FIRST — all pages depend on it
3. Also read `.claude/skills/vercel-react-best-practices/SKILL.md` — client/server boundary rules are critical for layouts

---

## Dashboard Layout
- Sidebar width: 256px expanded, 64px collapsed. Use `w-64` / `w-16` — not custom pixel values
- Sidebar must use `usePathname()` from `next/navigation` for active link detection
- Mobile: sidebar overlays with backdrop blur, closes on route change
- Main content area: `p-6` padding, `overflow-y-auto` for scrolling
- Top bar: fixed 64px height, `z-40`, shows page title dynamically

## Auth Pages
- Social login buttons (Google, GitHub) MUST look real even if non-functional
- Use `onClick={() => alert('Coming soon')}` for non-functional buttons — NOT empty onClick
- Login and signup must have IDENTICAL styling/layout — different form fields, same card design
- Always include: "Forgot password?" on login, "Already have an account?" on signup
- Password fields need show/hide toggle

## Shared Components
- StatCard: always accepts `trend` prop for up/down percentage indicators
- EmptyState: always includes icon + title + description + optional CTA button
- PageHeader: must support optional `action` button (usually "Add New" or "Export")
- All shared components must have `"use client"` if they use any interactivity

## Theme Mode Awareness (CRITICAL — Check Spec FIRST)
- **Read the Creative Brief's Design Intelligence section** BEFORE setting theme defaults
- `next-themes` defaultTheme in root layout MUST match the spec: `"light"` for light-mode apps, `"dark"` for dark-mode apps
- When the spec says light mode, do NOT apply dark-mode Tailwind variants (dark:bg-*, dark:border-*, dark:text-*) to shared components like DemoToastProvider, DemoNotifications, ClickReveal, LoadingSequence, ActionButton
- These shared components are used across ALL pages — dark-mode contamination on them breaks the entire app's visual consistency

### From Build: MT Promo B2B Merchandise Platform (2026-02-16)
Agent 3 set `defaultTheme="dark"` on a light-mode app. Also applied dark Tailwind classes to 5 shared components (ClickReveal, DemoToastProvider, DemoNotifications, LoadingSequence, ActionButton). Agent 6 had to convert ALL of them to slate/neutral equivalents. Cost: ~15 minutes of Agent 6's limited context window. Fix: Always check the Creative Brief design direction before touching any theme setting.

## Common Mistakes
- **CRITICAL: Double DashboardLayout nesting** — If `dashboard/layout.tsx` wraps children in `<DashboardLayout>`, then individual page files (page.tsx) must NOT also wrap in `<DashboardLayout>`. This causes double sidebar, double header, squished content. The layout.tsx handles the shell — pages just return their content.
- Forgetting `"use client"` on components that use `useState`, `useEffect`, or event handlers
- Importing from `@/components/providers/AuthProvider` without checking if it exists in scaffold
- Creating CSS modules or styled-components instead of using Tailwind-only
- Installing packages that aren't in package.json — DO NOT modify package.json

### From Build: Rocksolideleadgeneration OÜ (2026-02-12)
Layout wrapper files (dashboard/layout.tsx, mirror/layout.tsx) are critical path. Create these FIRST before shared components — all child pages depend on them.

## Creative Brief & Interactive Dashboard Components (MANDATORY)
- **Read `docs/CREATIVE_BRIEF.md` BEFORE starting work** — Agent 2.5 (Creative Director) creates this with interactive directives for the dashboard shell
- Follow the Creative Brief's directives for toast messages, notifications, and dashboard interactivity exactly

### Dashboard Layout Must Include These (from `@/components/shared`):

**`DemoToastProvider`** — Wrap the dashboard layout to show periodic mock activity toasts
```tsx
import { DemoToastProvider } from '@/components/shared'

export default function DashboardLayout({ children }) {
  return (
    <DemoToastProvider messages={[
      { type: 'lead', text: 'New lead captured: Sarah M.' },
      { type: 'action', text: 'Pipeline updated — 3 deals moved' },
      { type: 'metric', text: 'Conversion rate up 2.3% this week' },
    ]}>
      <div className="flex h-screen">
        <Sidebar />
        <main>{children}</main>
      </div>
    </DemoToastProvider>
  )
}
```
- Customize `messages` based on the app's domain (from the Creative Brief or spec)
- Types: 'lead' (green), 'action' (blue), 'metric' (amber), 'sync' (purple), 'alert' (red)

**`DemoNotifications`** — Add to the dashboard top bar (notification bell with badge + dropdown)
```tsx
import { DemoNotifications } from '@/components/shared'

// In the top bar, next to user avatar
<DemoNotifications notifications={[
  { id: '1', title: 'New signup', message: 'John D. created an account', time: '2 min ago' },
  { id: '2', title: 'Task completed', message: 'Report generation finished', time: '15 min ago' },
]} />
```
- Customize notification content to match the app's domain

### From Build: EliteFlame Coaching (2026-02-17)
**DemoToastProvider and DemoNotifications used generic CRM messages** — Agent 3 used default messages like "New lead captured" and "Pipeline updated" instead of domain-specific coaching messages. Agent 6 had to replace all messages with Romanian client names, kg weights, and coaching terminology. **ALWAYS read the Creative Brief's `§DemoToastProvider` and `§DemoNotifications` sections and use the EXACT messages specified there.** Generic messages make the demo feel fake.

**Used `dark-*` color classes not defined in Tailwind config** — Agent 3 used `dark-bg`, `dark-border`, `dark-text` classes that didn't exist in `tailwind.config.ts`. These silently fail (no error, just broken styling). **Before using ANY color class, verify it exists in the Tailwind config.** Use standard Tailwind colors (e.g., `slate-900`, `slate-800`) or add the missing tokens to the config.

## Cross-Build Learnings (auto-pulled from Supabase)
> These were extracted from past builds. Apply them proactively.

- **[pattern]** Providing exact component specs with props, colors, and behaviors produces reusable components → _Prevention: Continue detailed component specifications in project specs_ _(source: Rocksolideleadgeneration OÜ)_
- **[error]** Layout files are critical path — if missing, ALL child pages break at build time → _Prevention: Create layout files FIRST before shared components; or pre-generate in scaffold_ _(source: Rocksolideleadgeneration OÜ)_
