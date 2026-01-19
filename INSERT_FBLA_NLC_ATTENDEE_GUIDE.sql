-- Insert FBLA NLC Attendee Guide PDF Resource
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
  'FBLA National Leadership Conference Attendee Guide 2025',
  'Complete guide for attendees of the FBLA National Leadership Conference (NLC) for middle school and high school members. Includes conference schedule, event information, logistics, and important details for participants.',
  id,
  'pdf',
  'https://pmxgcdbwqiqhgaqplvqb.supabase.co/storage/v1/object/public/fbla-resources/25-NLC-MS-HS-Attendee-Guide.pdf',
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
WHERE r.title = 'FBLA National Leadership Conference Attendee Guide 2025';
