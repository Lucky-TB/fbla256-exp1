-- Supabase Community Features Setup
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- This adds social media fields to user_profiles and creates the announcements table

-- ============================================================================
-- STEP 1: Add Social Media Fields to user_profiles
-- ============================================================================
-- These fields store chapter-level social media handles (optional)
-- Since chapters are stored as text in user_profiles, we store social media
-- per user but they represent the chapter's social media accounts

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS chapter_instagram TEXT,
ADD COLUMN IF NOT EXISTS chapter_twitter TEXT,
ADD COLUMN IF NOT EXISTS chapter_tiktok TEXT,
ADD COLUMN IF NOT EXISTS chapter_facebook TEXT;

-- Add comment to clarify these are chapter-level fields
COMMENT ON COLUMN user_profiles.chapter_instagram IS 'Chapter Instagram username (without @)';
COMMENT ON COLUMN user_profiles.chapter_twitter IS 'Chapter X/Twitter username (without @)';
COMMENT ON COLUMN user_profiles.chapter_tiktok IS 'Chapter TikTok username (without @)';
COMMENT ON COLUMN user_profiles.chapter_facebook IS 'Chapter Facebook page URL or username';

-- ============================================================================
-- STEP 2: Create Announcements Table
-- ============================================================================
-- Stores chapter announcements and updates for the Community tab

CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Announcement Content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  posted_by_role TEXT, -- e.g., "Chapter Officer", "Admin", "Adviser"
  
  -- Chapter Association
  -- Since chapters are stored as text in user_profiles, we use chapter name here
  chapter_name TEXT NOT NULL,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: Enable Row Level Security for Announcements
-- ============================================================================

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view active announcements
-- Users can see announcements for their own chapter
DROP POLICY IF EXISTS "Users can view announcements for their chapter" ON announcements;
CREATE POLICY "Users can view announcements for their chapter"
  ON announcements FOR SELECT
  USING (
    is_active = true
    AND (
      -- Users can see announcements for their chapter
      chapter_name IN (
        SELECT chapter FROM user_profiles WHERE user_id = auth.uid()
      )
      -- OR admins can see all (if you add admin role later)
      -- OR public announcements (if chapter_name is NULL or 'all')
    )
  );

-- Policy: Only admins/officers can create announcements
-- For now, we'll allow authenticated users to insert (you can restrict this later)
DROP POLICY IF EXISTS "Authenticated users can create announcements" ON announcements;
CREATE POLICY "Authenticated users can create announcements"
  ON announcements FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only admins/officers can update announcements
DROP POLICY IF EXISTS "Users can update their chapter announcements" ON announcements;
CREATE POLICY "Users can update their chapter announcements"
  ON announcements FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND chapter_name IN (
      SELECT chapter FROM user_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND chapter_name IN (
      SELECT chapter FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 4: Create Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_announcements_chapter_name ON announcements(chapter_name);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);

-- ============================================================================
-- STEP 5: Create Trigger for updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Verify the setup
SELECT 
  'user_profiles columns' as check_type,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name IN ('chapter_instagram', 'chapter_twitter', 'chapter_tiktok', 'chapter_facebook')
UNION ALL
SELECT 
  'announcements table' as check_type,
  'announcements' as column_name,
  'table' as data_type
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_name = 'announcements'
);
