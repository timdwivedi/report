# Post-Build Squad — Battle Log

> **READ THIS BEFORE EVERY PIPELINE RUN.**
> This file is the squad's collective memory. Every build makes us sharper.
> Updated after each round. Learnings compound across ALL projects.

---

## How This File Works

This file lives in the Bloom SCAFFOLD — meaning every new project starts with these learnings baked in. When you (The Operator) run the post-build pipeline on a new client project, you bring all previous battle scars with you.

**After every pipeline run:**
1. The Overseer Loop (Phase 7) reads this file
2. Checks if new cross-phase issues were found
3. Adds new entries using the format below
4. These learnings prevent the same mistakes on the NEXT build

**Format for new entries:**
```markdown
### {Date} — {Project Name} — Round {N}
- **Issue:** What broke and why
- **Fix:** What was done to fix it
- **Prevention:** What to check in future builds to prevent this
- **Phase:** Which phase caused it / which phase caught it
```

---

## Cross-Phase Issues (Known Traps)

*Newest first. These are confirmed patterns that repeat across projects.*

### Trap: "use client" Quote Style — Single vs Double Quotes
- **Frequency:** Every project. 15 files affected in Rock Solid build.
- **Cause:** Agents write `'use client'` (single quotes) but `verify.sh` requires `"use client"` (double quotes). The directive works either way in Next.js, but the verification script uses `grep -q '"use client"'` — only matching double quotes.
- **Fix:** Batch replace all `'use client'` with `"use client"` across affected files.
- **Prevention:** ALL agent phases must use double-quoted directives: `"use client"`. Add this to the first line of every component file. This is non-negotiable.
- **Phase:** Tailor/Mechanic cause it, Inspector or verify.sh catches it

### Trap: "use client" Missing on Hook Components
- **Frequency:** Every single project. Every round. No exceptions.
- **Cause:** Tailor creates components with `useState`/`useEffect` but forgets the directive
- **Fix:** Inspector adds `"use client"` at top of file
- **Prevention:** Tailor's self-annealing build check should catch this. Inspector should STILL verify. Double-check is mandatory.
- **Phase:** Tailor causes it, Inspector catches it

### Trap: Import Path Mismatch Between Mechanic and Tailor
- **Frequency:** ~70% of builds
- **Cause:** Mechanic creates file at `web/lib/ai/conversation-manager.ts`, Tailor imports from `@/lib/ai/session-manager`
- **Fix:** Inspector renames import to match actual file path
- **Prevention:** Mechanic should document exact file paths in the master plan. Tailor should READ `web/lib/` directory before importing.
- **Phase:** Mechanic creates the structure, Tailor guesses wrong, Inspector fixes

### Trap: Dead Code Built But Never Wired
- **Frequency:** ~60% of builds (confirmed in Rock Solid)
- **Cause:** Mechanic creates sophisticated modules (conversation manager, pattern detector, scoring engine) but Tailor/API routes use simpler inline logic instead. The smart code exists but is never imported or called.
- **Example:** Rock Solid built `conversation-manager.ts` (166 lines, 6-phase state machine) and `pattern-detector.ts` (135 lines, fuzzy scoring) — neither was wired into the API route, which used simpler inline phase logic.
- **Fix:** Inspector must verify that EVERY file in `web/lib/ai/` is actually imported somewhere. Dead modules = wasted effort + confused maintainers.
- **Prevention:** Mechanic should write the import statements into the API route IMMEDIATELY after creating the module. Don't leave wiring for later. Build the connection, not just the component.
- **Phase:** Mechanic causes it (builds standalone), Inspector should catch it (verify imports exist)

### Trap: localStorage State Management Without DB Persistence
- **Frequency:** ~80% of scaffold builds
- **Cause:** Tailor stores user progress, session data, form values in `localStorage` for zero-friction UX. But nothing persists to Supabase. Browser close = data gone. No server-side awareness of what happened.
- **Example:** Rock Solid stored `neo_user_name`, `neo_user_email`, `neo_session_result` in localStorage. If user completed diagnostic and closed browser, the entire session was lost forever.
- **Fix:** Post-build round must create proper API endpoints: start-session (DB record), save-progress, complete-session. Replace localStorage.setItem with API calls.
- **Prevention:** Mechanic should create lifecycle API endpoints in the FIRST round, not defer them. Start, save, complete — minimum 3 endpoints for any user flow. localStorage is acceptable as a CACHE alongside DB writes, not as the primary store.
- **Phase:** Architecture gap in Phase 2 (Architect should flag), Mechanic should build endpoints, Tailor should wire them

