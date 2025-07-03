-- Disable RLS on storage.objects for demo
-- This is the simplest approach for getting storage to work

ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY; 