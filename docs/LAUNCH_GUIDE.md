# Launch Guide

> **Trigger:** Type "Launch" after the 6 agents finish building.
> This guide walks you through EVERYTHING needed to go from a local frontend to a live, production app.
> It's designed to be so complete that you don't need the training videos to follow along.

---

## How This Works

When you say "Launch", Claude becomes your deployment sidekick. It will walk you through each step in order, ask you questions, verify your work, and handle configuration automatically where possible.

**You will need accounts for:**
- GitHub (free) -- code hosting
- Supabase (free tier available) -- database + auth
- Vercel (free tier available) -- hosting + deployment
- Stripe (free to set up) -- payments (if your app needs billing)

**Estimated time:** 45-90 minutes for the full setup. Most of that is waiting for account creation and DNS propagation.

---

## Phase 1: Pre-Flight Check

Before deploying anything, verify the build is clean.

### Step 1.1: Verify the Build

```bash
cd web && npm run build
```

If this passes, the app compiles. If it fails, fix the errors first.

Then run the full verification:

```bash
bash verify.sh
```

This checks TypeScript, ESLint, and build. Everything must pass before deploying.

### Step 1.2: Review What the Agents Built

Quick inventory of what exists:
- Landing page: `web/app/page.tsx` + `web/components/public/`
- Auth pages: `web/app/(auth)/login/` and `web/app/(auth)/signup/`
- Dashboard: `web/app/dashboard/` + `web/components/layout/`
- Feature pages: `web/app/dashboard/[feature-name]/`
- Types: `web/lib/types/app.ts`
- Constants: `web/lib/constants/app.ts`
- DB schema: `supabase/migrations/003_app_schema.sql`
- API stubs: `web/app/api/[feature]/route.ts`

Everything is mock data right now. The Launch Guide connects real services.

---

## Phase 2: GitHub Repository

### Step 2.1: Create the Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `clientname-app` (lowercase, hyphens, no spaces)
3. Set to **Private**
4. Do NOT initialize with README (you already have code)
5. Click "Create repository"

### Step 2.2: Push Your Code

```bash
# From the project root (not web/)
git init
git add -A
git commit -m "Initial build: frontend scaffold with mock data"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/clientname-app.git
git push -u origin main
```

Refresh the GitHub page. You should see all your files.

### Step 2.3: Verify .gitignore

Make sure these are in your `.gitignore` (they should already be):
```
node_modules/
.next/
.env.local
.env*.local
```

**Never commit `.env.local`.** It contains your secret keys.

---

## Phase 3: Supabase (Database + Auth)

### Step 3.1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create account)
2. Click "New Project"
3. Choose your organization (or create one)
4. Project name: `clientname-app`
5. Database password: Generate a strong one and **save it somewhere safe**
6. Region: Choose closest to your users
7. Click "Create new project"
8. Wait 1-2 minutes for provisioning

### Step 3.2: Get Your Keys

Once the project is ready, go to **Settings > API** in the Supabase Dashboard.

You need three values:
```
Project URL:     https://xxxxx.supabase.co
Anon Key:        eyJ... (the long one under "anon public")
Service Role Key: eyJ... (the long one under "service_role" -- KEEP THIS SECRET)
```

Also note your **Project Reference** (the random string in your URL: `https://XXXXX.supabase.co` -- XXXXX is the ref).

### Step 3.3: Set Up Environment Variables Locally

Create or edit `web/.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Rules:**
- `NEXT_PUBLIC_` prefix = visible to the browser (safe for anon key)
- No `NEXT_PUBLIC_` prefix = server-only (required for service role key)
- Never commit this file to git

### Step 3.4: Run Migrations

**Option A: Supabase CLI (Recommended)**

The Supabase CLI pushes all migrations in one command. No copy-pasting SQL.

```bash
# Install Supabase CLI (one-time)
npm install -g supabase

# Login to Supabase
supabase login

# Link your local project to the remote Supabase project
supabase link --project-ref YOUR_PROJECT_REF
# (Project ref = the random string in your Supabase URL)

# Push all migrations
supabase db push
```

Every `.sql` file in `supabase/migrations/` gets executed in order. If a migration was already applied, it skips it.

**For future migrations:**
```bash
# Create a new migration file
supabase migration new add_feature_table

# Edit the generated file in supabase/migrations/
# Then push
supabase db push
```

**Option B: Dashboard (Manual fallback)**

If CLI isn't set up, go to Supabase Dashboard > SQL Editor and paste each migration file in order:

```
1. supabase/migrations/001_auth_schema.sql
2. supabase/migrations/002_org_schema.sql
3. supabase/migrations/003_app_schema.sql
```

Verify tables exist in Table Editor after each migration.

### Step 3.5: Configure Authentication

In Supabase Dashboard > Authentication > Providers:

**Email (enabled by default):**
- Confirm email: ON for production, OFF for development
- Minimum password length: 8

**Google OAuth (optional but recommended):**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Set authorized redirect URI: `https://xxxxx.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret into Supabase Dashboard