### Trap: Stub API Routes (501 Placeholders) Never Getting Built
- **Frequency:** ~50% of scaffold builds
- **Cause:** Build agents create route files with `return NextResponse.json({ error: "Not implemented" }, { status: 501 })` as placeholders. Post-build rounds often skip these because they "technically exist." 3 of 4 NEO API routes were 501 stubs in Rock Solid.
- **Fix:** Inspector must grep for `501` in all route.ts files. Any 501 stub is a gap, not a feature.
- **Prevention:** Surgeon's extraction should flag every 501 stub found in existing code. Architect's plan should explicitly list which stubs need implementation this round.
- **Phase:** Build agents create stubs, Surgeon should flag them, Mechanic should implement them

### Trap: Tailwind Dynamic Class Interpolation (Law 13)
- **Frequency:** ~50% of builds
- **Cause:** Tailor writes `className={\`bg-${color}-500\`}` — Tailwind JIT can't resolve dynamic classes
- **Fix:** Replace with class map: `const classes = { sky: 'bg-sky-500' }; className={classes[color]}`
- **Prevention:** Tailor self-annealing should grep for template literals in className props
- **Phase:** Tailor causes it, Inspector or build error catches it

### Trap: Inline Mock Arrays Instead of Demo Imports
- **Frequency:** ~60% of builds
- **Cause:** Tailor hardcodes mock data instead of importing from `@/lib/demo/`
- **Fix:** Move data to demo provider, import from `@/lib/demo/`
- **Prevention:** Tailor should ALWAYS check `@/lib/demo/` for existing data before creating new arrays
- **Phase:** Tailor causes it, Inspector catches it

### Trap: API Routes Missing Dual Auth (Law 1)
- **Frequency:** ~40% of builds
- **Cause:** Mechanic creates API route with only cookie auth, forgetting the Authorization header check
- **Fix:** Add `const authHeader = request.headers.get("Authorization");` pattern
- **Prevention:** Mechanic self-annealing should grep all route.ts files for the dual auth pattern
- **Phase:** Mechanic causes it, Inspector catches it

### Trap: Migration File Number Collision
- **Frequency:** ~20% of builds (round 2+ only)
- **Cause:** Plumber doesn't scan existing migrations before numbering new ones
- **Fix:** Rename migration files to correct sequential numbers
- **Prevention:** Plumber MUST Glob `web/supabase/migrations/*.sql` and find highest number BEFORE writing. Never guess.
- **Phase:** Plumber causes it, Inspector catches it

