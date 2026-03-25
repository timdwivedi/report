# Master Plan — Post-Build Strategic Synthesis

> **Trigger:** Type **"master plan"** or **"create master plan"** after the client has reviewed the Bloom demo and you've collected their feedback.

---

## Purpose

After Bloom build completion and client demo call, this skill synthesizes all feedback, transcripts, and vision into a comprehensive Phase 2 implementation roadmap.

**What it does:**
- Reads all MVP launch documentation (01-04 files)
- Scans all intel collected from client (transcripts, notes, feedback)
- Reads deployment context
- Identifies gaps between current build and client's vision
- Creates actionable Phase 2 roadmap with priorities

---

## When to Use

✅ **Use this skill when:**
- Agents 1-7 have completed initial Bloom build
- Client has reviewed the demo (in-person or call)
- You've transcribed the demo call and collected feedback
- Client has sent additional notes, walkthrough feedback, or vision docs
- Intel folder contains this raw material

❌ **Don't use this skill when:**
- Still in initial build phase (use Agents 1-7 instead)
- Client hasn't seen the demo yet
- No feedback collected yet
- Just need to implement existing plan (use "Activate" workflow instead)

---

## Prerequisites

Before running this skill, ensure you have:

1. **Completed Initial Build**
   - All 7 agents have run successfully
   - Demo is viewable and functional
   - Files 01-04 exist in `docs/roadmap/mvp-launch/`

2. **Intel Folder Populated**
   - Location: `docs/roadmap/mvp-launch/intel/`
   - Contains: Call transcripts, walkthrough notes, client feedback, feature requests
   - At minimum: Demo call transcript or notes

3. **Client Has Reviewed Demo**
   - Either live demo call OR async video walkthrough
   - Client has articulated their vision and next steps
   - You understand what they loved vs what needs work

---

## Input Files (What This Skill Reads)

### Primary Context Files
```
docs/roadmap/mvp-launch/
├── 01_project_brief.md              # Original vision
├── 02_build_summary.md              # What was built (Agent 6)
├── 03_implementation_plan.md        # Original plan (Agent 6.5)
├── 04_debrief.md                    # Post-build analysis (Agent 7)
└── intel/                           # Client feedback (YOU populate this)
    ├── demo-call-transcript.md      # Transcribed demo call
    ├── client-feedback-notes.md     # Follow-up feedback
    ├── feature-requests.md          # New features they want
    └── walkthrough-notes.md         # Issues found during testing
```

### Deployment Context
```
docs/DEPLOYMENT_SETUP.md             # Deployment instructions
```

### Invisible Pipeline Intelligence Services (SCAN THESE)
```
web/lib/intelligence/
├── core/                            # Universal IP — domain-agnostic intelligence
│   ├── subject-scorer.ts            # Dream client scoring (harsh/moderate/lenient), 4-tier output
│   ├── subject-profiler.ts          # Psychographic analysis, decision modes, trigger words
│   ├── subject-dna-extractor.ts     # Structured intelligence extraction from vague input
│   ├── voice-dna-service.ts         # 10 voice metrics, rhythm signature, generative formulas
│   ├── voice-genome-engine.ts       # Source quality weights (Curated 10x, Call 5x, LinkedIn 4x)
│   ├── conversation-analyzer.ts     # Signal detection, engagement classification, next-action
│   ├── conversion-predictor.ts      # Pattern-based outcome prediction, temporal decay
│   ├── constitution-service.ts      # Brand governance, branded lexicon
│   ├── prompt-builder.ts            # 10-layer DOE assembly (Constitution→Voice→DNA→Psychographic→...)
│   └── output-validator.ts          # Quality gates: banned phrases, AI tells, format artifacts
├── config/presets/
│   ├── sales-pipeline.ts            # 10 qualification signals, 4-tier scoring, 3 archetypes
│   ├── coaching-diagnostic.ts       # 5 revenue ceiling archetypes with keyword triggers
│   └── neo-diagnostic.ts            # 10 ceiling types, verbatim language patterns, revenue gap formula
└── demo/                            # Phase 0 zero-database intelligence layer
```

