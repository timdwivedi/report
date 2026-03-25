# Strategy Brief Generator

Create comprehensive business strategy documentation.

## Trigger Phrases
- "create strategy"
- "build strategy brief"
- "strategy document"
- "strategic analysis"
- `/strategy`

---

## What This Skill Does

Creates a structured strategy document that covers:
- Market analysis
- Competitive positioning
- Value proposition
- Target segments
- Go-to-market approach
- Key metrics & milestones

---

## Prerequisites

Before generating, gather:
1. Business description (what you do/sell)
2. Current situation (stage, revenue, team size)
3. Goals (where you want to be)
4. Known constraints (budget, timeline, resources)

---

## Output Location

```
docs/strategy/STRATEGY_[name].md
```

---

## Output Template

```markdown
# STRATEGY BRIEF: [Business/Project Name]

> **Version:** 1.0
> **Date:** [Date]
> **Status:** Draft / In Review / Final

---

## EXECUTIVE SUMMARY

[2-3 paragraphs covering the key strategic direction]

---

## 1. SITUATION ANALYSIS

### Current State
| Attribute | Value |
|-----------|-------|
| **Stage** | [Startup/Growth/Mature] |
| **Revenue** | [Current ARR/MRR] |
| **Team Size** | [Number] |
| **Key Assets** | [Technology, IP, relationships] |

### What's Working
1. [Strength 1]
2. [Strength 2]
3. [Strength 3]

### What's Not Working
1. [Challenge 1]
2. [Challenge 2]
3. [Challenge 3]

---

## 2. MARKET ANALYSIS

### Market Size
| Segment | TAM | SAM | SOM |
|---------|-----|-----|-----|
| [Segment 1] | $X | $X | $X |
| [Segment 2] | $X | $X | $X |

### Market Trends
1. **[Trend 1]**: [Impact on business]
2. **[Trend 2]**: [Impact on business]
3. **[Trend 3]**: [Impact on business]

### Regulatory/External Factors
- [Factor 1]
- [Factor 2]

---

## 3. COMPETITIVE LANDSCAPE

### Direct Competitors
| Competitor | Strengths | Weaknesses | Our Advantage |
|------------|-----------|------------|---------------|
| [Name 1] | [X] | [X] | [X] |
| [Name 2] | [X] | [X] | [X] |

### Indirect Competitors
- [Category]: [Examples]

### Competitive Moat
> [What makes us defensible]

---

## 4. TARGET SEGMENTS

### Primary Segment: [Name]
| Attribute | Description |
|-----------|-------------|
| **Who** | [Demographics/firmographics] |
| **Pain Points** | [Top 3 problems] |
| **Current Solutions** | [What they use now] |
| **Why Us** | [Compelling reason to switch] |
| **Size** | [Number of potential customers] |

### Secondary Segment: [Name]
[Same format]

### Segment Prioritization
1. **[Segment]** - [Why first]
2. **[Segment]** - [Why second]

---

## 5. VALUE PROPOSITION

### Core Promise
> "[One sentence that captures the main value]"

### Key Benefits
1. **[Benefit 1]**: [Proof/how we deliver]
2. **[Benefit 2]**: [Proof/how we deliver]
3. **[Benefit 3]**: [Proof/how we deliver]

### Positioning Statement
> For [target customer] who [has this problem], [Product] is a [category] that [key benefit]. Unlike [alternatives], we [key differentiator].

---

## 6. GO-TO-MARKET STRATEGY

### Acquisition Channels
| Channel | Cost | Timeline | Expected Results |
|---------|------|----------|------------------|
| [Channel 1] | $X/mo | X weeks | X leads |
| [Channel 2] | $X/mo | X weeks | X leads |

### Sales Motion
- **Model**: [Self-serve / Sales-led / PLG]
- **Cycle Length**: [X days/weeks]
- **Key Touchpoints**: [List]

### Pricing Strategy
| Tier | Price | Target Customer |
|------|-------|-----------------|
| [Tier 1] | $X/mo | [Who] |
| [Tier 2] | $X/mo | [Who] |

---

## 7. GOALS & METRICS

### North Star Metric
> **[Single metric that best captures value delivered]**

### Key Results (Next 90 Days)
| Metric | Current | Target | Owner |
|--------|---------|--------|-------|
| [Metric 1] | X | X | [Name] |
| [Metric 2] | X | X | [Name] |
| [Metric 3] | X | X | [Name] |

### Milestones
- **Month 1**: [Milestone]
- **Month 3**: [Milestone]
- **Month 6**: [Milestone]
- **Month 12**: [Milestone]

---

## 8. RISKS & MITIGATIONS

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [Plan] |
| [Risk 2] | High/Med/Low | High/Med/Low | [Plan] |
| [Risk 3] | High/Med/Low | High/Med/Low | [Plan] |

---

## 9. RESOURCE REQUIREMENTS

### Team
| Role | Current | Needed | Priority |
|------|---------|--------|----------|
| [Role 1] | X | X | High/Med/Low |
| [Role 2] | X | X | High/Med/Low |

### Budget
| Category | Monthly | Annual |
|----------|---------|--------|
| [Category 1] | $X | $X |
| [Category 2] | $X | $X |
| **Total** | $X | $X |

### Tools/Technology
- [ ] [Tool 1] - [Purpose]
- [ ] [Tool 2] - [Purpose]

---

## 10. NEXT STEPS

### Immediate (This Week)
1. [ ] [Action 1]
2. [ ] [Action 2]
3. [ ] [Action 3]

### Short-term (This Month)
1. [ ] [Action 1]
2. [ ] [Action 2]

### Decision Points
- **[Date]**: [Decision needed]
- **[Date]**: [Decision needed]

---

## APPENDIX

### Assumptions
1. [Key assumption 1]
2. [Key assumption 2]

### Open Questions
1. [Question needing research]
2. [Question needing validation]

### References
- [Source 1]
- [Source 2]
```

---

## Key Principles

1. **Data-driven** - Include numbers where possible
2. **Actionable** - Every section should inform decisions
3. **Honest** - Include challenges, not just strengths
4. **Prioritized** - Clear ranking of segments, channels, etc.
5. **Time-bound** - Specific milestones and deadlines

---

## Usage

```
# Generate strategy for a new venture:
claude> create strategy brief for [business]

# Or update existing:
claude> update strategy with new market data
```

---

## Customization

Adapt sections based on context:
- **B2B**: Emphasize account-based segments, sales cycles
- **B2C**: Emphasize channels, viral loops, retention
- **Marketplace**: Include both supply and demand sides
- **SaaS**: Include MRR metrics, churn analysis
