# Scaffold Setup - Learnings

> **Purpose:** Lessons learned during project setup. Read this BEFORE executing.

---

## Logged Learnings

### Next.js Cache Corruption on First Setup
**What happened:** After installing dependencies and running `npm run dev`, got 500 errors or "Cannot find module" on startup.
**Root cause:** The `.next` build cache can become corrupted, especially after major dependency changes.
**Fix:** `rm -rf .next && npm run dev` -- always the first thing to try for unexplained build errors.
**Prevention:** After any large npm install or dependency update, nuke `.next` before starting dev.

### Environment Variable Format Matters
**What happened:** Supabase connection failed silently with cryptic errors.
**Root cause:** `NEXT_PUBLIC_SUPABASE_URL` had a trailing slash, or the anon key had extra whitespace from copy-paste.
**Fix:** Trim all env values. Supabase URL must NOT end with `/`.
**Prevention:** After copying env values, always verify by echoing them or checking `.env.local` in a text editor. Watch for invisible characters.

### Migrations Must Run BEFORE Writing Code
**What happened:** Built a feature that referenced new columns, deployed, and got "column does not exist" errors.
**Root cause:** Wrote TypeScript queries for new tables/columns before running the SQL migration in Supabase Dashboard.
**Fix:** Always run migrations FIRST, confirm tables exist, THEN write the code that queries them.
**Prevention:** This is the Migration First Law. Never `select("new_column")` until you've confirmed the migration ran successfully.

### Supabase Auth Email Confirmation
**What happened:** User signed up but clicking the confirmation email redirected to the wrong URL or showed an error.
**Root cause:** Site URL in Supabase Authentication settings didn't match the actual app URL. For local dev, it needs to be `http://localhost:3000`.
**Fix:** Go to Supabase Dashboard > Authentication > URL Configuration > Set Site URL to match your `NEXT_PUBLIC_APP_URL`.
**Prevention:** Always set the Supabase Site URL as part of setup, not after.

### Stripe Webhook Secret Is Per-Endpoint
**What happened:** Stripe webhooks returned 400 errors even though the secret key was correct.
**Root cause:** Used the Stripe Dashboard webhook secret for the endpoint pointing to production URL, but was testing locally with `stripe listen` which generates a DIFFERENT webhook secret.
**Fix:** For local dev, use the `whsec_` secret printed by `stripe listen`, not the one from Dashboard.
**Prevention:** Keep TWO webhook secrets: one in Dashboard for production, one from `stripe listen` for local dev. Update `.env.local` accordingly.
