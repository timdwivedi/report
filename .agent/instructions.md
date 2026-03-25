# Project Instructions

> **For Antigravity IDE users.** This file provides context for AI assistants (Claude, Gemini, etc.)
> **All skill definitions, learnings, and sub-agents are in the `.claude/` folder.** Read them when triggered.

<!-- ONBOARDING_START - Remove this entire block after setup is complete -->
---

## First Run Detected

**AI Assistant: When you see this section, IMMEDIATELY do the following:**

Read the setup guide at `.claude/skills/scaffold-setup/SKILL.md` and follow it step by step. It contains the full guided setup flow written for beginners.

If you cannot read that file, ask the user:

> "I notice this project hasn't been set up yet. Would you like me to guide you through the initial configuration? This includes naming your project, setting up your database, and configuring payments. Just say 'yes' or 'setup project' to begin."

**Do NOT proceed with other tasks until the user either:**
1. Completes the setup
2. Explicitly says they want to skip it

**After setup is complete, this entire onboarding section will be removed automatically.**

---
<!-- ONBOARDING_END -->

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Payments**: Stripe
- **AI**: Anthropic Claude, OpenAI, Google Gemini
- **Deploy**: Vercel

---

## Project Structure

```
project/
├── .agent/               # Antigravity IDE config (this file)
├── .claude/              # Skills, learnings, and sub-agents
│   ├── skills/           # READ THESE when skills are triggered
│   │   ├── scaffold-setup/
│   │   │   ├── SKILL.md           # Guided setup flow (for beginners)
│   │   │   └── memory/learnings.md # Setup lessons learned
│   │   ├── feature-builder/
│   │   │   ├── SKILL.md           # 7-step feature implementation
│   │   │   └── memory/learnings.md # Feature building lessons
│   │   ├── product-lifecycle/
│   │   │   ├── SKILL.md           # B.L.A.S.T. gated build workflow
│   │   │   └── memory/learnings.md # Product build lessons
│   │   ├── action-plan/
│   │   │   ├── SKILL.md           # Business action plan generator
│   │   │   └── memory/learnings.md # Action plan lessons
│   │   ├── strategy-brief/
│   │   │   ├── SKILL.md           # Strategy documentation generator
│   │   │   └── memory/learnings.md # Strategy lessons
│   │   └── self-correction/
│   │       ├── SKILL.md           # Bug-fixing protocol
│   │       └── memory/learnings.md # Debugging lessons
│   └── sub-agents/
│       ├── code-reviewer.md       # Objective code review
│       └── migration-validator.md # SQL migration safety check
├── docs/
│   ├── CLAUDE.md         # Detailed project context & patterns
│   └── roadmap/          # Feature specs & project brief
├── web/                  # Next.js application
├── supabase/migrations/  # SQL migration files
└── scripts/              # Operational scripts
```

---

## Skills (Master Reference)

**CRITICAL INSTRUCTION: When the user says ANY of the trigger phrases below, you MUST:**
1. **Read** the skill file at the path listed below
2. **Read** the memory/learnings file in the same skill folder
3. **Follow** the skill's instructions step by step -- do NOT improvise

| Trigger Phrases | Skill File to Read |
|-----------------|-------------------|
| "setup project", "get started", "first time setup" | `.claude/skills/scaffold-setup/SKILL.md` |
| "add feature", "build feature", "implement [name]" | `.claude/skills/feature-builder/SKILL.md` |
| "build product", "B.L.A.S.T.", "gated build" | `.claude/skills/product-lifecycle/SKILL.md` |
| "create action plan", "what do I do now" | `.claude/skills/action-plan/SKILL.md` |
| "create strategy", "strategic analysis" | `.claude/skills/strategy-brief/SKILL.md` |
| "dark theme", "light theme", "dark UI", "premium dark", "alchemy", "skeleton loading", "form inputs", "toast", "empty state", "modal", "data viz", "micro-interactions" | `.claude/skills/alchemy-dark-theme/SKILL.md` |
| "review code", "code review" | `.claude/sub-agents/code-reviewer.md` |
| "validate migration", "check migration" | `.claude/sub-agents/migration-validator.md` |

**The skill files contain complete workflows, templates, tone instructions, and rules.** They are the source of truth for how to handle these tasks.

**The memory/learnings files contain lessons from past builds.** Reading them prevents repeating known mistakes.

