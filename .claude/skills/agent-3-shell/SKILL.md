# Agent 3 — The Shell (Dashboard Layout, Navigation, Auth Pages)

> **This agent is invoked by `agentic-build.sh`.** Full instructions are injected from `docs/QUICK_START_AGENTS.md` at build time.

## What This Agent Does
- Creates `web/components/layout/DashboardLayout.tsx` (sidebar + header + content area)
- Creates auth pages (`login`, `signup`) in `web/app/(auth)/`
- Creates shared dashboard components (StatCard, EmptyState, PageHeader)
- Wires `DemoToastProvider` and `DemoNotifications` into dashboard layout

## Key Files
- `memory/learnings.md` — Battle-tested lessons (double layout nesting, shared components)
- `docs/CREATIVE_BRIEF.md` — Dashboard interactivity directives, toast messages
- `.claude/skills/vercel-react-best-practices/SKILL.md` — Client/server boundary rules

## Manual Invocation
This agent is not designed for manual invocation. Use `agentic-build.sh` to run the full pipeline.
