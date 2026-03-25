# Feature Builder - Learnings

> **Purpose:** Lessons learned while building features. Read this BEFORE executing.

---

## Logged Learnings

### Always Add All 4 RLS Policies
**What happened:** New table could be queried (SELECT) but inserts failed with "permission denied".
**Root cause:** Only created SELECT policy, forgot INSERT/UPDATE/DELETE policies.
**Fix:** Every new table needs all 4 RLS policies: SELECT, INSERT, UPDATE, DELETE.
**Prevention:** Use this template for every new table:
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select" ON table_name FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert" ON table_name FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update" ON table_name FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete" ON table_name FOR DELETE USING (auth.uid() = user_id);
```

### Multi-Tenant Tables Need org_id
**What happened:** Built a feature with only `user_id` column. When team members were added later, they couldn't see each other's data.
**Root cause:** Data was scoped to individual users, not the organization. Team members need shared access.
**Fix:** Add `org_id` column to any table where data should be shared within an organization. RLS should check org membership, not just `auth.uid() = user_id`.
**Prevention:** Ask yourself: "Will team members need to see this data?" If yes, add `org_id` and use org-based RLS policies.

### Zod Schemas: Use .nullable().optional() for Optional Fields
**What happened:** API returned 400 "Expected string, received null" for optional fields like social URLs.
**Root cause:** Zod `.optional()` only accepts `undefined`, not `null`. Client code often sends `null` for empty fields (especially from forms and browser extensions).
**Fix:** Use `.nullable().optional()` for any field that might be null OR undefined.
**Prevention:** Default to `.nullable().optional()` for all optional string/number fields in API schemas.

### TypeScript Types Must Stay In Sync
**What happened:** Build failed with "property does not exist" after adding a new field to one function.
**Root cause:** Two functions shared a similar type definition but they were defined separately (not using a shared interface). Updated one, forgot the other.
**Fix:** Search for ALL places where a type is defined before adding new fields. Use shared interfaces.
**Prevention:** When adding fields to any type/interface, grep the entire codebase for similar type definitions and update them all.

### Always Add Indexes on Foreign Keys
**What happened:** Page load was slow (3-5 seconds) when listing items.
**Root cause:** Table had `user_id` and `org_id` foreign keys but no indexes. Every query did a full table scan.
**Fix:** `CREATE INDEX idx_tablename_column ON tablename(column_name);`
**Prevention:** Every foreign key column gets an index. Every column used in WHERE clauses gets an index. Add them in the same migration as the table.

### Use the Right Supabase Client
**What happened:** API route returned empty data or "Unauthorized" even for authenticated users.
**Root cause:** Used `createAdminClient()` (service role) to call `auth.getUser()`. Service role client cannot read session cookies -- it's for bypassing RLS, not identifying users.
**Fix:** Use TWO clients when you need both user identity AND admin data access:
```typescript
const authClient = createAuthClient();    // For identifying the user
const adminClient = createAdminClient();  // For data operations (bypasses RLS)
const { data: { user } } = await authClient.auth.getUser();
const { data } = await adminClient.from("table").select("*");
```
**Prevention:** Auth client for user identification. Admin client for data operations. Never mix them up.

### Dashboard Data = Activities, Not Current State
**What happened:** Dashboard stats showed 0 for "Calls Booked" even though leads were in that stage.
**Root cause:** Counted leads by current stage (pipeline approach). But leads move through stages -- you need to count activity EVENTS, not current positions.
**Fix:** Query activity/event logs to count "how many times did a lead enter this stage" rather than "how many leads are currently in this stage."
**Prevention:** Stats and metrics should always be derived from logged activities/events, not from current record state.

### Merge JSON Columns, Don't Replace Them
**What happened:** Updating a record wiped out important data stored in a JSONB column.
**Root cause:** Code fetched partial data, then did a full update that replaced the entire JSON column with incomplete data.
**Fix:** When updating JSONB columns, merge new data with existing: `{ ...existingData, ...newData }`. Only overwrite specific keys, never the entire object.
**Prevention:** Always fetch the current JSONB value before updating. Merge, don't replace.

### Verify Column Names Against Actual Schema
**What happened:** SQL function referenced `up.full_name` but the actual column was `display_name`. API returned 500.
**Root cause:** Assumed column name without checking the actual table schema.
**Fix:** Always verify column names by checking the migration file or running `SELECT * FROM table LIMIT 1` before writing SQL functions.
**Prevention:** Never guess column names. Check the schema first.
