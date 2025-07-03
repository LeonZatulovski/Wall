import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ypkkfqvgwbaefdcwmavs.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwa2tmcXZnd2JhZWZkY3dtYXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTQxNTEsImV4cCI6MjA2NzAzMDE1MX0._DaCHBmOjEBRoPy_fUzUwRE_tFLxieuIAF7Gi9KrBcw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Post {
  id: string
  user_id: string
  message: string
  created_at: string
}

export interface CreatePostData {
  user_id: string
  message: string
} 