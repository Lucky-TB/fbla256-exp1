-- Insert FBLA High School Competitive Events Changes PDF Resource
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
  'FBLA High School Competitive Events Changes 2025-2026',
  'Document outlining the changes and updates to competitive events for high school FBLA members for the 2025-2026 school year. Includes new events, rule modifications, and important updates to existing competitive events.',
  id,
  'pdf',
  'https://pmxgcdbwqiqhgaqplvqb.supabase.co/storage/v1/object/public/fbla-resources/2025-26-High-School-CE-Changes.pdf',
  true
FROM resource_categories
WHERE name = 'Competitions & Events'
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
WHERE r.title = 'FBLA High School Competitive Events Changes 2025-2026';