### Trap: Dead CTA Links (href="#")
- **Frequency:** ~40% of builds
- **Cause:** Tailor creates CTA buttons ("Book Your Session", "Join Community", "Start Free Trial") with `href="#"` as placeholder. These are the REVENUE ENDPOINTS of the product — the highest-intent moment in the entire funnel — and they go nowhere.
- **Example:** Rock Solid next-step page had "Book Your Session ($3,500)" and "Join the Community ($39/mo)" both pointing to `href="#"`. The diagnostic created urgency, then the conversion endpoint was a dead end.
- **Fix:** Replace with real URLs (Calendly, Stripe checkout, Skool invite, client's booking page). If URLs aren't available yet, use a proper "coming soon" state, not a dead link.
- **Prevention:** Architect must flag every CTA in the master plan with its target URL. If URL is unknown, mark it as "NEEDS CLIENT INPUT" — don't let it become a silent dead end.
- **Phase:** Tailor creates them, Architect should specify targets, Inspector should grep for `href="#"` and flag

### Trap: AI Responses Sound Like AI (Anti-Formatting + AI-isms)
- **Frequency:** Every project with AI-generated text. Confirmed in Rock Solid. Universal.
- **Cause:** System prompts don't ban AI tells. The output uses em dashes ("ChatGPT hyphens"), words like "delve", "leverage", "robust", "pivotal", transitions like "moreover", "furthermore", ChatGPT patterns like "Great question!", "I'd be happy to...". These are instantly recognizable as AI.
- **Fix:** Add the 12-point anti-AI formatting ruleset to EVERY system prompt (see SKILL.md Phase 3 for full list). Ban specific verbs (delve, leverage, utilize, streamline, curate, embark, unlock, unleash, harness, elevate), adjectives (robust, pivotal, comprehensive, seamless, cutting-edge), transitions (moreover, furthermore, notably, indeed), and ChatGPT response patterns.
- **Source:** The complete anti-AI ruleset lives in `prompts/COPYWRITING_GUIDELINES.md` in the SaaS codebase. Battle-tested across thousands of DMs.
- **Prevention:** Mechanic must include anti-AI formatting rules in EVERY system prompt file. Inspector must grep system prompts for enforcement rules. This is the #1 thing clients notice — if the AI sounds like AI, the product feels cheap.
- **Phase:** Mechanic causes it (prompt engineering), client catches it in live testing

### Trap: Layout Shifts from Typewriter Effects
- **Frequency:** Any app with typewriter/streaming text
- **Cause:** Typewriter text grows character by character, causing content below to shift downward as lines wrap. Every character triggers a re-layout. Combined with auto-scroll on every character, the page "jumps around."
- **Fix:** Pre-allocate final text height: render full text invisibly to reserve space, overlay visible (typed) text with absolute positioning. Change auto-scroll dependency from `[typedUpTo]` to `[messages.length]` — only scroll on NEW messages, not every character.
- **Prevention:** Any page with typewriter or streaming text must use the pre-allocation pattern. No exceptions.
- **Phase:** Tailor causes it, client/QA catches it

### Trap: Password Manager Autofill on Non-Login Inputs
- **Frequency:** Any app with text inputs outside auth pages
- **Cause:** LastPass/1Password detect `<input type="text">` and inject autofill suggestions, covering the actual input with credential dropdowns. Particularly bad on chat/diagnostic inputs where users are typing conversational responses.
- **Fix:** Change input `type="text"` to `type="search"`. Password managers completely ignore search inputs. Add `[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden` to hide browser's default search UI.
- **Prevention:** Any user-facing text input that is NOT a login/signup form should use `type="search"` or add `data-lpignore="true" data-1p-ignore="true" data-form-type="other"` attributes.
- **Phase:** Tailor creates the input, client catches the autofill issue

### Trap: Silent API Failure (No Error Recovery UI)
- **Frequency:** First occurrence in Rock Solid, likely universal
- **Cause:** `fetch()` doesn't throw on HTTP errors. Code checks `if (response.ok)` but does nothing in the `else` case. User sends a message, API returns 500, frontend silently swallows it. Complete dead end — user has to refresh the page.
- **Fix:** Implement `fetchWithRetry()` — auto-retry up to 2 times with 1s/2s exponential backoff for 500+/429 errors. If all retries fail, show error banner with retry button. Categorize errors: rate limit (429), overloaded (529), server error (500+). Return `retryable: true` flag from API.
- **Prevention:** EVERY API call in the frontend must have error handling with user-visible recovery. "CONNECTION LOST" banner with retry button. No silent failures. Ever.
- **Phase:** Mechanic builds API route without error categories, Tailor builds frontend without retry logic — both need to be fixed

---

## Patterns That Work (Proven Across Builds)

### Types-First Development
When the Mechanic writes complete TypeScript interfaces BEFORE writing API routes or AI modules, the Tailor has 50%+ fewer import errors. Types are the contract. Write them first. Always.

### Constants File as Single Source of Truth
Rock Solid's `constants/app.ts` was 430+ lines — all 11 ceiling definitions with verbatim client copy, 8 mock sessions, 8 mock leads, dashboard stats, label maps. When everything lives in ONE constants file, every component pulls from the same source. No divergence. No "which mock data is the real one?" Constants files this large are GOOD, not a code smell.

### 2-Stage AI Calls (Conversation + Extraction)
For AI-heavy products, separate the conversation call from the data extraction call. Rock Solid uses: (1) Claude call for conversation + basic classification, (2) Second Claude call with full transcript to generate personalized reveal data (12 structured fields). This lets each call evolve independently and keeps prompts focused.

### Prompt Caching for Repeated System Prompts
System prompts are 4000+ tokens. Marking the static portion as `cache_control: { type: "ephemeral" }` (5-min TTL) saves ~80% of input token costs on repeat calls. Always cache the static portion, inject dynamic context per-turn as a separate block.

### ELI5 as Demo Script
The cumulative ELI5 doc works best when written as if narrating a video walkthrough to the client. "When you open the dashboard, you'll see..." format — not bullet points of features.

### Focused Rounds > Kitchen Sink Rounds
Rounds with a specific focus (e.g., "dashboard analytics") produce more coherent, higher-quality results than "do everything" rounds. The focus directive concentrates all 6 phases on one area instead of spreading thin.

### Extraction Verification Pass Catches 15-20%
The Surgeon's mandatory second pass consistently catches 15-20% of requirements missed in the first pass. This is not optional. It's not "nice to have." It's the difference between a complete extraction and a partial one.

### Self-Annealing Build Checks Save Inspector Time
When Mechanic and Tailor run `npm run build` after their phases and fix their own errors, the Inspector's job drops from "fix 20 errors" to "verify 0-3 edge cases." The Annealing Gauntlet in Phase 6 is faster when earlier phases clean up after themselves.

### The Closer (Agent 6) Carries Failed Builds
In the Rock Solid scaffold build, 4 of 6 agents hit rate limits. Agent 6 (Closer) solo-built the entire application: created 7 files, modified 16, fixed 15 quote-style issues, ran verify.sh, passed build with zero errors. The Closer/Inspector is the most critical agent — it must have the FULL project spec, not just "fix what broke."

### Retrospective as Honest Gap Assessment
Rock Solid's `04_retrospective.md` was the single most useful document for post-build planning. It said: "Beautiful UI, zero working backend. The chassis is strong, the engine runs, it just needs to be connected to the wheels." Architect (Phase 2) should always produce an honest assessment of what's ACTUALLY working vs what's decorative.

### Design System Cohesion Through Dark Theme Tokens
When the creative brief specifies exact hex values for background (#0A0619), surface (#120E24), border (#2D2650), accent (#09F524) — AND every component uses these consistently — the result is polished. Zero light-mode leaks across 13 routes. Spec the design tokens, enforce them, done.

### Client Source Material > Agent Invention
Rock Solid's ceiling definitions came verbatim from the client's 73-page Mirror Prompt Pack. Lines like "You've confused preparation with progress" and "Content people don't search for diagnostic tools at 11 PM on a Tuesday" — these LAND because they're the client's IP, not AI-generated filler. The Surgeon must extract and preserve exact client language. The Mechanic must embed it verbatim in constants/prompts.

---

## Things to Watch For (Per Phase)

### Surgeon (Phase 1)
- Client says one thing in the transcript, contradicts it in the follow-up email. Flag BOTH. Don't resolve.
- "Throwaway comments" are often the real requirements. "Oh and it would be cool if..." = they actually want this.
- **Client source documents > spec assumptions.** Rock Solid's client delivered a 73-page Mirror Prompt Pack that superseded every assumption the spec made about how the diagnostic should work. If client provides production-ready content (prompt packs, brand guides, scoring systems), it becomes the source of truth. Flag it loudly.
- **Scan for 501 stub routes.** Grep all `route.ts` files for `501`. Every stub is a gap the Architect must address.

### Architect (Phase 2)
- ELI5 jargon creep. The Architect is technical by nature. They WILL sneak in "API" or "database" if you don't watch.
- Master plan scope creep. If the extraction has 30 requirements, the plan shouldn't have 45 features. Stick to what the client asked for.
- **Separate "Working" from "Decorative."** Rock Solid had 13 pages, all visually polished — but zero data persistence, 3 stub API routes, and every dashboard number was hardcoded. The retrospective's line: "Beautiful UI, zero working backend." The Architect MUST classify each feature: "Actually functional" vs "Mock/decorative."
- **CTA targets must be specified.** Every button that leads to revenue (Book, Buy, Join) must have a real URL in the master plan. If the client hasn't provided it, mark "NEEDS CLIENT INPUT" — don't leave `href="#"` as default.
- **Price anchoring in conversion flows.** Rock Solid showed users their ceiling cost $604,800... then asked for $3,500 with no bridge. The Architect should plan where price anchoring happens in the funnel.

### Mechanic (Phase 3)
- System prompts belong in dedicated files, NOT inline in API routes. This is a recurring pattern violation.
- `maxTokens` (Law 14) — always set it. Minimum 4096 for JSON responses.
- **Wire every module you create.** If you build `conversation-manager.ts` — import it in the API route in the SAME session. Don't create standalone modules and assume someone else will wire them.
- **Anti-AI formatting rules in EVERY system prompt.** Explicitly ban: em dashes (—), asterisks for emphasis, bullet points, markdown formatting. Specify: use ellipses for pauses, blank line between observation and question, final question stands alone. Users can tell when AI sounds like AI.
- **Session lifecycle endpoints are P0.** start-session, save-progress, complete-session — minimum 3 endpoints for any user flow with progression. Don't ship 501 stubs.
- **Error categorization in API responses.** Return `{ error, retryable, errorType }` so the frontend knows: rate limit (429) → auto-retry, client error (4xx) → show message, server error (5xx) → retry with backoff.

### Tailor (Phase 4)
- Mobile responsive is non-negotiable. If a page doesn't have `sm:/md:/lg:` Tailwind prefixes, it's not done.
- `console.log` statements left in final code. Strip them all.
- Animations should serve the story, not show off. If it doesn't improve UX, remove it.
- **Always use double-quoted `"use client"` directives.** Not single quotes. verify.sh checks specifically for double quotes.
- **Typewriter text needs height pre-allocation.** Render full text invisibly to reserve space, overlay visible text with absolute positioning. No content jumping.
- **Non-login inputs should use `type="search"`** to block LastPass/1Password autofill. Add `data-lpignore="true" data-1p-ignore="true"` as backup.
- **Error recovery UI is mandatory.** Every API call needs: retry logic (2 attempts, exponential backoff), error banner with retry button, fallback content if all retries fail. No silent failures.
- **Phase-reactive UI increases immersion.** Rock Solid's diagnostic page changed background opacity, vignette intensity, and progress bar glow based on conversation phase. These subtle shifts create subconscious engagement. Worth implementing on any app with progression states.

### Plumber (Phase 5)
- RLS policies must follow EXACT patterns from existing migrations. Don't invent new RLS patterns.
- `INSERT ... ON CONFLICT DO NOTHING` for seed data (Law 5). Not bare INSERTs.
- Column names in SQL must EXACTLY match TypeScript interface property names.
- **JSONB columns for AI-generated structured data.** Rock Solid stores `personalized_reveal` and `sales_prep_notes` as JSONB — not normalized columns. AI output is semi-structured; JSONB handles schema evolution without migrations.
- **Create views for complex joins.** Rock Solid's `lead_intelligence` view joins leads + sessions + reveals. Dashboard queries hit the view, not 3-way joins. Cleaner queries, single source of truth.

### Inspector (Phase 6)
- Don't just fix build errors. Cross-phase consistency matters more. A build can pass and still have type mismatches that cause runtime errors.
- The ELI5 check is part of YOUR job. If it has jargon, fix it.
- **Grep for `href="#"` in ALL pages.** Dead CTA links are silent revenue killers. Flag every one.
- **Grep for `501` in ALL route.ts files.** Stub routes that were supposed to be built this round.
- **Grep for `localStorage.setItem` and verify DB persistence exists alongside it.** localStorage is a cache, not a database.
- **Verify every file in `web/lib/ai/` is actually imported somewhere.** Dead code = wasted effort.
- **Verify anti-AI formatting rules exist in system prompts.** If the prompt doesn't explicitly ban em dashes, asterisks, bullets — the output WILL sound like ChatGPT.

---

## Build Statistics (Updated Per Project)

*Track success rates to measure improvement over time.*

<!-- Format:
| Project | Round | Build Attempts | Errors Fixed | Self-Annealing Catches | Inspector Catches |
|---------|-------|----------------|--------------|----------------------|-------------------|
| ClientApp | 1 | 3 | 12 | 8 | 4 |
-->

| Project | Round | Build Attempts | Errors Fixed | Notes |
|---------|-------|----------------|--------------|-------|
| Rock Solid (NEO Mirror) | Scaffold | 3 | 15+ | 4/6 agents rate-limited → Agent 6 solo-built. 15 quote-style fixes. |
| Rock Solid (NEO Mirror) | Post-build S1 | 2 | 8 | MVP + L3 personalization. Prompt rewrite, reveal overhaul, 2-stage Claude calls. |
| Rock Solid (NEO Mirror) | Post-build S2 | 1 | 5 | Layout shifts, anti-AI formatting, LastPass fix, API retry logic, typing indicator. |
