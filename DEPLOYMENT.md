# Deploy Facebook Wall 2008 to Vercel

## Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Supabase Project**: Your Supabase project should be set up and configured

## Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub with these files:
- All your React components
- `package.json` with dependencies
- `next.config.js`
- `tailwind.config.js`
- `tsconfig.json`

## Step 2: Set Up Environment Variables

### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://ypkkfqvgwbaefdcwmavs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwa2tmcXZnd2JhZWZkY3dtYXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTQxNTEsImV4cCI6MjA2NzAzMDE1MX0._DaCHBmOjEBRoPy_fUzUwRE_tFLxieuIAF7Gi9KrBcw
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Next.js project
5. Click "Deploy"

### Option B: Deploy via Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts to connect your GitHub repo

## Step 4: Configure Supabase for Production

### Run Database Setup:
1. Go to your Supabase dashboard
2. Open SQL Editor
3. Run the storage setup SQL:
   ```sql
   -- Run simple-storage-setup.sql or storage-policies-setup.sql
   ```
4. Run the user info setup SQL:
   ```sql
   -- Run user-info-setup.sql
   ```

### Configure Storage:
1. Go to Storage in Supabase dashboard
2. Create buckets manually if needed:
   - `profile-images` (public)
   - `user-images` (public)
3. Disable RLS on storage.objects table

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Test user registration and login
3. Test profile image upload
4. Test photo uploads
5. Test user information collection

## Step 6: Custom Domain (Optional)

1. In Vercel dashboard, go to "Domains"
2. Add your custom domain
3. Configure DNS settings as instructed

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Working**
   - Make sure they're set in Vercel dashboard
   - Redeploy after adding variables

2. **Supabase Connection Issues**
   - Check your Supabase URL and anon key
   - Ensure RLS is properly configured

3. **Storage Upload Fails**
   - Verify storage buckets exist
   - Check RLS policies on storage.objects

4. **Build Errors**
   - Check Vercel build logs
   - Ensure all dependencies are in package.json

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Supabase storage buckets created
- [ ] Database tables created
- [ ] RLS policies configured
- [ ] App builds successfully
- [ ] All features working in production
- [ ] Custom domain configured (optional)

## Support

If you encounter issues:
1. Check Vercel build logs
2. Check browser console for errors
3. Verify Supabase configuration
4. Test locally with `npm run build` first 