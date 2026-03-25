# Self-Correction - Learnings

> **Purpose:** Meta-learnings about the bug-fixing process itself. Read this BEFORE executing.

---

## Logged Learnings

### Never Stop at the First Fix
**What happened:** Fixed a surface-level symptom (UI showing wrong data). Declared victory. Same bug reappeared in a different view because the root cause was in the API layer, not the component.
**Root cause:** Treated the symptom as the disease.
**Fix:** Trace the complete data flow before declaring a bug fixed: Component > Hook > API > Database > Response > State > Render.
**Prevention:** After every fix, ask: "If I trace the data from source to screen, does my fix address the actual point of failure?"

### Check the Supabase Client Type First
**What happened:** Spent 2 hours debugging "Unauthorized" errors. Tried fixing RLS policies, auth tokens, and middleware. The real issue: API route used `createAdminClient()` (service role) to call `auth.getUser()`, which always returns null.
**Root cause:** Service role clients cannot read session cookies. They're for bypassing RLS, not identifying users.
**Fix:** Use `createAuthClient()` for user identification, `createAdminClient()` for data operations that bypass RLS.
**Prevention:** When ANY API returns "Unauthorized" unexpectedly, FIRST check which Supabase client type is being used. This is the #1 cause of auth bugs.

### RLS Policy Recursion = Instant Infinite Loop
**What happened:** Added an RLS policy that called a helper function. The helper function queried a table that also had RLS policies. Database went into infinite recursion, crashing all queries.
**Root cause:** RLS helper functions default to checking their own RLS policies when querying other tables.
**Fix:** Helper functions used in RLS policies MUST be `SECURITY DEFINER` and `LANGUAGE plpgsql`:
```sql
CREATE OR REPLACE FUNCTION is_org_member(org UUID)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM organization_members WHERE org_id = org AND user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
**Prevention:** Every function referenced in RLS policies needs `SECURITY DEFINER` + `plpgsql`.

### Compare Working Code vs Broken Code
**What happened:** Mobile page showed 0 items. Desktop page worked fine. Spent time investigating database, auth, and API. The actual issue: mobile page used a different query pattern than the working desktop page.
**Root cause:** Assumed both pages used the same data fetching logic. They didn't.
**Fix:** Diffed the working desktop page against the broken mobile page. Found the query difference immediately.
**Prevention:** When something works in one place but not another, DIFF the two implementations first. Don't start debugging from scratch.

### Remove Debug Console Logs BEFORE Moving On
**What happened:** Left 15+ console.log statements from debugging session. These cluttered the browser console for the next person working on the feature, making their debugging harder.
**Root cause:** Got excited about the fix working and forgot cleanup.
**Fix:** After confirming a fix works, remove ALL console.log statements added during debugging. Keep only intentional error logging.
**Prevention:** Part of every bug fix: clean up your debugging artifacts.

### Silent Failures Are the Worst Bugs
**What happened:** Feature appeared to work -- no errors, no crashes. But data wasn't actually being saved. Toast showed "Success!" because the API returned 200, but the database insert was silently failing due to a missing column.
**Root cause:** API caught the error and returned 200 with an empty `data` field instead of a proper error response.
**Fix:** API routes should ALWAYS check if the database operation actually succeeded: `if (!data) return error`.
**Prevention:** Never return 200 without verifying the operation produced the expected result. Check for null/empty data in responses.

### When In Doubt, Nuke the Cache
**What happened:** Made code changes, but the app showed old behavior. Checked the code 5 times. It was correct. Turns out the `.next` build cache was serving old compiled code.
**Root cause:** Next.js caches aggressively in development. Sometimes it doesn't pick up changes.
**Fix:** `rm -rf .next && npm run dev`
**Prevention:** If behavior doesn't match your code, try clearing cache BEFORE deep debugging. It saves hours.

### CSS Gradient Text Clips Descenders (g, y, p, q)
**What happened:** `background-clip: text` + `-webkit-text-fill-color: transparent` caused letters with descenders (g, y, p, q) to have their bottoms visually cut off.
**Root cause:** The element's content box doesn't extend far enough below the baseline when line-height is tight. The gradient background area ends before the descenders finish.
**Fix:** Add `padding-bottom: 0.1em` to the gradient text class. This extends the content area below the baseline.
**Prevention:** ALWAYS use the `.text-gradient-headline` utility class (which includes the padding fix). Never apply raw `background-clip: text` inline without the padding.

### Badge "Strikethrough" from Card Border Showing Through
**What happened:** A "RECOMMENDED" badge positioned at `-top-3` on a pricing card had a visible horizontal line through it.
**Root cause:** The badge's outer wrapper used `bg-dark-bg-secondary` — a Tailwind class that didn't exist in the config. The class was silently ignored, leaving zero background behind the badge. The card's top border was visible through the badge, appearing as a "strikethrough" line.
**Fix:** Changed to `bg-[var(--dark-bg-secondary)]` (uses the CSS variable directly) and added `px-2 py-0.5` for better border coverage.
**Prevention:** (1) Verify that Tailwind color classes actually exist in the config before using them. (2) For badge cutout effects, always test by looking at the badge against the card border. (3) Use arbitrary value syntax `bg-[var(--css-variable)]` when the Tailwind config doesn't have a matching class.

### Component Nesting Creates Phantom Top Gaps
**What happened:** Wrapping sections in `<ScrollReveal>` or other animation components caused unexpected gaps at the top of sections. The same issue recurred across multiple builds.
**Root cause:** Both the wrapper component AND the inner section had vertical padding/margin. The spacing stacked, creating visible gaps between where one section ends and the next begins.
**Fix:** Spacing (`py-24`, `mt-8`, etc.) goes ONLY on the inner section element. Animation wrappers (`ScrollReveal`, `StaggerContainer`) should have zero spacing classes.
**Prevention:** Animation wrapper components must NEVER have padding or margin. They are purely for animation — spacing belongs on the content element inside.

### Per-Card Styling Makes Grids Look Broken
**What happened:** Three cards in a row — each had different `bgColor`, `borderColor`, and `shadow` values from a data array. One card looked noticeably different (lighter/purple background vs dark).
**Root cause:** Assigning per-card visual styles (background, border, shadow) creates visual inconsistency even when the individual values seem "right." The human eye immediately spots the odd one out.
**Fix:** All cards in a grid use identical base styling. Only tiny accent elements (icon background, label text color) vary between cards.
**Prevention:** Card grid data arrays should only contain content (title, description, icon) and accent color tokens — NEVER base card styles like bgColor, borderColor, or shadow.

### Destructive Commands Need Doomsday Checks (Law 11)
**What happened:** A build script used `rm -rf "$OUTPUT_DIR"` where OUTPUT_DIR was derived from a database field via jq. The database field was empty string. jq's `//` operator treated empty string as truthy (it only falls through on null/false). The slug came out empty. OUTPUT_DIR resolved to the parent folder. `rm -rf` permanently destroyed ALL client project builds.
**Root cause:** Three cascading failures: (1) jq empty string bug, (2) no safety check on empty slug, (3) `rm -rf` with no confirmation and no recoverable trash.
**Fix:** Before writing ANY destructive code — run the 10-point Disaster Scenario Checklist (see CLAUDE.md Law 11). Check empty variables, null values, parent directory resolution, unexpected data formats. Use `trash` instead of `rm -rf`. Add confirmation prompts. Add safety guards.
**Prevention:** Every `rm`, `delete`, `truncate`, or overwrite must answer: "What's the blast radius if the target variable is empty?" If the answer is "catastrophic," add a guard. Always use trash for user data. Present risks to the user BEFORE writing the code.
