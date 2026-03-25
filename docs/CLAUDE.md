# Project Context - Detailed Reference

> **Detailed reference.** For quick start, see root `CLAUDE.md`.

## Overview

A SaaS application built with Next.js 14, React 18, TypeScript, Supabase, and Stripe. This document provides detailed context for AI assistants working on the codebase.

---

## Reference Files

| File | When to Read |
|------|--------------|
| `CLAUDE.md` (root) | Quick start, critical laws, commands |
| `.claude/skills/self-correction.md` | Bug-fixing protocol |
| `.claude/skills/scaffold-setup.md` | Initial project setup |
| `.claude/skills/feature-builder.md` | Adding new features |
| `.claude/sub-agents/code-reviewer.md` | Code review patterns |
| `.claude/sub-agents/migration-validator.md` | SQL migration safety |
| `docs/roadmap/00_README.md` | Feature planning template |
| `supabase/migrations/README.md` | Database migration guide |

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI primitives
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **AI**: Anthropic Claude, OpenAI, Google Gemini
- **Email**: Resend, Nodemailer
- **Deployment**: Vercel

---

## Project Structure

```
project/
├── .claude/              # AI assistant configuration
│   ├── skills/           # Reusable skill definitions
│   ├── sub-agents/       # Specialized review agents
│   └── settings.local.json
├── docs/
│   ├── roadmap/          # Feature specs & implementation plans
│   └── CLAUDE.md         # This file (detailed context)
├── web/                  # Next.js application
│   ├── app/              # App Router pages & API routes
│   ├── components/       # React components
│   ├── lib/              # Utilities & business logic
│   └── public/           # Static assets
├── supabase/
│   └── migrations/       # SQL migration files
├── scripts/              # Operational scripts
└── CLAUDE.md             # Quick reference (root)
```

## Key Conventions

### File Naming
- Components: PascalCase (`MyComponent.tsx`)
- Utilities: camelCase (`myUtility.ts`)
- Routes: kebab-case (`/my-route`)

### Database
- All tables have Row-Level Security (RLS) enabled
- Multi-tenant via `organizations` table
- User-scoped data via `user_id` or `org_id` columns

### Authentication
- Cookie-based sessions via Supabase SSR
- Use `createClient()` for browser components
- Use `createAdminClient()` for server-side with service role

### API Routes
- Located in `web/app/api/`
- Use typed responses
- Always validate inputs with Zod

## Common Patterns

### Fetching Data (Client)
```typescript
const supabase = createClient()
const { data, error } = await supabase.from('table').select('*')
```

### Fetching Data (Server with RLS bypass)
```typescript
const supabase = createAdminClient()
const { data } = await supabase.from('table').select('*')
```

### Protected API Route
```typescript
export async function GET(request: Request) {
  const supabase = createAdminClient()
  const authHeader = request.headers.get('Authorization')
  // Validate user...
  return NextResponse.json({ data })
}
```

## Development Commands

```bash
cd web
npm run dev      # Start dev server
npm run build    # Production build
npm run check    # TypeScript check
npm run lint     # ESLint
```

## Environment Variables

See `.env.local.example` for required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `ANTHROPIC_API_KEY`
- etc.

## Roadmap

Implementation plans are documented in `docs/roadmap/`. Each feature has:
- Overview & objectives
- Technical approach
- Database changes
- API endpoints
- UI components

## Self-Annealing

When fixing bugs or implementing features, update relevant documentation:
1. If bug: Add to BUG_SOLUTIONS.md with pattern learned
2. If feature: Update relevant skill file
3. If architecture: Update this file

See `.claude/skills/self-correction.md` for the full protocol.

---

## Domain Laws

### 1. React State Law
In async functions, **pass values explicitly** instead of reading state.
```typescript
// BAD: saveToDb(name);  // Stale closure
// GOOD: const newName = "x"; setName(newName); saveToDb(newName);
```

