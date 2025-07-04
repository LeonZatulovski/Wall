-- Simple Messages Setup (No RLS for demo)
-- Run this SQL in your Supabase SQL Editor

-- Create messages table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable real-time for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Optional: Add some sample data for testing
-- INSERT INTO messages (sender_id, recipient_id, subject, message, item_id) VALUES
--   ('John', 'Sarah', 'Inquiry about: Test Item', 'Hi Sarah, is this item still available?', 1),
--   ('Sarah', 'John', 'Re: Inquiry about: Test Item', 'Yes, it is! When would you like to meet?', 1); 