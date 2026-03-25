# Bloom Knowledge Base

Cross-build learning directory. Every debrief feeds patterns back here so future builds get smarter.

## How It Works

1. After each build, run the **Debrief** command (see `bloom/CLAUDE.md`)
2. The debrief extracts lessons into the appropriate file below
3. Agents read this directory at build start to avoid repeating mistakes

## Files

| File | What Goes Here |
|------|---------------|
| `landing-pages.md` | Headlines, layouts, and section patterns that convert |
| `database-patterns.md` | Schema patterns across verticals (common tables, relationships) |
| `build-failures.md` | What went wrong + how it was fixed |
| `client-requests.md` | Common feature requests and how they were implemented |
| `metrics.md` | Build times, costs, conversion rates |
| `vertical-insights/` | Per-vertical learnings (populated after 3+ builds per vertical) |

## Rules

- Keep entries short (3-5 lines max per entry)
- Always include the build date and client vertical
- Tag entries with relevant categories for searchability
- Never include client PII (names, emails, exact URLs)
