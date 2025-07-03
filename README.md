# Facebook Wall 2008

A nostalgic Facebook-style wall application built with React, Next.js, and Supabase. This project recreates the classic Facebook wall experience from 2008 with real-time updates.

## Features

- **Simple User Authentication**: Enter your name to start posting
- **Character Limit**: 280 character limit per post (like Twitter's original limit)
- **Real-time Updates**: Live feed that updates automatically without page refresh
- **2008 Facebook Styling**: Authentic look and feel from the early Facebook days
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, Next.js 14, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **Date Formatting**: date-fns

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is created, go to the **SQL Editor**
3. Run the following SQL to create the posts table:

```sql
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
```

4. Go to **Settings > API** in your Supabase dashboard
5. Copy your **Project URL** and **anon public** key

### 3. Configure Environment Variables

1. Create a `.env.local` file in the root directory
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Schema

The application uses a simple `posts` table with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier (auto-generated) |
| `user_id` | TEXT | Author's user ID/name |
| `message` | TEXT | Post content (max 280 characters) |
| `created_at` | TIMESTAMP | Post creation timestamp |

## Features Explained

### Real-time Updates
The application uses Supabase's real-time subscriptions to automatically update the feed when new posts are created. This is implemented in the `PostFeed` component using:

```typescript
const channel = supabase
  .channel('posts_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'posts'
  }, () => {
    fetchPosts()
  })
  .subscribe()
```

### Character Limit
Posts are limited to 280 characters with a live character counter, similar to Twitter's original character limit.

### 2008 Facebook Styling
The application uses custom Tailwind CSS classes to recreate the classic Facebook blue color scheme and styling from 2008.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel's dashboard
4. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for learning or commercial purposes. 