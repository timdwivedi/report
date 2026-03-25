# Database Migrations

This folder contains SQL migration files for the Bloom app database.

## Naming Convention

Migrations are numbered sequentially:
- `001_initial_schema.sql`
- `002_rls_policies.sql`
- `003_feature_name.sql`

## Running Migrations

### Using Supabase CLI

```bash
# Run all pending migrations
npx supabase db push

# Create a new migration
npx supabase migration new migration_name

# Check migration status
npx supabase db status
```

### Manual Execution

If running manually in the Supabase dashboard SQL editor, execute migrations in order.

## Migration Guidelines

1. **Always test locally first** - Use `supabase start` to test migrations
2. **Backup before migrating production** - Take a snapshot before major changes
3. **Make migrations reversible** - Include rollback instructions as comments
4. **One concern per file** - Keep migrations focused and atomic
5. **Document changes** - Add comments explaining non-obvious logic

## RLS (Row Level Security)

All tables should have RLS enabled. Policies are defined in `002_rls_policies.sql` and subsequent migration files.

Pattern for new tables:
```sql
-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Select policy
CREATE POLICY "Users can view their data"
    ON new_table FOR SELECT
    USING (user_id = auth.uid());

-- Insert policy
CREATE POLICY "Users can insert their data"
    ON new_table FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Update policy
CREATE POLICY "Users can update their data"
    ON new_table FOR UPDATE
    USING (user_id = auth.uid());

-- Delete policy
CREATE POLICY "Users can delete their data"
    ON new_table FOR DELETE
    USING (user_id = auth.uid());
```

## Indexes

Add indexes for:
- Foreign key columns
- Frequently queried columns
- Columns used in WHERE clauses

```sql
CREATE INDEX IF NOT EXISTS idx_table_column ON table_name(column_name);
```

## Troubleshooting

### Migration Failed
1. Check error message in Supabase dashboard
2. Verify SQL syntax
3. Check for conflicting constraints

### RLS Blocking Access
1. Verify policy conditions
2. Check auth.uid() is returning expected value
3. Test with service role to bypass RLS
