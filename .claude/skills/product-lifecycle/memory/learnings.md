# Product Lifecycle (B.L.A.S.T.) - Learnings

> **Purpose:** Lessons learned during gated product builds. Read this BEFORE starting a new B.L.A.S.T. process.

---

## Logged Learnings

### BLUEPRINT Phase: Ask "Will Team Members Use This?"
**What happened:** Built an entire feature scoped to individual users. Later, when team/org support was needed, had to rewrite database schema, RLS policies, and API routes.
**Root cause:** BLUEPRINT phase didn't ask about multi-tenancy requirements.
**Fix:** Added "Will team members need to see this data?" to BLUEPRINT discovery questions.
**Prevention:** Always ask about team/org scope during BLUEPRINT. If the answer is "maybe someday", add `org_id` now. It's cheap to add upfront, expensive to retrofit.

### BLUEPRINT Phase: Check for Existing Patterns First
**What happened:** Built a custom data fetching pattern from scratch, then discovered the codebase already had a caching hook that did the same thing better.
**Root cause:** Jumped into building without searching for existing utilities and patterns.
**Fix:** Before writing any new hook, component, or utility, search the codebase for similar patterns.
**Prevention:** Add a mandatory step to BLUEPRINT: "Search for existing patterns that solve part of this problem."

### LINK Phase: Test Connections Before Moving On
**What happened:** Created database tables and moved straight to ARCHITECT. Discovered during STYLIZE that RLS policies were blocking inserts. Had to go back two phases.
**Root cause:** Didn't actually TEST the database connection and all 4 CRUD operations before proceeding.
**Fix:** LINK phase now requires a manual test of SELECT, INSERT, UPDATE, DELETE through the API before moving to ARCHITECT.
**Prevention:** Never mark LINK as complete until you've verified all operations work end-to-end (not just "tables created").

### ARCHITECT Phase: Trace the Complete Data Flow
**What happened:** Fixed a bug on the surface (component level) but the real issue was 3 layers deeper (API route was bypassing the proper data path).
**Root cause:** Fixed the symptom, not the root cause. Didn't trace the full data flow.
**Fix:** Before fixing ANY bug, trace the complete path: Component > Hook > API > Database > Response > State > Render.
**Prevention:** Never stop at the first fix. Always trace the complete data flow before declaring victory.

### ARCHITECT Phase: Side Effects Belong in API Routes
**What happened:** Put activity logging in a React component. It fired twice in dev mode (React Strict Mode), created duplicate entries, and missed server-side triggers entirely.
**Root cause:** Side effects (logging, notifications, emails) were in client code instead of API routes.
**Fix:** Moved all side effects to the API route. Client just calls the API, API handles all consequences.
**Prevention:** If a mutation has side effects (logging, sending emails, updating related records), it MUST go through an API route. Never trigger side effects from client components.

### STYLIZE Phase: Test Mobile FIRST
**What happened:** Built a beautiful desktop UI, then discovered it was completely broken on mobile. Spent more time fixing responsive issues than the original build.
**Root cause:** Designed for desktop, tested on desktop, then tried to make it responsive after the fact.
**Fix:** Start with mobile layout, then expand for desktop. Tailwind's mobile-first approach (`sm:`, `md:`, `lg:`) makes this natural.
**Prevention:** After creating any component, immediately check it at 375px width before moving on.

### TRIGGER Phase: Don't Skip verify.sh
**What happened:** Deployed with TypeScript errors that were hidden during development because `npm run dev` is more permissive than `npm run build`.
**Root cause:** Skipped `./verify.sh` because "it looked fine in the browser."
**Fix:** `./verify.sh` catches type errors, lint issues, and build failures that dev mode hides.
**Prevention:** NEVER mark TRIGGER as complete without a green `./verify.sh`. No exceptions.

### General: Retry Limits on Everything
**What happened:** A function that retried on failure had no retry limit. When the upstream service was down, it created an infinite loop that crashed the browser tab.
**Root cause:** Recursive error handler called itself without a counter.
**Fix:** Added `MAX_RETRIES = 3` parameter. After max retries, fail gracefully with an error message.
**Prevention:** Every retry loop, recursive function, or polling mechanism needs a maximum attempt count. Default to 3.
