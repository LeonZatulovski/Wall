-- User Information Setup for Facebook Wall 2008
-- Run this in your Supabase SQL Editor

-- Create user_info table to store additional user information
CREATE TABLE IF NOT EXISTS user_info (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  birthdate DATE,
  location TEXT,
  networks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_info_user_id ON user_info(user_id);

-- Enable RLS
ALTER TABLE user_info ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for demo
CREATE POLICY "Allow all operations on user_info" ON user_info FOR ALL USING (true);

-- Or disable RLS for demo
-- ALTER TABLE user_info DISABLE ROW LEVEL SECURITY; 