# BrandOps — Operator Training Sandbox

This is a sanitized copy of a real bloom build (BrandOps / 85 Supply) for operator training.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.local.example` to `.env.local` and fill in your credentials (or leave DEMO_MODE=true for demo data)

3. Start the dev server:
   ```bash
   cd web && npm run dev -- --port 3099
   ```

4. Open http://localhost:3099

## What's Inside

- Full bloom build with all pages, components, API routes
- Demo data that works without a database (DEMO_MODE=true)
- Intel files from a real client engagement (docs/intel/)
- Industry knowledge base (knowledge/)
- Supabase migrations (supabase/)

## Training Exercises

- Trace the data flow from a lead form to the dashboard
- Add a new feature using the feature-builder skill
- Run verify.sh and fix any issues
- Take headless Chrome screenshots of all pages
- Try flipping DEMO_MODE to false (you'll need real Supabase credentials)

## Port

Use port 3099 for the sandbox. This avoids conflicts with any live builds.
