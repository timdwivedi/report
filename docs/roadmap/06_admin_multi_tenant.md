# BrandOps — Super Admin Panel + Multi-Tenant Architecture

## Status: Phase 1 Complete (Demo Mode)

All admin pages are built and functional in demo mode. Supabase integration is the next step.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  BrandOps Platform               │
├─────────────────────────────────────────────────┤
│                                                   │
│  /admin/*  ── Super Admin Panel ──────────────── │
│    ├── Overview (platform stats)                  │
│    ├── Accounts (org CRUD + View As)              │
│    ├── Account Detail (projects/orders/team/cfg)  │
│    ├── Users (platform user management)           │
│    └── Health Monitor (activity tracking)         │
│                                                   │
│  /dashboard/*  ── Org Dashboard ─────────────── │
│    ├── Org Switcher (header dropdown)             │
│    ├── Impersonation Banner (View As indicator)   │
│    └── All existing dashboard pages               │
│                                                   │
├─────────────────────────────────────────────────┤
│  Auth Layer                                       │
│    ├── AuthProvider: effectiveRole, isSuperAdmin  │
│    ├── OrgContextProvider: View As, org switching │
│    └── Middleware: /admin + /dashboard protection  │
│                                                   │
├─────────────────────────────────────────────────┤
│  Data Layer                                       │
│    ├── demo-data-provider.ts (orgId-aware)        │
│    ├── admin-demo-data.ts (3 orgs, 10 users)     │
│    ├── useAdminData hook                          │
│    └── API stubs: /api/admin/*                    │
│                                                   │
├─────────────────────────────────────────────────┤
│  Database (Supabase — future)                     │
│    ├── organizations (RLS by org_id)              │
│    ├── organization_members (user ↔ org)          │
│    ├── user_profiles (role, home org)             │
│    └── All entity tables (org_id FK)              │
└─────────────────────────────────────────────────┘
```

---

## What's Built (Demo Mode)

### Pages
| Route | Description |
|-------|-------------|
| `/admin` | Platform Overview — stats, activity, health |
| `/admin/accounts` | Accounts list — search, create, View As |
| `/admin/accounts/[id]` | Account detail — projects, orders, team, settings tabs |
| `/admin/users` | Users list — search, role filter, role change, View As |
| `/admin/health` | Health monitor — grouped by active/moderate/stale |

### Components
| Component | Location |
|-----------|----------|
| OrgSwitcher | `components/shared/OrgSwitcher.tsx` |
| ImpersonationBanner | `components/shared/ImpersonationBanner.tsx` |
| Admin Layout | `app/admin/layout.tsx` |

### Data
| File | Purpose |
|------|---------|
| `lib/demo/admin-demo-data.ts` | 3 orgs, 10 users, health metrics, per-org data |
| `lib/hooks/useAdminData.ts` | Hook wrapping admin demo data getters |
| `lib/demo/demo-data-provider.ts` | Extended with optional orgId parameter |

### Providers
| Provider | Changes |
|----------|---------|
| AuthProvider | Added effectiveRole, isSuperAdmin |
| OrgContextProvider | Added View As (startViewAs/stopViewAs), multi-org loading |

---

## Supabase Migration Plan

### Migration: `002_admin_multi_tenant.sql`

```sql
-- 1. Add role to user_profiles (if not exists)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'viewer'
  CHECK (role IN ('super_admin', 'owner', 'admin', 'sales', 'production', 'viewer'));

-- 2. Add health tracking columns to organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'active'
  CHECK (health_status IN ('active', 'moderate', 'stale'));

-- 3. RLS policies for admin access
CREATE POLICY "Super admins can read all organizations"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can read all org members"
  ON organization_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- 4. Function to compute org health (runs on cron)
CREATE OR REPLACE FUNCTION compute_org_health()
RETURNS void AS $$
BEGIN
  UPDATE organizations SET health_status = CASE
    WHEN last_activity_at > now() - INTERVAL '7 days' THEN 'active'
    WHEN last_activity_at > now() - INTERVAL '30 days' THEN 'moderate'
    ELSE 'stale'
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Production Wiring Checklist

- [ ] Run `002_admin_multi_tenant.sql` migration
- [ ] Set Trevor's `user_profiles.role = 'super_admin'`
- [ ] Update AuthProvider to fetch role from `user_profiles` table
- [ ] Update OrgContextProvider to fetch orgs from `organization_members` join
- [ ] Replace demo data getters with Supabase queries in admin pages
- [ ] Update useAdminData hook to call `/api/admin/*` routes
- [ ] Wire `/api/admin/view-as` to set `app_metadata.impersonating_user_id`
- [ ] Add org creation API (insert into `organizations` + `organization_members`)
- [ ] Add team invite flow (email + magic link)
- [ ] Update middleware to check `user_profiles.role` for `/admin` access
- [ ] Add cron job for `compute_org_health()` (Supabase pg_cron)
- [ ] Test RLS policies with multiple user sessions

---

## API Routes (Stubs → Production)

| Route | Method | Demo | Production |
|-------|--------|------|------------|
| `/api/admin/stats` | GET | Returns demo stats | Aggregate query across all orgs |
| `/api/admin/organizations` | GET/POST | Returns demo orgs / local state | Supabase CRUD |
| `/api/admin/users` | GET | Returns demo users | Join user_profiles + org_members |
| `/api/admin/org-members` | GET/POST | Returns demo team | Supabase CRUD + invite email |
| `/api/admin/view-as` | POST | localStorage | Set app_metadata.impersonating_user_id |
