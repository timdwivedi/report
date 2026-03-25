# Bloom Agentic Build Pipeline — Developer Guide

> **Last updated: Feb 11, 2026**
> Send this to any developer who needs to understand the system.

---

## What Is This?

A **fully automated AI build pipeline** that turns a client intake form into a working SaaS app.

One bash command. 9 AI agents. Zero manual coding for Phase 1.

```
Client fills out form → You run one command → AI builds the entire app → Deploys to Vercel → Client sees live demo
```

---

## Two Phases

### Phase 1: Showcase (Fully Automated)

**Time:** ~20-40 minutes
**Human effort:** Run one command, wait

The pipeline builds a complete frontend with:
- Branded landing page (9-section conversion formula)
- Login/signup pages
- Dashboard with sidebar navigation
- All feature pages with realistic mock data
- Mobile-responsive design
- Auto-deployed to Vercel with a live URL

Everything uses mock data. The app looks real, feels real, but doesn't have a real database yet. Think of it like a model home — the faucets look real but there's no plumbing behind them.

### Phase 2: Activate (Semi-Automated)

**Time:** Hours to days
**Human effort:** Developer + human verification at checkpoints

After the client approves the showcase, a developer opens the project and says **"Activate"** in Claude Code (or any AI IDE). The Activator Agent reads the implementation plan and builds real database, auth, payments, and live data — pausing at checkpoints for human verification.

---

## Build Modes

### Default: All Opus, No Teams

```bash
bash bloom/scripts/ops/agentic-build.sh <submission-id>
```

All 9 agents run on **Opus**. Spec Agent is always Opus (never changes). Teams mode OFF. This is the recommended configuration — maximum quality, straightforward execution.

### All Sonnet (Budget Mode)

```bash
bash bloom/scripts/ops/agentic-build.sh <submission-id> --model sonnet
```

All agents run on **Sonnet** except the Spec Agent (always Opus). Teams auto-disabled. Cheapest and fastest, but lower quality output.

### Opus + Teams (Experimental)

```bash
bash bloom/scripts/ops/agentic-build.sh <submission-id> --experimental-teams
```

All agents on Opus, plus experimental team features:
- **Agent 4 splits into 3 sub-agents** with file-lock coordination (each claims pages to avoid conflicts)
- **Welder uses oracle loop** — runs `npm run build`, captures errors, scales 1-3 welders based on error count, up to 3 passes
- **Pre-computed context** — each agent gets only its relevant section (~84K token savings)

### Hybrid Teams (Sonnet Builders + Opus QC)

```bash
bash bloom/scripts/ops/agentic-build.sh <submission-id> --model sonnet --qc-model opus --experimental-teams
```

Builders 1-3 on Sonnet (follow spec), Agent 4 team + QC agents on Opus (need reasoning). Most cost-efficient teams mode.

### Full Mode Matrix

| Command | Builders (1-3) | Agent 4 | Spec | QC (Welder/Closer/Debrief) | Teams |
|---------|---------------|---------|------|---------------------------|-------|
| `<id>` (default) | opus | opus | **opus** | opus | OFF |
| `<id> --model sonnet` | sonnet | sonnet | **opus** | sonnet | OFF |
| `<id> --experimental-teams` | opus | opus (team) | **opus** | opus | ON |
| `<id> --model sonnet --qc-model opus --experimental-teams` | sonnet | opus (team) | **opus** | opus | ON |

**Spec Agent is ALWAYS Opus.** It writes the master blueprint that all other agents follow. Bad spec = bad app.

### All Options

```bash
bash bloom/scripts/ops/agentic-build.sh <submission-id> \
  --output ~/Desktop/my-build      # Custom output directory
  --model opus                      # Model for builder agents (default: opus)
  --qc-model opus                   # Model for QC agents (default: opus)
  --experimental-teams              # Enable teams mode (Agent 4 split + Welder oracle)
  --no-teams                        # Explicitly disable teams
  --agent5-delay 600                # Seconds before Welder starts (default: 600)
  --skip-spec                       # Use cached spec (must exist from previous build)
  --dry-run                         # Preview without executing
```

