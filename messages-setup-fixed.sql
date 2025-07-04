-- Fixed Messages Setup (Handles existing tables)
-- Run this SQL in your Supabase SQL Editor

-- Create messages table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  item_id INTEGER REFERENCES marketplace_items(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for demo (simple authentication)
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Create indexes (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Add to realtime publication (only if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;

-- Verify the setup
SELECT 
  'Messages table created successfully' as status,
  COUNT(*) as message_count
FROM messages; 