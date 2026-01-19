-- Insert FBLA Honor Code Resource
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
  'FBLA Honor Code',
  'The official FBLA Honor Code outlining the ethical standards and principles that all FBLA members are expected to uphold. This code emphasizes integrity, responsibility, and respect in all FBLA activities and competitions.',
  id,
  'external_link',
  'https://www.fbla.org/honor-code/?utm_source=chatgpt.com',
  true
FROM resource_categories
WHERE name = 'Official FBLA Documents'
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
WHERE r.title = 'FBLA Honor Code';
