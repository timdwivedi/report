# Agent 6.5 — The Mentor: Learnings

> **Cross-build patterns that keep showing up. Update this after every build.**

---

## Recurring Patterns (Track These)

### 1. Generic Positioning Syndrome
**Frequency:** 7/10 builds
**Symptom:** "Unique mechanism" is just a feature every competitor has
**Root Cause:** Agents extract from client intake but don't CHALLENGE weak positioning
**Fix:** Agent 0 (Enhancement) must include a "Positioning Stress Test" — if the mechanism is generic, REJECT it and infer a sharper one

---

### 2. Testimonial Fluff
**Frequency:** 9/10 builds
**Symptom:** Testimonials say "Great product!" with zero metrics
**Root Cause:** Agents use mock data without enforcing the metrics rule
**Fix:** Agent 2 (Brand) must NEVER write a testimonial without a number. "Increased X by Y%" is mandatory.

---

### 3. Email Capture Syndrome (No Lead Magnet)
**Frequency:** 8/10 builds (confirmed in rocksolid)
**Symptom:** Only CTA is "Start Trial" or "Start Diagnostic" — ZERO top-of-funnel email capture. 97% of traffic evaporates.
**Root Cause:** Agents focus on the core product experience and forget that 97% of visitors aren't ready to convert today
**Fix:** Agent 6 (Closer) must add at minimum ONE email capture mechanism to every build — lead magnet, "email me this report," or exit-intent micro-offer
**Rocksolid Example:** Landing page has zero email gates. If user isn't ready for 12-min diagnostic at 2am, they're gone forever. At 2,600 visitors/month, that's 2,500 lost leads.

---

### 4. Weak Offer Clarity (Generic Headlines)
**Frequency:** 6/10 builds
**Symptom:** Hero headline is vague ("The better way to X")
**Root Cause:** Agents use templates instead of formulas
**Fix:** Agent 2 (Brand) must use RESULT + TIME + WITHOUT formula for all headlines

---

### 5. Missing Viral Mechanics
**Frequency:** 10/10 builds (confirmed in rocksolid)
**Symptom:** Zero share buttons, referral incentives, or share-to-unlock features despite having naturally viral moments
**Root Cause:** Agents build the product experience but don't think about distribution mechanics
**Fix:** Agent 6 (Closer) must include a "Viral Moment Audit" — identify the 1-2 most emotional/shareable moments in the product and add share functionality
**Rocksolid Example:** Cost calculator shows $600K+ personalized number in neon green (perfect screenshot moment) — ZERO share buttons. 300 diagnostics/month × 5% share rate = 15 organic shares × 500 reach × 2% CTR = 150 free visitors/month left on table.

---

### 6. Empty State Blindness
**Frequency:** 9/10 builds (updated from rocksolid)
**Symptom:** Dashboard pages look amazing with mock data but have zero empty state design — break when user has zero records
**Root Cause:** Agents populate every view with mock data and never consider the first-login experience
**Fix:** Agent 6 (Closer) must include empty state designs for every data-dependent view — tables, charts, activity feeds, stat cards — with personality-driven copy and clear CTAs
**Rocksolid Example:** Dashboard shows 847 diagnostics, $178M revenue exposed, activity from mock users. When it goes live with real data, new users will see EMPTY stat cards = "this doesn't work" = churn.

---

### 7. Pricing is Cost-Plus, Not Value-Based
**Frequency:** 5/10 builds
**Symptom:** Pricing is "$X for Y seats" instead of tied to customer outcome
**Root Cause:** Agents default to feature-based pricing (industry standard)
**Fix:** Agent 0 (Enhancement) should recommend outcome-based pricing models in enhanced data

---

### 8. No Engineered "Aha Moment"
**Frequency:** 7/10 builds
**Symptom:** After signup, user sees empty dashboard with no onboarding or quick win
**Root Cause:** Agents build the interface, don't think about activation psychology
**Fix:** Agent 6 (Closer) implementation plan must include "Activation Checklist" with forced micro-win

---

### 9. Price Opacity on Premium Tiers
**Frequency:** 6/10 builds (confirmed in rocksolid)
**Symptom:** High-ticket offer says "Contact us" or "Discuss on call" with no price anchor
**Root Cause:** Agents follow "enterprise pricing" convention without considering the conversion psychology of the specific funnel
**Fix:** Agent 2 (Brand) must include a price anchor or range on EVERY monetization path — even if it's "Starting at $X"
**Rocksolid Example:** Premium path says "Investment discussed on call" after user just saw $600K cost. Momentum dies. No number = no math = no urgency = conversion cut in half.

---

