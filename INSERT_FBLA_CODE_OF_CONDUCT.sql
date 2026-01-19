-- Insert FBLA Code of Conduct Resource
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
  'FBLA Code of Conduct',
  'The official FBLA Code of Conduct that establishes the standards of behavior expected from all FBLA members, advisers, and participants. This code ensures a respectful and professional environment at all FBLA events and activities.',
  id,
  'external_link',
  'https://www.fbla.org/code-of-conduct/',
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
WHERE r.title = 'FBLA Code of Conduct';
