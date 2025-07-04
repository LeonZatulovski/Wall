-- In-App Messaging System Setup
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

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages (using username-based auth)
-- Users can read messages they sent or received
CREATE POLICY "Users can read their own messages" ON messages
  FOR SELECT USING (
    sender_id = current_setting('request.jwt.claims', true)::json->>'user_id' OR 
    recipient_id = current_setting('request.jwt.claims', true)::json->>'user_id'
  );

-- Users can insert messages (send messages)
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id = current_setting('request.jwt.claims', true)::json->>'user_id'
  );

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can update messages they received" ON messages
  FOR UPDATE USING (
    recipient_id = current_setting('request.jwt.claims', true)::json->>'user_id'
  );

-- Alternative: Simple policies for demo (disable RLS temporarily)
-- DROP POLICY IF EXISTS "Users can read their own messages" ON messages;
-- DROP POLICY IF EXISTS "Users can send messages" ON messages;
-- DROP POLICY IF EXISTS "Users can update messages they received" ON messages;
-- CREATE POLICY "Allow all operations for demo" ON messages FOR ALL USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable real-time for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages; 