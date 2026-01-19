-- Update Announcements RLS Policy to Allow Deletion
-- Run this in your Supabase SQL Editor
-- This allows teachers to delete announcements from their chapter and admins to delete any announcement

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Users can delete their chapter announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can delete any announcement" ON announcements;

-- Policy: Teachers can delete announcements from their chapter
-- Note: We check if the announcement's chapter matches the user's chapter
CREATE POLICY "Teachers can delete their chapter announcements"
  ON announcements FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND (
      -- Check if user is a teacher or admin via user_roles table
      EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('teacher', 'admin')
      )
      AND (
        -- Admins can delete any announcement
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = auth.uid()
          AND role = 'admin'
        )
        OR
        -- Teachers can delete announcements from their chapter
        (
          EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'teacher'
          )
          AND LOWER(chapter_name) = LOWER(
            (SELECT chapter FROM user_profiles WHERE user_id = auth.uid() LIMIT 1)
          )
        )
      )
    )
  );

-- Verify the policy was created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'announcements' AND policyname = 'Teachers can delete their chapter announcements';
