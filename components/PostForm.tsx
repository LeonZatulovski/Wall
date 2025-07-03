'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface PostFormProps {
  userId: string
  onPostCreated: () => void
}

export default function PostForm({ userId, onPostCreated }: PostFormProps) {
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() || message.length > 280) {
      return
    }

    setIsSubmitting(true)

    try {
      console.log('Attempting to create post with data:', {
        user_id: userId,
        message: message.trim()
      })

      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: userId,
            message: message.trim()
          }
        ])
        .select()

      if (error) {
        console.error('Supabase error creating post:', error)
        alert(`Failed to create post: ${error.message}`)
      } else {
        console.log('Post created successfully:', data)
        setMessage('')
        onPostCreated()
      }
    } catch (error) {
      console.error('Unexpected error creating post:', error)
      alert(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const remainingChars = 280 - message.length

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's on your mind?"
            className="facebook-input resize-none"
            rows={3}
            maxLength={280}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {remainingChars} characters remaining
          </div>
          
          <button
            type="submit"
            disabled={!message.trim() || message.length > 280 || isSubmitting}
            className="facebook-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </form>
    </div>
  )
} 