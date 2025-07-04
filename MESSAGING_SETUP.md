# In-App Messaging System Setup

This guide shows you how to set up the in-app messaging system for the marketplace.

## Database Setup

### 1. Run the Messages Table Setup

1. Go to your Supabase dashboard
2. Open the SQL Editor
3. Run the SQL from `messages-setup.sql`:

```sql
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

-- Create policies for messages
CREATE POLICY "Users can read their own messages" ON messages
  FOR SELECT USING (
    auth.uid()::text = sender_id OR 
    auth.uid()::text = recipient_id
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid()::text = sender_id
  );

CREATE POLICY "Users can update messages they received" ON messages
  FOR UPDATE USING (
    auth.uid()::text = recipient_id
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable real-time for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

## How It Works

### 1. Message Flow
1. User clicks "Message Seller" on a marketplace item
2. Contact form opens with just a message field (no email needed)
3. Message is sent directly to the seller's inbox
4. Seller can view the message in their Messages page

### 2. Messages Page Features
- **Inbox Tab**: Shows messages received from other users
- **Sent Tab**: Shows messages you've sent to others
- **Item Context**: Shows the marketplace item details with each message
- **Read Status**: Messages are automatically marked as read when viewed
- **Real-time Updates**: New messages appear instantly

### 3. Security Features
- **Row Level Security (RLS)**: Users can only see their own messages
- **Sender Validation**: Users can only send messages as themselves
- **Read Permissions**: Only message recipients can mark messages as read

## Testing the Messaging System

### 1. Test with Multiple Users
1. Open the app in two different browsers or incognito windows
2. Log in as different users (e.g., "John" and "Sarah")
3. Have one user post an item in the marketplace
4. Have the other user message the seller
5. Check that the message appears in the seller's inbox

### 2. Test Message Features
- Send messages between users
- Check that messages appear in both inbox and sent tabs
- Verify that marketplace item details are shown with messages
- Test that messages are marked as read when viewed

## Navigation

### 1. Accessing Messages
- **From Main Wall**: Click "Messages" in the header
- **From Marketplace**: Messages are sent directly to seller's inbox
- **Direct URL**: `/messages?user=USERNAME`

### 2. Message Notifications
Currently, there are no push notifications, but you could add them later using:
- Browser notifications
- Email notifications (using the Edge Function we created earlier)
- Real-time notifications in the UI

## Future Enhancements

### 1. Real-time Notifications
```typescript
// Subscribe to new messages
const channel = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `recipient_id=eq.${userId}`
  }, (payload) => {
    // Show notification for new message
    showNotification('New message received!')
  })
  .subscribe()
```

### 2. Message Threads
- Group messages by conversation
- Show message history between users
- Add reply functionality

### 3. Message Search
- Search through messages by content
- Filter by sender/recipient
- Search by item title

### 4. Message Actions
- Delete messages
- Mark as unread
- Archive messages
- Block users

## Troubleshooting

### Common Issues:

1. **Messages not appearing**: Check RLS policies are correct
2. **Can't send messages**: Verify user is logged in and sender_id matches
3. **Real-time not working**: Ensure messages table is added to realtime publication
4. **Performance issues**: Check that indexes are created

### Check Logs:
1. Go to Supabase dashboard
2. Navigate to Database > Logs
3. Look for any errors related to messages table

## Benefits of In-App Messaging

- **No external dependencies**: No need for email services
- **Better user experience**: Messages stay within the app
- **Privacy**: Users don't need to share email addresses
- **Real-time**: Instant message delivery
- **Context**: Messages include marketplace item details
- **Security**: Built-in access controls

The messaging system is now fully integrated with your marketplace! 