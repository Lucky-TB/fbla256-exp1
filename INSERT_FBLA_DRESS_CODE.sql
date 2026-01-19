-- Insert FBLA Dress Code PDF Resource
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
  'FBLA Dress Code 2023',
  'The official FBLA Dress Code guidelines for conferences and competitive events. This document outlines the professional attire requirements for all FBLA members, advisers, and guests attending FBLA conferences, including business professional and business casual options.',
  id,
  'pdf',
  'https://pmxgcdbwqiqhgaqplvqb.supabase.co/storage/v1/object/public/fbla-resources/2023-Dress-Code.pdf',
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
WHERE r.title = 'FBLA Dress Code 2023';
