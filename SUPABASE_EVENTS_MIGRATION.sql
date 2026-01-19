-- Migration Script: Update fbla_events table to use event_category and event_division
-- Run this in your Supabase SQL Editor if you already have the old schema
-- This migrates from event_type to event_category and adds event_division

-- ============================================================================
-- STEP 1: Remove NOT NULL constraint from event_type (if it exists)
-- ============================================================================

DO $$
BEGIN
  -- Check if event_type column exists and has NOT NULL constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fbla_events' 
      AND column_name = 'event_type'
      AND is_nullable = 'NO'
  ) THEN
    -- Make event_type nullable temporarily
    ALTER TABLE fbla_events 
    ALTER COLUMN event_type DROP NOT NULL;
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Add new columns if they don't exist
-- ============================================================================

-- Add event_category column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fbla_events' AND column_name = 'event_category'
  ) THEN
    ALTER TABLE fbla_events 
    ADD COLUMN event_category TEXT CHECK (event_category IN ('adviser_webinar', 'celebration', 'conferences', 'member_webinar'));
  END IF;
END $$;

-- Add event_division column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fbla_events' AND column_name = 'event_division'
  ) THEN
    ALTER TABLE fbla_events 
    ADD COLUMN event_division TEXT CHECK (event_division IN ('collegiate', 'high_school', 'middle_school'));
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Migrate data from event_type to event_category (if event_type exists)
-- ============================================================================

DO $$
BEGIN
  -- Check if event_type column exists and migrate data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fbla_events' AND column_name = 'event_type'
  ) THEN
    -- Migrate old event_type values to new event_category
    UPDATE fbla_events
    SET event_category = CASE
      WHEN event_type = 'conference' THEN 'conferences'
      WHEN event_type = 'competition' THEN 'conferences'  -- Competitions are typically conferences
      WHEN event_type = 'meeting' THEN 'celebration'      -- Meetings map to celebration
      ELSE 'conferences'  -- Default fallback
    END
    WHERE event_category IS NULL;
    
    -- Set default division for existing events (if not set)
    UPDATE fbla_events
    SET event_division = 'high_school'
    WHERE event_division IS NULL;
  END IF;
END $$;

-- ============================================================================
-- STEP 4: Make event_category NOT NULL (after migration)
-- ============================================================================

DO $$
BEGIN
  -- First ensure all rows have a category
  UPDATE fbla_events
  SET event_category = 'conferences'
  WHERE event_category IS NULL;
  
  -- Then make it NOT NULL
  ALTER TABLE fbla_events 
  ALTER COLUMN event_category SET NOT NULL;
END $$;

-- ============================================================================
-- STEP 5: Update indexes
-- ============================================================================

-- Drop old index if it exists
DROP INDEX IF EXISTS idx_fbla_events_event_type;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_fbla_events_event_category ON fbla_events(event_category);
CREATE INDEX IF NOT EXISTS idx_fbla_events_event_division ON fbla_events(event_division);

-- ============================================================================
-- STEP 6: (Optional) Drop old event_type column
-- ============================================================================
-- Uncomment the following if you want to remove the old column
-- Make sure all data is migrated first!

-- DO $$
-- BEGIN
--   IF EXISTS (
--     SELECT 1 FROM information_schema.columns 
--     WHERE table_name = 'fbla_events' AND column_name = 'event_type'
--   ) THEN
--     ALTER TABLE fbla_events DROP COLUMN event_type;
--   END IF;
-- END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify the new columns exist
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'fbla_events' 
  AND column_name IN ('event_category', 'event_division', 'event_type')
ORDER BY column_name;

-- Check that all events have a category
SELECT 
  COUNT(*) as total_events,
  COUNT(event_category) as events_with_category,
  COUNT(event_division) as events_with_division
FROM fbla_events;