---

## Parallel Build Agents (Speed Build)

**When the user says "Agent 1", "Agent 2", "Agent 3", "Agent 4", or "Agent 5", you MUST:**

1. **Read** `docs/QUICK_START_AGENTS.md`
2. **Read the App Brief** section at the top of that document -- this tells you what app to build
3. **Find YOUR agent section** (matching the number the user said)
4. **Execute** those instructions exactly

If the App Brief says "STATUS: NOT YET CONFIGURED", tell the user:
> "The app hasn't been set up yet. In your first window, say 'setup project' or 'get started' to describe your app. Once that's done, come back here and say 'Agent [number]' again."

Each agent owns specific files. DO NOT touch files outside your assigned lane.

| Trigger | What It Does |
|---------|-------------|
| **Agent 1** | Builds types, mock data, DB schema, project spec |
| **Agent 2** | Builds landing page, brand colors, marketing sections |
| **Agent 3** | Builds dashboard layout, sidebar, nav, auth pages |
| **Agent 4** | Builds all feature pages with stats, tables, cards |
| **Agent 5** | Fixes imports, stubs APIs, runs verify.sh (start this one last) |

---

## Critical Rules

### 1. React State Law
In async functions, **pass values explicitly** instead of reading state.
```typescript
// BAD: saveToDb(name);  // Stale closure
// GOOD: const newName = "x"; setName(newName); saveToDb(newName);
```

### 2. Migration First Law
**NEVER** write `select("new_column")` before migration runs in Supabase.

### 3. RLS Always Law
All tables have Row-Level Security. Use correct client:
- `createClient()` → Browser, respects RLS
- `createAdminClient()` → Server, bypasses RLS (verify auth first!)

### 4. API Gateway Law
All mutations with side effects MUST go through API routes.
```typescript
// BAD: await supabase.from("table").update(...)
// GOOD: await fetch(`/api/resource/${id}`, { method: 'PATCH', ... })
```

### 5. Tailwind JIT Law
**NEVER** use dynamic string interpolation for Tailwind classes.
```typescript
// BAD: className={`bg-${color}-500`}
// GOOD: const classes = { sky: 'bg-sky-500' }; className={classes[color]}
```

### 6. Zod Validation Law
All API inputs must be validated with Zod schemas.

### 7. Clean Console Law
Remove all debug console.log statements before committing.

---

## Common Commands

```bash
cd web
npm run dev           # Start dev server
npm run build         # Production build
npm run check         # TypeScript check
npm run lint          # ESLint
./verify.sh           # Pre-deploy verification
```

---

## Adding Features

**Preferred method:** Say "add feature [description]" or "build [feature name]" and the AI will read the feature-builder skill and follow its step-by-step process.

**Manual method:**
1. Create roadmap file: `docs/roadmap/XX_feature_name.md` (scan folder for next number)
2. Add migration: `supabase/migrations/XXX_description.sql`
3. Create API route: `web/app/api/feature/route.ts`
4. Add components: `web/components/feature/`
5. Create page: `web/app/feature/page.tsx`
6. Run `./verify.sh` before committing

---

## Reference Files

| File | When to Read |
|------|--------------|
| `docs/CLAUDE.md` | Full project context, patterns, all domain laws |
| `docs/roadmap/00_PROJECT_BRIEF.md` | What this app is, who it's for (created during setup) |
| `.claude/skills/<skill>/SKILL.md` | **When skill is triggered** -- contains full workflow |
| `.claude/skills/<skill>/memory/learnings.md` | **Before executing any skill** -- lessons from past builds |
| `supabase/migrations/README.md` | Database migration guide |

---

## Bug Fixing

When fixing bugs, read `.claude/skills/self-correction/SKILL.md` first. It contains the debugging protocol and common patterns.

Key rule: **Never stop at the first fix.** Trace the complete data flow:
```
Component → Hook → API → Database → Response → State → Render
```

---

## Customization

After initial setup, you can further customize:

1. **Add domain-specific skills**: Create new folders in `.claude/skills/` with a `SKILL.md`
2. **Update conventions**: Edit `docs/CLAUDE.md` with your project patterns
3. **Log learnings**: When bugs are fixed, add lessons to the relevant `memory/learnings.md`
4. **Add features**: Say "build [feature name]" for guided implementation
