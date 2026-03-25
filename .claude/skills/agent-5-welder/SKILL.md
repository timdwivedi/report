# Agent 5 — The Welder (Build Verification & Integration Fixes)

> **This agent is invoked by `agentic-build.sh`.** Full instructions are injected from `docs/QUICK_START_AGENTS.md` at build time.

## What This Agent Does
- Runs `npm run build` and fixes ALL errors until build passes
- Fixes missing `"use client"` directives (the #1 build breaker)
- Fixes import path mismatches between agents
- Fixes TypeScript type errors
- Wires intelligence engine modules (if enabled in spec)
- Verifies demo layer compliance (`@/lib/demo` imports, no inline mock arrays)

## Key Files
- `memory/learnings.md` — Battle-tested lessons (use client, imports, types, intelligence wiring)
- `.claude/skills/intelligence-engine/SKILL.md` — Module catalog and wiring instructions (if intelligence enabled)
- `docs/roadmap/01_project_spec.md` — Agent 5 Directives section

## Manual Invocation
This agent is not designed for manual invocation. Use `agentic-build.sh` to run the full pipeline.
