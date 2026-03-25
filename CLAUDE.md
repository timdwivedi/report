# Project Context

This is a Bloom scaffold build — a SaaS application built with Next.js 14, React 18, TypeScript, Supabase, and Tailwind CSS.

## Agent System (Teams Mode)

Your full instructions have been pre-loaded in this prompt. Proceed directly with your tasks.

Additional references:
- `docs/CREATIVE_BRIEF.md` — **MUST READ FIRST** — Agent 2.5 creates this with visual identity, signature element, and animation/interactive directives
- `docs/roadmap/01_project_spec.md` — contains the project spec with your AGENT DIRECTIVES section

## Key Rules
- Use Tailwind CSS only (no CSS modules, no styled-components)
- All Tailwind classes must be static strings (no dynamic `bg-${color}-500`)
- Mock data should look REAL (real names, numbers, dates)
- Mobile-first: every component must look great at 375px
- DO NOT install packages or modify package.json
- Follow the "Show Everything, Connect Later" principle — frontend showcase with mock data
- **Default currency is USD ($)**. Use dollars for ALL pricing, revenue, costs, and financial displays unless the client's intake data, project spec, or copy EXPLICITLY specifies a different currency (e.g., EUR €, GBP £). Never assume non-USD.

## Verification
Run `bash verify.sh` to check the build.
