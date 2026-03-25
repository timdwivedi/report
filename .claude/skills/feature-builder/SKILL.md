# Feature Builder

Standard pattern for adding new features to the application.

## Trigger Phrases
- "add feature"
- "build feature"
- "create new feature"
- "implement [feature name]"
- `/feature`

---

## The Feature Implementation Flow

```
1. Plan      → docs/roadmap/XX_feature.md
2. Database  → supabase/migrations/XXX_feature.sql
3. Types     → web/lib/types/ (if needed)
4. API       → web/app/api/feature/route.ts
5. Hooks     → web/lib/hooks/useFeature.ts (if client needs data)
6. Component → web/components/feature/
7. Page      → web/app/[route]/page.tsx
8. Verify    → ./verify.sh
```

---

## Step 1: Create Roadmap File

### Auto-Numbering Rule (IMPORTANT)

**Before creating the roadmap file, scan `docs/roadmap/` for existing files to determine the next number.**

1. List all files in `docs/roadmap/` that start with a number (e.g., `01_`, `02_`, `05_`)
2. Find the highest number (ignore `00_` files like `00_PROJECT_BRIEF.md` and `00_MASTER_ROADMAP.md`)
3. Use the next number (highest + 1), zero-padded to 2 digits
4. If no numbered files exist (besides `00_`), start at `01`

**Example:**
- Only `00_` files exist → next file is `01_feature_name.md`
- Existing: `01_quiz.md`, `02_dashboard.md` → next file is `03_feature_name.md`
- Existing: `01_...`, `05_...` (gap is fine) → next file is `06_feature_name.md`

**NEVER guess the number. ALWAYS scan the folder first.**

**Location:** `docs/roadmap/XX_feature_name.md` (where XX is the auto-detected next number)

```markdown
# Feature: [Name]

## Overview
[What does this feature do? Who is it for?]

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Database Changes
[Tables to create/modify]

## API Endpoints
| Method | Route | Purpose |
|--------|-------|---------|
| GET | /api/feature | List items |
| POST | /api/feature | Create item |

## UI Components
- [ ] Component 1
- [ ] Component 2

## Testing
- [ ] Test case 1
- [ ] Test case 2
```

---

## Step 2: Database Migration

**Location:** `supabase/migrations/XXX_description.sql`

```sql
-- Migration: [Description]
-- Date: [YYYY-MM-DD]

-- Create table
CREATE TABLE IF NOT EXISTS feature_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_feature_items_user ON feature_items(user_id);
CREATE INDEX idx_feature_items_org ON feature_items(org_id);

-- Enable RLS
ALTER TABLE feature_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own items"
ON feature_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own items"
ON feature_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
ON feature_items FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items"
ON feature_items FOR DELETE
USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_feature_items_updated_at
    BEFORE UPDATE ON feature_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**IMPORTANT:** Run this in Supabase Dashboard SQL Editor before writing code that uses these tables.

---

## Step 3: API Route

**Location:** `web/app/api/feature/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { z } from "zod";

const CreateSchema = z.object({
  name: z.string().min(1),
  data: z.record(z.unknown()).optional(),
});

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();

  // Get user from auth header or cookie
  const authHeader = request.headers.get("Authorization");
  // ... validate user

  const { data, error } = await supabase
    .from("feature_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();

  const body = await request.json();
  const parsed = CreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("feature_items")
    .insert({ ...parsed.data, user_id: userId })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
```

---

## Step 4: React Hook (Optional)

**Location:** `web/lib/hooks/useFeature.ts`

```typescript
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useFeatureItems() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/feature",
    fetcher
  );

  return {
    items: data?.data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
```

---

## Step 5: Component

**Design Intelligence (auto-consult silently before building components):**
- Read `.claude/skills/vercel-react-best-practices/SKILL.md` -- follow performance patterns (proper memoization, avoid inline objects in JSX, co-locate state)
- Read `.claude/skills/vercel-composition-patterns/SKILL.md` -- use proper composition (compound components for complex UI, slots for customization)
- Read `.claude/skills/web-design-guidelines/SKILL.md` -- apply accessibility patterns (ARIA labels, keyboard navigation, focus management)

**Location:** `web/components/feature/FeatureList.tsx`

```typescript
"use client";

import { useFeatureItems } from "@/lib/hooks/useFeature";

export function FeatureList() {
  const { items, isLoading, isError } = useFeatureItems();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading items</div>;

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="p-4 border rounded-lg">
          <h3 className="font-medium">{item.name}</h3>
        </div>
      ))}
    </div>
  );
}
```

---

## Step 6: Page

**Location:** `web/app/dashboard/feature/page.tsx`

```typescript
import { FeatureList } from "@/components/feature/FeatureList";

export default function FeaturePage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Features</h1>
      <FeatureList />
    </div>
  );
}
```

---

## Step 7: Verify

```bash
./verify.sh
```

All checks should pass before committing.

---

## Checklist

Before marking a feature complete:

- [ ] Roadmap file created
- [ ] Migration written and run
- [ ] API routes with validation
- [ ] RLS policies tested
- [ ] Components created
- [ ] Page accessible
- [ ] `./verify.sh` passes
- [ ] Tested manually in browser

---

## Common Patterns

### Protected Route
```typescript
// In middleware.ts, routes under /dashboard/* are protected
```

### Optimistic Updates
```typescript
mutate(
  async (current) => {
    await fetch("/api/feature", { method: "POST", body: JSON.stringify(data) });
    return { ...current, data: [...current.data, newItem] };
  },
  { optimisticData: { ...current, data: [...current.data, newItem] } }
);
```

### Error Handling
```typescript
try {
  const res = await fetch("/api/feature", { ... });
  if (!res.ok) throw new Error("Failed to create");
  // success
} catch (error) {
  toast.error("Something went wrong");
}
```
