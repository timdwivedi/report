# Performance Optimizer - Learnings

> **Purpose:** Battle-tested lessons from real production performance audits. Read this BEFORE executing any performance optimization.
> **Source:** Accumulated from auditing production Next.js + Supabase SaaS applications.

---

## Logged Learnings

### 1. API Routes Are Waterfall Factories
**What happened:** Every API route used sequential `await` for independent database queries. A route fetching user settings + daily counts took 400ms instead of 200ms.
**Root cause:** Default coding pattern is `const a = await X; const b = await Y;` which is sequential even when X and Y don't depend on each other.
**Fix:** `Promise.all([X, Y])` for independent queries. Keep sequential only when B depends on A's result.
**Prevention:** Before writing a second `await` in any function, ask: "Does this depend on the previous result?" If no, use `Promise.all`.

### 2. Server Layouts Have Hidden Waterfalls Too
**What happened:** Dashboard layout made 4 sequential DB calls: getUser → getProfile → getOrg → getMembership. Profile and org fetches are independent but ran one after another.
**Root cause:** Copy-paste from examples that show sequential patterns. Nobody thinks to parallelize server component code.
**Fix:** `Promise.all([getUserProfile(id), getOrgBySlug(slug)])` for the independent pair. Used `React.cache()` to deduplicate `getUser()` across layout + page.
**Prevention:** Every server layout/page should have its queries analyzed for independence. Profile fetch and org fetch are almost always independent.

### 3. Modals Are the #1 Bundle Bloat Source
**What happened:** 13+ modal components (each 200-500 lines) were statically imported on pages where they're only shown on button click. Initial JS bundle was unnecessarily large.
**Root cause:** `import MyModal from "./MyModal"` loads the entire modal JS on page load even though the user may never open it.
**Fix:** `const MyModal = dynamic(() => import("./MyModal"), { ssr: false, loading: () => null })` for every modal.
**Prevention:** **Rule: Every modal, dialog, and drawer MUST use `next/dynamic` with `ssr: false`.** No exceptions. Modals are never visible on first paint.

### 4. Named Exports Block Dynamic Import Savings
**What happened:** Tried to dynamically import `RanksInfoModal` (default export) from a file that also had `RanksInfoButton` (named export). The named export was statically imported elsewhere, loading the entire module anyway.
**Root cause:** If ANY export from a module is statically imported, the whole module loads. Dynamic importing the default export saves nothing.
**Fix:** Skipped this file. For future: put the small always-visible component in its own file, separate from the heavy modal.
**Prevention:** Never mix small always-rendered components with heavy modals in the same file. One file = one purpose.

### 5. Ten .filter() Calls Is a Common Anti-Pattern
**What happened:** Leads page computed stage counts by calling `.filter()` 10 separate times on the same 1000-item array. That's 10,000 iterations per render.
**Root cause:** It's the "obvious" way to write it: `cold: leads.filter(l => l.stage === "cold").length`. Clean code, terrible performance.
**Fix:** Single-pass `useMemo` with a for-loop that increments counters in one object. 10,000 iterations → 1,000.
**Prevention:** **Rule: If you call `.filter()` more than twice on the same array, replace with a single-pass loop.** Wrap in `useMemo` with the array as dependency.

### 6. Pipeline Pages Re-filter on Every Render
**What happened:** Pipeline/kanban page filtered leads by stage inside each column's `.map()` callback. With 8 stages, that's 8 full array scans per render.
**Root cause:** `STAGES.map(stage => { const stageLeads = leads.filter(l => l.stage === stage.id) })` -- reads clean but iterates leads 8 times.
**Fix:** Precomputed `leadsByStage` object in a single `useMemo` pass. Columns read from the precomputed map.
**Prevention:** **Rule: Never filter inside `.map()`.** Precompute groupings with `useMemo`, then look up by key.

### 7. Sorting Creates New Arrays Every Render
**What happened:** `[...items].sort(...)` creates a new array on every render even when items haven't changed. Combined with a `.filter()` chain, each render produced 3 new arrays.
**Root cause:** `.sort()` mutates in place, so devs use `[...items].sort()` to avoid mutation. But without `useMemo`, this runs on every render.
**Fix:** Wrap the entire filter → sort → paginate chain in `useMemo` with appropriate dependencies.
**Prevention:** Any `.sort()`, `.filter()`, or `.slice()` in a component body should be inside `useMemo`.

### 8. Default Prop Values Are Silent Re-render Triggers
**What happened:** `function Component({ items = [] })` creates a new empty array reference on every render when `items` is undefined. This defeats `React.memo` and `useMemo` downstream.
**Root cause:** JavaScript destructuring defaults create new values on each call. `[] !== []` in reference equality.
**Fix:** Hoist defaults to module level: `const EMPTY_ITEMS: Item[] = []; function Component({ items = EMPTY_ITEMS })`.
**Prevention:** **Rule: Never use `= []` or `= {}` in function parameter destructuring.** Always hoist to a module-level constant.

### 9. Regex in Functions Recompiles Every Call
**What happened:** Device detection utility compiled 3 regex patterns inside the function body. Called on every request.
**Root cause:** `const regex = /pattern/i` inside a function body creates a new RegExp object each call. V8 may optimize this but it's wasteful.
**Fix:** Moved all regex patterns to module-level constants (`const MOBILE_REGEX = /pattern/i`).
**Prevention:** Any regex that doesn't change should be a module-level constant.

### 10. new Audio() on Every Play Leaks Memory
**What happened:** Sound effect in swipe UI created `new Audio(url)` on every play. Each creates a new DOM element.
**Root cause:** Quick-and-dirty pattern: `const audio = new Audio(src); audio.play()`. Works but never cleans up.
**Fix:** `useRef<HTMLAudioElement>` to create once, reset `currentTime = 0` and replay.
**Prevention:** **Rule: Audio, Video, and WebSocket objects should always be stored in a `useRef` and reused.** Never create inside event handlers.

