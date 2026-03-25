# Agent 7 — Auto-Debrief: Cross-Build Intelligence

> **This file tracks patterns that recur across builds. Updated automatically by the debrief feedback loop.**

---

## Recurring Error Patterns

### TypeScript Type Mismatches
**Frequency:** TBD
**Symptom:** Agent 4 (Pages) creates components expecting types Agent 1 (Spec) never defined
**Root Cause:** Agent 1 defines minimal types; Agent 4 assumes richer data structures
**Fix:** Agent 1 needs stricter type definitions with all expected fields

---

### Missing "use client" Directives
**Frequency:** TBD
**Symptom:** Interactive components (onClick, useState) break without "use client"
**Root Cause:** Agents forget Next.js 14 RSC defaults
**Fix:** Agent 4 prompt must emphasize client directive for ALL interactive components

---

### Tailwind Dynamic Classes
**Frequency:** TBD
**Symptom:** `className={bg-${color}-500}` doesn't work (JIT mode)
**Root Cause:** Agents use string interpolation for dynamic Tailwind classes
**Fix:** Enforce lookup objects or safe lists in Agent 4 prompt

---

## What's Working Well

### Landing Page Quality
**Pattern:** Agent 2 (Brand) + Agent 3 (Landing Page) consistently produce high-quality landing pages with strong copy and clean layouts

### Build Recovery
**Pattern:** Agent 5 (Welder) successfully auto-fixes ~90% of Agent 4 errors without human intervention

---

## Scaffold Improvements Applied

*This section is auto-populated by the feedback loop after each build.*

---

**Update this file after every build. Track what breaks. Fix what's systematic.**
