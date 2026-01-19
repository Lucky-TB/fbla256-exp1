-- Fix Announcements RLS Policy for Case-Insensitive Chapter Matching
-- Run this in your Supabase SQL Editor
-- This updates the RLS policy to use case-insensitive comparison for chapter names

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view announcements for their chapter" ON announcements;

-- Create new policy with case-insensitive comparison
CREATE POLICY "Users can view announcements for their chapter"
  ON announcements FOR SELECT
  USING (
    is_active = true
    AND (
      -- Users can see announcements for their chapter (case-insensitive)
      LOWER(chapter_name) = LOWER(
        (SELECT chapter FROM user_profiles WHERE user_id = auth.uid() LIMIT 1)
      )
    )
  );

-- Verify the policy was updated
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'announcements' AND policyname = 'Users can view announcements for their chapter';
