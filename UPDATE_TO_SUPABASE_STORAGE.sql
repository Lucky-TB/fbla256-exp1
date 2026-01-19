-- Update FBLA Competitive Events Guide to Use Supabase Storage
-- 
-- INSTRUCTIONS:
-- 1. First, follow SUPABASE_STORAGE_SETUP.md to create the bucket and upload your PDF
-- 2. Get the public URL from Supabase Storage (Storage → fbla-resources → click file → copy Public URL)
-- 3. Replace [YOUR-SUPABASE-STORAGE-URL] below with your actual Supabase Storage public URL
-- 4. Run this SQL in Supabase SQL Editor

UPDATE resources
SET 
  url = 'https://pmxgcdbwqiqhgaqplvqb.supabase.co/storage/v1/object/public/fbla-resources/25-26-High-School-Guidelines-All-in-One.pdf',
  last_updated = NOW()
WHERE title = 'FBLA Competitive Events Guide 2025-2026';

-- Example URL format:
-- https://[project-id].supabase.co/storage/v1/object/public/fbla-resources/25-26-High-School-Guidelines-All-in-One.pdf

-- Verify the update
SELECT 
  r.id,
  r.title,
  r.resource_type,
  r.url,
  r.last_updated,
  rc.name as category_name
FROM resources r
LEFT JOIN resource_categories rc ON r.category_id = rc.id
WHERE r.title = 'FBLA Competitive Events Guide 2025-2026';
