# Supabase Authentication Setup Guide

This app uses Supabase for authentication with role-based access control (Student, Teacher, Admin).

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to finish setting up

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**
3. Create a `.env` file in the root of your project:

```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Set Up the Database

Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor):

**IMPORTANT: If you already ran the previous SQL, first drop the problematic policy:**

```sql
-- Drop the old admin policy if it exists (to fix infinite recursion)
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
```

**Then run this complete setup:**

```sql
-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('student', 'teacher', 'admin')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON user_roles;

-- Create a function to check if user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$;

-- Create policies
CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own role (for registration)
CREATE POLICY "Users can insert their own role"
  ON user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Note:** The app only needs users to view their own role, so we've removed the admin policy that was causing recursion. If you need admins to view all roles later, you can add a separate admin-only table or use the service role key for admin operations.

## Step 4: Create Test Users

### Option A: Using Supabase Dashboard

1. Go to **Authentication** → **Users** → **Add User**
2. Create users with different roles
3. After creating each user, manually insert their role in the `user_roles` table:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('user-uuid-here', 'student'); -- or 'teacher' or 'admin'
```

### Option B: Using SQL (for testing)

```sql
-- This will create a user and assign a role
-- Note: You'll need to set the password through the Auth UI or API
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('student@test.com', crypt('password123', gen_salt('bf')), NOW())
RETURNING id;

-- Then insert the role (replace 'user-id-here' with the returned id)
INSERT INTO user_roles (user_id, role)
VALUES ('user-id-here', 'student');
```

## Step 5: Test the Authentication

1. Start your Expo app
2. You should be redirected to the login screen
3. Select a role (Student, Teacher, or Admin)
4. Enter your test user credentials
5. You should be redirected to the home screen upon successful login

## Features Implemented

- ✅ Clean, professional login UI with role selection
- ✅ Supabase authentication integration
- ✅ Role-based access control (student, teacher, admin)
- ✅ Protected routes
- ✅ Persistent sessions
- ✅ Dark mode support
- ✅ Profile page with user info and logout
- ✅ Automatic redirects based on auth state

## Using Protected Routes

You can protect routes based on roles using the `ProtectedRoute` component:

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AdminScreen() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <View>
        <Text>Admin Only Content</Text>
      </View>
    </ProtectedRoute>
  );
}
```

## Troubleshooting

- **"Invalid role for this account"**: Make sure the user has a corresponding entry in the `user_roles` table
- **"Invalid credentials"**: Check that the user exists in Supabase Auth and the password is correct
- **Environment variables not working**: Make sure your `.env` file is in the root directory and restart your Expo dev server
