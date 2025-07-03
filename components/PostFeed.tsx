'use client'

import { useEffect, useState } from 'react'
import { supabase, Post } from '@/lib/supabase'
import PostCard from './PostCard'

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts from Supabase...')
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
        alert(`Error fetching posts: ${error.message}`)
      } else {
        console.log('Posts fetched successfully:', data)
        setPosts(data || [])
      }
    } catch (error) {
      console.error('Unexpected error fetching posts:', error)
      alert(`Unexpected error fetching posts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()

    // Set up real-time subscription
    const channel = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          // Refetch posts when there are changes
          fetchPosts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div style={{color: 'var(--color-facebook-darkgray)'}}>Loading posts...</div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8" style={{color: 'var(--color-facebook-darkgray)'}}>
        No posts yet. Be the first to share something!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
} 