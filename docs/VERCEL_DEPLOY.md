# Vercel Deployment — Bloom Builds

> **Auto-configured in agentic-build.sh** — No manual setup needed for new builds.

---

## Environment Variables (web/.env.local)

All Vercel deployment settings are configured in `web/.env.local`:

```bash
# Required for Vercel auto-deploy
BLOOM_GITHUB_ORG=bloom-builds                           # GitHub org for demo repos
BLOOM_GIT_EMAIL=vitaliysheremet7@gmail.com              # Git author email (must match Vercel team)
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=team_2LqQ5PfSTdaDdIN6P2868epx            # Vitaliy's Projects team
```

### How to Get These Values

| Variable | Where to Find |
|----------|---------------|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) → Create Token |
| `VERCEL_ORG_ID` | Vercel Team Settings → General → Team ID |
| `BLOOM_GIT_EMAIL` | Must match the email on your Vercel account |

---

## What the Pipeline Does (agentic-build.sh)

**Automatic deployment flow:**

1. **Git init** — Initializes git repo in output directory
2. **Set git config** — Uses `BLOOM_GIT_EMAIL` (prevents "Git author must have access" errors)
3. **Create vercel.json** — Configures Next.js build (monorepo at `/web`)
4. **Deploy to Vercel** — Runs `vercel --prod` with team scope
5. **Extract URL** — Pulls production URL from Vercel output

**Generated vercel.json:**
```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "cd web && next build",
  "outputDirectory": "web/.next"
}
```

---

## Manual Deployment (If Pipeline Fails)

If you need to manually deploy a Bloom build:

```bash
# 1. Navigate to build directory
cd /Users/vit10081/Desktop/bloom-builds/{project-slug}

# 2. Ensure git config is set (critical!)
git config user.email "vitaliysheremet7@gmail.com"
git config user.name "Vitaliy S"

# 3. Commit if needed
git add -A
git commit -m "feat: Manual deploy"

# 4. Deploy to Vercel
vercel --prod
```

**Common errors:**

| Error | Fix |
|-------|-----|
| `Git author ... must have access to the team` | Run: `git config user.email "vitaliysheremet7@gmail.com"` then `git commit --amend --reset-author --no-edit && git push --force` |
| `No vercel.json found` | The pipeline auto-creates this. For manual: copy from another build or use the template above. |
| `Build failed: Cannot find web/` | Check `vercel.json` has correct `buildCommand: "cd web && next build"` |

---

## Vercel Project Structure

Each Bloom build gets:
- **GitHub repo**: `bloom-builds/{company-slug}` (auto-created by pipeline)
- **Vercel project**: Auto-linked on first deploy
- **Production URL**: `{random-hash}.vercel.app` (can set custom domain later)

**Project settings** are stored in `.vercel/project.json`:
```json
{
  "projectId": "prj_...",
  "orgId": "team_2LqQ5PfSTdaDdIN6P2868epx"
}
```

---

## Troubleshooting

### Build passes locally but fails on Vercel

**Cause:** Vercel runs `npm run build` at root, but Next.js is in `/web`.

**Fix:** Check `vercel.json` has:
```json
{
  "buildCommand": "cd web && next build"
}
```

### "This project is already linked to Vercel"

**Cause:** `.vercel/` directory exists but project was deleted.

**Fix:**
```bash
rm -rf .vercel
vercel --prod  # Re-link
```

### Multiple deployments showing as "Error" in Vercel dashboard

**Cause:** Previous deploys failed during rate-limited builds.

**Effect:** Harmless. The latest successful deploy is what's live. Old failed deploys can be ignored or deleted from Vercel dashboard.

---

## Future: Custom Domains

Once a client wants a custom domain:

1. **Vercel Dashboard** → Project → Settings → Domains
2. Add domain: `app.clientname.com`
3. Set DNS records (Vercel provides instructions)
4. SSL auto-provisions

**Current status:** All Bloom builds use auto-generated `.vercel.app` URLs.

---

## Deployment Checklist (For Manual QA)

- [ ] `vercel.json` exists at project root
- [ ] `buildCommand` includes `cd web &&`
- [ ] Git author email matches Vercel team: `vitaliysheremet7@gmail.com`
- [ ] `.vercel/project.json` has correct `projectId` and `orgId`
- [ ] Latest commit is pushed to GitHub
- [ ] `vercel --prod` runs without errors
- [ ] Production URL loads all pages (test at least `/`, `/login`, `/dashboard`)

---

## Pipeline Integration

The deployment happens in **Agent 7 (Publisher)** of `agentic-build.sh`. Controlled by:

```bash
SHOULD_DEPLOY=true  # Set to true to auto-deploy after build
```

**Exit criteria for Agent 7:**
- ✅ GitHub repo created
- ✅ Vercel deployment succeeded
- ✅ Production URL extracted and logged

If deployment fails, the build still completes — deployment is optional.
