# Supabase Storage Setup for PDF Resources

This guide shows you how to upload PDFs to Supabase Storage and use them in your app instead of external links.

## Why Supabase Storage?

- ✅ **Reliable**: No broken external links
- ✅ **Fast**: Served from Supabase CDN
- ✅ **Secure**: Built-in access control
- ✅ **Scalable**: Handles large files efficiently
- ✅ **FBLA Judging**: Shows proper data infrastructure

## Step 1: Create a Storage Bucket

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Select your project

2. **Navigate to Storage**
   - Click "Storage" in the left sidebar
   - Click "New bucket"

3. **Create the Bucket**
   - **Name**: `fbla-resources` (or `pdfs`, `documents`, etc.)
   - **Public bucket**: ✅ **Check this** (so PDFs can be accessed without authentication)
   - Click "Create bucket"

## Step 2: Set Up Bucket Policies (RLS)

1. **Go to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

2. **Run this SQL** (replace `fbla-resources` with your bucket name if different):

```sql
-- Allow authenticated users to view files in the fbla-resources bucket
CREATE POLICY "Public Access for FBLA Resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'fbla-resources');

-- Optional: Allow authenticated users to upload (if you want app uploads)
CREATE POLICY "Authenticated users can upload resources"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'fbla-resources' 
  AND auth.role() = 'authenticated'
);
```

## Step 3: Upload Your PDF

### Option A: Via Supabase Dashboard (Easiest)

1. **Go to Storage**
   - Click "Storage" → Your bucket name (`fbla-resources`)
   - Click "Upload file"
   - Select your PDF file
   - Click "Upload"

2. **Get the Public URL**
   - After upload, click on the file name
   - Copy the "Public URL" (looks like: `https://[project-id].supabase.co/storage/v1/object/public/fbla-resources/filename.pdf`)

### Option B: Via SQL (If you have the file URL)

If you've already downloaded the PDF, you can upload it via the Supabase dashboard manually.

## Step 4: Update the Resource in Database

Run this SQL in the SQL Editor (replace the URL with your Supabase Storage public URL):

```sql
-- Update the FBLA Competitive Events Guide to use Supabase Storage
UPDATE resources
SET 
  url = 'https://[YOUR-PROJECT-ID].supabase.co/storage/v1/object/public/fbla-resources/25-26-High-School-Guidelines-All-in-One.pdf',
  last_updated = NOW()
WHERE title = 'FBLA Competitive Events Guide 2025-2026';

-- Verify the update
SELECT 
  r.id,
  r.title,
  r.resource_type,
  r.url,
  rc.name as category_name
FROM resources r
LEFT JOIN resource_categories rc ON r.category_id = rc.id
WHERE r.title = 'FBLA Competitive Events Guide 2025-2026';
```

## Step 5: Test in App

1. Open the Resources tab
2. Find the FBLA Competitive Events Guide
3. Tap "Open PDF"
4. The PDF should load in the in-app WebView

## File Naming Tips

- Use descriptive names: `25-26-High-School-Guidelines-All-in-One.pdf`
- Avoid spaces (use hyphens): `competitive-events-guide-2025-2026.pdf`
- Keep names consistent for easier management

## Adding More PDFs

1. Upload PDF to your `fbla-resources` bucket
2. Copy the public URL
3. Either:
   - Update existing resource: `UPDATE resources SET url = '...' WHERE title = '...';`
   - Insert new resource: Use the INSERT statement from `INSERT_FBLA_COMPETITIVE_EVENTS_GUIDE.sql` with the new URL

## Troubleshooting

**PDF won't load:**
- Check that the bucket is set to "Public"
- Verify the RLS policy allows SELECT
- Make sure the URL is correct (copy from Supabase dashboard)

**Can't upload:**
- Check bucket permissions
- Make sure you're authenticated in Supabase dashboard
- Verify file size limits (Supabase free tier: 50MB per file)

**URL not working:**
- Ensure the bucket name matches in the URL
- Check that the file path in the URL matches the file name exactly
