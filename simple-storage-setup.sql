-- Simple Supabase Storage Setup for Demo
-- Run this in your Supabase SQL Editor

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-images', 'user-images', true)
ON CONFLICT (id) DO NOTHING;

-- Disable RLS on storage.objects for demo
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS but allow all operations:
-- DROP POLICY IF EXISTS "Allow all operations" ON storage.objects;
-- CREATE POLICY "Allow all operations" ON storage.objects FOR ALL USING (true); 