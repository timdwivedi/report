# Roadmap Documentation

This folder contains detailed implementation plans for all features in the Bloom app.

## Structure

Each feature should have its own markdown file following this naming convention:
- `XX_feature_name.md` where XX is a number for ordering

### Auto-Numbering Rule
**Before creating a new file, scan this folder for the highest existing number:**
1. Ignore `00_` files (PROJECT_BRIEF, MASTER_ROADMAP, this README)
2. Find the highest number (e.g., if `03_quiz.md` exists, next is `04`)
3. Use the next number, zero-padded to 2 digits
4. **Never guess -- always scan first**

## Template

When creating a new roadmap file, include these sections:

```markdown
# Feature Name

> One-line summary of the feature

## Overview

Brief description of what this feature does and why it's needed.

## Objectives

- [ ] Objective 1
- [ ] Objective 2
- [ ] Objective 3

## Technical Approach

### Database Changes

```sql
-- Migration SQL here
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/feature | Description |
| POST | /api/feature | Description |

### Components

- `FeatureComponent.tsx` - Main component
- `FeatureForm.tsx` - Form component

### State Management

Describe how state will be managed.

## Implementation Steps

1. Create database migration
2. Implement API routes
3. Build UI components
4. Add tests
5. Update documentation

## Testing Plan

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

## Rollout Plan

1. Deploy to staging
2. Internal testing
3. Beta release
4. GA release

## Success Metrics

- Metric 1
- Metric 2

## Dependencies

- Dependency 1
- Dependency 2

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Risk 1 | Mitigation 1 |
```

## Index

| # | Feature | Status | Priority |
|---|---------|--------|----------|
| 00 | Master Roadmap | Active | - |
| 01 | Auth & Users | Planned | P0 |
| 02 | Organizations | Planned | P0 |

## Guidelines

1. **Always plan before implementing** - Create a roadmap file before starting work
2. **Keep files updated** - Mark objectives as complete as you progress
3. **Link related files** - Reference other roadmap files when features overlap
4. **Document decisions** - Explain why certain approaches were chosen
5. **Review regularly** - Update priorities based on feedback and learnings