**GitHub OAuth (optional):**
1. Go to GitHub > Settings > Developer Settings > OAuth Apps
2. New OAuth App
3. Authorization callback URL: `https://xxxxx.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret into Supabase Dashboard

**URL Configuration:**
In Supabase Dashboard > Authentication > URL Configuration:
- Site URL: `http://localhost:3000` (change to production URL later)
- Redirect URLs: Add `http://localhost:3000/auth/callback`

### Step 3.6: Verify Locally

```bash
cd web && npm run dev
```

Open `http://localhost:3000`. Try to create an account. If auth works, Supabase is connected.

---

## Phase 4: Database Hygiene (Critical)

> **This section prevents the #1 source of bugs in production apps.**
> Get naming right from the start. Changing column names later is painful.

### Step 4.1: Naming Conventions (Non-Negotiable)

Every table and column in your database MUST follow these rules:

**Tables:**
- `snake_case`, plural: `user_profiles`, `lead_activities`, `organization_members`
- Never mix: `orgs` vs `organizations` -- pick ONE and use it everywhere

**Columns:**
- `snake_case` always: `created_at`, `updated_at`, `organization_id`
- **NEVER** abbreviate foreign keys inconsistently:
  ```
  BAD:  org_id in some tables, organization_id in others
  GOOD: organization_id everywhere (or org_id everywhere -- but PICK ONE)
  ```
- **NEVER** have both `org_id` AND `organization_id` in your schema. This causes:
  - AI confusion when writing queries
  - Join errors that are hard to debug
  - RLS policy mismatches

**Foreign Key Naming:**
```sql
-- GOOD: Consistent pattern
user_id        REFERENCES auth.users(id)
organization_id REFERENCES organizations(id)
lead_id        REFERENCES leads(id)

-- BAD: Mixed patterns
org_id         REFERENCES organizations(id)  -- abbreviated
organization_id REFERENCES organizations(id)  -- full name
-- Now which one do you use in queries? Chaos.
```

### Step 4.2: Required Columns on Every Table

Every table should have these columns:

```sql
CREATE TABLE your_table (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- your columns here --
    organization_id UUID REFERENCES organizations(id),  -- multi-tenant
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Why `organization_id` on every table?**
- Multi-tenancy: Every row belongs to an org
- RLS policies filter by org membership
- Data isolation between clients
- Without this, you'll add it later and it's a painful migration

### Step 4.3: Enable RLS on Every Table

```sql
-- Enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Basic org-level isolation policy
CREATE POLICY "Users can view own org data"
ON your_table FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
    )
);

-- Repeat for INSERT, UPDATE, DELETE as needed
```

**Never skip RLS.** Without it, any authenticated user can see any row in the table.

### Step 4.4: Audit Your Migration

Before running migrations, check for these issues:

```
[ ] All foreign keys use consistent naming (not mixed org_id / organization_id)
[ ] Every table has id, organization_id, created_at, updated_at
[ ] RLS is enabled on every table
[ ] Indexes exist on foreign key columns
[ ] Enum types are used for status columns (not free-text strings)
[ ] No table or column uses camelCase (always snake_case)
[ ] No column is named "type" or "status" without a prefix (use lead_status, not status)
```

---

## Phase 5: Vercel Deployment

### Step 5.1: Connect GitHub to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select the `clientname-app` repo from GitHub
4. Configure the project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `web` (click "Edit" and type `web`)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
5. Click "Deploy"

From this point on, **every `git push` to `main` triggers an automatic production deployment.** No manual deploy commands needed.

### Step 5.2: Set Environment Variables in Vercel

In Vercel Dashboard > Project > Settings > Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

If the app uses AI features, also add:
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

If the app uses Stripe, also add:
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**After adding env vars for the first time:** Trigger a redeploy (Vercel Dashboard > Deployments > click "..." on latest > Redeploy). Future pushes pick up vars automatically.

### Step 5.3: The Day-to-Day Deploy Workflow

Once GitHub + Vercel are connected, this is the entire deploy process:

```bash
# Make changes to the app
git add -A
git commit -m "feat: Add client dashboard analytics"
git push
```

Vercel builds in ~60-90 seconds. The live URL updates automatically.

**Preview deploys:** Push to a branch other than `main` and Vercel creates a preview URL (e.g., `clientname-app-git-feature-xyz.vercel.app`). Great for showing clients changes before going live.

### Step 5.4: Custom Domain

In Vercel Dashboard > Project > Settings > Domains:

1. Add domain: `clientname.com` or `app.clientname.com`
2. Vercel gives you DNS records (CNAME or A record)
3. Add records at the domain registrar
4. Wait for DNS propagation (usually 5-30 minutes)
5. Vercel auto-provisions SSL certificate

### Step 5.5: Update Supabase Redirect URLs

Back in Supabase Dashboard > Authentication > URL Configuration:
- Site URL: `https://clientname.com`
- Redirect URLs: Add `https://clientname.com/auth/callback`

