# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy the SQL from `supabase-setup.sql` and run it in your Supabase SQL Editor
3. Go to **Settings > API** and copy your Project URL and anon key

### 3. Configure Environment Variables

Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your Facebook Wall!

## 📋 What's Included

✅ **Complete Next.js 14 App** with TypeScript  
✅ **Real-time Updates** using Supabase subscriptions  
✅ **280 Character Limit** with live counter  
✅ **2008 Facebook Styling** with Tailwind CSS  
✅ **Responsive Design** for mobile and desktop  
✅ **Simple Authentication** (just enter your name)  

## 🎯 Features

- **Live Feed**: Posts appear instantly without page refresh
- **Character Counter**: See how many characters you have left
- **Timestamps**: Shows "2 minutes ago" style timestamps
- **User Avatars**: Simple colored circles with initials
- **Share Button**: Classic Facebook-style posting

## 🔧 Database Schema

The `posts` table has 4 fields:
- `id` (UUID, auto-generated)
- `user_id` (TEXT, author name)
- `message` (TEXT, max 280 chars)
- `created_at` (TIMESTAMP, auto-generated)

## 🚀 Ready to Deploy?

This app works great on:
- Vercel (recommended)
- Netlify
- Railway
- Any platform that supports Next.js

Just add your environment variables and deploy! 