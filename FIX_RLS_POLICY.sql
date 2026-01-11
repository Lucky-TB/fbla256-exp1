-- Fix infinite recursion in user_roles RLS policy
-- Run this in your Supabase SQL Editor

-- Drop the problematic admin policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;

-- The app only needs users to view their own role, so we don't need the admin policy
-- If you need admin functionality later, handle it at the application level or use service role
