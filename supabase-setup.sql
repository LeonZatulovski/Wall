-- Facebook Wall 2008 - Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create the posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) <= 280),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for demo purposes)
CREATE POLICY "Allow all operations" ON posts FOR ALL USING (true);

-- Enable real-time for the posts table
ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- Optional: Insert some sample data
INSERT INTO posts (user_id, message) VALUES
  ('Mark', 'Just launched the new Facebook Wall feature!'),
  ('Zuckerberg', 'The future of social networking is here.'),
  ('Sarah', 'This is so much better than MySpace!'),
  ('Mike', 'Can''t wait to see what''s next for Facebook.'); 