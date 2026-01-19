-- Insert FBLA Events into fbla_events table
-- Run this in your Supabase SQL Editor after running SUPABASE_EVENTS_SETUP.sql or SUPABASE_EVENTS_MIGRATION.sql
-- Make sure the fbla_events table exists with event_category and event_division columns

-- ============================================================================
-- JANUARY 2026 EVENTS
-- ============================================================================

-- Industry Connect: FBLA to the Boardroom
INSERT INTO fbla_events (
  name,
  event_category,
  event_division,
  description,
  start_date,
  end_date,
  location,
  location_type,
  status
) VALUES (
  'Industry Connect: FBLA to the Boardroom: Lessons in Marketing, Leadership & Global Careers',
  'member_webinar',
  'high_school',
  'Join us for an Industry Connect webinar exploring marketing, leadership, and global career opportunities.',
  '2026-01-21 18:00:00-05:00',
  '2026-01-21 19:00:00-05:00',
  'Virtual',
  'virtual',
  'upcoming'
);

-- Power Up Your Teaching with Design Thinking (Adviser Webinar)
INSERT INTO fbla_events (
  name,
  event_category,
  event_division,
  description,
  start_date,
  end_date,
  location,
  location_type,
  status
) VALUES (
  'Power Up Your Teaching with Design Thinking',
  'adviser_webinar',
  NULL,
  'Join us for an interactive webinar where we will break down the 5-step design thinking process and discuss examples of how to integrate it into your coursework. You''ll leave with practical strategies you can use immediately, plus free classroom-ready resources.',
  '2026-01-29 18:30:00-05:00',
  '2026-01-29 19:30:00-05:00',
  'Virtual',
  'virtual',
  'upcoming'
);

-- ============================================================================
-- FEBRUARY 2026 EVENTS
-- ============================================================================

-- National Career & Technical Education Month
INSERT INTO fbla_events (
  name,
  event_category,
  event_division,
  description,
  start_date,
  end_date,
  location,
  location_type,
  status
) VALUES (
  'National Career & Technical Education Month',
  'celebration',
  NULL,
  'Celebrate National Career & Technical Education Month throughout February.',
  '2026-02-01 00:00:00-05:00',
  '2026-02-28 23:59:59-05:00',
  'Nationwide',
  'physical',
  'upcoming'
);

-- Intuit Career Lab: Skills for the New Era of Accounting
INSERT INTO fbla_events (
  name,
  event_category,
  event_division,
  description,
  start_date,
  end_date,
  location,
  location_type,
  status
) VALUES (
  'Intuit Career Lab: Skills for the New Era of Accounting',
  'member_webinar',
  'high_school',
  'This FREE Career Lab showcases a range of diverse career paths along with the skills and certifications students need to maximize earning potential. You''ll meet three panelists with diverse backgrounds who all showcase the rewards and benefits of being a professional in accounting.',
  '2026-02-03 15:00:00-05:00',
  '2026-02-03 16:00:00-05:00',
  'Virtual',
  'virtual',
  'upcoming'
);

-- Accounting Major vs. CPA: Understanding the Difference
INSERT INTO fbla_events (
  name,
  event_category,
  event_division,
  description,
  start_date,
  end_date,
  location,
  location_type,
  status
) VALUES (
  'Accounting Major vs. CPA: Understanding the Difference—and the Opportunities',
  'member_webinar',
  'high_school',
  'Ever wondered what sets a CPA apart from an accounting major? In this webinar, we''ll break down what the CPA designation actually means, why it matters, and the doors it can open for your career. Explore the wide range of opportunities available in the accounting field.',
  '2026-02-04 18:00:00-05:00',
  '2026-02-04 19:00:00-05:00',
  'Virtual',
  'virtual',
  'upcoming'
);

-- FBLA Week
INSERT INTO fbla_events (
  name,
  event_category,
  event_division,
  description,
  start_date,
  end_date,
  location,
  location_type,
  status
) VALUES (
  'FBLA Week',
  'celebration',
  NULL,
  'Celebrate FBLA Week with us on February 8-14, 2026! This week, held during National Career & Technical Education Month, is a highlight of the membership year, and we can''t wait to see you at all the national events we have planned.',
  '2026-02-08 00:00:00-05:00',
  '2026-02-14 23:59:59-05:00',
  'Nationwide',
  'physical',
  'upcoming'
);

-- Industry Connect Webinar (February)
INSERT INTO fbla_events (
  name,
  event_category,
  event_division,
  description,
  start_date,
  end_date,
  location,
  location_type,
  status
) VALUES (
  'Industry Connect Webinar',
  'member_webinar',
  'high_school',
  'Join us for an Industry Connect webinar featuring industry professionals and career insights.',
  '2026-02-18 18:00:00-05:00',
  '2026-02-18 19:00:00-05:00',
  'Virtual',
  'virtual',
  'upcoming'
);

-- Collegiate Officer Leadership Summit
INSERT INTO fbla_events (
  name,
  event_category,
  event_division,
  description,
  start_date,
  end_date,
  location,
  location_type,
  status
) VALUES (
  'Collegiate Officer Leadership Summit',
  'conferences',
  'collegiate',
  'Launch your leadership journey at the Officer Leadership Summit on February 21, 2026 from 11:00 AM-1:00 PM ET! This exclusive virtual event brings together all Collegiate officers for a powerful session of leadership growth, networking, and FBLA inspiration. Whether you''re a new officer or returning, this summit will equip you with the tools and connections to lead effectively.',
  '2026-02-21 11:00:00-05:00',
  '2026-02-21 13:00:00-05:00',
  'Virtual',
  'virtual',
  'upcoming'
);

-- ============================================================================
-- MARCH 2026 EVENTS
-- ============================================================================

-- Start Strong: Career Readiness & Success Skills
INSERT INTO fbla_events (
  name,
  event_category,
  event_division,
  description,
  start_date,
  end_date,
  location,
  location_type,
  status
) VALUES (
  'Start Strong: Career Readiness & Success Skills for Future Business Leaders',
  'member_webinar',
  'high_school',
  'Your career journey doesn''t start after graduation—it starts now. Learn the essential success skills employers look for and how to start developing them today. We''ll cover communication, leadership, teamwork, problem-solving, professionalism—skills that will give you a competitive edge in internships, job interviews, and your future career.',
  '2026-03-04 18:00:00-05:00',
  '2026-03-04 19:00:00-05:00',
  'Virtual',
  'virtual',
  'upcoming'
);

-- Industry Connect Webinar (March)
INSERT INTO fbla_events (
  name,
  event_category,
  event_division,
  description,
  start_date,
  end_date,
  location,
  location_type,
  status
) VALUES (
  'Industry Connect Webinar',
  'member_webinar',
  'high_school',
  'Join us for an Industry Connect webinar featuring industry professionals and career insights.',
  '2026-03-18 18:00:00-05:00',
  '2026-03-18 19:00:00-05:00',
  'Virtual',
  'virtual',
  'upcoming'
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that all events were inserted
SELECT 
  name,
  event_category,
  event_division,
  start_date,
  status
FROM fbla_events
WHERE start_date >= '2026-01-01'
ORDER BY start_date;