**Why scan these:** These files contain the Invisible Pipeline's distilled proprietary methodology — scoring frameworks, psychographic profiling, voice genome analysis, conversion prediction, and revenue ceiling detection. When creating the master plan, reference these to:
- Recommend which intelligence modules to activate for the client's Phase 2
- Identify which scoring dimensions and archetypes fit the client's domain
- Suggest voice DNA training and constitution setup based on client feedback
- Frame Phase 2 features through the revenue engine lens (not generic SaaS features)

---

## Output File

**Creates:** `docs/roadmap/mvp-launch/05_master_plan.md`

**Structure:**
```markdown
# Phase 2 Master Plan: [Company Name]

> **Context:** [When created, what triggered this plan]
> **Client Vision:** [One-paragraph synthesis of their passionate vision]

## 1. What We Built (24-Hour MVP)
[Summary from 02_build_summary.md]

## 2. What the Client Loved
[Extract from demo call transcript - specific quotes]

## 3. What the Client Wants Next
[Extract from intel folder - features, improvements, vision]

## 4. Blind Spots Identified
[Gaps between current build and client's vision]

## 5. Phase 2 Implementation Roadmap

### Priority 1: Critical Path (Must-Have)
[Features blocking launch or core value prop]

### Priority 2: Viral Growth (High-Impact)
[Features that drive adoption, referrals, growth]

### Priority 3: Polish & Refinement
[UX improvements, edge cases, nice-to-haves]

## 6. Deployment Strategy
[Supabase org setup, Vercel config, domain, migrations]

## 7. Developer Handoff
[README-style instructions for implementation]
```

---

## How to Use This Skill

### Step 1: Collect Intel After Demo

**Demo Call Workflow:**
1. Get on call with client to show demo
2. Record/transcribe the call (use Otter.ai, Fireflies, or similar)
3. Client sends follow-up notes, feature requests, feedback
4. Save everything in `docs/roadmap/mvp-launch/intel/`

**Intel Folder Structure:**
```bash
cd docs/roadmap/mvp-launch/intel/
touch demo-call-transcript.md         # Transcribe call here
touch client-feedback-notes.md        # Paste client's written feedback
touch feature-requests.md             # List of features they want
touch walkthrough-notes.md            # Issues found during testing
```

### Step 2: Invoke the Skill

In Claude Code, simply type:
```
master plan
```

Or:
```
create master plan
```

### Step 3: Review & Refine

The skill will:
1. Read all 01-04 files + intel folder + deployment docs
2. Synthesize client's passionate vision from transcripts
3. Identify blind spots (gaps between current vs vision)
4. Create `05_master_plan.md` with actionable roadmap

**Review the output:**
- Does it capture the client's vision accurately?
- Are the priorities correct (critical path vs nice-to-have)?
- Is the deployment strategy clear?

### Step 4: Use for Implementation

Once `05_master_plan.md` is created, you can:
- Share it with the client for approval
- Use it to guide Phase 2 development
- Reference it when invoking "Activate" workflow for implementation
- Update it as new intel comes in

---

## Execution Steps (For Claude Code)

When this skill is invoked, follow this sequence:

### Phase 1: Context Gathering

**Read all MVF launch files:**
```bash
Read docs/roadmap/mvp-launch/01_project_brief.md
Read docs/roadmap/mvp-launch/02_build_summary.md
Read docs/roadmap/mvp-launch/03_implementation_plan.md
Read docs/roadmap/mvp-launch/04_debrief.md
Read docs/DEPLOYMENT_SETUP.md
```

**Scan intel folder:**
```bash
Glob docs/roadmap/mvp-launch/intel/**/*.md
# Read all markdown and text (and potential PDF) files found
```

