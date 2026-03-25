# Bloom Build Deployment Setup

> **For Operators:** Complete guide to deploying your Bloom build with your own infrastructure

This guide walks you through setting up Supabase, Vercel, and environment variables for your build. Each Bloom build is a standalone app that needs its own project infrastructure.

---

## Prerequisites

- GitHub account (for code hosting)
- Vercel account (for deployment)
- Supabase account (for database)

---

## Part 1: Supabase Setup

### Step 1: Create a New Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name**: Your app name (e.g., "RockSolid Lead Gen")
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

### Step 2: Get Your API Credentials

You need **3 credentials** from Supabase:

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Project API keys** → **anon/public** key
   - **Project API keys** → **service_role** key (click "Reveal" to see it)

### Step 3: Run Database Migrations

Your build comes with SQL migrations in the `web/supabase/migrations/` folder.

**How to run them:**

1. Go to **SQL Editor** in your Supabase dashboard
2. Open each migration file from `web/supabase/migrations/` (in order by number)
3. Copy the SQL content
4. Paste into the SQL Editor
5. Click **Run**
6. Repeat for each migration file

**Important:** Run migrations in numerical order (001, 002, 003, etc.)

---

## Part 2: Environment Variables Setup

### Step 1: Update `.env.local`

In your project root, find or create `web/.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI (for AI features)
OPENAI_API_KEY=sk-proj-...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Where to get Stripe keys:**
- Go to [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
- Copy **Publishable key** and **Secret key**
- For webhook secret: Create a webhook endpoint in Stripe → Developers → Webhooks

**Where to get OpenAI key:**
- Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Click **"Create new secret key"**

### Step 2: Test Locally

```bash
cd web
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to verify everything works.

---

## Part 3: Vercel Deployment

### Step 1: Push Code to GitHub

If you haven't already:

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create a new GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repo
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave default
5. Click **"Deploy"**

### Step 3: Add Environment Variables to Vercel

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add ALL variables from your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (use your Vercel domain, e.g., `https://your-app.vercel.app`)

3. Click **"Save"**
4. Go to **Deployments** → Redeploy latest deployment

**Important:** Update `NEXT_PUBLIC_APP_URL` to your production domain after deployment.

---

## Part 4: Post-Deployment Configuration

### Stripe Webhook Setup

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Set **Endpoint URL**: `https://your-app.vercel.app/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
7. Redeploy

### Supabase Authentication Redirect URLs

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add these URLs:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**:
     - `https://your-app.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (for local dev)

---

## Part 5: Domain Setup (Optional)

### Using a Custom Domain

1. **Buy a domain** (Namecheap, GoDaddy, etc.)
2. **In Vercel:**
   - Go to **Settings** → **Domains**
   - Click **"Add Domain"**
   - Enter your domain (e.g., `rocksolidleads.com`)
   - Follow DNS configuration instructions
3. **Update environment variables:**
   - Change `NEXT_PUBLIC_APP_URL` to `https://yourdomain.com`
   - Redeploy
4. **Update Stripe webhook URL** to `https://yourdomain.com/api/webhooks/stripe`
5. **Update Supabase redirect URLs** to use your custom domain

---

## Multi-Owner Setup (For Partnerships)

If you're building this with a partner and want shared ownership:

### GitHub Organization (Recommended)

**Why:** Better than personal accounts for multi-owner projects

1. Create a new GitHub Organization (free):
   - [https://github.com/organizations/plan](https://github.com/organizations/plan)
   - Choose **"Create a free organization"**
2. Invite your partner as an **Owner**
3. Transfer the repo to the organization:
   - Go to repo **Settings** → **Danger Zone** → **Transfer ownership**

### Vercel Team

**Why:** Easy project transfers between accounts

1. Create a Vercel Team (free):
   - [https://vercel.com/teams/create](https://vercel.com/teams/create)
2. Invite your partner as **Member**
3. Transfer project to team:
   - Go to project **Settings** → **Transfer**

### Supabase Organization

**Why:** Shared database access, co-billing

1. Create a Supabase Organization:
   - [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Click profile icon → **"New Organization"**
2. Invite your partner:
   - Go to **Organization Settings** → **Members**
   - Add partner's email as **Owner** or **Admin**
3. Create your project INSIDE this organization

**Important:** If you already created a project, you can transfer it:
- Contact Supabase support to move the project to the new organization
- OR create a new project in the org and migrate data

---

## Troubleshooting

### Build fails with "Module not found"
- Run `npm install` in the `web/` directory
- Check that `web/package.json` exists
- Clear cache: `rm -rf .next && npm run dev`

### Database connection errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct (no trailing slash)
- Verify API keys are correct (no extra spaces)
- Check Supabase project status (not paused)

### Stripe webhook not working
- Verify `STRIPE_WEBHOOK_SECRET` is set in Vercel
- Check webhook endpoint URL matches your deployment URL
- Test webhook in Stripe Dashboard → Webhooks → "Send test webhook"

### Authentication redirect issues
- Verify redirect URLs in Supabase match your deployment URL
- Check `NEXT_PUBLIC_APP_URL` is set correctly in Vercel

---

## Database Credentials Reference

### When do I need each credential?

| Credential | Used For | Where |
|------------|----------|-------|
| **Project URL** | Next.js app connecting to Supabase | `.env.local` |
| **Anon Key** | Client-side queries (respects RLS) | `.env.local` |
| **Service Role Key** | Server-side admin operations (bypasses RLS) | `.env.local` (keep secret!) |
| **Database Password** | Direct PostgreSQL access (TablePlus, psql, migrations) | Not used in `.env.local` |

**Important:** The Next.js app does NOT use the database password. It only uses the URL + API keys.

---

## Quick Checklist

Before going live, verify:

- [ ] All migrations run successfully in Supabase
- [ ] `.env.local` has all required variables
- [ ] Local dev works (`npm run dev`)
- [ ] Code pushed to GitHub
- [ ] Vercel deployment successful
- [ ] All environment variables added to Vercel
- [ ] Stripe webhook configured and tested
- [ ] Supabase redirect URLs updated
- [ ] Custom domain configured (if applicable)
- [ ] Test user signup flow
- [ ] Test payment flow (use Stripe test cards)

---

## Support

If you run into issues:

1. Check the troubleshooting section above
2. Review error messages in Vercel deployment logs
3. Check Supabase logs for database errors
4. Contact Claude Code support or reference CLAUDE.md in the repo

---

**You're ready to deploy! 🚀**
