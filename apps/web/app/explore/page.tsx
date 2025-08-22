'use client'
import React, { useState, useRef, useEffect } from 'react'

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState('for-you')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Traveler modal states
  const [showTravelerModal, setShowTravelerModal] = useState(false)
  const [activeTravelerTab, setActiveTravelerTab] = useState('account')
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [isUploadingProfile, setIsUploadingProfile] = useState(false)
  const [userName, setUserName] = useState('Alex')
  const [travelerSettings, setTravelerSettings] = useState({
    email: 'alex@example.com',
    notifications: true,
    language: 'English (US)',
    theme: 'light'
  })
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackType, setFeedbackType] = useState('General Feedback')
  const profilePictureRef = useRef<HTMLInputElement>(null)

  const tabs = [
    { id: 'for-you', label: 'For you' },
    { id: 'locations', label: 'Locations' },
    { id: 'restaurants', label: 'Restaurants' },
    { id: 'bars', label: 'Bars' },
    { id: 'activities', label: 'Activities' }
  ]

  const locations = [
    {
      id: 1,
      name: '15th Arrondissement',
      location: 'Paris, Ile-De-France, France',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
      rating: 4.8,
      reviews: 1247,
      price: '$$',
      category: 'District'
    },
    {
      id: 2,
      name: 'Paris',
      location: 'Ile-De-France, France',
      image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=300&fit=crop',
      rating: 4.9,
      reviews: 8923,
      price: '$$$',
      category: 'City'
    },
    {
      id: 3,
      name: 'Montmartre',
      location: 'Paris, Ile-De-France, France',
      image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&h=300&fit=crop',
      rating: 4.7,
      reviews: 2156,
      price: '$$',
      category: 'District'
    },
    {
      id: 4,
      name: 'Le Marais',
      location: 'Paris, Ile-De-France, France',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      rating: 4.6,
      reviews: 1893,
      price: '$$$',
      category: 'District'
    },
    {
      id: 5,
      name: 'Latin Quarter',
      location: 'Paris, Ile-De-France, France',
      image: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=400&h=300&fit=crop',
      rating: 4.5,
      reviews: 1678,
      price: '$$',
      category: 'District'
    },
    {
      id: 6,
      name: 'Champs-Élysées',
      location: 'Paris, Ile-De-France, France',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
      rating: 4.4,
      reviews: 2341,
      price: '$$$',
      category: 'Avenue'
    }
  ]

  const mapPOIs = [
    // Restaurants
    { name: 'Brach Paris Restaurant', type: 'restaurant', price: '$$$', rating: 9, googleMapsUrl: 'https://maps.google.com/?q=Brach+Paris+Restaurant' },
    { name: 'Les Ombres', type: 'restaurant', price: '$$$', rating: 9, googleMapsUrl: 'https://maps.google.com/?q=Les+Ombres+Paris' },
    { name: 'L\'Ami Jean', type: 'restaurant', price: '$$$', rating: 9, googleMapsUrl: 'https://maps.google.com/?q=LAmi+Jean+Paris' },
    { name: 'Le CasseNoix', type: 'restaurant', price: '$$', rating: 9, googleMapsUrl: 'https://maps.google.com/?q=Le+CasseNoix+Paris' },
    { name: 'Fratelli Castellano', type: 'restaurant', price: '$$', rating: 9, googleMapsUrl: 'https://maps.google.com/?q=Fratelli+Castellano+Paris' },
    { name: 'L\'Antre Amis', type: 'restaurant', price: '$$', rating: 9, googleMapsUrl: 'https://maps.google.com/?q=LAntre+Amis+Paris' },
    { name: 'MELT Cambronne', type: 'restaurant', price: '$$', rating: 9, googleMapsUrl: 'https://maps.google.com/?q=MELT+Cambronne+Paris' },
    
    // Bars
    { name: 'Le Baron', type: 'bar', price: '$$$', rating: 8, googleMapsUrl: 'https://maps.google.com/?q=Le+Baron+Paris' },
    { name: 'Experimental Cocktail Club', type: 'bar', price: '$$$', rating: 8, googleMapsUrl: 'https://maps.google.com/?q=Experimental+Cocktail+Club+Paris' },
    { name: 'Harry\'s New York Bar', type: 'bar', price: '$$', rating: 7, googleMapsUrl: 'https://maps.google.com/?q=Harrys+New+York+Bar+Paris' },
    { name: 'Le Comptoir Général', type: 'bar', price: '$$', rating: 8, googleMapsUrl: 'https://maps.google.com/?q=Le+Comptoir+Général+Paris' },
    { name: 'Café de la Paix', type: 'bar', price: '$$$', rating: 8, googleMapsUrl: 'https://maps.google.com/?q=Café+de+la+Paix+Paris' },
    
    // Activities
    { name: 'Eiffel Tower', type: 'activity', price: '$$', rating: 9, googleMapsUrl: 'https://maps.google.com/?q=Eiffel+Tower+Paris' },
    { name: 'Louvre Museum', type: 'activity', price: '$$', rating: 9, googleMapsUrl: 'https://maps.google.com/?q=Louvre+Museum+Paris' },
    { name: 'Arc de Triomphe', type: 'activity', price: '$', rating: 8, googleMapsUrl: 'https://maps.google.com/?q=Arc+de+Triomphe+Paris' },
    { name: 'Notre-Dame Cathedral', type: 'activity', price: '$', rating: 9, googleMapsUrl: 'https://maps.google.com/?q=Notre+Dame+Cathedral+Paris' },
    { name: 'Champs-Élysées Walk', type: 'activity', price: '$', rating: 8, googleMapsUrl: 'https://maps.google.com/?q=Champs+Élysées+Paris' },
    { name: 'Montmartre Walking Tour', type: 'activity', price: '$$', rating: 9, googleMapsUrl: 'https://maps.google.com/?q=Montmartre+Paris' },
    { name: 'Seine River Cruise', type: 'activity', price: '$$$', rating: 8, googleMapsUrl: 'https://maps.google.com/?q=Seine+River+Cruise+Paris' },
    { name: 'Luxembourg Gardens', type: 'activity', price: '$', rating: 8, googleMapsUrl: 'https://maps.google.com/?q=Luxembourg+Gardens+Paris' }
  ]

  // Traveler tabs definition
  const travelerTabs = [
    { id: 'account', label: 'Account Settings', icon: '⚙️' },
    { id: 'feedback', label: 'Feedback', icon: '💬' },
    { id: 'privacy', label: 'Privacy Policy', icon: '🔒' },
    { id: 'terms', label: 'Terms of Service', icon: '📄' }
  ]

  // Profile picture upload handler
  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      setIsUploadingProfile(true)
      
      // Simulate upload delay
      setTimeout(() => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setProfilePicture(e.target?.result as string)
          setIsUploadingProfile(false)
        }
        reader.readAsDataURL(file)
      }, 1500)
    }
  }

  // Remove profile picture
  const removeProfilePicture = () => {
    setProfilePicture(null)
    if (profilePictureRef.current) {
      profilePictureRef.current.value = ''
    }
  }

  // Filter POIs based on selected category
  const filteredPOIs = selectedCategory === 'all' 
    ? mapPOIs 
    : mapPOIs.filter(poi => poi.type === selectedCategory)

  // Handle POI click to open Google Maps
  const handlePOIClick = (poiName: string, googleMapsUrl: string) => {
    // Show a brief notification
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
    notification.textContent = `Opening ${poiName} in Google Maps...`
    document.body.appendChild(notification)
    
    // Remove notification after 2 seconds
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 2000)
    
    // Open Google Maps
    window.open(googleMapsUrl, '_blank')
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#fffbea] via-[#fff8e1] to-[#fffde7]">
      {/* Top Navigation Header */}
      <div className="bg-white/80 backdrop-blur border-b border-amber-200/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="size-8 rounded-xl bg-yellow-400 text-slate-900 grid place-items-center font-black">TW</div>
              <span className="font-semibold">TripWeaver</span>
            </a>
            <div className="h-6 w-px bg-amber-200/50"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Explore Destinations</span>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Active</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <a href="/workspace">
              <button className="px-3 py-1.5 text-xs bg-amber-50 text-amber-700 rounded-lg ring-1 ring-amber-200 hover:bg-amber-100 transition">
                ← Back to Workspace
              </button>
            </a>
            <button className="p-2 text-slate-600 hover:bg-amber-50 rounded-lg transition">📤</button>
            <button className="p-2 text-slate-600 hover:bg-amber-50 rounded-lg transition">⚙️</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur border-r border-amber-200/50 flex flex-col">

          {/* Navigation */}
          <div className="flex-1 p-4 space-y-1">
            <a href="/workspace" className="block">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition">
                <span className="text-sm text-slate-700">💬 Chats</span>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">2</span>
              </div>
            </a>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 text-white cursor-pointer transition">
              <span className="text-sm">🔍 Explore</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition">
              <span className="text-sm text-slate-700">❤️ Saved</span>
            </div>
            <a href="/trips" className="block">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition">
                <span className="text-sm text-slate-700">💼 Trips</span>
              </div>
            </a>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition">
              <span className="text-sm text-slate-700">🔔 Updates</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition">
              <span className="text-sm text-slate-700">✈️ Inspiration</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition">
              <span className="text-sm text-slate-700">➕ Create</span>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-4 border-t border-amber-200/50">
            <a href="/workspace">
              <button className="w-full px-3 py-2 rounded-xl text-sm font-semibold transition active:scale-[.99] text-slate-900 shadow-sm ring-1 ring-black/5"
                style={{ background: 'linear-gradient(90deg,#fde047,#fbbf24,#f59e0b)' }}>
                ➕ New chat
              </button>
            </a>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-amber-200/50 space-y-3">
            <button 
              onClick={() => setShowTravelerModal(true)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition"
            >
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-200"
                />
              ) : (
                <div className="w-6 h-6 bg-amber-100 rounded-full ring-1 ring-amber-200 flex items-center justify-center">
                  <span className="text-amber-700 text-xs font-medium">{userName.charAt(0)}</span>
                </div>
              )}
              <span className="text-sm text-slate-700">Traveler</span>
            </button>
            <div className="text-xs text-slate-500 space-y-1">
              <div>Company Contact Help</div>
              <div>Terms Privacy</div>
              <div>© 2025 TripWeaver, Inc.</div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-amber-200/50 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900">Map area</h1>
                <button className="text-slate-400 hover:text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-amber-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white/80 backdrop-blur"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-amber-200/50 rounded-xl hover:bg-amber-50/50 transition flex items-center gap-2 bg-white/80 backdrop-blur"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-amber-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white/80 backdrop-blur"
              >
                <option value="all">All Categories</option>
                <option value="restaurant">🍽️ Restaurants</option>
                <option value="bar">🍷 Bars</option>
                <option value="activity">🎯 Activities</option>
              </select>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mt-4">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    // Map tab IDs to category filters
                    const categoryMap: { [key: string]: string } = {
                      'for-you': 'all',
                      'locations': 'all',
                      'restaurants': 'restaurant',
                      'bars': 'bar',
                      'activities': 'activity'
                    }
                    setSelectedCategory(categoryMap[tab.id] || 'all')
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-amber-50/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Grid */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Content Panel */}
            <div className="w-1/2 p-6 overflow-y-auto">
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-900">Locations</h2>
                
                <div className="grid gap-4">
                  {locations.map(location => (
                    <div key={location.id} className="bg-white/80 backdrop-blur border border-amber-200/50 rounded-xl overflow-hidden hover:shadow-lg transition">
                      <div className="relative">
                        <img
                          src={location.image}
                          alt={location.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <button className="p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition">
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          <button className="p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition">
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <div className="absolute bottom-3 left-3 flex space-x-1">
                          {[1, 2, 3, 4, 5].map((dot, index) => (
                            <div
                              key={dot}
                              className={`w-2 h-2 rounded-full ${
                                index === 0 ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-slate-900">{location.name}</h3>
                            <p className="text-sm text-slate-600">{location.location}</p>
                          </div>
                          <span className="text-sm font-medium text-slate-900">{location.price}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-sm font-medium text-slate-900 ml-1">{location.rating}</span>
                            </div>
                            <span className="text-sm text-slate-500">({location.reviews})</span>
                          </div>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            {location.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Map Panel */}
            <div className="w-1/2 bg-gradient-to-br from-blue-50 to-indigo-100 relative">
              {/* Map Controls */}
              <div className="absolute top-4 left-4 z-10">
                <a href="/workspace">
                  <button className="p-2 bg-white/90 backdrop-blur rounded-xl shadow-sm hover:bg-white transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </a>
              </div>
              
              <div className="absolute top-4 right-4 z-10">
                <button className="p-2 bg-white/90 backdrop-blur rounded-xl shadow-sm hover:bg-white transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              
              {/* Map Content */}
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 relative">
                {/* Map Placeholder */}
                <div className="absolute inset-0 bg-blue-200/20"></div>
                
                {/* POI Markers */}
                {filteredPOIs.map((poi, index) => (
                  <div
                    key={index}
                    className="absolute bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm text-xs cursor-pointer hover:bg-white hover:shadow-md transition-all duration-200"
                    style={{
                      top: `${20 + (index * 8) % 60}%`,
                      left: `${30 + (index * 12) % 50}%`
                    }}
                    onClick={() => handlePOIClick(poi.name, poi.googleMapsUrl)}
                    title={`Click to open ${poi.name} in Google Maps`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {poi.type === 'restaurant' && '🍽️'}
                      {poi.type === 'bar' && '🍷'}
                      {poi.type === 'activity' && '🎯'}
                      <span className="font-medium">{poi.name}</span>
                      <span className="text-slate-500">({poi.price})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-slate-600">{poi.rating}</span>
                      <span className="text-blue-500 text-xs ml-1">📍</span>
                    </div>
                  </div>
                ))}

                {/* District Labels */}
                <div className="absolute top-20 left-20 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs font-medium">
                  16TH ARR.
                </div>
                <div className="absolute top-40 right-20 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs font-medium">
                  15TH ARR.
                </div>

                {/* Street Names */}
                <div className="absolute top-60 left-10 bg-white/60 backdrop-blur px-2 py-1 rounded text-xs">
                  Bd Lannes
                </div>
                <div className="absolute top-80 left-30 bg-white/60 backdrop-blur px-2 py-1 rounded text-xs">
                  Av. Mozart
                </div>
                <div className="absolute bottom-40 left-20 bg-white/60 backdrop-blur px-2 py-1 rounded text-xs">
                  Av. Emile Zola
                </div>
                <div className="absolute bottom-60 right-30 bg-white/60 backdrop-blur px-2 py-1 rounded text-xs">
                  Rue de Sèvres
                </div>

                {/* Zoom Controls */}
                <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
                  <button className="p-2 w-8 h-8 bg-white/90 backdrop-blur rounded-xl shadow-sm hover:bg-white transition">
                    <span className="text-sm font-bold">+</span>
                  </button>
                  <button className="p-2 w-8 h-8 bg-white/90 backdrop-blur rounded-xl shadow-sm hover:bg-white transition">
                    <span className="text-sm font-bold">-</span>
                  </button>
                </div>

                {/* Map Attribution */}
                <div className="absolute bottom-2 left-2 text-xs text-slate-500">
                  <div>Keyboard shortcuts</div>
                  <div>Map Data ©2025 Google</div>
                  <div>500 m</div>
                  <div>Terms Report a map error</div>
                  <div className="text-blue-500 font-medium">Click any marker to open in Google Maps</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Traveler Modal */}
      {showTravelerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-amber-200/50">
              <div className="flex items-center gap-3">
                {profilePicture ? (
                  <img 
                    src={profilePicture} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-amber-200"
                  />
                ) : (
                  <div className="w-10 h-10 bg-amber-100 rounded-full ring-1 ring-amber-200 flex items-center justify-center">
                    <span className="text-amber-700 font-medium">{userName.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{userName}</h2>
                  <p className="text-sm text-slate-600">Traveler Account</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTravelerModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-amber-200/50">
              {travelerTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTravelerTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition flex items-center justify-center gap-2 ${
                    activeTravelerTab === tab.id
                      ? 'text-amber-700 border-b-2 border-amber-500 bg-amber-50/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTravelerTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Settings</h3>
                    
                    {/* Profile Picture Section */}
                    <div className="mb-6 p-6 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {profilePicture ? (
                            <img 
                              src={profilePicture} 
                              alt="Profile" 
                              className="w-20 h-20 rounded-full object-cover ring-2 ring-amber-200"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-amber-100 rounded-full ring-2 ring-amber-200 flex items-center justify-center">
                              <span className="text-amber-700 font-bold text-2xl">{userName.charAt(0)}</span>
                            </div>
                          )}
                          {isUploadingProfile && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 mb-2">Profile Picture</h4>
                          <p className="text-sm text-slate-600 mb-3">
                            Upload a photo to personalize your profile. We recommend a square image (1:1 ratio) for best results.
                          </p>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => profilePictureRef.current?.click()}
                              disabled={isUploadingProfile}
                              className="px-4 py-2 text-sm bg-amber-50 text-amber-700 rounded-lg ring-1 ring-amber-200 hover:bg-amber-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isUploadingProfile ? 'Uploading...' : '📷 Upload Photo'}
                            </button>
                            {profilePicture && (
                              <button 
                                onClick={removeProfilePicture}
                                disabled={isUploadingProfile}
                                className="px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg ring-1 ring-red-200 hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                🗑️ Remove
                              </button>
                            )}
                          </div>
                          <input
                            ref={profilePictureRef}
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">Email Address</p>
                          <p className="text-sm text-slate-600">{travelerSettings.email}</p>
                        </div>
                        <button 
                          onClick={() => {
                            const newEmail = prompt('Enter new email address:', travelerSettings.email)
                            if (newEmail && newEmail !== travelerSettings.email) {
                              setTravelerSettings({...travelerSettings, email: newEmail})
                            }
                          }}
                          className="px-3 py-1.5 text-sm bg-amber-50 text-amber-700 rounded-lg ring-1 ring-amber-200 hover:bg-amber-100 transition"
                        >
                          Edit
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">Password</p>
                          <p className="text-sm text-slate-600">Last changed 30 days ago</p>
                        </div>
                        <button className="px-3 py-1.5 text-sm bg-amber-50 text-amber-700 rounded-lg ring-1 ring-amber-200 hover:bg-amber-100 transition">
                          Change
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">Notifications</p>
                          <p className="text-sm text-slate-600">
                            {travelerSettings.notifications ? 'Email and push notifications enabled' : 'Notifications disabled'}
                          </p>
                        </div>
                        <button 
                          onClick={() => setTravelerSettings({...travelerSettings, notifications: !travelerSettings.notifications})}
                          className={`px-3 py-1.5 text-sm rounded-lg ring-1 transition ${
                            travelerSettings.notifications 
                              ? 'bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100' 
                              : 'bg-slate-50 text-slate-700 ring-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {travelerSettings.notifications ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">Language</p>
                          <p className="text-sm text-slate-600">{travelerSettings.language}</p>
                        </div>
                        <button 
                          onClick={() => {
                            const languages = ['English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Italian']
                            const currentIndex = languages.indexOf(travelerSettings.language)
                            const nextIndex = (currentIndex + 1) % languages.length
                            setTravelerSettings({...travelerSettings, language: languages[nextIndex]})
                          }}
                          className="px-3 py-1.5 text-sm bg-amber-50 text-amber-700 rounded-lg ring-1 ring-amber-200 hover:bg-amber-100 transition"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTravelerTab === 'feedback' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Feedback</h3>
                    <p className="text-slate-600 mb-6">We'd love to hear your thoughts about TripWeaver! Your feedback helps us improve and create better experiences for all travelers.</p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Feedback Type</label>
                        <select 
                          value={feedbackType}
                          onChange={(e) => setFeedbackType(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                        >
                          <option>General Feedback</option>
                          <option>Bug Report</option>
                          <option>Feature Request</option>
                          <option>Praise</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Your Message</label>
                        <textarea 
                          rows={6}
                          placeholder="Tell us what you think..."
                          value={feedbackMessage}
                          onChange={(e) => setFeedbackMessage(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-none"
                        ></textarea>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="contact" className="rounded border-amber-200/50" />
                        <label htmlFor="contact" className="text-sm text-slate-700">
                          I'd like to be contacted about this feedback
                        </label>
                      </div>
                      
                      <button 
                        onClick={() => {
                          if (feedbackMessage.trim()) {
                            alert('Thank you for your feedback! We appreciate your input.')
                            setFeedbackMessage('')
                            setFeedbackType('General Feedback')
                          } else {
                            alert('Please enter your feedback message.')
                          }
                        }}
                        className="w-full px-6 py-3 rounded-xl text-white font-medium transition active:scale-[.99] shadow-sm ring-1 ring-black/5"
                        style={{ background: 'linear-gradient(90deg,#fde047,#fbbf24,#f59e0b)' }}
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTravelerTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Privacy Policy</h3>
                    <div className="prose prose-sm max-w-none text-slate-700 space-y-4">
                      <p><strong>Last updated:</strong> January 15, 2025</p>
                      
                      <h4 className="font-semibold text-slate-900">Information We Collect</h4>
                      <p>We collect information you provide directly to us, such as when you create an account, plan trips, or contact us for support. This may include:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Name, email address, and contact information</li>
                        <li>Trip preferences and travel history</li>
                        <li>Payment information (processed securely by third-party providers)</li>
                        <li>Communications with our support team</li>
                      </ul>
                      
                      <h4 className="font-semibold text-slate-900">How We Use Your Information</h4>
                      <p>We use the information we collect to:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Personalize your travel planning experience</li>
                        <li>Process transactions and send related information</li>
                        <li>Send technical notices and support messages</li>
                        <li>Respond to your comments and questions</li>
                      </ul>
                      
                      <h4 className="font-semibold text-slate-900">Information Sharing</h4>
                      <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
                      
                      <h4 className="font-semibold text-slate-900">Data Security</h4>
                      <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                      
                      <h4 className="font-semibold text-slate-900">Your Rights</h4>
                      <p>You have the right to access, update, or delete your personal information. You can manage your account settings or contact us directly.</p>
                      
                      <h4 className="font-semibold text-slate-900">Contact Us</h4>
                      <p>If you have questions about this Privacy Policy, please contact us at privacy@tripweaver.com</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTravelerTab === 'terms' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Terms of Service</h3>
                    <div className="prose prose-sm max-w-none text-slate-700 space-y-4">
                      <p><strong>Last updated:</strong> January 15, 2025</p>
                      
                      <h4 className="font-semibold text-slate-900">Acceptance of Terms</h4>
                      <p>By accessing and using TripWeaver, you accept and agree to be bound by the terms and provision of this agreement.</p>
                      
                      <h4 className="font-semibold text-slate-900">Description of Service</h4>
                      <p>TripWeaver provides AI-powered travel planning services, including itinerary creation, booking assistance, and travel recommendations.</p>
                      
                      <h4 className="font-semibold text-slate-900">User Obligations</h4>
                      <p>Users are responsible for:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Providing accurate information</li>
                        <li>Maintaining account security</li>
                        <li>Complying with applicable laws</li>
                        <li>Respecting intellectual property rights</li>
                      </ul>
                      
                      <h4 className="font-semibold text-slate-900">Service Availability</h4>
                      <p>We strive to maintain service availability but do not guarantee uninterrupted access. Services may be temporarily unavailable for maintenance or updates.</p>
                      
                      <h4 className="font-semibold text-slate-900">Limitation of Liability</h4>
                      <p>TripWeaver shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p>
                      
                      <h4 className="font-semibold text-slate-900">Modifications</h4>
                      <p>We reserve the right to modify these terms at any time. Users will be notified of significant changes via email or service notifications.</p>
                      
                      <h4 className="font-semibold text-slate-900">Contact Information</h4>
                      <p>For questions about these Terms of Service, contact us at legal@tripweaver.com</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


