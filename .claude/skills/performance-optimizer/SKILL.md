# Performance Optimizer

Systematic performance audit and optimization for Next.js + React + Supabase applications.

## Trigger Phrases
- "optimize performance"
- "performance audit"
- "make it faster"
- "speed up the app"
- `/perf`

---

## Pre-Flight

**MUST READ before executing:**
1. This file (workflow)
2. `memory/learnings.md` (lessons from past audits)
3. `vercel-react-best-practices` skill (57-rule reference)

---

## The Performance Audit Flow

```
1. Scan       → Automated codebase audit (8 categories)
2. Score      → Rate each category 1-10
3. Plan       → Prioritized fix list (impact vs risk)
4. Fix        → Phase-by-phase implementation
5. Verify     → ./verify.sh after EVERY phase
6. Document   → Update learnings.md with new findings
```

---

## Step 1: Automated Scan (8 Categories)

Run these scans in parallel using Explore agents:

### Scan A: Waterfall Detection
```bash
# Find sequential awaits in API routes
grep -rn "await.*await" web/app/api/ --include="*.ts"

# Find independent fetches that could be parallelized
# Look for: const a = await X; const b = await Y; where b doesn't use a
```

### Scan B: Bundle Size
```bash
# Count dynamic imports
grep -rn "next/dynamic\|React.lazy" web/ --include="*.tsx" | wc -l

# Find heavy static imports (modals, charts, editors)
grep -rn "import.*Modal\|import.*Chart\|import.*Editor" web/ --include="*.tsx"

# Find framer-motion static imports
grep -rn "from.*framer-motion" web/ --include="*.tsx"
```

### Scan C: Server vs Client
```bash
# Count "use client" pages
grep -rn '"use client"' web/app/ --include="page.tsx" | wc -l

# Count total pages
find web/app -name "page.tsx" | wc -l

# Find React.cache usage
grep -rn "React.cache\|import { cache }" web/ --include="*.ts" --include="*.tsx" | wc -l
```

### Scan D: Re-render Optimization
```bash
# Find React.memo usage
grep -rn "React.memo\|memo(" web/ --include="*.tsx" | wc -l

# Find useMemo usage
grep -rn "useMemo" web/ --include="*.tsx" | wc -l

# Find useCallback usage
grep -rn "useCallback" web/ --include="*.tsx" | wc -l
```

### Scan E: Data Fetching Patterns
```bash
# Find manual useState+useEffect+fetch patterns
grep -rn "useEffect.*fetch\|useEffect.*supabase" web/ --include="*.tsx" | wc -l

# Find SWR usage
grep -rn "useSWR\|import.*swr" web/ --include="*.tsx" | wc -l
```

### Scan F: List Rendering
```bash
# Find .filter().map() chains (potential useMemo candidates)
grep -rn "\.filter.*\.map\|\.sort.*\.map" web/ --include="*.tsx"

# Find lists without keys or with index keys
grep -rn "key={i}\|key={index}" web/ --include="*.tsx"
```

### Scan G: Default Props
```bash
# Find destructured default arrays/objects (new reference each render)
grep -rn "= \[\]\|= {}" web/components/ --include="*.tsx"
```

### Scan H: API Route Efficiency
```bash
# Find loop-based inserts (should be batch)
grep -rn "for.*await.*insert\|forEach.*await.*insert" web/app/api/ --include="*.ts"
```

---

## Step 2: Score Each Category

| Category | What to Check | Score Range |
|----------|--------------|-------------|
| Waterfall Elimination | Promise.all usage, Suspense boundaries | 1-10 |
| Bundle Size | Dynamic imports, code splitting | 1-10 |
| Server-Side Performance | RSC pages, React.cache, streaming | 1-10 |
| Client Data Fetching | SWR/cache usage, deduplication | 1-10 |
| Re-render Optimization | React.memo, useMemo, useCallback | 1-10 |
| Rendering Performance | List virtualization, content-visibility | 1-10 |
| JavaScript Performance | Hoisted constants, object reuse | 1-10 |
| Provider Efficiency | Context splitting, lazy providers | 1-10 |

