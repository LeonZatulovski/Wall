'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ProfileEdit() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('user')
  
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [userImages, setUserImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      router.push('/')
      return
    }
    loadUserImages()
  }, [userId, router])

  const loadUserImages = async () => {
    try {
      // Load profile image
      const { data: profileData } = await supabase.storage
        .from('profile-images')
        .list(`${userId}/`, {
          limit: 1,
          offset: 0,
        })

      if (profileData && profileData.length > 0) {
        const { data: urlData } = supabase.storage
          .from('profile-images')
          .getPublicUrl(`${userId}/profile.jpg`)
        setProfileImage(urlData.publicUrl)
      }

      // Load user images
      const { data: imagesData } = await supabase.storage
        .from('user-images')
        .list(`${userId}/`, {
          limit: 100,
          offset: 0,
        })

      if (imagesData) {
        const imageUrls = await Promise.all(
          imagesData.map(async (file) => {
            const { data } = supabase.storage
              .from('user-images')
              .getPublicUrl(`${userId}/${file.name}`)
            return data.publicUrl
          })
        )
        setUserImages(imageUrls)
      }
    } catch (error) {
      console.error('Error loading images:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadProfileImage = async (file: File) => {
    if (!userId) return

    setUploading(true)
    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop()
      const fileName = `profile.${fileExt}`

      console.log('Attempting to upload profile image:', fileName)

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(`${userId}/${fileName}`, file, {
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error details:', uploadError)
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(`${userId}/${fileName}`)

      setProfileImage(urlData.publicUrl)
      alert('Profile image updated successfully!')
    } catch (error) {
      console.error('Error uploading profile image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('row-level security')) {
        alert('Storage security error. Please check Supabase storage settings and disable RLS.')
      } else {
        alert(`Failed to upload profile image: ${errorMessage}`)
      }
    } finally {
      setUploading(false)
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

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadProfileImage(file)
    }
  }

  const handleUserImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <div className="text-lg">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--color-facebook-gray)'}}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold" style={{color: 'var(--color-facebook-blue)'}}>
              Edit Profile
            </h1>
            <button
              onClick={handleBackToWall}
              className="facebook-button cursor-pointer"
            >
              Back to Wall
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
          
          {/* Profile Image Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Profile Picture</h3>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full profile-image flex items-center justify-center text-white text-2xl font-bold">
                    {userId?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <label className="facebook-button cursor-pointer">
                  {uploading ? 'Uploading...' : 'Change Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* User Images Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Your Photos</h3>
            <div className="mb-4">
              <label className="facebook-button cursor-pointer">
                {uploading ? 'Uploading...' : 'Upload New Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUserImageChange}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            
            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userImages.map((imageUrl, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                  <img 
                    src={imageUrl} 
                    alt={`User image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {userImages.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No photos uploaded yet. Upload your first photo!
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-4">Account Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={userId || ''}
                  disabled
                  className="facebook-input bg-gray-50"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Username cannot be changed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 