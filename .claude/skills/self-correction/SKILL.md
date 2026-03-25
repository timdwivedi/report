# Self-Correction & Skill Annealing

This skill defines the **"Self-Healing"** philosophy. Every bug encountered and every complex feature built is an opportunity to harden the system against future errors.

---

## Memory

**MUST READ before using this skill:** `memory/learnings.md` -- contains lessons from past debugging sessions that prevent repeat mistakes.

---

## When to Use

1. **After Fixing a Bug**: Especially difficult, recurring, or "silent failure" bugs.
2. **After Implementing a Feature**: When you discover a new pattern that works well.
3. **When Finding Documentation Gaps**: If you had to "figure it out", write it down.

---

## The Annealing Protocol

### 1. Extract the Lesson
Don't just fix the code. Abstract the **principle**.

* **Bad**: "Fixed typo in generic-component.tsx"
* **Good**: "Generic components must handle undefined props to prevent crashes."

### 2. Locate the Home
Find the specific skill file or documentation that governs this domain.

**Per-Agent Learnings (for build pipeline issues):**
* Types/Mock data/Schema → `.claude/skills/agent-1-blueprint/memory/learnings.md`
* Landing page/Colors/Design → `.claude/skills/agent-2-brand/memory/learnings.md`
* Layout/Sidebar/Auth pages → `.claude/skills/agent-3-shell/memory/learnings.md`
* Dashboard pages/Feature UI → `.claude/skills/agent-4-pages/memory/learnings.md`
* Build errors/Imports/Wiring → `.claude/skills/agent-5-welder/memory/learnings.md`
* QC/Review/Plans → `.claude/skills/agent-6-closer/memory/learnings.md`

**General skill domains:**
* UI/CSS → `react-components.md`
* Database/SQL → `database-migrations.md`
* API/Backend → `api-routes.md`
* Auth/Context → `supabase-data-access.md`

### 3. Update the Documentation
Add a **"Trap"**, **"Critical Rule"**, or **"Pattern"** section.

#### Format for Traps (Bugs):
```markdown
### Trap X: [Name of Error]
**Cause**: [Brief explanation of why it happens]
**Fix**: [Code snippet or rule to prevent it]
```

#### Format for Patterns (Features):
```markdown
### Pattern: [Name of Architecture]
**Use When**: [Scenario]
**Code**:
[code snippet]
```

### 4. Verify
Ensure the new rule contradicts the bad code you just fixed. If you followed the rule, would the bug have happened? If no, you are done.

---

## Common Anti-Patterns to Squash

* **Copy-Paste Drift**: If you copy code that has valid stylistic differences, standardize it.
* **Hidden Knowledge**: "I know to do this because I saw it in file X". Move that knowledge to documentation.
* **Assumption Loops**: "I assumed the user was logged in." Add a rule about checking assumptions.

---

## Systematic Debugging (4-Phase Process)

### The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes. Random fixes waste time and create new bugs.

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read Error Messages Carefully** — Don't skip past errors. Read stack traces completely. Note line numbers, file paths, error codes. They often contain the exact solution.
2. **Reproduce Consistently** — Can you trigger it reliably? What are the exact steps? If not reproducible, gather more data — don't guess.
3. **Check Recent Changes** — What changed? Git diff, recent commits, new dependencies, config changes.
4. **Trace Data Flow** — Where does the bad value originate? Trace up the call stack until you find the source. Fix at source, not at symptom.
5. **Gather Evidence in Multi-Component Systems** — For each component boundary: log what enters, log what exits. Run once to see WHERE it breaks.

### Phase 2: Pattern Analysis

1. **Find Working Examples** — Locate similar working code in the same codebase
2. **Compare Against References** — Diff working vs broken code. List every difference.
3. **Understand Dependencies** — What other components, settings, or environment does this need?

### Phase 3: Hypothesis and Testing

1. **Form Single Hypothesis** — State clearly: "I think X is the root cause because Y"
2. **Test Minimally** — Make the SMALLEST possible change. One variable at a time.
3. **Verify Before Continuing** — Did it work? If not, form NEW hypothesis. DON'T add more fixes on top.

### Phase 4: Implementation

1. **Implement Single Fix** — Address the root cause. ONE change at a time. No "while I'm here" improvements.
2. **Verify Fix** — Test passes? No other tests broken? Issue actually resolved?
3. **Anneal** — Document the learning in the appropriate `memory/learnings.md` file.

### The 3-Fix Rule

