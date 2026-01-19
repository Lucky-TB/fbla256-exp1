# Community Tab Setup Guide

This guide explains how to set up the Community tab features in Supabase for the FBLA Member App.

## Quick Setup

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the SQL File**
   - Copy the entire contents of `SUPABASE_COMMUNITY_SETUP.sql`
   - Paste it into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify Setup**
   - Check that the `announcements` table exists
   - Verify that `user_profiles` table has the new social media columns
   - Test by adding a test announcement (see below)

## What This Creates

### Database Changes

1. **Social Media Fields in `user_profiles`**
   - `chapter_instagram` - Chapter Instagram username (optional)
   - `chapter_twitter` - Chapter X/Twitter username (optional)
   - `chapter_tiktok` - Chapter TikTok username (optional)
   - `chapter_facebook` - Chapter Facebook page URL or username (optional)

2. **`announcements` Table**
   - Stores chapter announcements and updates
   - Includes title, body, posted_by_role, chapter_name
   - Row Level Security (RLS) ensures users only see their chapter's announcements

### Features

1. **Announcements Feed**
   - Real-time feed of chapter announcements
   - Sorted by newest first
   - Shows posted by role and timestamp
   - Read-only for regular members

2. **Social Media Integration**
   - Conditional display based on onboarding data
   - Direct integration with Instagram, X/Twitter, TikTok, Facebook
   - Uses WebView with deep linking fallback
   - Only appears if at least one social media handle exists

## Adding Announcements

### Via Supabase Dashboard (Table Editor)

1. Go to Table Editor
2. Select `announcements` table
3. Click "Insert row"
4. Fill in the fields:
   - `title` (required) - Announcement title
   - `body` (required) - Announcement content
   - `posted_by_role` (optional) - e.g., "Chapter Officer", "Admin", "Adviser"
   - `chapter_name` (required) - Must match the chapter name from user_profiles
   - `is_active` (default: true) - Set to false to hide announcement

### Via SQL

```sql
INSERT INTO announcements (
  title,
  body,
  posted_by_role,
  chapter_name,
  is_active
)
VALUES (
  'Welcome to the New School Year!',
  'We are excited to kick off another great year of FBLA activities. Stay tuned for upcoming events and competitions.',
  'Chapter Officer',
  'Lincoln High School FBLA', -- Must match chapter name from user_profiles
  true
);
```

## Social Media Setup

Social media handles are collected during onboarding (optional). They represent chapter-level social media accounts, not individual member accounts.

### Example Social Media Handles

- **Instagram**: `lincolnfbla` (stored without @)
- **X/Twitter**: `lincolnfbla` (stored without @)
- **TikTok**: `lincolnfbla` (stored without @)
- **Facebook**: `lincolnhighschoolfbla` or full URL

## Security

All data is protected by Row Level Security (RLS):
- Users can only view announcements for their chapter
- Social media handles are stored per user but represent chapter-level accounts
- All operations require authentication

## Testing

1. **Test Announcements**
   - Add a test announcement for your chapter
   - Verify it appears in the Community tab
   - Check that it's sorted by newest first

2. **Test Social Media**
   - Complete onboarding with social media handles
   - Verify the "Follow Our Chapter" section appears
   - Test tapping each platform (should open in WebView or native app)

3. **Test Conditional Display**
   - Complete onboarding without social media handles
   - Verify the social media section does NOT appear
   - Verify announcements still display

## Troubleshooting

### Announcements not showing
- Verify the `announcements` table exists
- Check that `chapter_name` matches exactly with user's chapter in `user_profiles`
- Ensure `is_active` is set to `true`
- Check RLS policies are correctly set

### Social media section not appearing
- Verify social media fields were added to `user_profiles` table
- Check that at least one social media handle was entered during onboarding
- Verify the handles are stored correctly (without @ symbols)

### Deep linking not working
- This is expected - deep linking will only work if the native app is installed
- WebView fallback is the primary method and works for all platforms

## FBLA Competition Alignment

This implementation demonstrates:

✅ **News feed with announcements and updates** - Real announcements from Supabase
✅ **Integration with chapter social media channels** - Direct WebView integration with deep linking fallback
✅ **Real data handling** - No mock or placeholder data
✅ **Conditional rendering** - Social media only appears if handles exist
✅ **Professional UX** - Clean, accessible interface with proper loading states
