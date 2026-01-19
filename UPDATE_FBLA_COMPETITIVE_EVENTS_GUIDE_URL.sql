-- Update FBLA Competitive Events Guide PDF Resource URL
-- Run this in your Supabase SQL Editor to replace the existing URL with the Supabase Storage link

UPDATE resources
SET 
  url = 'https://pmxgcdbwqiqhgaqplvqb.supabase.co/storage/v1/object/public/fbla-resources/25-26-High-School-Guidelines-All-in-One.pdf',
  last_updated = NOW()
WHERE title = 'FBLA Competitive Events Guide 2025-2026';

-- Verify the resource was updated
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
