'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PhotosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('user')
  
  const [userImages, setUserImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!userId) {
      router.push('/')
      return
    }
    loadUserImages()
  }, [userId, router])

  const loadUserImages = async () => {
    try {
      setLoading(true)
      
      // Load user images from storage
      const { data: imagesData, error } = await supabase.storage
        .from('user-images')
        .list(`${userId}/`, {
          limit: 100,
          offset: 0,
        })

      console.log('Images data:', imagesData, 'Error:', error)

      if (imagesData && imagesData.length > 0) {
        const imageUrls = await Promise.all(
          imagesData.map(async (file) => {
            const { data } = supabase.storage
              .from('user-images')
              .getPublicUrl(`${userId}/${file.name}`)
            return data.publicUrl
          })
        )
        setUserImages(imageUrls)
      } else {
        setUserImages([])
      }
    } catch (error) {
      console.error('Error loading images:', error)
      setUserImages([])
    } finally {
      setLoading(false)
    }
  }

  const uploadUserImage = async (file: File) => {
    if (!userId) return

    setUploading(true)
    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      console.log('Attempting to upload user image:', fileName)

      const { error: uploadError } = await supabase.storage
        .from('user-images')
        .upload(`${userId}/${fileName}`, file)

      if (uploadError) {
        console.error('Upload error details:', uploadError)
        throw uploadError
      }

      // Get public URL and add to list
      const { data: urlData } = supabase.storage
        .from('user-images')
        .getPublicUrl(`${userId}/${fileName}`)

      setUserImages(prev => [urlData.publicUrl, ...prev])
      alert('Image uploaded successfully!')
    } catch (error) {
      console.error('Error uploading image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('row-level security')) {
        alert('Storage security error. Please check Supabase storage settings and disable RLS.')
      } else {
        alert(`Failed to upload image: ${errorMessage}`)
      }
    } finally {
      setUploading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadUserImage(file)
    }
  }

  const handleBackToWall = () => {
    router.push(`/?user=${userId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--color-facebook-gray)'}}>
        <div className="text-lg">Loading photos...</div>
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
              {userId}'s Photos
            </h1>
            <button
              onClick={handleBackToWall}
              className="facebook-button"
            >
              Back to Wall
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Upload Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Upload New Photo</h2>
            <div className="flex items-center space-x-4">
              <label className="facebook-button cursor-pointer">
                {uploading ? 'Uploading...' : 'Choose Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <span className="text-sm text-gray-500">
                JPG, PNG or GIF. Max size 5MB.
              </span>
            </div>
          </div>

          {/* Photos Grid */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              All Photos ({userImages.length})
            </h2>
            
            {userImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {userImages.map((imageUrl, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <img 
                      src={imageUrl} 
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', imageUrl)
                        // Remove failed image from the list
                        setUserImages(prev => prev.filter((_, i) => i !== index))
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
                <p className="text-gray-500 mb-4">
                  Upload your first photo to get started!
                </p>
                <label className="facebook-button cursor-pointer inline-block">
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Photo Gallery</h3>
                <p className="text-sm text-gray-500">
                  All photos uploaded by {userId}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {userImages.length} photo{userImages.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 