**Scan intelligence services (proprietary IP):**
```bash
# Read the intelligence engine skill for module catalog + detection rules
Read .claude/skills/intelligence-engine/SKILL.md

# Scan key intelligence presets for scoring/archetype frameworks
Read web/lib/intelligence/config/presets/sales-pipeline.ts
Read web/lib/intelligence/config/presets/coaching-diagnostic.ts

# Scan core services for methodology to recommend in Phase 2
Glob web/lib/intelligence/core/*.ts
# At minimum read: subject-scorer.ts, subject-profiler.ts, prompt-builder.ts
```

Use these to inform the Intelligence Engine section of the master plan (Phase 2 module recommendations, scoring dimensions, archetype definitions, voice DNA training setup).

**If intel folder is empty or doesn't exist:**
```
⚠️  No intel found in docs/roadmap/mvp-launch/intel/

Before creating the master plan, you need to collect client feedback:
1. Transcribe the demo call → save as intel/demo-call-transcript.md
2. Collect client's written feedback → save as intel/client-feedback-notes.md
3. List feature requests → save as intel/feature-requests.md

Once you have at least one intel file, re-run this skill.
```

### Phase 2: Vision Synthesis

**Extract from transcripts:**
- What did the client get excited about? (direct quotes)
- What features did they immediately ask for?
- What's their "big vision" for this product?
- What problems are they trying to solve?
- What's their timeline/urgency?

**Extract from feedback notes:**
- What broke or confused them?
- What features are missing?
- What's their ideal user flow?
- What integrations do they need?

**Synthesize into one paragraph:**
> "The client envisions [X]. They were most excited about [Y] and immediately asked for [Z]. Their core problem is [A], and they need this to [B] by [timeline]."

### Phase 3: Gap Analysis

**Compare:**
- What we built (from 02_build_summary.md)
- What they want (from intel folder)

**Identify blind spots:**
- Features we didn't know they needed
- UX issues they discovered during demo
- Integrations/APIs missing
- Scale/performance concerns
- Deployment blockers

**Categorize gaps:**
- Critical (blocks launch or core value)
- High-Impact (drives growth or adoption)
- Polish (nice-to-have improvements)

### Phase 4: Roadmap Creation

**Priority 1: Critical Path**
- Features blocking launch
- Core value prop gaps
- Deployment/infrastructure needs
- Security/compliance issues

**Priority 2: Viral Growth**
- Referral mechanics
- Social sharing
- Network effects
- Onboarding optimization

**Priority 3: Polish & Refinement**
- UX improvements
- Edge case handling
- Performance optimization
- Nice-to-have features

**For each priority:**
```markdown
### [Feature Name]
- **Why it matters:** [Impact on business/users]
- **What it does:** [User-facing description]
- **How to build:** [Technical approach]
- **Effort:** [Small/Medium/Large]
- **Dependencies:** [What needs to happen first]
```

### Phase 5: Deployment Strategy

**Read deployment context:**
- Current Supabase setup (from DEPLOYMENT_SETUP.md)
- Vercel configuration
- Environment variables
- Domain status