### 2. Migration First Law
**NEVER** write `select("new_column")` before migration runs in Supabase.

### 3. API Gateway Law
All mutations with side effects MUST go through API routes.
```typescript
// BAD: await supabase.from("leads").update(...)
// GOOD: await fetch(`/api/leads/${id}`, { method: 'PATCH', ... })
```

### 4. Tailwind JIT Law
**NEVER** use dynamic string interpolation for Tailwind classes.
```typescript
// BAD: className={`bg-${color}-500`}
// GOOD: const classes = { sky: 'bg-sky-500' }; className={classes[color]}
```

### 5. Dual Client Law
API routes needing BOTH auth AND service-role must use TWO clients.
```typescript
const authClient = createClient();     // For user verification
const adminClient = createAdminClient(); // For data operations
```

### 6. RLS Always Law
All tables have Row-Level Security. Never bypass without explicit reason.

### 7. Zod Validation Law
All API inputs must be validated with Zod schemas.
```typescript
const Schema = z.object({ name: z.string().min(1) });
const parsed = Schema.safeParse(body);
if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
```

### 8. Error Boundary Law
Pages with async data fetching should have error boundaries.

### 9. Clean Console Law
Remove all debug console.log statements before committing. Use proper logging if needed.

### 10. maxTokens Law
Always set `maxTokens` (>=4096) for AI calls returning JSON.

### 11. Disaster Scenario Law
**Before writing ANY destructive code (rm, delete, truncate, overwrite), run through this checklist and present risks to the user BEFORE writing the code:**
```
1. What VARIABLE determines the target?
2. What if it's EMPTY STRING ""?
3. What if it's NULL/UNDEFINED?
4. What if it resolves to a PARENT DIRECTORY?
5. What if the data source returns UNEXPECTED FORMAT?
6. Is there a CONFIRMATION PROMPT?
7. Is there a SAFETY CHECK that aborts on bad state?
8. Does it use TRASH (recoverable) instead of rm (permanent)?
9. Is the target BACKED UP?
10. What's the BLAST RADIUS if this goes wrong?
```
For jq: `//` does NOT catch empty strings — use explicit length checks.
For bash: every `rm` needs a non-empty variable guard + parent directory guard.
For database: check WHERE clause for NULL, check CASCADE impact, prefer soft-delete.

### 12. Never Permanently Delete User Data Law
**NEVER use `rm -rf` on user data.** Use `trash` (macOS) or backup first. `rm -rf` is only for temp/build files created in the same script run. For API routes that delete user data: verify ownership, consider soft-delete, log for audit trail.

---

## Skills & Sub-Agents

### Available Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `/scaffold-setup` | "setup project" | Guided initial configuration |
| `/feature` | "add feature" | Standard feature implementation |
| `/action-plan` | "create action plan" | Business action plan generator |
| `/strategy` | "create strategy" | Business strategy documentation |

### Available Sub-Agents

| Agent | Invocation | Purpose |
|-------|------------|---------|
| `code-reviewer` | "Use code-reviewer to review X" | Objective code review |
| `migration-validator` | "Use migration-validator to review X" | SQL migration safety |

---

## Quick Commands

```bash
# Development
npm run dev           # Start dev server
npm run build         # Production build
npm run check         # TypeScript check
npm run lint          # ESLint

# Pre-deploy
./verify.sh           # Run all checks

# Stripe (local)
npm run stripe:listen # Webhook listener
```

---

## Checklist: Before You Code

```markdown
[ ] Does this pattern exist elsewhere? (Search first)
[ ] Does this mutation need side effects? (Use API route)
[ ] Have I read the related files?
[ ] Will this work with RLS enabled?
[ ] Am I using the right Supabase client?
```

---

## Checklist: Before You Commit

```markdown
[ ] ./verify.sh passes
[ ] No console.log statements
[ ] No hardcoded secrets
[ ] RLS policies added for new tables
[ ] Documentation updated if needed
```
