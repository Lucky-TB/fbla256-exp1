-- Quick Fix: Remove NOT NULL constraint from event_type and ensure new columns exist
-- Run this FIRST if you're getting "null value in column event_type" errors

-- Step 1: Make event_type nullable (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fbla_events' AND column_name = 'event_type'
  ) THEN
    ALTER TABLE fbla_events ALTER COLUMN event_type DROP NOT NULL;
    RAISE NOTICE 'Removed NOT NULL constraint from event_type';
  ELSE
    RAISE NOTICE 'event_type column does not exist';
  END IF;
END $$;

-- Step 2: Add event_category column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fbla_events' AND column_name = 'event_category'
  ) THEN
    ALTER TABLE fbla_events 
    ADD COLUMN event_category TEXT CHECK (event_category IN ('adviser_webinar', 'celebration', 'conferences', 'member_webinar'));
    RAISE NOTICE 'Added event_category column';
  ELSE
    RAISE NOTICE 'event_category column already exists';
  END IF;
END $$;

-- Step 3: Add event_division column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fbla_events' AND column_name = 'event_division'
  ) THEN
    ALTER TABLE fbla_events 
    ADD COLUMN event_division TEXT CHECK (event_division IN ('collegiate', 'high_school', 'middle_school'));
    RAISE NOTICE 'Added event_division column';
  ELSE
    RAISE NOTICE 'event_division column already exists';
  END IF;
END $$;

-- Step 4: Migrate existing data from event_type to event_category
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fbla_events' AND column_name = 'event_type'
  ) THEN
    UPDATE fbla_events
    SET event_category = CASE
      WHEN event_type = 'conference' THEN 'conferences'
      WHEN event_type = 'competition' THEN 'conferences'
      WHEN event_type = 'meeting' THEN 'celebration'
      ELSE 'conferences'
    END
    WHERE event_category IS NULL;
    
    RAISE NOTICE 'Migrated data from event_type to event_category';
  END IF;
END $$;

-- Step 5: Set default division for existing events
UPDATE fbla_events
SET event_division = 'high_school'
WHERE event_division IS NULL;

-- Step 6: Make event_category NOT NULL (after ensuring all rows have values)
DO $$
BEGIN
  -- First ensure all rows have a category
  UPDATE fbla_events
  SET event_category = 'conferences'
  WHERE event_category IS NULL;
  
  -- Then make it NOT NULL
  ALTER TABLE fbla_events 
  ALTER COLUMN event_category SET NOT NULL;
  
  RAISE NOTICE 'Set event_category to NOT NULL';
END $$;

-- Verification
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'fbla_events' 
  AND column_name IN ('event_category', 'event_division', 'event_type')
ORDER BY column_name;