### Step 5.6: The Complete Pipeline

```
Code changes → git push → GitHub receives code
                                   ↓
                           Vercel auto-deploys
                                   ↓
                           Live at clientname.com (~90 seconds)

SQL changes → supabase db push → Supabase applies migrations
                                   ↓
                           Database updated instantly
```

**Two commands. That's the entire deploy process.** `git push` for code. `supabase db push` for database.

---

## Phase 6: Stripe (Payments)

> Skip this phase if the app doesn't need billing.

### Step 6.1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete verification (business info, bank account)
3. Start in **Test Mode** (toggle in top-right of Dashboard)

### Step 6.2: Create Products and Prices

In Stripe Dashboard > Products:

1. Click "Add Product"
2. Create your pricing tiers:

**Example structure:**
```
Free Plan:     $0/month  (no Stripe product needed, handle in code)
Pro Plan:      $49/month (create product + recurring price)
Enterprise:    $199/month (create product + recurring price)
```

For each paid plan:
- Product name: "Pro Plan" (or whatever)
- Pricing: Recurring, Monthly
- Price: $XX.00
- Copy the **Price ID** (starts with `price_`)

### Step 6.3: Get Stripe Keys

In Stripe Dashboard > Developers > API Keys:
```
Publishable key: pk_test_... (or pk_live_... for production)
Secret key:      sk_test_... (or sk_live_... for production)
```

### Step 6.4: Set Up Webhook

In Stripe Dashboard > Developers > Webhooks:

1. Click "Add endpoint"
2. Endpoint URL: `https://clientname.com/api/stripe/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Click "Add endpoint"
5. Copy the **Webhook Signing Secret** (starts with `whsec_`)

### Step 6.5: Add Keys to Environment

Add to `web/.env.local`:
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

And add the same to Vercel environment variables (Step 5.2).

### Step 6.6: Verify Webhook

Use Stripe CLI to test locally:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This gives you a local webhook secret for testing.

---

## Phase 7: Connect Real Data

### Step 7.1: Replace Mock Data with Supabase Queries

The agents created pages with mock data (const arrays at the top of each file). Replace them with real Supabase queries.

**Pattern for every page:**

```typescript
// BEFORE (mock data from agents)
const leads = [
  { id: '1', name: 'John Doe', status: 'active' },
  { id: '2', name: 'Jane Smith', status: 'contacted' },
];

// AFTER (real Supabase query)
const supabase = createBrowserClient();
const { data: leads } = await supabase
  .from('leads')
  .select('*')
  .eq('organization_id', orgId)
  .order('created_at', { ascending: false });
```

**Do this for each feature page:**
1. Import the Supabase client
2. Replace the mock array with a real query
3. Add loading and error states
4. Keep the UI components exactly the same -- only the data source changes

### Step 7.2: Connect Auth Forms

The agents built login/signup pages with styled forms. Connect them to real Supabase Auth:

**Login:**
```typescript
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
if (!error) router.push('/dashboard');
```

**Signup:**
```typescript
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: name },
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

**Social Login (Google):**
```typescript
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

### Step 7.3: Create the Auth Callback Route

Create `web/app/auth/callback/route.ts`:

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

---

## Phase 8: Adding New Features

### Step 8.1: The Feature Checklist

When adding any new feature to the app, follow this order:

```
1. Migration  → supabase/migrations/XXX_feature_name.sql
2. Types      → web/lib/types/ (if new data types needed)
3. API Route  → web/app/api/feature/route.ts
4. Hook       → web/lib/hooks/useFeature.ts (if client needs data)
5. Component  → web/components/feature/Component.tsx
6. Page       → web/app/dashboard/feature/page.tsx
7. Navigation → Update sidebar to include new page link
8. Verify     → bash verify.sh
```

### Step 8.2: Migration Template

```sql
-- supabase/migrations/004_add_feature.sql

CREATE TABLE IF NOT EXISTS feature_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE feature_items ENABLE ROW LEVEL SECURITY;

-- Org isolation policy
CREATE POLICY "Org members can view feature items"
ON feature_items FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Org members can insert feature items"
ON feature_items FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
    )
);

