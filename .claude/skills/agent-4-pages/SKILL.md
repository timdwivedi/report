# Agent 4 — The Pages (Dashboard Feature Pages + Signature Element)

> **This agent is invoked by `agentic-build.sh`.** Full instructions are injected from `docs/QUICK_START_AGENTS.md` at build time.

## What This Agent Does
- **Builds the Signature Element** — the #1 priority (interactive calculator, quiz, timeline, etc.)
- Creates all dashboard feature pages in `web/app/dashboard/[feature]/page.tsx`
- Uses types and demo data from Agent 1 (`@/lib/demo` imports, never inline mock arrays)
- Wires interactive components (AnimatedCounter, ClickReveal, ActionButton, LoadingSequence)

## Key Files
- `memory/learnings.md` — Battle-tested lessons (**Signature Element is #1 job**, demo data patterns)
- `docs/CREATIVE_BRIEF.md` — Signature Element specs, per-page animation directives
- `.claude/skills/performance-optimizer/memory/learnings.md` — Table/list performance patterns

## Manual Invocation
This agent is not designed for manual invocation. Use `agentic-build.sh` to run the full pipeline.
