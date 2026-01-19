-- Sample Announcements for Testing
-- Run this in your Supabase SQL Editor after setting up the announcements table
-- Replace 'Your Chapter Name' with your actual chapter name from user_profiles

-- Example 1: Welcome Announcement
INSERT INTO announcements (
  title,
  body,
  posted_by_role,
  chapter_name,
  is_active
)
VALUES (
  'Welcome to the New School Year!',
  'We are excited to kick off another great year of FBLA activities. This year promises to be full of opportunities for growth, leadership, and competition. Stay tuned for upcoming events, workshops, and competition registration deadlines.',
  'Chapter Officer',
  'Your Chapter Name', -- Replace with your chapter name
  true
);

-- Example 2: Competition Reminder
INSERT INTO announcements (
  title,
  body,
  posted_by_role,
  chapter_name,
  is_active
)
VALUES (
  'Regional Competition Registration Opens Soon',
  'Registration for the Regional FBLA Competition will open on February 1st. Make sure you have completed all required preparation materials and have your competition events selected. Contact your chapter adviser if you have any questions.',
  'Chapter Adviser',
  'Your Chapter Name', -- Replace with your chapter name
  true
);

-- Example 3: Meeting Announcement
INSERT INTO announcements (
  title,
  body,
  posted_by_role,
  chapter_name,
  is_active
)
VALUES (
  'Monthly Chapter Meeting - This Friday',
  'Join us this Friday at 3:00 PM in Room 205 for our monthly chapter meeting. We will be discussing upcoming events, recognizing member achievements, and planning our community service project. Refreshments will be provided!',
  'Chapter Secretary',
  'Your Chapter Name', -- Replace with your chapter name
  true
);

-- Verify the announcements were added
SELECT 
  id,
  title,
  posted_by_role,
  chapter_name,
  created_at
FROM announcements
WHERE chapter_name = 'Your Chapter Name' -- Replace with your chapter name
ORDER BY created_at DESC;
