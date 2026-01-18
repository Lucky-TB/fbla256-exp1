# User Profiles Table Setup

This guide explains how to set up the `user_profiles` table in Supabase for the FBLA Member App.

## Quick Setup

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the SQL File**
   - Copy the entire contents of `SUPABASE_USER_PROFILES.sql`
   - Paste it into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify Setup**
   - The query should complete successfully
   - You should see a table listing with `user_profiles` policies

## What This Creates

The SQL file creates:

- **`user_profiles` table** - Stores member profile data
- **Row Level Security (RLS)** - Ensures users can only access their own data
- **Policies** - Three policies for SELECT, INSERT, and UPDATE operations
- **Triggers** - Automatically updates `updated_at` timestamp
- **Indexes** - Optimizes user_id lookups

## Table Structure

The `user_profiles` table includes:

- **Required Fields**: first_name, last_name, school, chapter
- **Optional Fields**: grade, graduation_year, phone_number, officer_role
- **Status Fields**: membership_status, completed_onboarding
- **Preferences**: JSONB field for notification and accessibility settings
- **Timestamps**: created_at, updated_at

## Security

All data is protected by Row Level Security (RLS):
- Users can only view their own profile
- Users can only insert/update their own profile
- All operations require authentication

## Troubleshooting

If you see an error like "Could not find the table 'public.user_profiles'":
- Make sure you've run the SQL file in Supabase SQL Editor
- Check that the query completed successfully
- Verify the table exists in the Table Editor

## Next Steps

After running the SQL file:
1. Complete the onboarding flow in the app
2. Your profile data will be saved to Supabase
3. View your profile in the Profile tab
