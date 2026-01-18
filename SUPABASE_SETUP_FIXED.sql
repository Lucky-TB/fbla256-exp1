-- Complete Supabase Setup for FBLA App
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)

-- Step 1: Create user_roles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('student', 'teacher', 'admin')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;

-- Step 4: Create policies
-- Policy: Users can view their own role
CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own role (for registration)
CREATE POLICY "Users can insert their own role"
  ON user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Verify the setup
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'user_roles';
