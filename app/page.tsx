'use client'

import { useState, useEffect } from 'react'
import PostForm from '@/components/PostForm'
import PostFeed from '@/components/PostFeed'
import SupabaseTest from '@/components/SupabaseTest'
import { supabase } from '@/lib/supabase'

interface UserInfo {
  birthdate: string | null
  location: string | null
  networks: string | null
}

export default function Home() {
  const [userId, setUserId] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showUserInfoForm, setShowUserInfoForm] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [imageVersion, setImageVersion] = useState(0) // For cache busting
  const [userInfo, setUserInfo] = useState<UserInfo>({
    birthdate: null,
    location: null,
    networks: null
  })
  
  // Check for user parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const userParam = urlParams.get('user')
    if (userParam) {
      setUserId(userParam)
      checkUserInfo(userParam)
    }
  }, [])
  
  // Load profile image when userId changes
  useEffect(() => {
    if (userId && isLoggedIn) {
      loadProfileImage()
    }
  }, [userId, isLoggedIn])

  // Listen for focus events to refresh profile image when returning from profile page
  useEffect(() => {
    const handleFocus = () => {
      if (userId && isLoggedIn) {
        // Force refresh by incrementing version
        setImageVersion(prev => prev + 1)
        loadProfileImage()
      }
    }

    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [userId, isLoggedIn])

  const checkUserInfo = async (username: string) => {
    try {
      const { data, error } = await supabase
        .from('user_info')
        .select('*')
        .eq('user_id', username)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking user info:', error)
      }

      if (data) {
        setUserInfo({
          birthdate: data.birthdate,
          location: data.location,
          networks: data.networks
        })
        setIsLoggedIn(true)
      } else {
        setShowUserInfoForm(true)
      }
    } catch (error) {
      console.error('Error checking user info:', error)
      setShowUserInfoForm(true)
    }
  }

  const loadProfileImage = async () => {
    if (!userId) return

    setLoading(true)
    try {
      // Check if profile image exists - look for any file in the user's folder
      const { data: profileData, error } = await supabase.storage
        .from('profile-images')
        .list(`${userId}/`, {
          limit: 100,
          offset: 0,
        })

      console.log('Profile data:', profileData, 'Error:', error)
      console.log('User ID:', userId)

      if (profileData && profileData.length > 0) {
        console.log('All files found:', profileData.map(f => f.name))
        
        // Find the profile image file (could be profile.jpg, profile.png, etc.)
        const profileFile = profileData.find(file => 
          file.name.startsWith('profile.') || 
          file.name.includes('profile')
        )
        
        console.log('Profile file found:', profileFile)
        
        if (profileFile) {
          // Get the public URL for the profile image with cache busting
          const { data: urlData } = supabase.storage
            .from('profile-images')
            .getPublicUrl(`${userId}/${profileFile.name}`)
          
          console.log('URL data:', urlData)
          
          // Add cache busting parameter
          const imageUrl = `${urlData.publicUrl}?v=${imageVersion}&t=${Date.now()}`
          console.log('Setting profile image URL:', imageUrl)
          setProfileImage(imageUrl)
        } else {
          // If no profile file found, try the first file in the folder
          console.log('No profile file found, trying first file:', profileData[0])
          const firstFile = profileData[0]
          
          const { data: urlData } = supabase.storage
            .from('profile-images')
            .getPublicUrl(`${userId}/${firstFile.name}`)
          
          console.log('First file URL data:', urlData)
          
          const imageUrl = `${urlData.publicUrl}?v=${imageVersion}&t=${Date.now()}`
          console.log('Setting first file as profile image URL:', imageUrl)
          setProfileImage(imageUrl)
        }
      } else {
        console.log('No files found for user:', userId)
        setProfileImage(null)
      }
    } catch (error) {
      console.error('Error loading profile image:', error)
      setProfileImage(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (userId.trim()) {
      checkUserInfo(userId.trim())
    }
  }

  const handleUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('user_info')
        .insert({
          user_id: userId,
          birthdate: userInfo.birthdate || null,
          location: userInfo.location || null,
          networks: userInfo.networks || null
        })

      if (error) {
        console.error('Error saving user info:', error)
        alert('Error saving information. Please try again.')
        return
      }

      setShowUserInfoForm(false)
      setIsLoggedIn(true)
    } catch (error) {
      console.error('Error saving user info:', error)
      alert('Error saving information. Please try again.')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserId('')
    setProfileImage(null)
    setImageVersion(0)
    setUserInfo({ birthdate: null, location: null, networks: null })
    setShowUserInfoForm(false)
  }

  if (!isLoggedIn && !showUserInfoForm) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--color-facebook-gray)'}}>
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--color-facebook-blue)'}}>
              Facebook Wall 2008
            </h1>
            <p style={{color: 'var(--color-facebook-darkgray)'}}>
              Share what's on your mind with friends
            </p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your name
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Your name"
                className="facebook-input"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={!userId.trim()}
              className="facebook-button w-full"
            >
              Enter Wall
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (showUserInfoForm) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--color-facebook-gray)'}}>
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{color: 'var(--color-facebook-blue)'}}>
              Welcome, {userId}!
            </h1>
            <p style={{color: 'var(--color-facebook-darkgray)'}}>
              Tell us a bit about yourself (optional)
            </p>
          </div>
          
          <form onSubmit={handleUserInfoSubmit}>
            <div className="mb-4">
              <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-2">
                Birthdate
              </label>
              <input
                type="date"
                id="birthdate"
                value={userInfo.birthdate || ''}
                onChange={(e) => setUserInfo(prev => ({ ...prev, birthdate: e.target.value }))}
                className="facebook-input"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={userInfo.location || ''}
                onChange={(e) => setUserInfo(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, State"
                className="facebook-input"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="networks" className="block text-sm font-medium text-gray-700 mb-2">
                Networks
              </label>
              <input
                type="text"
                id="networks"
                value={userInfo.networks || ''}
                onChange={(e) => setUserInfo(prev => ({ ...prev, networks: e.target.value }))}
                placeholder="School, Company, etc."
                className="facebook-input"
              />
            </div>
            
            <button
              type="submit"
              className="facebook-button w-full"
            >
              Continue to Wall
            </button>
          </form>
        </div>
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
              Facebook Wall 2008
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = `/marketplace?user=${userId}`}
                className="font-medium cursor-pointer hover:opacity-80 transition-opacity"
                style={{color: 'var(--color-facebook-blue)'}}
              >
                Marketplace
              </button>
              <button
                onClick={() => window.location.href = `/messages?user=${userId}`}
                className="font-medium cursor-pointer hover:opacity-80 transition-opacity"
                style={{color: 'var(--color-facebook-blue)'}}
              >
                Messages
              </button>
              <span style={{color: 'var(--color-facebook-darkgray)'}}>
                Welcome, {userId}!
              </span>
              <button
                onClick={handleLogout}
                className="font-medium cursor-pointer hover:opacity-80 transition-opacity"
                style={{color: 'var(--color-facebook-blue)'}}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - User Profile */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-8">
              {/* User Name */}
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {userId}
                </h2>
                <p className="text-sm text-gray-500">Online</p>
              </div>
              
              {/* Profile Image */}
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', profileImage)
                      setProfileImage(null)
                    }}
                    key={imageVersion} // Force re-render when version changes
                  />
                ) : (
                  <div className="w-full h-full profile-image flex items-center justify-center text-white text-4xl font-bold">
                    {userId.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Information Section */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Information</h3>
                <div className="space-y-2 text-sm">
                  {userInfo.birthdate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Birthday</span>
                      <span className="font-medium text-end">{new Date(userInfo.birthdate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {userInfo.location && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location</span>
                      <span className="font-medium text-end">{userInfo.location}</span>
                    </div>
                  )}
                  {userInfo.networks && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Networks</span>
                      <span className="font-medium text-end">{userInfo.networks}</span>
                    </div>
                  )}
                  {!userInfo.birthdate && !userInfo.location && !userInfo.networks && (
                    <div className="text-gray-500 text-center py-2">
                      No information added
                    </div>
                  )}
                </div>
              </div>
              
              {/* User Stats */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Posts</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Friends</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Photos</span>
                  <span className="font-semibold">0</span>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <button 
                  onClick={() => window.location.href = `/profile?user=${userId}`}
                  className="w-full facebook-button mb-2"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => window.location.href = `/photos?user=${userId}`}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  View Photos
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - Wall */}
          <div className="flex-1">
            <PostForm 
              userId={userId} 
              onPostCreated={() => {
                // The PostFeed will automatically update via real-time subscription
              }} 
            />
            <PostFeed />
          </div>
        </div>
      </div>
    </div>
  )
} 