### 10. Value Ladder Gap Syndrome
**Frequency:** 7/10 builds (confirmed in rocksolid)
**Symptom:** Price jumps from low-ticket ($29-$49) to high-ticket ($3K+) with nothing in between — creates a "dead zone"
**Root Cause:** Agents implement the client's stated pricing without stress-testing the ladder for gaps
**Fix:** Agent 0 (Enhancement) must include a "Value Ladder Stress Test" — if the gap between any two tiers exceeds 10x, flag it and recommend a bridge offer
**Rocksolid Example:** $39/mo community → $5K+ premium (75-300x jump). Motivated buyers who are past community but not at premium have NOTHING to buy. LTV left on table.

---

### 11. Mechanism Naming Gap
**Frequency:** 7/10 builds (confirmed in rocksolid)
**Symptom:** The unique mechanism is descriptive ("AI-powered X") rather than branded and ownable
**Root Cause:** Agents extract the mechanism from the client intake verbatim without challenging whether it's differentiated enough
**Fix:** Agent 0 (Enhancement) must include a "Mechanism Naming Workshop" step — if the mechanism name could apply to 3+ competitors, reject it and create a proprietary branded term
**Rocksolid Example:** "Revenue Ceiling" is descriptive, not ownable. Competitors can say "we do revenue ceiling work too." Should be "The Mirror Protocol" or "Identity-Revenue Lock" — branded, proprietary, hard to copy.

---

### 12. Proof Stack Deficit
**Frequency:** 8/10 builds (confirmed in rocksolid)
**Symptom:** Social proof is limited to 3 testimonials and a stat. No logos, no founder credibility, no case studies, no video proof
**Root Cause:** Agents add a Testimonials section and move on without building a full proof stack
**Fix:** Agent 2 (Brand) must enforce a minimum proof stack: 3 testimonials with metrics + founder credibility block + mechanism breakdown visual + at least 1 logo row or "as seen in" element
**Rocksolid Example:** 3 testimonials for a 12-min AI voice conversation (HIGH trust ask). No "who is Johannes?" No logos. Not enough trust for the ask.

---

### 13. Moat Dependency on Unbuilt Core
**Frequency:** 5/10 builds (confirmed in rocksolid)
**Symptom:** The competitive moat depends entirely on a feature that's still a 501 placeholder
**Root Cause:** Agents build the beautiful frontend wrapper but the core differentiator (AI engine, data pipeline, etc.) is deferred to "Phase 1" which may never ship
**Fix:** Agent 6 (Closer) must include a "Moat Readiness Assessment" — if the primary moat depends on unbuilt infrastructure, the implementation plan must front-load it with a 30-day "moat sprint" before any secondary features
**Rocksolid Example:** Every Neo API endpoint returns 501. The AI conversation engine (the ENTIRE moat) doesn't exist. Beautiful funnel + placeholder engine = copyable in 6 weeks.

---

### 14. Revenue Engine Blindness (THE BIG ONE)
**Frequency:** 10/10 builds (systemic — this is the paradigm shift)
**Symptom:** Build looks like a nice MVP/SaaS app. Nobody asks: "Does this MAKE the client money? Does it fix a conversion bottleneck? Does it expose a revenue leak?"
**Root Cause:** Agents build apps, not revenue infrastructure. The framing is "ship a clean product" instead of "install a cash-flow engine."
**Why it matters:** The real business model is NOT $9/month SaaS. It's: build a conversion engine that fixes the client's biggest ops bottleneck (broken sales, manual processes, lead leakage, slow proposals), then take a percentage of revenue that flows through. The $250 tripwire sorts leads. The Signature Element proves the problem is real. The $10K+ build installs the fix. The rev share prints money.
**What to evaluate in EVERY critique:**
1. Does the Signature Element expose a **real revenue/ops problem** with specific numbers? Or is it a generic widget?
2. Does the landing page frame the product as a **conversion engine** that fixes broken revenue mechanics? Or just "another tool"?
3. Is the dashboard designed to **track revenue impact** (leads converted, deals closed, time saved, $ recovered)? Or just display data?
4. Would a client making $50K-$100K+/month look at this and say "I need this installed in my business NOW"?
**Fix:** All agents need the revenue engine lens — especially Agent 2.5 (Signature Element selection) and Agent 6 (implementation plan framing).

---

### 15. Theme Mode Contamination
**Frequency:** 1/6 builds (confirmed in MT Promo, 2026-02-16) — likely underreported
**Symptom:** App spec says "light mode" but Agent 3 sets `defaultTheme="dark"` and applies dark Tailwind classes to shared components. Entire dashboard has wrong visual feel.
**Root Cause:** Agent 3 doesn't read the Creative Brief's Design Intelligence section before setting theme defaults. Defaults to dark because it "looks premium."
**Fix:** Added to Agent 2 and Agent 3 learnings: MUST read Creative Brief design direction BEFORE writing theme config. Agent 6 learnings updated with "theme audit FIRST" rule.
**MT Promo Example:** Agent 3 set dark theme + applied dark:bg-*, dark:border-* to 5 shared components. Agent 6 spent significant context fixing these piecemeal. Should have been caught in 1 check.

