'use client'

import { formatDistanceToNow } from 'date-fns'
import { Post } from '@/lib/supabase'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'Unknown time'
    }
  }

  return (
    <div className="post-card">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{backgroundColor: 'var(--color-facebook-blue)'}}>
          {post.user_id.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-semibold text-gray-900">
              {post.user_id}
            </span>
            <span className="text-sm" style={{color: 'var(--color-facebook-darkgray)'}}>
              {formatTime(post.created_at)}
            </span>
          </div>
          
          <div className="text-gray-800 leading-relaxed">
            {post.message}
          </div>
        </div>
      </div>
    </div>
  )
} 