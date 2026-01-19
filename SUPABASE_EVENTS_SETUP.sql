-- Supabase Events & User-Event Associations Table Setup
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- This creates the table structure for storing FBLA events and member event tracking
--
-- IMPORTANT: If you already have the fbla_events table with the old schema (event_type),
-- run SUPABASE_EVENTS_MIGRATION.sql first to migrate your existing data.

-- ============================================================================
-- FBLA EVENTS TABLE
-- ============================================================================
-- Stores all FBLA events (conferences, competitions, meetings)
-- This is a centralized event catalog that all members can view

-- Drop table if it exists (ONLY if you want to start fresh - be careful!)
-- DROP TABLE IF EXISTS fbla_events CASCADE;

CREATE TABLE IF NOT EXISTS fbla_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Event Identification
  name TEXT NOT NULL,
  event_category TEXT NOT NULL CHECK (event_category IN ('adviser_webinar', 'celebration', 'conferences', 'member_webinar')),
  event_division TEXT CHECK (event_division IN ('collegiate', 'high_school', 'middle_school')),
  description TEXT,
  
  -- Date & Time Information
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  
  -- Location Information
  location TEXT,
  location_type TEXT CHECK (location_type IN ('physical', 'virtual', 'hybrid')) DEFAULT 'physical',
  virtual_link TEXT, -- For virtual/hybrid events
  
  -- Competition-Specific Fields
  competition_category TEXT, -- e.g., "Business Communication", "Accounting", etc.
  competition_level TEXT CHECK (competition_level IN ('regional', 'state', 'national')) DEFAULT 'regional',
  
  -- Event Status
  status TEXT CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming',
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id), -- Admin who created the event
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER EVENT ASSOCIATIONS TABLE
-- ============================================================================
-- Tracks which events each user has added to their personal schedule
-- This enables "My Events" functionality and reminder tracking

CREATE TABLE IF NOT EXISTS user_event_associations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES fbla_events(id) ON DELETE CASCADE NOT NULL,
  
  -- Reminder Settings
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_days_before INTEGER DEFAULT 1, -- How many days before event to remind
  reminder_sent BOOLEAN DEFAULT false,
  
  -- Tracking
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one user can only add an event once
  UNIQUE(user_id, event_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for fast event lookups by date range
CREATE INDEX IF NOT EXISTS idx_fbla_events_start_date ON fbla_events(start_date);
CREATE INDEX IF NOT EXISTS idx_fbla_events_event_category ON fbla_events(event_category);
CREATE INDEX IF NOT EXISTS idx_fbla_events_event_division ON fbla_events(event_division);
CREATE INDEX IF NOT EXISTS idx_fbla_events_status ON fbla_events(status);

-- Index for user-event association lookups
CREATE INDEX IF NOT EXISTS idx_user_event_associations_user_id ON user_event_associations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_event_associations_event_id ON user_event_associations(event_id);
CREATE INDEX IF NOT EXISTS idx_user_event_associations_reminder ON user_event_associations(user_id, reminder_enabled, reminder_sent);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on both tables
ALTER TABLE fbla_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_event_associations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR FBLA_EVENTS
-- ============================================================================

-- All authenticated users can view all events (public event catalog)
DROP POLICY IF EXISTS "All users can view events" ON fbla_events;
CREATE POLICY "All users can view events"
  ON fbla_events FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can create/update/delete events
-- Note: This assumes you have an admin role system. If not, you can manually insert events via SQL Editor
DROP POLICY IF EXISTS "Admins can manage events" ON fbla_events;
-- For now, we'll allow authenticated users to insert (for testing/demo)
-- In production, restrict this to admins only
CREATE POLICY "Authenticated users can insert events"
  ON fbla_events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update events"
  ON fbla_events FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- RLS POLICIES FOR USER_EVENT_ASSOCIATIONS
-- ============================================================================

-- Users can only view their own event associations
DROP POLICY IF EXISTS "Users can view their own event associations" ON user_event_associations;
CREATE POLICY "Users can view their own event associations"
  ON user_event_associations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add events to their own schedule
DROP POLICY IF EXISTS "Users can add events to their schedule" ON user_event_associations;
CREATE POLICY "Users can add events to their schedule"
  ON user_event_associations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reminder settings
DROP POLICY IF EXISTS "Users can update their event associations" ON user_event_associations;
CREATE POLICY "Users can update their event associations"
  ON user_event_associations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can remove events from their schedule
DROP POLICY IF EXISTS "Users can remove events from their schedule" ON user_event_associations;
CREATE POLICY "Users can remove events from their schedule"
  ON user_event_associations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for fbla_events
DROP TRIGGER IF EXISTS update_fbla_events_updated_at ON fbla_events;
CREATE TRIGGER update_fbla_events_updated_at
  BEFORE UPDATE ON fbla_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (Optional - for testing/demo)
-- ============================================================================
-- Uncomment and modify these to add sample events for testing

/*
-- Sample Conference Event
INSERT INTO fbla_events (name, event_category, event_division, description, start_date, end_date, registration_deadline, location, location_type, status)
VALUES (
  'FBLA National Leadership Conference 2025',
  'conferences',
  'high_school',
  'Join thousands of FBLA members from across the nation for workshops, networking, and leadership development.',
  '2025-06-29 08:00:00-05:00',
  '2025-07-02 17:00:00-05:00',
  '2025-05-15 23:59:59-05:00',
  'Anaheim, CA',
  'physical',
  'upcoming'
);

-- Sample Competition Event
INSERT INTO fbla_events (name, event_category, event_division, description, start_date, registration_deadline, location, location_type, competition_category, competition_level, status)
VALUES (
  'State Leadership Conference - Business Communication',
  'conferences',
  'high_school',
  'Compete in the Business Communication event at the state level. Top performers advance to nationals.',
  '2025-04-12 09:00:00-05:00',
  '2025-03-01 23:59:59-05:00',
  'State Convention Center',
  'physical',
  'Business Communication',
  'state',
  'upcoming'
);

-- Sample Chapter Meeting
INSERT INTO fbla_events (name, event_category, event_division, description, start_date, location, location_type, status)
VALUES (
  'Monthly Chapter Meeting',
  'celebration',
  'high_school',
  'Regular monthly chapter meeting to discuss upcoming events and competitions.',
  '2025-02-15 15:30:00-05:00',
  'School Library',
  'physical',
  'upcoming'
);
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables were created
SELECT 
  schemaname, 
  tablename
FROM pg_tables 
WHERE tablename IN ('fbla_events', 'user_event_associations');

-- Verify RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename IN ('fbla_events', 'user_event_associations');
