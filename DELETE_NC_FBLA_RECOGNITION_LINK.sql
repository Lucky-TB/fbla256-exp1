-- Delete NC FBLA Recognition Chapter Scholarship Events Link (Duplicate)
-- Run this in your Supabase SQL Editor
-- This removes the duplicate resource that was added as an external_link

DELETE FROM resources
WHERE title = 'NC FBLA Recognition Chapter Scholarship Events'
  AND resource_type = 'external_link';

-- Verify the deletion (should show only the PDF version remaining)
SELECT 
  r.id,
  r.title,
  r.resource_type,
  r.url,
  rc.name as category_name
FROM resources r
LEFT JOIN resource_categories rc ON r.category_id = rc.id
WHERE r.title = 'NC FBLA Recognition Chapter Scholarship Events';
