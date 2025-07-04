'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface MarketplaceItem {
  id: number
  seller_id: string
  seller_email: string
  title: string
  description: string | null
  price: number
  image_url: string | null
  location: string | null
  category: string | null
  condition: string | null
  created_at: string
}

export default function MarketplacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('user')
  
  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPostForm, setShowPostForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    category: '',
    condition: '',
    dateRange: '',
    locationRadius: ''
  })
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    price: '',
    sellerEmail: '',
    location: '',
    category: '',
    condition: ''
  })
  const [itemImage, setItemImage] = useState<File | null>(null)

  useEffect(() => {
    if (!userId) {
      router.push('/')
      return
    }
    loadItems()
  }, [userId, router])

  const loadItems = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('marketplace_items')
        .select('*')
        .order('created_at', { ascending: false })

      // Text search
      if (searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      // Price range filter
      if (filters.minPrice) {
        query = query.gte('price', parseFloat(filters.minPrice))
      }
      if (filters.maxPrice) {
        query = query.lte('price', parseFloat(filters.maxPrice))
      }

      // Category filter
      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      // Condition filter
      if (filters.condition) {
        query = query.eq('condition', filters.condition)
      }

      // Date range filter
      if (filters.dateRange) {
        const now = new Date()
        let startDate = new Date()
        
        switch (filters.dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0)
            break
          case 'week':
            startDate.setDate(now.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(now.getMonth() - 1)
            break
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1)
            break
        }
        
        query = query.gte('created_at', startDate.toISOString())
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading items:', error)
        return
      }

      // Client-side location filtering (since Supabase doesn't have built-in geolocation)
      let filteredData = data || []
      
      if (filters.locationRadius && filters.locationRadius !== 'any') {
        // For now, we'll just show all items with locations
        // In a real app, you'd implement proper geolocation filtering
        filteredData = filteredData.filter(item => item.location)
      }

      setItems(filteredData)
    } catch (error) {
      console.error('Error loading items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadItems()
  }

  const uploadItemImage = async (file: File): Promise<string | null> => {
    if (!userId) return null

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `marketplace/${userId}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('user-images')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return null
      }

      const { data: urlData } = supabase.storage
        .from('user-images')
        .getPublicUrl(fileName)

      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const handlePostItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setUploading(true)
    try {
      let imageUrl = null
      if (itemImage) {
        imageUrl = await uploadItemImage(itemImage)
      }

      const { error } = await supabase
        .from('marketplace_items')
        .insert({
          seller_id: userId,
          seller_email: newItem.sellerEmail,
          title: newItem.title,
          description: newItem.description || null,
          price: parseFloat(newItem.price),
          image_url: imageUrl,
          location: newItem.location || null,
          category: newItem.category || null,
          condition: newItem.condition || null
        })

      if (error) {
        console.error('Error posting item:', error)
        alert('Error posting item. Please try again.')
        return
      }

      // Reset form
      setNewItem({ title: '', description: '', price: '', sellerEmail: '', location: '', category: '', condition: '' })
      setItemImage(null)
      setShowPostForm(false)
      
      // Reload items
      loadItems()
      
      alert('Item posted successfully!')
    } catch (error) {
      console.error('Error posting item:', error)
      alert('Error posting item. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setItemImage(file)
    }
  }

  const handleMessageSeller = (item: MarketplaceItem) => {
    setSelectedItem(item)
    setShowContactForm(true)
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem || !userId) return

    const formData = new FormData(e.target as HTMLFormElement)
    const message = formData.get('message') as string

    try {
      // Send direct message to seller
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          recipient_id: selectedItem.seller_id,
          subject: `Inquiry about: ${selectedItem.title}`,
          message: message,
          item_id: selectedItem.id
        })

      if (error) {
        console.error('Error sending message:', error)
        alert('Error sending message. Please try again.')
        return
      }

      alert(`Message sent successfully to ${selectedItem.seller_id}!`)
      setShowContactForm(false)
      setSelectedItem(null)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error sending message. Please try again.')
    }
  }



  const handleBackToWall = () => {
    router.push(`/?user=${userId}`)
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
        <div className="text-lg">Loading marketplace...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--color-facebook-gray)'}}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold" style={{color: 'var(--color-facebook-blue)'}}>
              Marketplace
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPostForm(true)}
                className="facebook-button cursor-pointer"
              >
                Post Item
              </button>
              <button
                onClick={handleBackToWall}
                className="font-medium cursor-pointer hover:opacity-80 transition-opacity"
                style={{color: 'var(--color-facebook-blue)'}}
              >
                Back to Wall
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <form onSubmit={handleSearch} className="space-y-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search items..."
                    className="w-full facebook-input text-sm"
                  />
                  <button type="submit" className="w-full facebook-button text-sm">
                    Search
                  </button>
                </form>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    className="w-full facebook-input text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="w-full facebook-input text-sm"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full facebook-input text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Books">Books</option>
                  <option value="Sports">Sports</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Home & Garden">Home & Garden</option>
                  <option value="Toys & Games">Toys & Games</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Condition */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select
                  value={filters.condition}
                  onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full facebook-input text-sm"
                >
                  <option value="">Any Condition</option>
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              {/* Date Listed */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Listed</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full facebook-input text-sm"
                >
                  <option value="">Any Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={filters.locationRadius}
                  onChange={(e) => setFilters(prev => ({ ...prev, locationRadius: e.target.value }))}
                  className="w-full facebook-input text-sm"
                >
                  <option value="any">Any Location</option>
                  <option value="local">Local Items Only</option>
                </select>
              </div>

              {/* Apply & Clear Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={loadItems}
                  className="w-full facebook-button text-sm"
                >
                  Apply Filters
                </button>
                {(searchTerm || Object.values(filters).some(v => v)) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('')
                      setFilters({
                        minPrice: '',
                        maxPrice: '',
                        category: '',
                        condition: '',
                        dateRange: '',
                        locationRadius: ''
                      })
                      loadItems()
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">

        {/* Contact Form Modal */}
        {showContactForm && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Contact Seller</h2>
                <button
                  onClick={() => {
                    setShowContactForm(false)
                    setSelectedItem(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <h3 className="font-medium">{selectedItem.title}</h3>
                <p className="text-sm text-gray-600">Seller: {selectedItem.seller_id}</p>
                <p className="text-sm text-gray-600">Price: {formatPrice(selectedItem.price)}</p>
              </div>
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message to {selectedItem.seller_id} *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    className="facebook-input"
                    placeholder="Hi, I'm interested in your item. Is it still available?"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 facebook-button"
                  >
                    Send Message
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowContactForm(false)
                      setSelectedItem(null)
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Post Item Form */}
        {showPostForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Post New Item</h2>
              <button
                onClick={() => setShowPostForm(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handlePostItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Item title"
                  className="facebook-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your item..."
                  className="facebook-input"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.price}
                  onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  className="facebook-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email *
                </label>
                <input
                  type="email"
                  value={newItem.sellerEmail}
                  onChange={(e) => setNewItem(prev => ({ ...prev, sellerEmail: e.target.value }))}
                  placeholder="your@email.com"
                  className="facebook-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newItem.location}
                  onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, State"
                  className="facebook-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  className="facebook-input"
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Books">Books</option>
                  <option value="Sports">Sports</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Home & Garden">Home & Garden</option>
                  <option value="Toys & Games">Toys & Games</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  value={newItem.condition}
                  onChange={(e) => setNewItem(prev => ({ ...prev, condition: e.target.value }))}
                  className="facebook-input"
                >
                  <option value="">Select Condition</option>
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="facebook-input"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="facebook-button"
                >
                  {uploading ? 'Posting...' : 'Post Item'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPostForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Items Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'All Items'} ({items.length})
          </h2>
          
          {items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                  {/* Item Image */}
                  <div className="aspect-square bg-gray-200">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Item Details */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-2xl font-bold text-green-600 mb-2">
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex gap-2 mb-2">
                      {item.category && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {item.category}
                        </span>
                      )}
                      {item.condition && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {item.condition}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        <div>Posted by {item.seller_id}</div>
                        {item.location && (
                          <div>📍 {item.location}</div>
                        )}
                      </div>
                      <button
                        onClick={() => handleMessageSeller(item)}
                        className="facebook-button text-sm cursor-pointer"
                      >
                        Message Seller
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No items found' : 'No items yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Be the first to post an item!'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowPostForm(true)}
                  className="facebook-button cursor-pointer"
                >
                  Post First Item
                </button>
              )}
            </div>
          )}
        </div>
            </div>
          </div>
        </div>
      </div>
   
  )
} 