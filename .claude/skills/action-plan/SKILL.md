# Action Plan Generator

Generate a simple, actionable day-by-day plan for any business initiative.

## Trigger Phrases
- "create action plan"
- "generate action"
- "build action steps"
- "what do I do now"
- "give me the action plan"
- `/action-plan`

---

## What This Skill Does

Takes business context and distills it into a **dead-simple action plan** that anyone can follow. Written in plain language.

The action plan includes:
- 30-second TL;DR
- Who exactly to target
- Where to find them
- The exact steps to take
- Day-by-day breakdown for Week 1
- What success looks like (metrics)
- What could go wrong + how to handle
- Tools checklist

---

## Prerequisites

Before generating, gather:
1. Business context (what you're trying to achieve)
2. Target audience (who you're reaching)
3. Available resources (budget, tools, team)
4. Timeline (when do you need results)

---

## Output Location

```
docs/plans/ACTION_[name].md
```

---

## Output Template

```markdown
# ACTION PLAN: [Initiative Name]

> **Mission:** [One sentence goal]
> **Generated:** [Date]

---

## TL;DR - The 30-Second Brief

**What we're doing:** [One sentence]

**Who we're targeting:** [Primary audience]

**Why now:** [Urgency/opportunity]

**The approach:** [Core strategy in one line]

**Goal this week:** [Specific, measurable goal]

---

## THE TARGET

### Who Exactly

| Attribute | Description |
|-----------|-------------|
| **Demographics** | [Age, location, etc.] |
| **Role/Title** | [Job titles, responsibilities] |
| **Pain Points** | [What problems do they have] |
| **Where They Are** | [Platforms, locations] |

### Who to Avoid

- [Anti-persona 1]
- [Anti-persona 2]

---

## WHERE TO FIND THEM

### Method 1: [Primary Channel]
[Step by step instructions]

### Method 2: [Secondary Channel]
[Alternative method]

---

## THE APPROACH

### Core Message
> "[The main value proposition in their language]"

### Key Differentiators
1. [Why you, not competitors]
2. [Unique angle]
3. [Proof/credibility]

---

## DAY-BY-DAY ACTION PLAN

### Day 1 - SETUP
| Time | Action | How | Done |
|------|--------|-----|------|
| Morning | [Action] | [How] | [ ] |
| Afternoon | [Action] | [How] | [ ] |
| End of day | [Action] | [How] | [ ] |

### Day 2 - LAUNCH
[Same format]

### Day 3 - MOMENTUM
[Same format]

### Day 4 - OPTIMIZE
[Same format]

### Day 5 - REVIEW & ADJUST
[Same format]

---

## WHAT SUCCESS LOOKS LIKE

| Metric | Week 1 Target | Good | Great |
|--------|---------------|------|-------|
| [Metric 1] | [X] | [Range] | [Range] |
| [Metric 2] | [X%] | [Range] | [Range] |
| [Metric 3] | [X] | [Range] | [Range] |

---

## WHAT COULD GO WRONG

| Risk | Likelihood | What To Do |
|------|------------|------------|
| [Risk 1] | Low/Med/High | [Mitigation] |
| [Risk 2] | Low/Med/High | [Mitigation] |
| [Risk 3] | Low/Med/High | [Mitigation] |

---

## OBJECTION HANDLERS

**"[Objection 1]"**
> [Response]

**"[Objection 2]"**
> [Response]

**"[Objection 3]"**
> [Response]

---

## TOOLS CHECKLIST

- [ ] [Tool 1] - [Purpose]
- [ ] [Tool 2] - [Purpose]
- [ ] [Tool 3] - [Purpose]

---

## AFTER WEEK 1

If this works:
1. [Scale step 1]
2. [Scale step 2]

If this doesn't work:
1. [Pivot option 1]
2. [Pivot option 2]

---

## THE NORTH STAR

> **"[The guiding question or vision that keeps you focused]"**

Go get it.
```

---

## Key Principles

1. **Simple language** - No jargon, no technical terms
2. **Specific actions** - "Send 10 emails" not "Do outreach"
3. **Named targets** - Actual examples, not just categories
4. **Time-boxed** - Day-by-day breakdown, not vague "phases"
5. **Risk-aware** - Include what could go wrong and how to handle
6. **Measurable** - Clear success metrics

---

## Usage

```
# Generate action plan for a new initiative:
claude> create action plan for [initiative]

# Or if context is already established:
claude> /action-plan
```

---

## Customization

This template can be adapted for:
- Marketing campaigns
- Product launches
- Sales outreach
- Hiring initiatives
- Feature rollouts
- Customer onboarding
- Partnership development

Modify the sections to fit your specific domain.