---

## Prerequisites

| Tool | Install | Why |
|------|---------|-----|
| Claude Code CLI | `npm install -g @anthropic-ai/claude-code` | Runs the AI agents |
| Claude Max plan | $200/month at anthropic.com | $0 per-token cost for unlimited agent usage |
| Node.js + npm | [nodejs.org](https://nodejs.org/) | Builds the Next.js app |
| Python 3 | `brew install python3` | Post-build cleanup scripts |
| jq | `brew install jq` | JSON processing |
| GitHub CLI | `brew install gh` | Auto-deploy to GitHub |
| Vercel CLI | `npm install -g vercel` | Auto-deploy to Vercel |

### Environment Variables

In `web/.env.local`:

```bash
# Required — Supabase (fetches intake form data)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional — Auto-deploy (skip if you want local-only builds)
BLOOM_GITHUB_ORG=your-github-org
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id    # optional
```

---

## What Happens When You Run the Command

```
┌─────────────────────────────────────────────────────────────┐
│                    THE BUILD PIPELINE                         │
│                                                               │
│  STEP 1: Load credentials from web/.env.local                │
│  STEP 2: Fetch client intake data from Supabase              │
│  STEP 2b: Download uploaded assets (logos, docs)             │
│  STEP 2c: Query past build debriefs (cross-build learning)   │
│                                                               │
│  ── SEQUENTIAL INTELLIGENCE ──────────────────────────────   │
│                                                               │
│  STEP 3a: Agent -1 (The Scout)                               │
│           Scrapes competitor + client websites                │
│           → docs/founder/competitor_intel.md                  │
│           → docs/founder/client_site_audit.md                │
│                                                               │
│  STEP 3b: Agent 0 (Enhancement Engine)                       │
│           Transforms raw intake into business intelligence    │
│           With Zone Questions + Self-Validation Gates         │
│           → .bloom-enhanced-data.json                         │
│           → docs/founder/enhanced_brief.md                   │
│                                                               │
│  STEP 3c: Spec Agent (ALWAYS Opus)                           │
│           Generates full project specification                │
│           With Atomic Task Breakdown + Validation Gates       │
│           → docs/roadmap/01_project_spec.md                  │
│                                                               │
│  STEP 4:  Validation gates (soft — warns, doesn't block)    │
│  STEP 5a: Injects app brief into QUICK_START_AGENTS.md       │
│  STEP 5b: npm install                                        │
│  STEP 5c: Pull learnings from Supabase into agent memory     │
│  STEP 5d: Pre-compute agent contexts (teams mode only)       │
│                                                               │
│  ── PARALLEL BUILD ───────────────────────────────────────   │
│                                                               │
│  STEP 6:  4 agents launch simultaneously:                    │
│           Agent 1 (Blueprint) → types, mock data, DB schema  │
│           Agent 2 (Brand)     → landing page, colors, fonts  │
│           Agent 3 (Shell)     → dashboard, sidebar, nav      │
│           Agent 4 (Pages)     → all feature pages            │
│           [Teams: Agent 4 splits into 3 sub-agents]          │
│                                                               │
│  STEP 7:  Wait for all 4 (live status in terminal)           │
│                                                               │
│  ── SEQUENTIAL FINISHING ─────────────────────────────────   │
│                                                               │
│  STEP 8:  Agent 5 (The Welder)                               │
│           Wires everything together, gets npm run build       │
│           passing with zero errors                            │
│           [Teams: Oracle loop — build→fix→build, up to 3x]  │
│                                                               │
│  STEP 9:  Agent 6 (The Closer)                               │
│           QC review, build summary, implementation plan       │
│           → docs/roadmap/02_build_summary.md                 │
│           → docs/roadmap/03_implementation_plan.md           │
│                                                               │
│  STEP 10: verify.sh                                          │
│  STEP 10b: Agent 7 (Auto-Debrief)                            │
│            Reads all logs, generates intelligence report      │
│            → BUILD_DEBRIEF.md                                │
│            → .bloom-debrief-data.json                        │
│                                                               │
│  ── LEARNING FEEDBACK LOOP ──────────────────────────────   │
│                                                               │
│  STEP 10c: Push per-agent learnings to Supabase              │
│            (bloom_agent_learnings table, 3x retry)           │
│  STEP 10d: Apply learnings to scaffold files                 │
│            (bloom/.claude/skills/agent-N/memory/learnings.md)│
│                                                               │
│  ── DEPLOY ───────────────────────────────────────────────   │
│                                                               │
│  STEP 11a: Push to GitHub (FULL version)                     │
│  STEP 11b: Auto-Package (strip SOPs from local copy)         │
│  STEP 11c: Deploy CLEAN version to Vercel                    │
│  STEP 11d: Save demo URL + debrief to Supabase              │
│                                                               │
│  OUTPUT: Live demo URL + GitHub repo + build intelligence    │
└─────────────────────────────────────────────────────────────┘
```

---

## The 9 Agents

| # | Name | Model | What It Does | Sequential or Parallel |
|---|------|-------|-------------|----------------------|
| -1 | **The Scout** | QC_MODEL | Scrapes competitor and client websites. Writes intel reports to `docs/founder/`. | Sequential (runs first) |
| 0 | **Enhancement Engine** | QC_MODEL | Takes raw intake data and transforms it into rich business intelligence. Includes Zone Questions and Self-Validation Gates. | Sequential |
| — | **Spec Agent** | **Always Opus** | Reads all intel + enhanced data. Generates complete project spec with atomic task breakdown and validation gates. | Sequential |
| 1 | **Blueprint** | AGENT_MODEL | Creates TypeScript types, mock data, DB schema, constants. | **Parallel** (with 2, 3, 4) |
| 2 | **Brand** | AGENT_MODEL | Builds landing page, defines colors/fonts in tailwind config, creates marketing sections. | **Parallel** |
| 3 | **Shell** | AGENT_MODEL | Creates dashboard layout, sidebar, navigation, auth pages (login/signup). | **Parallel** |
| 4 | **Pages** | AGENT_MODEL (or QC_MODEL in teams) | Builds all feature pages. In teams mode, splits into 3 sub-agents with file-lock coordination. | **Parallel** |
| 5 | **The Welder** | QC_MODEL | Wires everything together. Fixes imports, types, "use client" directives. In teams mode, uses oracle loop (build→fix→build, up to 3 passes). | Sequential (after 1-4) |
| 6 | **The Closer** | QC_MODEL | QC review. Checks accessibility, performance, SEO. Writes build summary + implementation plan. | Sequential (after 5) |
| 7 | **Auto-Debrief** | QC_MODEL | Reads all agent logs. Generates structured build intelligence report with per-agent learnings. | Sequential (after 6) |

---

## Cross-Build Learning System

The pipeline has a **dual feedback loop** — local files + Supabase database:

### How It Works

1. **Debrief extracts learnings** — Agent 7 reads all agent logs and identifies errors, patterns, and optimizations per agent
2. **Push to Supabase** — Learnings are INSERTed into `bloom_agent_learnings` table (with 3x retry on failure)
3. **Apply to scaffold** — Learnings are appended to each agent's `memory/learnings.md` file in the scaffold
4. **Pull on next build** — Before launching agents, the pipeline queries the last 15 learnings per agent from Supabase and injects them into the build directory

### Per-Agent Memory Files

Each agent has accumulated learnings in the scaffold:

```
bloom/.claude/skills/agent-1-blueprint/memory/learnings.md
bloom/.claude/skills/agent-2-brand/memory/learnings.md
bloom/.claude/skills/agent-3-shell/memory/learnings.md
bloom/.claude/skills/agent-4-pages/memory/learnings.md
bloom/.claude/skills/agent-5-welder/memory/learnings.md
bloom/.claude/skills/agent-6-closer/memory/learnings.md
```

These grow over time as the pipeline learns from each build. The system gets smarter with every run.

### Supabase Table

```sql
-- Migration 197: bloom_agent_learnings
CREATE TABLE bloom_agent_learnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_number INT NOT NULL CHECK (agent_number BETWEEN 1 AND 6),
    learning_type TEXT NOT NULL CHECK (learning_type IN ('error', 'pattern', 'optimization')),
    description TEXT NOT NULL,
    lesson TEXT NOT NULL,
    prevention TEXT,
    source_build TEXT NOT NULL,
    submission_id UUID REFERENCES bloom_submissions(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Quality Gates

The pipeline has soft validation gates between phases. They **log warnings** but **never block** the build (no human interaction required):

| Gate | When | What It Checks |
|------|------|---------------|
| **Post-Enhancement** | After Agent 0 | Zone analysis fields, persona specificity, feature count |
| **Post-Spec** | After Spec Agent | Required sections, line count, hex codes, vague language |
| **Pre-Welder** | Before Agent 5 | Agent output directories exist, .tsx file count, landing page |

Gate pass/fail rates are tracked in the debrief for cross-build improvement.

---

## Experimental: Teams Mode

Enable with `--experimental-teams`. Three features:

### 1. Pre-Computed Agent Context

Instead of each agent reading the full `QUICK_START_AGENTS.md` (16K tokens), each agent gets only its relevant section + inlined learnings. Saves ~84K tokens per build.

### 2. Agent 4 Page Team

Agent 4 (Pages) splits into 3 sub-agents that build different pages simultaneously. They coordinate via lock files in `.building/` directory:
- Before building a page, create `.building/page-name.lock`
- If lock exists, skip that page (another agent is building it)
- Lock files are cleaned up between passes

### 3. Welder Oracle Loop

Instead of one Welder pass, the oracle loop:
1. Runs `npm run build`, captures errors
2. Scales welders: 1 for ≤5 errors, 2 for 6-15, 3 for 16+
3. Welders coordinate via `.welder-claims-N/` lock files
4. Repeats up to 3 passes until build passes
5. Lock files cleaned at start of each pass (prevents stale claims from crashed agents)

---

## Self-Correction Skill

The pipeline includes a systematic debugging methodology (in `bloom/.claude/skills/self-correction/SKILL.md`):

- **4-Phase Debug Process**: Root Cause Investigation → Pattern Analysis → Hypothesis Testing → Implementation
- **Iron Law**: No fixes without root cause investigation first
- **3-Fix Rule**: If 3+ fixes fail, question the architecture — don't attempt fix #4
- **Skill Annealing**: After fixing a bug, extract the lesson and add it to the relevant agent's `memory/learnings.md`
- **Rationalization Prevention**: Common excuses mapped to correct behavior

---

## Key Files in the Pipeline Repo

| File | What It Does |
|------|-------------|
| `bloom/scripts/ops/agentic-build.sh` | **The main script** — runs all 9 agents end-to-end |
| `bloom/scripts/ops/build-daemon.sh` | Polls Supabase for queued builds, runs them sequentially |
| `bloom/docs/QUICK_START_AGENTS.md` | Detailed agent instructions (injected into each build) |
| `bloom/docs/LAUNCH_GUIDE.md` | 10-phase post-build deployment guide |
| `bloom/docs/SAAS_DESIGN_SYSTEM.md` | Design system for landing pages |
| `bloom/docs/DEVELOPER_GUIDE.md` | This file |
| `bloom/.claude/skills/self-correction/SKILL.md` | Systematic debugging methodology |
| `bloom/.claude/skills/agent-N-*/memory/learnings.md` | Per-agent accumulated learnings |
| `web/scripts/ops/activate-client.ts` | Phase 2 activator script (lives in web/, safe from build cleanup) |
| `web/lib/bloom/bloom-build-generator.ts` | Scaffold generator (creates starter project) |
| `web/.env.local` | Supabase creds + GitHub org + Vercel token |

---

## Output Directory Structure

```
~/Desktop/bloom-builds/company-name/
├── web/                              # Full Next.js 14 app (App Router)
│   ├── app/                          # Pages
│   │   ├── page.tsx                  # Landing page
│   │   ├── login/page.tsx            # Login
│   │   ├── signup/page.tsx           # Signup
│   │   └── dashboard/               # Dashboard + feature pages
│   ├── components/                   # All UI components
│   │   ├── landing/                  # Landing page sections
│   │   ├── dashboard/               # Dashboard components
│   │   └── shared/                  # Shared/reusable components
│   ├── lib/                          # Business logic
│   │   ├── types/                   # TypeScript interfaces
│   │   ├── constants/               # Mock data
│   │   ├── supabase.ts              # DB client (demo mode)
│   │   └── utils.ts                 # Helpers
│   ├── tailwind.config.ts           # Brand colors, fonts
│   ├── package.json                 # Dependencies
│   └── tsconfig.json                # TypeScript config
│
├── docs/
│   ├── QUICK_START_AGENTS.md        # Full agent instructions
│   ├── LAUNCH_GUIDE.md              # 10-phase deployment guide
│   ├── SAAS_DESIGN_SYSTEM.md        # Design system reference
│   ├── roadmap/
│   │   ├── 01_project_spec.md       # AI-generated project spec
│   │   ├── 02_build_summary.md      # What was built + QC findings
│   │   └── 03_implementation_plan.md # Production expansion roadmap
│   └── founder/                     # Client assets + AI intel reports
│       ├── competitor_intel.md      # Competitor analysis
│       ├── client_site_audit.md     # Client website audit
│       └── enhanced_brief.md        # Enhanced business brief
│
├── .claude/skills/                  # Agent skill files + learnings
├── BUILD_DEBRIEF.md                 # Auto-generated build intelligence
├── CLAUDE.md                        # AI project context
├── verify.sh                        # Build verification script
└── supabase/migrations/             # DB migration SQL files
```

---

## Auto-Package: GitHub vs Vercel

The pipeline deploys two different versions:

| Where | What's Included | Why |
|-------|----------------|-----|
| **GitHub** | EVERYTHING — all docs, agent instructions, Activate trigger, build logs, SOPs | The developer needs these for Phase 2 (Activate) |
| **Vercel** | CLEAN version — no internal docs, no agent instructions, no operator SOPs | The client sees this URL. No internal stuff exposed. |

**What gets stripped before Vercel deploy:**
- `docs/QUICK_START_AGENTS.md`, `LAUNCH_GUIDE.md`, `SAAS_DESIGN_SYSTEM.md`, `DEVELOPER_GUIDE.md`
- All `.bloom-*.json`, `.bloom-*.md`, `agent-*.log` files
- Agent directives from the project spec
- Agent System + Activate sections from CLAUDE.md
- The `.claude/skills/scaffold-setup` directory

---

## Operator Notes (Steering the Build)

The `operator_notes` field in `bloom_submissions` is a text field where you can write strategic directives for the build. Every agent reads these notes.

Examples:
- "This client needs a quiz funnel as the main feature, not a dashboard"
- "Focus on the webinar registration page — that's their primary conversion"
- "Use dark theme, the client hates light mode"
- "Include a ROI calculator at /tools/roi-calculator"

These notes override default assumptions. The agents treat them as non-negotiable instructions.

---

## Phase 2: Activate (Production Build)

After the client approves the showcase and you've refined the implementation plan together:

### Prerequisites
1. Phase 1 build complete (demo is live)
2. `docs/roadmap/03_implementation_plan.md` refined and approved by client
3. Supabase project created, Stripe account set up (if needed)
4. Environment variables in `web/.env.local`

### How to Run
1. Clone the GitHub repo (full version, not the Vercel-stripped one)
2. Open it in Claude Code, Antigravity, or any AI IDE
3. Say **"Activate"**

**Note:** The activator script lives at `web/scripts/ops/activate-client.ts` — in the `web/` directory, NOT `bloom/`. It's safe from build cleanup.

### What Happens
The Activator Agent reads the implementation plan and works through 4 phases sequentially, pausing at checkpoints:

| Phase | What It Does | Checkpoint |
|-------|-------------|-----------|
| **A: Foundation** | Database migrations, auth setup, Supabase client helpers | "Run migrations, verify auth works" |
| **B: Core Features** | Replace mock data with real Supabase queries, create hooks | "Start dev server, verify data loads" |
| **C: Payments** | Stripe checkout, webhook handler, billing page | "Create Stripe products, test checkout" |
| **D: Polish** | SEO, email templates, final verify, deploy | "Run verify.sh, check production" |

The Activator will NOT proceed past a checkpoint until the human confirms everything works.

---

## Troubleshooting

### Build failed — how to re-run specific agents

```bash
# Re-run just the Welder (fixes imports, types, build errors)
cd ~/Desktop/bloom-builds/company-name
claude --model opus -p "Agent 5" --allowedTools "Read,Write,Edit,Glob,Grep,Bash"

# Re-run just the Closer (QC + implementation plan)
cd ~/Desktop/bloom-builds/company-name
claude --model opus -p "Agent 6" --allowedTools "Read,Write,Edit,Glob,Grep,Bash"
```

### Common issues

| Issue | Fix |
|-------|-----|
| "Missing SUPABASE_URL" | Check `web/.env.local` exists and has the right keys |
| "Submission not found" | Verify the UUID in Admin Panel → Bloom Builds |
| "npm install failed" | Check internet connection; the pipeline now exits early on npm failure |
| Agent hangs | Claude Max may be rate-limited. Wait a few minutes, re-run. |
| `npm run build` fails | Re-run Agent 5 (Welder) — it fixes build errors |
| Vercel deploy fails | Check `VERCEL_TOKEN` is valid: `vercel whoami --token=YOUR_TOKEN` |
| GitHub push fails | Check `gh auth status` — may need to re-authenticate |
| "--skip-spec but no cached spec" | Run once without `--skip-spec` first to generate a spec |
| Learnings push fails | Auto-retries 3x with 2s backoff. Check Supabase is reachable. |

### Logs

Every agent writes its own log file:

```
agent-neg1-scout.log         # Agent -1: Scout
agent-0-enhance.log          # Agent 0: Enhancement
agent-1.log                  # Agent 1: Blueprint
agent-2.log                  # Agent 2: Brand
agent-3.log                  # Agent 3: Shell
agent-4.log                  # Agent 4: Pages (or merged team logs)
agent-5-welder.log           # Agent 5: Welder (or merged oracle pass logs)
agent-6-closer.log           # Agent 6: Closer
agent-7-debrief.log          # Agent 7: Auto-Debrief
bloom-build.log              # Master pipeline log
welder-build-pass-N.log      # Teams: per-pass build output
agent-5-welder-passN-M.log   # Teams: per-welder per-pass logs
```

---

## Resilience & Error Handling

| Feature | How |
|---------|-----|
| **Curl timeouts** | All API calls: 15s, asset downloads: 30s. No more infinite hangs. |
| **npm install guard** | Pipeline exits immediately if `npm install` fails. |
| **--skip-spec guard** | Exits if no cached spec exists. |
| **Dependency check** | Validates `claude`, `jq`, `curl`, `npm`, `python3` before starting. |
| **Learning retry** | Supabase learning pushes retry 3x with 2s backoff. |
| **Lock file cleanup** | Welder oracle clears stale lock files at start of each pass. |
| **Soft quality gates** | Validation between phases — logs warnings, never blocks. |

---

## Tech Stack (What Gets Built)

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS (custom theme per client)
- **Database**: Supabase (PostgreSQL + Auth + RLS) — mock in Phase 1, real in Phase 2
- **Payments**: Stripe — added in Phase 2 (Activate)
- **Hosting**: Vercel (auto-deployed)
- **AI**: Claude Code CLI on Claude Max plan ($0 per-token)
