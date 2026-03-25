# Product Lifecycle (B.L.A.S.T.)

A gated lifecycle for building significant products, features, or apps. Use this when building something substantial that needs quality gates.

## Trigger Phrases
- "build product"
- "product mode"
- "start B.L.A.S.T."
- "gated build"
- `/product`

---

## When to Use

Use B.L.A.S.T. for:
- New SaaS features with multiple components
- Full app builds
- Anything with database + API + UI layers
- Projects that need documentation and testing

**Skip B.L.A.S.T. for:**
- Quick fixes
- Single-file changes
- Simple UI tweaks

---

## The B.L.A.S.T. Framework

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  BLUEPRINT  │───▶│    LINK     │───▶│  ARCHITECT  │───▶│   STYLIZE   │───▶│   TRIGGER   │
│   (Plan)    │    │  (Connect)  │    │   (Build)   │    │  (Polish)   │    │  (Deploy)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │                  │                  │
      ▼                  ▼                  ▼                  ▼                  ▼
  Questions          Credentials        Scripts &         UI/Brand          Go Live
  answered           verified           architecture      applied           + docs
```

---

## Phase 1: BLUEPRINT

**Goal:** Complete understanding before any code is written.

### Gate Criteria
- [ ] All discovery questions answered
- [ ] Data schema defined
- [ ] User flows mapped
- [ ] Edge cases identified

### Deliverables
1. **Roadmap file**: `docs/roadmap/XX_feature_name.md` (scan `docs/roadmap/` for highest number, use next number. See feature-builder auto-numbering rule.)
2. **B.L.A.S.T. tracker**: Auto-create `docs/roadmap/XX_feature_name_BLAST.md` (see Progress Tracker section below)
3. **Schema design**: Tables, columns, relationships
4. **User stories**: Who does what, when, why

### Questions to Answer
```markdown
1. What problem does this solve?
2. Who is the user?
3. What data do we need to store?
4. What are the main user flows?
5. What could go wrong? (edge cases)
6. What's the MVP vs nice-to-have?
7. Will team members need to see this data? (if yes, add org_id from the start)
8. Does this exist elsewhere in the codebase? (search for similar patterns FIRST)
```

**Do NOT proceed until BLUEPRINT is complete.**

---

## Phase 2: LINK

**Goal:** All external services connected and verified.

### Gate Criteria
- [ ] Database tables created
- [ ] API credentials configured
- [ ] Handshake tests pass
- [ ] Environment variables set

### Deliverables
1. **Migration files**: `supabase/migrations/XXX_feature.sql`
2. **Env vars**: Added to `.env.local`
3. **Connection tests**: Verify all services respond

### Checklist
```markdown
- [ ] Supabase table created
- [ ] RLS policies added (SELECT, INSERT, UPDATE, DELETE)
- [ ] Indexes on foreign keys
- [ ] Third-party API keys configured
- [ ] Test API calls succeed
```

**Do NOT proceed until LINK is complete.**

---

## Phase 3: ARCHITECT

**Goal:** Core functionality built with proper architecture.

### Gate Criteria
- [ ] API routes created and tested
- [ ] Database queries working
- [ ] Business logic implemented
- [ ] Error handling in place

### Deliverables
1. **API routes**: `web/app/api/feature/route.ts`
2. **Hooks** (if needed): `web/lib/hooks/useFeature.ts`
3. **Types**: Updated in `web/lib/types/`
4. **Scripts** (if deterministic logic): `scripts/ops/`

### Architecture Pattern
```
Request → Validate (Zod) → Auth Check → Business Logic → Database → Response
```

**Do NOT proceed until ARCHITECT is complete.**

---

## Phase 4: STYLIZE

**Goal:** UI polished and brand-consistent.

**Design Intelligence (auto-consult before building):**
- Read `.claude/skills/web-design-guidelines/SKILL.md` -- apply accessibility and interaction patterns to all components
- Read `.claude/skills/vercel-react-best-practices/SKILL.md` -- follow React performance patterns
- Read `.claude/skills/vercel-composition-patterns/SKILL.md` -- use proper component composition and server/client boundaries
- Read `.claude/skills/tailwind-design-system/SKILL.md` -- use Tailwind v4 patterns (CVA for variants, OKLCH for colors) if project uses Tailwind v4
- If a `design-system/` folder exists in the project, read `MASTER.md` for pre-generated style tokens

### Gate Criteria
- [ ] Components created
- [ ] Responsive design verified
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Accessibility checked (keyboard nav, ARIA labels, focus states)

### Deliverables
1. **Components**: `web/components/feature/`
2. **Pages**: `web/app/[route]/page.tsx`
3. **Loading/Error states**: Skeleton loaders, error boundaries

### UI Checklist
```markdown
- [ ] Mobile responsive (375px minimum)
- [ ] Dark mode works (if applicable)
- [ ] Loading states show feedback
- [ ] Error messages are helpful
- [ ] Forms have validation
- [ ] Buttons have hover/active/focus states
- [ ] Touch targets are at least 44x44px
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 large text)
- [ ] Semantic HTML used (proper headings, landmarks, lists)
```

**Do NOT proceed until STYLIZE is complete.**

---

## Phase 5: TRIGGER

**Goal:** Deployed, documented, and automated.

### Gate Criteria
- [ ] `./verify.sh` passes
- [ ] Feature tested end-to-end
- [ ] Documentation updated
- [ ] Deployment successful

### Deliverables
1. **Verification**: TypeScript + lint + tests pass
2. **Documentation**: README or roadmap updated
3. **Deployment**: Live on staging/production

### Final Checklist
```markdown
- [ ] ./verify.sh passes
- [ ] Manual testing complete
- [ ] Edge cases tested
- [ ] Documentation reflects changes
- [ ] Deployed and accessible
- [ ] Monitoring/logging in place (if applicable)
```

---

## Progress Tracker (Auto-Created)

**IMPORTANT: When starting a B.L.A.S.T. process, AUTOMATICALLY create a progress tracker file.**

### How to Create the Tracker

1. Scan `docs/roadmap/` for the highest numbered file (same rule as feature-builder)
2. Create the tracker at `docs/roadmap/XX_feature_name_BLAST.md` using the next number
3. Update this file as you complete each phase -- check off items as they're done
4. When you transition between phases, update the "Current Phase" line

### Tracker Template (create this file automatically)

```markdown
# B.L.A.S.T. Progress: [Feature Name]

