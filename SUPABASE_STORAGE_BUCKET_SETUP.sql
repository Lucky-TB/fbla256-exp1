-- Supabase Storage Bucket Setup for FBLA Resources
-- Run this in your Supabase SQL Editor
-- This sets up the storage bucket and policies for PDF resources

-- ============================================================================
-- STEP 1: Create the Storage Bucket (if it doesn't exist)
-- ============================================================================
-- Note: You may need to create the bucket via the Supabase Dashboard first
-- Go to Storage → New bucket → Name: "fbla-resources" → Public: Yes

-- ============================================================================
-- STEP 2: Set Up Storage Policies (RLS)
-- ============================================================================

-- Allow public read access to all files in fbla-resources bucket
-- This allows anyone (including unauthenticated users) to view PDFs
DROP POLICY IF EXISTS "Public Access for FBLA Resources" ON storage.objects;
CREATE POLICY "Public Access for FBLA Resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'fbla-resources');

-- Optional: Allow authenticated users to upload resources
-- Uncomment if you want users to upload PDFs from the app
-- DROP POLICY IF EXISTS "Authenticated users can upload resources" ON storage.objects;
-- CREATE POLICY "Authenticated users can upload resources"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'fbla-resources' 
--   AND auth.role() = 'authenticated'
-- );

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this, verify:
-- 1. Go to Storage → fbla-resources bucket
-- 2. Upload a test PDF
-- 3. Click on the file and copy the Public URL
-- 4. Test the URL in a browser - it should load the PDF
