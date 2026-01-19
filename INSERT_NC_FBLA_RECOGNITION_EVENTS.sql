-- Insert NC FBLA Recognition Chapter Scholarship Events PDF Resource
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
  'NC FBLA Recognition Chapter Scholarship Events',
  'North Carolina FBLA guide covering recognition programs, chapter activities, and scholarship events. This document provides information about state-level recognition opportunities, chapter management resources, and scholarship programs available to NC FBLA members.',
  id,
  'pdf',
  'https://pmxgcdbwqiqhgaqplvqb.supabase.co/storage/v1/object/public/fbla-resources/NC_FBLA_Recognition_Chapter_Scholarship_Events.docx',
  true
FROM resource_categories
WHERE name = 'Chapter Management'
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
WHERE r.title = 'NC FBLA Recognition Chapter Scholarship Events';
