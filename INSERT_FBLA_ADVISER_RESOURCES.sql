-- Insert FBLA Adviser Resources Link
-- Run this in your Supabase SQL Editor

INSERT INTO resources (
  title,
  description,
  category_id,
  resource_type,
  url,
  is_active
)
SELECT 
  'FBLA Adviser Resources',
  'Comprehensive collection of resources for FBLA advisers, including curriculum materials, professional development opportunities, chapter management tools, and guidance for supporting student success in FBLA programs and competitions.',
  id,
  'external_link',
  'https://www.fbla.org/adviser-resources/',
  true
FROM resource_categories
WHERE name = 'Leadership & Career Development'
LIMIT 1;

-- Verify the resource was added
SELECT 
  r.id,
  r.title,
  r.resource_type,
  r.url,
  rc.name as category_name
FROM resources r
LEFT JOIN resource_categories rc ON r.category_id = rc.id
WHERE r.title = 'FBLA Adviser Resources';