### 11. SWR Is Installed But Nobody Uses It
**What happened:** SWR was in package.json (v2.3.8) but zero components used it. Every component hand-rolled `useState + useEffect + fetch`.
**Root cause:** Initial development prioritized shipping features. Nobody went back to consolidate data fetching.
**Fix:** Converted polling components (BroadcastToasts: 30s interval, NotificationBell: lazy fetch) to SWR. Removed manual setInterval, useState for loading, useEffect for fetch.
**Prevention:** **Rule: If you install a data-fetching library, use it from day one.** Every new component that fetches from an API route should use SWR. Manual fetch patterns should be code-reviewed and flagged.

### 12. "use client" on Every Page Kills SSR Benefits
**What happened:** 54 out of 60 pages had `"use client"` at the top, making the entire app essentially a client-rendered SPA. Zero benefit from Next.js server rendering.
**Root cause:** Pages need hooks (`useAuth`, `useOrganization`, `useSettings`), so developers add `"use client"`. Once that's there, everything in the file is client-rendered.
**Fix:** For this audit, we couldn't safely convert pages because they're deeply coupled to 5+ client providers. We DID optimize the server layouts (which were already RSC) with `React.cache` and `Promise.all`.
**Prevention:** **Rule: Design provider architecture BEFORE building pages.** Server components should fetch data and pass it as props to client components. Don't wrap everything in `"use client"` -- split into a server page wrapper + client interactive section.

### 13. React.cache Needs Server Components to Work
**What happened:** Created `React.cache()` wrappers for common queries but could only use them in 2 layout files (the only server components in the app).
**Root cause:** `React.cache()` only deduplicates within a single server request. Client components can't use it.
**Fix:** Applied to the dashboard and mobile layouts where it deduplicates `getUser()` and `getUserProfile()` calls.
**Prevention:** Plan your server/client boundary early. `React.cache()` is extremely powerful but only in server components. The more server components you have, the more deduplication you get.

### 14. Provider Lazy-Loading Is Too Risky for Existing Apps
**What happened:** Plan called for lazy-loading NotificationProvider and ToastProvider. Assessed as too risky because any child component reading context before the provider loads would crash.
**Root cause:** Context providers are synchronous -- components expect context to be available immediately on mount.
**Fix:** Skipped. For existing apps, provider optimization should be context splitting (separate frequently-changing values) rather than lazy-loading.
**Prevention:** **Rule: Never lazy-load context providers in existing apps.** For new apps, design providers to be as small as possible. Split "auth state" from "user preferences" from "UI state".

### 15. content-visibility CSS Is Free Performance
**What happened:** Long list of lead rows rendered 50+ DOM elements even when off-screen.
**Root cause:** Browser calculates layout and paint for all DOM elements by default.
**Fix:** Added `.virtual-list-item { content-visibility: auto; contain-intrinsic-size: auto 80px; }` CSS class to list item wrappers.
**Prevention:** **Rule: Any list that can exceed 20 items should have `content-visibility: auto` on its item wrapper.** It's a CSS-only change with zero risk.

### 16. Promise.all Must Preserve Error Checking
**What happened:** When parallelizing two operations with `Promise.all`, the original code checked `if (result.error)` after each. The parallel version needed to destructure results and check each individually.
**Root cause:** `Promise.all` returns an array of results. If you forget to check individual results, errors are silently swallowed.
**Fix:** `const [resultA, resultB] = await Promise.all([...])` then check `resultA.error` and `resultB.error` individually.
**Prevention:** **Rule: After every `Promise.all`, destructure results and preserve the original error checks.** Never assume both succeeded.

### 17. Batch Inserts Replace Loop-Based Inserts
**What happened:** API route inserted thread usage records one at a time in a `for` loop. 10 records = 10 round trips to Supabase.
**Root cause:** Easiest pattern: `for (const item of items) { await supabase.from("table").insert(item) }`.
**Fix:** `supabase.from("table").insert(items.map(item => ({ ... })))` -- single batch insert.
**Prevention:** **Rule: Never `await` inside a loop for INSERT operations.** Always batch: `.insert(array)`. Supabase supports batch inserts natively.

### 18. Performance Changes Never Affect RLS
**What happened:** User asked "will this break RLS?" after performance optimizations.
**Root cause:** Reasonable concern -- any change touching database queries could theoretically affect security.
**Fix:** Confirmed: `Promise.all` sends the same queries with the same auth tokens. `useMemo` is client-only. Dynamic imports don't touch the database. SWR calls the same API endpoints.
**Prevention:** **Rule: Performance optimizations should NEVER change which Supabase client is used, which auth token is passed, or which columns are queried.** If a performance change requires changing any of these, it's no longer a performance change -- it's a refactor.

---

## Quick Reference: When to Use What

| Pattern | When | Risk |
|---------|------|------|
| `Promise.all` | 2+ independent async operations | Very Low |
| `next/dynamic` | Any modal, drawer, dialog, chart library | Very Low |
| `useMemo` | `.filter()`, `.sort()`, `.map()` chains in render | Very Low |
| `React.cache` | Server component shared queries | Low |
| `useRef` for objects | Audio, Video, WebSocket, Intersection Observer | Very Low |
| `content-visibility` | Lists with 20+ items | Zero |
| SWR | Polling patterns, lazy-loaded data panels | Low-Medium |
| RSC conversion | Pages with minimal client interactivity | Medium-High |
| Provider lazy-loading | Only for new apps, never existing | High |