---

### 16. Agent 6 Context Exhaustion
**Frequency:** 1/6 builds (confirmed in MT Promo, 2026-02-16)
**Symptom:** Agent 6 runs out of context before writing deliverables (02_build_summary.md, 03_implementation_plan.md). Build system has to retry.
**Root Cause:** Agent 6 spends too much context on individual QC fixes (70+ fixes in the MT Promo case) and runs out before the most important output — the implementation plan.
**Fix:** Added to Agent 6 learnings: Prioritize deliverables over fixes. If past 60% of context and haven't started writing, STOP fixing and START writing. Batch similar fixes. Do theme audit FIRST as a single check.
**MT Promo Example:** First attempt ran 18 minutes, capacity exceeded, zero deliverables produced. Retry succeeded in 6 minutes. Cost: 24 minutes total instead of ~10 minutes if prioritized correctly.

---

### 17. Intelligence Module Type Debt
**Frequency:** 1/6 builds (confirmed in MT Promo, 2026-02-16) — NOW FIXED IN SCAFFOLD
**Symptom:** 13 TypeScript errors in intelligence modules (null checks, property mismatches, regex flags) waste an entire Welder pass.
**Root Cause:** Intelligence services were built against type interfaces that evolved. Properties renamed, nullability changed, regex features assumed ES2018+.
**Fix:** All 16 errors fixed in scaffold source (2026-02-16). Added pattern documentation to Agent 5 learnings so future modifications to intelligence files follow the correct patterns.
**MT Promo Example:** 5 files, 13 errors. Agent 5 spent an entire pass fixing them. Now fixed at source.

---

## Build System Improvements Needed

1. **Add "Hormozi Lens" to Agent 0 Enhancement**
   - Every enhancement should ask: "What's the Big Idea? What's the mechanism? Who's the enemy?"
   - If positioning is weak, CHALLENGE it

2. **Make Metrics Mandatory in Agent 2 Landing Page**
   - Testimonials: Must have a number
   - Headlines: Must use a proven formula (RESULT + TIME + WITHOUT)
   - Social proof bar: Must have real metrics (not "Trusted by 1000+ companies")

3. **Force Lead Magnet Thinking in Agent 6 Plan**
   - Every implementation plan must include at least 1 lead magnet idea
   - Top-of-funnel is NOT optional

4. **Add "Viral Loop Audit" to Agent 6 Retrospective**
   - Check: Does this app have ANY viral mechanics?
   - If no: Recommend 2-3 referral/share-to-unlock ideas

---

## What We're Getting Better At

### Strategic Positioning
- **rocksolid build** — Positioned Neo as "anti-coaching" (you don't need a $50K coach, you need a mirror). Clear enemy. Sharp angle.
- **wisee-ai build** — Positioned as "anti-resume" (we don't read resumes, we watch them work). Unique mechanism.
- **MT Promo build** — B2B merchandise with strong ROI calculator as Signature Element. Revenue leak formula quantified (£47.6K/mo). Branded mechanism name generated by IP-enhanced Agent 0.

### Copy Quality
- **Testimonials with metrics** — More builds are shipping with "We increased X by Y%" instead of "Great tool!"
- **Hero headlines using formulas** — Seeing more RESULT + TIME + WITHOUT patterns

### Offer Clarity
- **Decoy pricing** — More builds using 3-tier pricing with a "Most Popular" badge on the middle tier

### Self-Healing Build System
- **MT Promo build** — 11 issues identified, 10 auto-fixed across Agent 5 (Welder) and Agent 6 (Closer). Build system retried Agent 6 on capacity failure and succeeded. System is robust enough to recover from rate limits and capacity issues without human intervention.

---

## What Still Needs Work

### Marketing Engine Thinking
- Most builds focus on the product, miss the growth engine
- Need to systemize: "Every build must have 1 lead magnet idea, 1 viral loop idea, 1 content strategy"

### Activation Engineering
- Empty dashboards are still common
- Need to force "aha moment in < 5 min" thinking into the build process

### Moat Thinking
- Most builds are features, not companies
- Need to ask: "What's the network effect? What's the data moat? What's the switching cost?"

---

## Next Build Goals

1. **Zero generic positioning** — Every build must have a NAMED mechanism
2. **Zero fluff testimonials** — Every testimonial must have a metric
3. **Every build gets a lead magnet recommendation** — Top-of-funnel is mandatory
4. **Every build gets a viral loop audit** — Referral mechanics are not optional
5. **Every dashboard has empty states** — No more broken UX on zero data

---

**Update this file after every build. Track what's working. Fix what's not.**
