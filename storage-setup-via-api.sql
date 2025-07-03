-- Storage Setup via Supabase Dashboard (Recommended)
-- This is the safest approach

-- Step 1: Go to your Supabase Dashboard
-- Step 2: Navigate to "Storage" in the left sidebar
-- Step 3: Click "Create a new bucket"
-- Step 4: Create these two buckets:

-- Bucket 1:
-- Name: profile-images
-- Public: Yes
-- File size limit: 5MB
-- Allowed MIME types: image/*

-- Bucket 2:
-- Name: user-images  
-- Public: Yes
-- File size limit: 10MB
-- Allowed MIME types: image/*

-- Step 5: Go to Settings > Storage
-- Step 6: Disable "Row Level Security" for storage

-- Alternative: If you want to keep RLS enabled, create this policy:
-- CREATE POLICY "Allow public access to storage" ON storage.objects
-- FOR ALL USING (bucket_id IN ('profile-images', 'user-images')); 