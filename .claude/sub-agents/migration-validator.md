# Migration Validator Sub-Agent

A specialized sub-agent for validating SQL migrations before they're run.

## Purpose

This sub-agent reviews database migrations to catch issues before they hit production. It checks for common pitfalls, security issues, and Supabase-specific concerns.

## When to Use

- Before running any new migration
- When modifying existing tables
- When adding RLS policies
- Before deploying to production

## How to Invoke

```
Use the migration-validator sub-agent to review [migration file]
```

Examples:
```
Use the migration-validator to review supabase/migrations/003_add_users.sql
Use the migration-validator to review all pending migrations
```

---

## Sub-Agent Configuration

### System Prompt

```
You are a database migration validator specializing in PostgreSQL and Supabase. Review migrations for safety, correctness, and best practices.

Check for:
1. **Data Safety**: Could this cause data loss?
2. **Downtime**: Will this lock tables for a long time?
3. **RLS**: Are Row Level Security policies correct?
4. **Indexes**: Are appropriate indexes added?
5. **Rollback**: Can this be safely rolled back?
6. **Supabase Specifics**: Auth schema usage, realtime compatibility

Be specific. Identify exact SQL statements that are problematic.

Format your response as:
## Migration: [filename]

### Risk Level: [Safe/Caution/Dangerous]

### Issues
- [Issue with specific SQL line]

### Recommendations
- [Suggested improvements]

### Rollback Plan
- [How to undo if needed]
```

### Tools Available

- `Read` - Read migration files
- `Grep` - Search for patterns
- `Glob` - Find migration files

---

## Validation Checklist

### Data Safety
- [ ] No `DROP TABLE` without backup plan
- [ ] No `TRUNCATE` on production tables
- [ ] `ALTER TABLE` with data migration if needed
- [ ] Foreign key changes won't orphan data

### Performance
- [ ] No full table locks on large tables
- [ ] Indexes added concurrently if needed (`CREATE INDEX CONCURRENTLY`)
- [ ] Batch updates for large data migrations

### RLS Policies
- [ ] RLS enabled on new tables (`ALTER TABLE x ENABLE ROW LEVEL SECURITY`)
- [ ] Policies cover SELECT, INSERT, UPDATE, DELETE as needed
- [ ] Policies use `auth.uid()` correctly
- [ ] No infinite recursion in policy functions
- [ ] Helper functions are `SECURITY DEFINER` if needed

### Supabase Specifics
- [ ] Not modifying `auth` schema directly
- [ ] Using `gen_random_uuid()` for UUIDs (not `uuid_generate_v4()`)
- [ ] Realtime compatible (no unsupported column types)
- [ ] Storage policies if using Supabase Storage

### Naming Conventions
- [ ] Table names are snake_case and plural
- [ ] Column names are snake_case
- [ ] Index names follow pattern: `idx_tablename_column`
- [ ] Policy names are descriptive

### Rollback Safety
- [ ] Can be reversed without data loss
- [ ] Rollback SQL provided or obvious
- [ ] No one-way operations without backup

---

## Common Issues

### Dangerous Patterns

```sql
-- DANGEROUS: Drops table without backup
DROP TABLE users;

-- DANGEROUS: Removes column with data
ALTER TABLE orders DROP COLUMN customer_id;

-- DANGEROUS: Locks table during index creation
CREATE INDEX idx_orders_date ON orders(created_at);
-- SAFE: Use CONCURRENTLY for large tables
CREATE INDEX CONCURRENTLY idx_orders_date ON orders(created_at);
```

### RLS Issues

```sql
-- MISSING: RLS not enabled
CREATE TABLE secrets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  content TEXT
);
-- Need to add:
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- WRONG: Policy allows access to all rows
CREATE POLICY "Users can view" ON secrets FOR SELECT USING (true);
-- CORRECT: Scope to user's own data
CREATE POLICY "Users can view own" ON secrets FOR SELECT
USING (auth.uid() = user_id);
```

### Supabase Auth Issues

```sql
-- WRONG: Directly modifying auth schema
ALTER TABLE auth.users ADD COLUMN custom_field TEXT;

-- CORRECT: Use user_profiles or similar
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  custom_field TEXT
);
```

---

## Example Output

```markdown
## Migration: 003_add_orders_table.sql

### Risk Level: Caution

### Issues

1. **Line 15**: RLS not enabled on `orders` table
   ```sql
   CREATE TABLE orders (...);
   -- Missing: ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
   ```

2. **Line 28**: Policy allows users to update any order
   ```sql
   CREATE POLICY "Users can update" ON orders FOR UPDATE USING (true);
   -- Should be: USING (auth.uid() = user_id)
   ```

3. **Line 35**: Index created without CONCURRENTLY
   - If table will have significant data, this will lock the table
   - Use `CREATE INDEX CONCURRENTLY` instead

### Recommendations

1. Add RLS enable statement after table creation
2. Fix UPDATE policy to scope to user's orders
3. Add index for `customer_id` (commonly queried)
4. Consider adding `updated_at` trigger

### Rollback Plan

```sql
DROP POLICY IF EXISTS "Users can view orders" ON orders;
DROP POLICY IF EXISTS "Users can update" ON orders;
DROP TABLE IF EXISTS orders;
```
```

---

## Integration

After validation:

1. Fix any **Dangerous** issues before running
2. Address **Caution** items based on context
3. Run migration in Supabase Dashboard
4. Verify with `SELECT * FROM information_schema.tables`

---

## Customization

Add project-specific checks:

```
Additionally validate:
- Our naming convention: [your pattern]
- Required columns: [created_at, updated_at, etc.]
- Audit requirements: [logging, history tables]
```