---

## Step 3: Prioritized Fix Plan

**Order fixes by: Impact / Risk**

| Priority | Fix Type | Risk | Impact |
|----------|----------|------|--------|
| 1 | API route Promise.all | VERY LOW | HIGH |
| 2 | Dynamic imports for modals | LOW | HIGH |
| 3 | useMemo for filter/sort chains | LOW | HIGH |
| 4 | React.cache for server queries | LOW | MEDIUM |
| 5 | Layout waterfall parallelization | LOW | MEDIUM |
| 6 | SWR for polling/fetch patterns | MEDIUM | MEDIUM |
| 7 | Micro-optimizations (regex, audio, CSS) | VERY LOW | LOW |
| 8 | RSC page conversion | HIGH | HIGH |
| 9 | Provider lazy-loading | MEDIUM | MEDIUM |

**ALWAYS start with lowest risk. NEVER combine risky changes.**

---

## Step 4: Implementation Rules

### Golden Rules
1. **NEVER change functionality.** Performance changes only.
2. **Run verify.sh after EVERY phase.** Not after every file -- after every phase.
3. **One category per phase.** Don't mix Promise.all fixes with dynamic imports.
4. **Read the file before editing.** Never assume import structure.
5. **Preserve auth patterns.** Dual auth (cookie + header) must stay intact.
6. **Preserve error handling.** Promise.all must check individual results.
7. **Preserve RLS.** Never change which Supabase client is used.

### Promise.all Pattern
```typescript
// ONLY parallelize INDEPENDENT operations
// If B depends on A's result, keep them sequential

// GOOD: Independent queries
const [profile, org] = await Promise.all([
    getProfile(userId),
    getOrg(slug),
]);

// BAD: B depends on A
const [user, profile] = await Promise.all([
    getUser(),
    getProfile(user.id), // user doesn't exist yet!
]);
```

### Dynamic Import Pattern
```typescript
import dynamic from "next/dynamic";

// For modals (not visible on initial load)
const MyModal = dynamic(() => import("./MyModal"), {
    ssr: false,
    loading: () => null,
});

// NEVER dynamic import:
// - Components visible on first paint
// - Context providers
// - Components with named exports used elsewhere
```

### useMemo Pattern
```typescript
// GOOD: Expensive computation with clear dependencies
const filtered = useMemo(() =>
    items.filter(i => i.active).sort((a, b) => b.score - a.score),
    [items]
);

// GOOD: Single-pass counting (replace multiple .filter() calls)
const counts = useMemo(() => {
    const c = { active: 0, archived: 0 };
    for (const item of items) {
        if (item.archived) c.archived++;
        else c.active++;
    }
    return c;
}, [items]);

// BAD: Trivial computation
const doubled = useMemo(() => count * 2, [count]);
```

### React.cache Pattern
```typescript
// web/lib/server/cached-queries.ts
import { cache } from "react";

// Deduplicates within a single server request
export const getCurrentUser = cache(async () => {
    const supabase = createServerAuthClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
});
```

---

## Step 5: Verification Checklist

After EACH phase:
```bash
./verify.sh  # Must pass

# Manual verification:
# - Auth flow still works (login, logout, session)
# - Extension dual auth still works (Authorization header)
# - Stripe/billing routes unchanged
# - RLS not affected (same clients, same queries)
# - No new console errors in browser
```

---

## Step 6: Update Learnings

After completing an audit, add new findings to `memory/learnings.md` using this format:

```markdown
### [Short Title]
**What happened:** [Observable symptom]
**Root cause:** [Technical reason]
**Fix:** [What was changed]
**Prevention:** [Rule for new code]
```

---

## What NOT to Optimize

1. **Admin-only pages** - Low traffic, not worth the risk
2. **Auth pages** - Simple, rarely visited, high risk if broken
3. **Pages deeply coupled to 5+ providers** - RSC conversion too risky
4. **Working polling patterns** - Only convert to SWR if clearly beneficial
5. **Content behind feature flags** - May be removed anyway
