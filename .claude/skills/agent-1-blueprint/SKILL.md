# Agent 1 — The Blueprint (Types, Demo Data, Database)

> **This agent is invoked by `agentic-build.sh`.** Full instructions are injected from `docs/QUICK_START_AGENTS.md` at build time.

## What This Agent Does
- Creates TypeScript interfaces in `web/lib/types/app.ts`
- Creates the demo data provider in `web/lib/demo/` (3 files: provider, wrapper, barrel)
- Creates navigation config in `web/lib/constants/navigation.ts`
- Creates database schema/migrations if needed
- Creates types and mock data for the Signature Element (from Creative Brief)

## Key Files
- `memory/learnings.md` — Battle-tested lessons from past builds (read by agent at runtime)
- `docs/QUICK_START_AGENTS.md` — Full build instructions (injected by build script)
- `docs/CREATIVE_BRIEF.md` — Visual identity and Signature Element specs (must read before starting)

## Manual Invocation
This agent is not designed for manual invocation. Use `agentic-build.sh` to run the full pipeline.
