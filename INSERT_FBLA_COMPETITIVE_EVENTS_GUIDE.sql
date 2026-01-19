-- Insert FBLA Competitive Events Guide PDF Resource
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
  'FBLA Competitive Events Guide 2025-2026',
  'Complete guide to all FBLA competitive events, rules, and guidelines for the 2025-2026 school year. Includes event descriptions, performance indicators, and competition procedures.',
  id,
  'pdf',
  'https://connect.fbla.org/headquarters/files/High%20School%20Competitive%20Events%20Resources/25-26-High-School-Guidelines-All-in-One.pdf',
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
WHERE r.title = 'FBLA Competitive Events Guide 2025-2026';
