'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  subject: string
  message: string
  item_id: number | null
  is_read: boolean
  created_at: string
  marketplace_item?: {
    title: string
    price: number
    image_url: string | null
  }
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get('user')
  
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox')

  useEffect(() => {
    if (userId) {
      loadMessages()
    }
  }, [userId, activeTab])

  const loadMessages = async () => {
    if (!userId) return

    setLoading(true)
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          marketplace_item:marketplace_items(title, price, image_url)
        `)
        .order('created_at', { ascending: false })

      if (activeTab === 'inbox') {
        query = query.eq('recipient_id', userId)
      } else {
        query = query.eq('sender_id', userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading messages:', error)
        return
      }

      setMessages(data || [])

      // Mark received messages as read
      if (activeTab === 'inbox' && data) {
        const unreadMessages = data.filter(msg => !msg.is_read)
        if (unreadMessages.length > 0) {
          const messageIds = unreadMessages.map(msg => msg.id)
          try {
            await supabase
              .from('messages')
              .update({ is_read: true })
              .in('id', messageIds)
          } catch (error) {
            console.error('Error marking messages as read:', error)
            // Continue even if marking as read fails
          }
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToWall = () => {
    router.push(`/?user=${userId}`)
  }

  const handleGoToMarketplace = () => {
    router.push(`/marketplace?user=${userId}`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--color-facebook-gray)'}}>
        <div className="text-lg">Loading messages...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--color-facebook-gray)'}}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
                      <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToWall}
                  className="facebook-button cursor-pointer"
                >
                  ← Back to Wall
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              </div>
              <button
                onClick={handleGoToMarketplace}
                className="facebook-button cursor-pointer"
              >
                Marketplace
              </button>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors duration-200 cursor-pointer ${
                activeTab === 'inbox'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Inbox
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors duration-200 cursor-pointer ${
                activeTab === 'sent'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sent
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {messages.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab === 'inbox' ? 'messages' : 'sent messages'} yet
              </h3>
              <p className="text-gray-500">
                {activeTab === 'inbox' 
                  ? 'When someone messages you about your marketplace items, they\'ll appear here.'
                  : 'Messages you send to sellers will appear here.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {messages.map((message) => (
                <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start space-x-4">
                    {/* Item Image (if available) */}
                    {message.marketplace_item?.image_url && (
                      <div className="flex-shrink-0">
                        <img
                          src={message.marketplace_item.image_url}
                          alt={message.marketplace_item.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {activeTab === 'inbox' ? message.sender_id : message.recipient_id}
                          </h3>
                          {!message.is_read && activeTab === 'inbox' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <h4 className="text-md font-medium text-gray-700 mb-2">
                        {message.subject}
                      </h4>
                      
                      {message.marketplace_item && (
                        <div className="mb-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Item:</span> {message.marketplace_item.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Price:</span> {formatPrice(message.marketplace_item.price)}
                          </p>
                        </div>
                      )}
                      
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 