**Plan Phase 2 deployment:**
- New Supabase org? (client's own account)
- Migration strategy (if moving from demo to production)
- Domain setup (custom domain)
- SSL/HTTPS configuration
- Database backups

### Phase 6: Developer Handoff

**Create README-style instructions:**
```markdown
## For the Developer

### Quick Start
1. Clone repo: `git clone ...`
2. Install deps: `npm install`
3. Set up Supabase: [link to DEPLOYMENT_SETUP.md]
4. Run locally: `npm run dev`

### Project Structure
[Brief overview of folders/files]

### Key Files to Know
- `app/(dashboard)/page.tsx` - Main dashboard
- `lib/api/` - API utilities
- `components/` - Reusable components

### How to Add Features
[Reference to 05_master_plan.md priorities]

### Deployment
[Reference to DEPLOYMENT_SETUP.md]

### Support
[How to get help, contact info]
```

### Phase 7: Write Output File

**Create:** `docs/roadmap/mvp-launch/05_master_plan.md`

**Include:**
1. Context summary (what was built, when, why)
2. Client vision synthesis (from transcripts)
3. What they loved (direct quotes from demo)
4. What they want next (from intel folder)
5. Blind spots identified (gap analysis)
6. Phase 2 roadmap (3-tier priorities)
7. Deployment strategy (Supabase, Vercel, domain)
8. Developer handoff (README-style)

**Formatting:**
- Use clear headings (##, ###)
- Include direct quotes from client (blockquotes)
- Use tables for roadmap items
- Use checklists for deployment steps
- Keep paragraphs concise

---

## Example Output Structure

```markdown
# Phase 2 Master Plan: RockSolid Lead Gen

> **Context:** Created Feb 15, 2026 after demo call with client.
> **Client Vision:** "I want to be the go-to lead gen tool for commercial real estate. This needs to replace cold calling entirely and make prospecting actually enjoyable."

## 1. What We Built (24-Hour MVP)

[Summary from 02_build_summary.md]
- Dashboard with lead import
- LinkedIn extension for profile scraping
- Basic scoring system
- Email templates

## 2. What the Client Loved

> "The LinkedIn extension is *chef's kiss*. This is exactly what I needed. I can see this saving me 10 hours a week." — Demo Call, 02/15

> "The scoring system is brilliant. I never thought about grading leads like this before." — Follow-up email

## 3. What the Client Wants Next

From demo call and follow-up feedback:

1. **Automated Outreach Sequences** — "I want to set it and forget it. Load 100 leads, let it send 5 messages per day automatically."

2. **CRM Integration** — "I use HubSpot. Can we sync leads both ways?"

3. **Team Collaboration** — "I have 3 setters. They need their own accounts but share the same lead pool."

4. **Analytics Dashboard** — "I want to see conversion rates, response times, which messages work best."

## 4. Blind Spots Identified

| Gap | Why It Matters | Complexity |
|-----|----------------|------------|
| No automated sending | Manual DMs don't scale beyond 20 leads/day | Medium |
| No CRM sync | Client will duplicate work otherwise | High |
| Single-user only | Client has a team, can't onboard them | Medium |
| No analytics | Client can't optimize without data | Low |
| LinkedIn rate limits | Extension could trigger account flags | High |

## 5. Phase 2 Implementation Roadmap

### Priority 1: Critical Path (Must-Have)

#### 1. Multi-User Support + Team Roles
- **Why:** Client has 3 setters waiting to use this. Blocking revenue.
- **What:** Add org/team structure, role-based access, lead assignment.
- **How:** Supabase RLS policies, organization_members table, invite flow.
- **Effort:** Medium (2-3 days)
- **Dependencies:** None — can start immediately

#### 2. LinkedIn Rate Limit Protection
- **Why:** Client's account could get flagged/banned without this.
- **What:** Delay randomization, daily limits, session detection.
- **How:** Extension storage for tracking, configurable limits, warnings.
- **Effort:** Small (1 day)
- **Dependencies:** None — critical for safety

### Priority 2: Viral Growth (High-Impact)

#### 3. Automated Outreach Sequences
- **Why:** Main feature client wants. 10x productivity unlock.
- **What:** Queue system, scheduled sending, follow-up logic.
- **How:** Supabase cron jobs, automation_queue table, extension API.
- **Effort:** Large (5-7 days)
- **Dependencies:** Rate limit protection must be live first

#### 4. Analytics Dashboard
- **Why:** Client can't optimize without data. Retention driver.
- **What:** Conversion tracking, message performance, lead funnel.
- **How:** lead_activities table, Chart.js, aggregate queries.
- **Effort:** Medium (3-4 days)
- **Dependencies:** None — can build in parallel

### Priority 3: Polish & Refinement

#### 5. HubSpot Integration
- **Why:** Client uses HubSpot daily. Reduces friction.
- **What:** Two-way sync, field mapping, webhook handlers.
- **How:** HubSpot OAuth, API integration, background jobs.
- **Effort:** Large (7-10 days)
- **Dependencies:** Multi-user support (org context needed)

#### 6. Message Template Library
- **Why:** Client wants to A/B test different approaches.
- **What:** Save templates, version history, sharing across team.
- **How:** message_templates table, rich text editor, versioning.
- **Effort:** Small (2 days)
- **Dependencies:** None

## 6. Deployment Strategy

### Current State (Demo Environment)
- Supabase: Developer's account (shared project)
- Vercel: `rocksolid-lead-gen.vercel.app`
- Domain: None (using .vercel.app subdomain)

### Phase 2 Deployment (Production)

**Week 1: Own Supabase Org**
- [ ] Client creates Supabase account
- [ ] Create new project: `rocksolid-production`
- [ ] Run migrations from `web/supabase/migrations/`
- [ ] Set up RLS policies
- [ ] Update environment variables

**Week 2: Custom Domain**
- [ ] Client purchases domain: `rocksolidleads.com`
- [ ] Configure DNS (Vercel)
- [ ] SSL certificate (auto via Vercel)
- [ ] Update extension manifest with production domain

**Week 3: Team Onboarding**
- [ ] Invite 3 setters via Admin Panel
- [ ] Configure roles (setter/closer)
- [ ] Training session on new features

### Migration Strategy
- **Option A:** Fresh start (clean database, import leads manually)
- **Option B:** Data migration (export from demo, import to production)

**Recommendation:** Option A (fresh start) — demo has test data only, easier to start clean.

## 7. Developer Handoff

### Quick Start
```bash
git clone [repo-url]
cd rocksolid-lead-gen
npm install
cp .env.example .env.local
# Fill in Supabase credentials
npm run dev
```

### Project Structure
```
app/
  (dashboard)/     # Main dashboard pages
  api/             # API routes
components/        # Reusable UI components
lib/
  api/             # API utilities
  hooks/           # Custom React hooks
  supabase.ts      # Database types
extension/         # Chrome extension code
```

### Key Files
- `app/(dashboard)/page.tsx` — Main dashboard
- `extension/background.js` — LinkedIn scraping logic
- `lib/api/leadService.ts` — Lead CRUD operations
- `components/LeadTable.tsx` — Main leads view

### How to Add Features

**For Priority 1 tasks:**
1. Read `05_master_plan.md` (this file)
2. Start with "Multi-User Support" section
3. Reference `docs/DEPLOYMENT_SETUP.md` for database setup
4. Follow existing patterns in `lib/api/` for new endpoints

**For Priority 2 tasks:**
1. Complete Priority 1 first (dependencies)
2. Use background jobs for automation (`automation_queue` table)
3. Test rate limits thoroughly (use test LinkedIn account)

### Deployment
See `docs/DEPLOYMENT_SETUP.md` for full instructions.

### Support
- **Technical Questions:** [Your email]
- **Feature Requests:** Update `intel/feature-requests.md`
- **Bugs:** Create GitHub issue

---

**Last Updated:** Feb 15, 2026
**Next Review:** After Priority 1 completion
```

### Phase 8: Output Implementation Roadmap to Chat

**After creating `05_master_plan.md`, you MUST output a concise implementation guide to the user in the chat.**

This is NOT just "file created" — this is the ACTION PLAN for getting to working MVP ASAP.

**Format:**

```markdown
✅ **05_master_plan.md created successfully**

---

## 🚀 Fastest Path to Working MVP

Based on the master plan, here's how to get your core product functionality working:

### **The Engine** (What makes this product valuable — build THIS first)

**Core Feature:** [What's the main value? e.g., "12-minute AI diagnostic conversation"]

**Critical Files to Create/Modify:**
1. `[file-path]` — [what it does]
2. `[file-path]` — [what it does]
3. `[file-path]` — [what it does]

**Required API Routes:**
- `POST /api/[endpoint]` — [purpose]
- `POST /api/[endpoint]` — [purpose]
- `GET /api/[endpoint]` — [purpose]

**Database Setup:**
- Migration needed: `[migration-file]` — [what tables/columns]
- Key tables: `[table-name]` (for [purpose])

**Third-Party Services:**
- [ ] [Service name] — Get API key from [where]
- [ ] [Service name] — Configure [what]

**Environment Variables Required:**
```bash
# Add to .env.local:
SERVICE_API_KEY=your_key_here
SERVICE_URL=https://...
```

---

### **Implementation Order** (Step-by-step)

**Week 1: Make the core feature work**
1. [ ] Set up [service] account + API keys
2. [ ] Create/modify [file 1] — [purpose]
3. [ ] Create/modify [file 2] — [purpose]
4. [ ] Run migration: `[migration-file]`
5. [ ] Test: [specific test scenario]

**Week 2: Connect the pieces**
1. [ ] [Task]
2. [ ] [Task]
3. [ ] Test: [specific test scenario]

---

### **What to Build FIRST (P0 - Non-Negotiable)**

| Task | File | Why Critical |
|------|------|-------------|
| [Task name] | `[file]` | [blocking issue if not done] |
| [Task name] | `[file]` | [blocking issue if not done] |

---

### **What Can Wait (P1 - Polish)**

- [ ] [Feature] — improves UX but not required for MVP
- [ ] [Feature] — nice-to-have enhancement
- [ ] [Integration] — can add after core works

---

### **Quick Verification**

To test if your MVP is working:
1. [Step 1 to test core feature]
2. [Step 2]
3. Expected result: [what success looks like]

---

**Next Action:** [Most urgent task to start with]
```

---

**Example Output for NEO (from rocksolid master plan):**

```markdown
✅ **05_master_plan.md created successfully**

---

## 🚀 Fastest Path to Working MVP

Based on the master plan, here's how to get the 12-minute AI diagnostic working:

### **The Engine** (The conversation IS the product)

**Core Feature:** 12-minute AI diagnostic that identifies revenue ceiling via conversation

**Critical Files to Create:**
1. `web/lib/ai/neo-system-prompt.ts` — 5-layer system prompt (personality + classification logic)
2. `web/lib/ai/pattern-detector.ts` — Scores messages against 10 ceiling archetypes
3. `web/lib/ai/conversation-manager.ts` — State machine (tracks timer, phase transitions)
4. `web/lib/ai/types.ts` — TypeScript types for session state

**Required API Routes:**
- `POST /api/neo/start-session` — Creates session, returns Neo's opening message
- `POST /api/neo/message` — Handles conversation (Claude API + pattern detection)
- `POST /api/neo/classify` — Final classification when confidence > 70%
- `POST /api/neo/complete` — Saves financial data, creates lead, routes to next step

**Database Setup:**
- Migration needed: `004_session_enhancements.sql`
  - Adds: `contact_name`, `contact_email`, `conversation_phase`, `classification_confidence`
- Key tables: `diagnostic_sessions` (stores conversation + classification)

**Third-Party Services:**
- [ ] **Anthropic API** — Get key from https://console.anthropic.com
- [ ] **Supabase** — Create new org/project, run migrations 001-004

**Environment Variables Required:**
```bash
# Add to web/.env.local:
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

### **Implementation Order** (Step-by-step)

**Week 1: Make the conversation work**
1. [ ] Create Anthropic API account + get API key
2. [ ] Create 4 AI files (system prompt, pattern detector, conversation manager, types)
3. [ ] Rewrite `/api/neo/start-session` — test opening message generates
4. [ ] Rewrite `/api/neo/message` — test full conversation with pattern scoring
5. [ ] Test: Have a full 12-minute diagnostic conversation, verify it feels like Tony Robbins interviewing you

**Week 2: Connect classification + reveal**
1. [ ] Rewrite `/api/neo/classify` — match to ceiling archetypes
2. [ ] Make reveal page dynamic (pull from session data, not hardcoded)
3. [ ] Add typewriter effect + screen flicker to reveal
4. [ ] Add email gate on mirror entry page
5. [ ] Test: Full flow from email → conversation → classification → reveal

---

### **What to Build FIRST (P0 - Non-Negotiable)**

| Task | File | Why Critical |
|------|------|-------------|
| AI system prompt | `web/lib/ai/neo-system-prompt.ts` | Without this, Neo sounds like generic GPT |
| Message API | `web/app/api/neo/message/route.ts` | This IS the product — conversation must work |
| Email gate | `web/app/mirror/page.tsx` | Without email capture, 97% of traffic is lost |
| Dynamic reveal | `web/app/mirror/reveal/page.tsx` | Hardcoded "Perfection Ceiling" ruins personalization |

---

### **What Can Wait (P1 - Polish)**

- [ ] GHL sync — improves lead routing but not required for diagnostic to work
- [ ] Email report — nice-to-have, can add after core works
- [ ] Sequential cost sliders — UX polish, doesn't block validation
- [ ] Share buttons — viral growth feature, add after product works

---

### **Quick Verification**

To test if your MVP is working:
1. Visit `/mirror` → enter name + email
2. Start conversation → send 6-10 messages drilling into revenue blocks
3. System classifies ceiling after ~10 minutes
4. Redirect to `/mirror/reveal` → see YOUR ceiling (not hardcoded)
5. Expected result: Conversation feels surgical, classification is accurate, reveal is personalized

---

**Next Action:** Create the 4 AI files in `web/lib/ai/` — this is the foundation everything else depends on.
```

---

**Key Principles for This Output:**

1. **Focus on THE ENGINE** — what makes this product unique/valuable
2. **Prioritize ruthlessly** — P0 = blocks validation, P1 = polish
3. **Be specific** — file paths, not vague "implement backend"
4. **Show dependencies** — what blocks what
5. **Make it actionable** — developer can start immediately

---

## Tips for Best Results

### For Client Demo Calls
- **Record everything** — Don't rely on memory
- **Ask follow-up questions** — "What would make this 10x better?"
- **Get specific** — "Show me what you'd do with 100 leads"
- **Document vision** — "Where do you see this in 6 months?"

### For Intel Collection
- **Use their words** — Direct quotes are powerful
- **Prioritize ruthlessly** — Not all features are equal
- **Think business impact** — Revenue > polish
- **Consider effort** — Quick wins build momentum

### For Master Plan Creation
- **Be honest about gaps** — Client appreciates transparency
- **Show trade-offs** — "We can do X OR Y first, not both"
- **Reference deployment** — Real constraints matter
- **Make it actionable** — Developer should know exactly what to do

---

## FAQs

**Q: What if the client hasn't sent feedback yet?**
A: Wait. This skill needs intel to work. Send them a follow-up email asking for specific feedback.

**Q: What if there's too much feedback to process?**
A: Prioritize ruthlessly. Focus on what blocks launch or drives revenue.

**Q: Should I include every feature request?**
A: No. Capture everything, but prioritize only what matters. Use Priority 3 for "nice-to-haves."

**Q: How often should I update the master plan?**
A: After each major milestone or new intel collection. Treat it as a living document.

**Q: Can I use this for non-Bloom projects?**
A: Yes, but adapt the file paths. This skill assumes Bloom structure.

---

## Packaging Note

**IMPORTANT:** This skill is NOT removed during Bloom packaging.

**What gets removed:**
- `agent-*` skills (build-specific)
- Build logs
- Temporary files

**What stays:**
- `master-plan` skill (strategic tool for client)
- All `docs/` files
- `DEPLOYMENT_SETUP.md`

**Why:** The master plan skill is useful for the client's ongoing development, not just the initial build. Keep it in the package.
