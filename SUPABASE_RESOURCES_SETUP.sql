-- Supabase Resources & Resource Categories Table Setup
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- This creates the table structure for storing FBLA resources

-- ============================================================================
-- RESOURCE CATEGORIES TABLE
-- ============================================================================
-- Stores resource categories (Competitions & Events, Conferences & Deadlines, etc.)

CREATE TABLE IF NOT EXISTS resource_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT, -- For FontAwesome icon names
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- RESOURCES TABLE
-- ============================================================================
-- Stores all FBLA resources (PDFs, links, documents, etc.)

CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES resource_categories(id) ON DELETE SET NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('pdf', 'external_link', 'internal_page')),
  url TEXT, -- For external links and PDFs
  file_path TEXT, -- For internal file references
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for category lookups
CREATE INDEX IF NOT EXISTS idx_resources_category_id ON resources(category_id);
CREATE INDEX IF NOT EXISTS idx_resources_is_active ON resources(is_active);
CREATE INDEX IF NOT EXISTS idx_resources_resource_type ON resources(resource_type);

-- Index for category display order
CREATE INDEX IF NOT EXISTS idx_resource_categories_display_order ON resource_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_resource_categories_is_active ON resource_categories(is_active);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on both tables
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR RESOURCE_CATEGORIES
-- ============================================================================

-- All authenticated users can view active categories
DROP POLICY IF EXISTS "All users can view active categories" ON resource_categories;
CREATE POLICY "All users can view active categories"
  ON resource_categories FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- ============================================================================
-- RLS POLICIES FOR RESOURCES
-- ============================================================================

-- All authenticated users can view active resources
DROP POLICY IF EXISTS "All users can view active resources" ON resources;
CREATE POLICY "All users can view active resources"
  ON resources FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

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

-- Trigger for resource_categories
DROP TRIGGER IF EXISTS update_resource_categories_updated_at ON resource_categories;
CREATE TRIGGER update_resource_categories_updated_at
  BEFORE UPDATE ON resource_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for resources (last_updated)
CREATE OR REPLACE FUNCTION update_resources_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_resources_last_updated ON resources;
CREATE TRIGGER update_resources_last_updated
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_resources_last_updated();

-- ============================================================================
-- INSERT DEFAULT CATEGORIES
-- ============================================================================

INSERT INTO resource_categories (name, description, icon_name, display_order) VALUES
  ('Competitions & Events', 'Resources for FBLA competitions and competitive events', 'trophy', 1),
  ('Conferences & Deadlines', 'Information about conferences and important deadlines', 'calendar', 2),
  ('Leadership & Career Development', 'Resources for leadership growth and career planning', 'graduation-cap', 3),
  ('Chapter Management', 'Tools and guides for managing your FBLA chapter', 'users', 4),
  ('Official FBLA Documents', 'Official FBLA documents, bylaws, and policies', 'file-text', 5)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SAMPLE RESOURCES (Optional - for testing/demo)
-- ============================================================================
-- Uncomment and modify these to add sample resources

/*
-- Sample PDF Resource
INSERT INTO resources (title, description, category_id, resource_type, url, is_active)
SELECT 
  'FBLA Competitive Events Guide 2025-2026',
  'Complete guide to all FBLA competitive events, rules, and guidelines.',
  id,
  'pdf',
  'https://www.fbla.org/wp-content/uploads/2024/08/Competitive-Events-Guide.pdf',
  true
FROM resource_categories
WHERE name = 'Competitions & Events'
LIMIT 1;

-- Sample External Link Resource
INSERT INTO resources (title, description, category_id, resource_type, url, is_active)
SELECT 
  'FBLA National Leadership Conference',
  'Official website for the FBLA National Leadership Conference.',
  id,
  'external_link',
  'https://www.fbla.org/nlc/',
  true
FROM resource_categories
WHERE name = 'Conferences & Deadlines'
LIMIT 1;

-- Sample Internal Page Resource
INSERT INTO resources (title, description, category_id, resource_type, url, is_active)
SELECT 
  'Chapter Officer Handbook',
  'Comprehensive guide for chapter officers on leadership and management.',
  id,
  'internal_page',
  '/chapter-handbook',
  true
FROM resource_categories
WHERE name = 'Chapter Management'
LIMIT 1;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables were created
SELECT 
  schemaname, 
  tablename
FROM pg_tables 
WHERE tablename IN ('resources', 'resource_categories');

-- Verify categories were inserted
SELECT name, display_order, is_active FROM resource_categories ORDER BY display_order;

-- Verify RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename IN ('resources', 'resource_categories');