-- Index for performance
CREATE INDEX idx_feature_items_org ON feature_items(organization_id);
CREATE INDEX idx_feature_items_created ON feature_items(created_at DESC);
```

### Step 8.3: API Route Template

```typescript
// web/app/api/feature/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('feature_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from('feature_items')
    .insert({ ...body, created_by: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
```

---

## Phase 9: Pre-Launch QA Checklist

Before handing the app to a client, verify everything:

### Auth
- [ ] Can create account with email/password
- [ ] Can log in with existing account
- [ ] Can log out and session is cleared
- [ ] Social login works (Google/GitHub if configured)
- [ ] Forgot password flow works
- [ ] Email confirmation works (if enabled)

### Dashboard
- [ ] Dashboard loads after login
- [ ] All sidebar navigation links work
- [ ] All feature pages render without errors
- [ ] Data loads from Supabase (not mock data)
- [ ] Create/edit/delete operations work on each feature

### Mobile
- [ ] Landing page looks good on mobile (375px)
- [ ] Dashboard is usable on mobile
- [ ] Auth pages are mobile-friendly
- [ ] No horizontal scrolling on any page

### Payments (if applicable)
- [ ] Can subscribe to a plan (test mode)
- [ ] Webhook receives events
- [ ] Subscription status updates in the database
- [ ] Billing portal link works
- [ ] Cancel/downgrade flow works

### Security
- [ ] RLS is enabled on ALL tables
- [ ] Service role key is NOT exposed to the browser
- [ ] .env.local is in .gitignore
- [ ] API routes check authentication
- [ ] Users can only see their own org's data

### Performance
- [ ] Landing page loads in under 3 seconds
- [ ] Dashboard loads in under 2 seconds
- [ ] No console errors in browser dev tools
- [ ] Images are optimized (not huge uncompressed files)

### Deployment
- [ ] Vercel build succeeds
- [ ] Environment variables are set in Vercel
- [ ] Custom domain is configured (if applicable)
- [ ] Supabase redirect URLs match production domain
- [ ] SSL certificate is active (auto from Vercel)

---

## Phase 10: Client Handoff

### What to Deliver

1. **Live URL:** `https://clientname.com` or `https://clientname-app.vercel.app`
2. **Admin access:** Their login credentials
3. **Documentation:** Brief guide on how to use the app
4. **Support channel:** How to reach you for issues/changes

### What to Keep

1. **GitHub access:** You maintain repo access for updates
2. **Supabase access:** You maintain database admin access
3. **Vercel access:** You maintain deployment access
4. **Stripe access:** Shared or separate depending on agreement

### Retainer Setup

If the client is on a monthly retainer:
- Set up a shared communication channel (Slack, email)
- Define response time expectations
- Track feature requests in a backlog
- Schedule monthly check-ins
- Deploy updates via `git push` (auto-deploys to Vercel)

---

## Quick Reference: The Full Stack

```
                        ┌─────────────────┐
                        │   Custom Domain  │
                        │ clientname.com   │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │     Vercel      │
                        │  (Auto-deploy)  │
                        │  Next.js app    │
                        └────────┬────────┘
                                 │
                   ┌─────────────┼─────────────┐
                   │             │             │
          ┌────────▼────┐  ┌────▼─────┐  ┌────▼─────┐
          │  Supabase   │  │  Stripe  │  │  AI APIs │
          │  Database   │  │ Payments │  │  Claude  │
          │  Auth       │  │ Webhooks │  │  OpenAI  │
          │  Storage    │  │ Billing  │  │  Gemini  │
          │  RLS        │  │          │  │          │
          └─────────────┘  └──────────┘  └──────────┘
```

### Two Commands to Deploy Everything

```bash
# Code changes
git add -A && git commit -m "feat: description" && git push

# Database changes
supabase db push
```

That's it. Everything else is automated.

---

## Troubleshooting

### "Build failed on Vercel"
- Check Vercel build logs for the exact error
- Most common: missing environment variables, TypeScript errors
- Run `npm run build` locally first to catch errors before pushing

### "Auth not working"
- Check Supabase URL and anon key in .env.local
- Check redirect URLs in Supabase Dashboard match your domain
- Check browser console for CORS errors
- Make sure auth callback route exists at `web/app/auth/callback/route.ts`

### "Data not loading"
- Check RLS policies (most common issue)
- Check that organization_id is set on inserted rows
- Check browser network tab for failed API calls
- Try querying directly in Supabase Dashboard to verify data exists

### "Stripe webhook not firing"
- Check webhook endpoint URL is correct (must be HTTPS, not localhost)
- Check webhook signing secret matches
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Check Stripe Dashboard > Developers > Webhooks > Recent deliveries for errors

### "CSS looks wrong in production"
- Delete `.next/` folder and rebuild: `rm -rf .next && npm run build`
- Check that all Tailwind classes are static strings (no dynamic interpolation)
- Verify tailwind.config.ts content array includes all component paths

---

*This guide covers every step from a local build to a live production app. Follow it in order. Don't skip steps. When in doubt, verify before moving on.*
