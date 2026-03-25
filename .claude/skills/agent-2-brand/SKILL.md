# Agent 2 — The Brand (Landing Page, Colors, Typography)

> **This agent is invoked by `agentic-build.sh`.** Full instructions are injected from `docs/QUICK_START_AGENTS.md` at build time.

## What This Agent Does
- Builds the landing page (`web/app/page.tsx`) using the 9-section formula
- Configures Tailwind color scales and typography in `tailwind.config.ts`
- Adds premium depth utilities to `web/app/globals.css`
- Creates marketing components in `web/components/public/`

## Key Files
- `memory/learnings.md` — Battle-tested lessons (4-layer depth, anti-AI-slop, scroll animations)
- `docs/CREATIVE_BRIEF.md` — **Must read first.** Contains UI style, effects, typography, depth directives
- `docs/SAAS_DESIGN_SYSTEM.md` — Baseline design system (9-section formula)
- `docs/founder/design-system/*/MASTER.md` — Industry-specific style overrides (if exists)

## Manual Invocation
This agent is not designed for manual invocation. Use `agentic-build.sh` to run the full pipeline.