**If 3+ fixes fail, STOP and question the architecture:**
- Each fix reveals new problems in different places = architectural issue
- Fixes require "massive refactoring" = wrong pattern, not wrong code
- DON'T attempt Fix #4 without discussing fundamentals with the user

### Verification Before Completion

**Evidence before claims. Always.**
- "Tests pass" requires showing test output with 0 failures
- "Build succeeds" requires showing build output with exit 0
- "Bug fixed" requires reproducing the original symptom and confirming it's gone
- Using "should work", "probably fixed", "seems good" = you haven't verified

### Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| "Quick fix for now, investigate later" | Later never comes. Investigate now. |
| "Just try changing X and see" | That's guessing, not debugging. |
| "Issue is simple, don't need process" | Simple bugs have root causes too. |
| "Emergency, no time for process" | Systematic is FASTER than thrashing. |
| "I'll write test after confirming fix" | Untested fixes don't stick. |
| "One more fix attempt" (after 2+) | 3+ failures = architectural problem. |
| "I see the problem, let me fix it" | Seeing symptoms != understanding root cause. |

---

## Bug Fix Workflow (Quick Reference)

When handling bugs:
0. **CRITICAL: Clean up console logs** - Remove all white noise console logs.
1. **Follow the 4-Phase Process above** — Phase 1 (investigate) BEFORE Phase 4 (fix)
2. Read relevant BUG_SOLUTIONS.md if it exists
3. Search for similar bugs in `memory/learnings.md` files — check ALL agent learnings too
4. Compare with working code — diff immediately
5. Propose fix using documented patterns
6. Verify the fix with evidence (run the command, show the output)
7. **Anneal**: Document the learning (see Annealing Protocol above)

**Key**: Always use established patterns, don't invent new approaches without documenting them.

---

## Document Maintenance Policy

**Condensing Policy**: Bug logs older than 2 days are condensed to focus on solutions:
- ✅ **Keep**: Bug name, **Fix/Solution** (what was done), Files/Lines, Pattern
- ❌ **Remove**: Detailed root cause explanations, step-by-step problem descriptions
- **Rationale**: Solution details are critical for troubleshooting similar bugs.

---

## Critical Patterns (Universal)

### What Works (Always Do This)

1. **Use refs for latest data, React state for UI** - Refs update synchronously
2. **Check for changes before updating in useEffect** - Prevents infinite loops
3. **Always clean up resources in useEffect** - AbortControllers, timeouts, listeners
4. **Include all dependencies in dependency arrays** - Prevents stale closures
5. **Capture values at start of effects** - Prevents race conditions
6. **Test on mobile viewports** - Ensure responsive design works

### What Doesn't Work (Never Do This)

1. **Using refs inside React updaters** - Breaks React's reactivity
2. **Relying on React state for latest data in async ops** - Use refs instead
3. **Missing dependencies in dependency arrays** - Causes stale closures
4. **Not cleaning up resources** - Causes memory leaks
5. **Complex conditional logic when simple inverse works** - Keep it simple
6. **Hardcoded values for responsive layouts** - Use Tailwind breakpoints
7. **Showing raw error messages to users** - Log technical errors to console, show clean messages in toasts

### Error Handling (User-Facing)

**Every toast/error shown to a user must be clean and actionable.** This is non-negotiable.

```typescript
// Pattern: Separate technical logging from user messaging
try {
    const res = await fetch('/api/something', { method: 'POST', body: formData });
    if (!res.ok) {
        let userMessage = 'Something went wrong. Please try again.';
        try {
            const data = await res.json();
            userMessage = data.error || userMessage;
        } catch {
            // Non-JSON response (413, 502, etc.)
            userMessage = `Server error (${res.status}). Please try again.`;
        }
        throw new Error(userMessage);
    }
} catch (error: any) {
    console.error('[ComponentName] Operation failed:', error); // Full error → console
    showToast(error.message || 'Something went wrong.', 'error'); // Clean → user
}
```

**Never do:** `showToast(\`Failed: ${error.message}\`, "error")` — error.message may contain raw DB errors, stack traces, or `SyntaxError: Unexpected token` garbage.

---

## Example Workflow

1. **Bug Found**: "Button text invisible on hover."
2. **Root Cause**: `z-index` conflict with glow effect.
3. **Target Doc**: `react-components.md`
4. **Action**: Added "Glow Button Pattern" documentation.
5. **Result**: Future buttons will not have this bug.