> Started: [Date]
> Status: In Progress

## Current Phase: BLUEPRINT

### BLUEPRINT
- [ ] Discovery questions answered
- [ ] Roadmap file created
- [ ] Schema designed
- [ ] User flows mapped
- [ ] Edge cases identified

### LINK
- [ ] Database tables created
- [ ] RLS policies added (SELECT, INSERT, UPDATE, DELETE)
- [ ] Indexes on foreign keys
- [ ] Environment variables set
- [ ] Connection tests pass

### ARCHITECT
- [ ] API routes built and tested
- [ ] Business logic implemented
- [ ] Hooks created (if needed)
- [ ] Error handling in place
- [ ] Types updated

### STYLIZE
- [ ] Components created
- [ ] Pages created
- [ ] Mobile responsive verified
- [ ] Loading states implemented
- [ ] Error states handled

### TRIGGER
- [ ] verify.sh passes
- [ ] Manual testing complete
- [ ] Edge cases tested
- [ ] Documentation updated
- [ ] Deployed and accessible

---

## Notes
[Add notes as you progress through each phase]
```

**Update the tracker file after completing EACH checklist item, not just at the end of each phase.** This gives the user a clear view of progress at any time.

---

## Example Usage

```
User: "I want to add a feedback collection feature"

Claude: "This sounds like a significant feature. Let me start B.L.A.S.T. mode.

**PHASE 1: BLUEPRINT**

I need to understand the requirements first:
1. What kind of feedback? (ratings, text, both?)
2. Who can submit feedback? (any user, logged-in only?)
3. Where does feedback appear? (admin dashboard, public?)
4. Do you need email notifications when feedback is submitted?

Let's answer these before writing any code."
```

---

## Key Principle

**"No code until BLUEPRINT is complete. No UI until ARCHITECT is complete."**

This prevents:
- Building the wrong thing
- Architectural rewrites
- UI that doesn't match the data model
- Forgotten edge cases

---

## Memory

Check `memory/learnings.md` before starting any B.L.A.S.T. process.
