-- Storage Policies Setup for Facebook Wall 2008
-- Run this in your Supabase SQL Editor after creating buckets via UI

-- Remove any existing policies that might conflict
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations for demo" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations" ON storage.objects;

-- Create policies for profile-images bucket
CREATE POLICY "Allow all operations on profile-images" ON storage.objects
FOR ALL USING (bucket_id = 'profile-images');

-- Create policies for user-images bucket  
CREATE POLICY "Allow all operations on user-images" ON storage.objects
FOR ALL USING (bucket_id = 'user-images');

-- Alternative: Create a single policy for both buckets
-- CREATE POLICY "Allow all operations on both buckets" ON storage.objects
-- FOR ALL USING (bucket_id IN ('profile-images', 'user-images')); 