# [Your App Name]

> **First step:** Rename this file's title and run `/scaffold-setup` in Claude Code.

A modern SaaS application built with Next.js 14, React 18, TypeScript, Supabase, and Stripe.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **AI**: Anthropic Claude, OpenAI, Google Gemini
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account (for billing)
- AI API keys (optional)

### Installation

1. Clone/copy this folder:
```bash
# Rename to your project name
mv bloom my-app-name
cd my-app-name
```

2. Install dependencies:
```bash
cd web
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

4. Run database migrations:
```bash
npx supabase db push
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
project/
├── .agent/            # Antigravity IDE config
├── .claude/           # Claude Code config
│   ├── skills/        # Custom AI skills
│   └── sub-agents/    # Specialized review agents
├── docs/              # Documentation
│   └── roadmap/       # Feature specs
├── scripts/           # Operational scripts
├── supabase/
│   └── migrations/    # SQL migrations
├── web/               # Next.js application
│   ├── app/           # Pages & API routes
│   ├── components/    # React components
│   └── lib/           # Utilities
└── verify.sh          # Pre-deploy checks
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server

# Code Quality
npm run lint         # ESLint
npm run check        # TypeScript check

# Operations
npm run pull:client <slug>     # Fetch client data
npm run create:client          # Create new organization
npm run stripe:listen          # Stripe webhook listener
```

## Documentation

- [Project Context](docs/CLAUDE.md) - For AI assistants
- [Master Roadmap](docs/roadmap/00_MASTER_ROADMAP.md) - Feature overview
- [Migrations Guide](supabase/migrations/README.md) - Database setup

---

## For Claude Code Users

This scaffold is optimized for use with [Claude Code](https://claude.ai/claude-code).

### Quick Start with Claude Code

1. Open this folder in VS Code
2. Start Claude Code (Cmd+Shift+P → "Claude Code: Open")
3. Say: `/scaffold-setup` for guided setup

### What's Included

```
.claude/
├── settings.local.json    # Pre-configured permissions
├── skills/                # Reusable skill definitions
│   ├── self-correction.md # Bug-fixing protocol
│   ├── scaffold-setup.md  # Initial setup guide
│   ├── feature-builder.md # Feature implementation pattern
│   ├── action-plan.md     # Business action plan generator
│   └── strategy-brief.md  # Strategy documentation
└── sub-agents/            # Specialized review agents
    ├── code-reviewer.md   # Objective code review
    └── migration-validator.md # SQL migration safety
```

### Available Commands

| Command | What it does |
|---------|--------------|
| `/scaffold-setup` | Guided initial configuration |
| `/feature [name]` | Add a new feature with best practices |
| `/action-plan` | Generate business action plan |
| `/strategy` | Create strategy documentation |

### Sub-Agents

Use specialized agents for focused tasks:

```
"Use the code-reviewer sub-agent to review web/components/auth/"
"Use the migration-validator to review the new migration"
```

### Configuration Files

- `CLAUDE.md` (root) - Quick reference, auto-loaded each session
- `docs/CLAUDE.md` - Detailed project context
- `.claude/settings.local.json` - Allowed commands

### Customizing for Your Project

1. Update `CLAUDE.md` with your project conventions
2. Add domain-specific skills to `.claude/skills/`
3. Modify sub-agents for your review needs
4. Update `docs/roadmap/` with your feature plans

---

## For Antigravity IDE Users

This scaffold also supports [Antigravity IDE](https://antigravity.dev) with Gemini/Claude.

### Configuration

```
.agent/
└── instructions.md    # AI context for Antigravity
```

The `.agent/instructions.md` file contains the same critical rules and project context, formatted for Antigravity's AI assistants.

### Quick Start with Antigravity

1. Open this folder in Antigravity
2. The AI will auto-load `.agent/instructions.md`
3. Say "setup project" for guided configuration

---

## Environment Variables

See [.env.local.example](web/.env.local.example) for required variables.

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Manual

```bash
cd web
npm run build
npm run start
```

## Contributing

1. Create a roadmap file for your feature
2. Implement following existing patterns
3. Update documentation
4. Run `./verify.sh` before pushing

## License

[Your License]
