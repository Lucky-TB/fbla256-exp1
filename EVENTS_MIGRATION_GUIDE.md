# Events Table Migration Guide

If you're getting an error that `event_category` does not exist, it means your database still has the old schema with `event_type`. Follow these steps to migrate:

## Quick Migration Steps

1. **Open Supabase SQL Editor**
   - Go to your Supabase Dashboard
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

2. **Run the Migration Script**
   - Copy the entire contents of `SUPABASE_EVENTS_MIGRATION.sql`
   - Paste it into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

3. **Verify Migration**
   - The script will show verification queries at the end
   - Check that `event_category` and `event_division` columns exist
   - Verify all events have a category assigned

## What the Migration Does

1. **Adds New Columns**: Creates `event_category` and `event_division` columns
2. **Migrates Data**: Converts old `event_type` values to new `event_category`:
   - `conference` → `conferences`
   - `competition` → `conferences`
   - `meeting` → `celebration`
3. **Sets Defaults**: Assigns `high_school` as default division for existing events
4. **Updates Indexes**: Creates new indexes for the new columns
5. **Preserves Data**: Keeps all existing event data intact

## After Migration

- Your existing events will be preserved
- All events will have `event_category` set
- All events will have `event_division` set to `high_school` by default (you can update these manually)
- The old `event_type` column will remain (commented out drop statement if you want to remove it later)

## If You Want to Start Fresh

If you don't have important data in the `fbla_events` table, you can:

1. Drop the table: `DROP TABLE IF EXISTS fbla_events CASCADE;`
2. Run the full `SUPABASE_EVENTS_SETUP.sql` script

**Warning**: This will delete all existing events!

## Troubleshooting

### "Column already exists" error
- The migration script checks if columns exist before creating them
- This is safe to run multiple times

### "Cannot set NOT NULL on column with NULL values"
- The migration script sets default values before making the column NOT NULL
- If you still get this error, manually update NULL values first:
  ```sql
  UPDATE fbla_events SET event_category = 'conferences' WHERE event_category IS NULL;
  ```

### Events missing after migration
- Check the migration logs
- Verify the UPDATE statements ran successfully
- Check that events still exist: `SELECT COUNT(*) FROM fbla_events;`
