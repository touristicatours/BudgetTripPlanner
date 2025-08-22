'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Plane, 
  Hotel, 
  MapPin, 
  Star,
  Calendar,
  Users,
  ArrowRight,
  Heart
} from 'lucide-react'
import { OfferCard } from '@/components/OfferCard'

interface Offer {
  id: string
  type: 'flight' | 'hotel' | 'activity'
  title: string
  description: string
  price: number
  currency: string
  rating?: number
  image?: string
  location?: string
  duration?: string
  departure?: string
  arrival?: string
  amenities?: string[]
  provider: string
  deepLink?: string
}

// Mock offers data
const mockOffers: Offer[] = [
  // Flights
  {
    id: 'f1',
    type: 'flight',
    title: 'Paris → Rome',
    description: 'Direct flight with Air France',
    price: 189,
    currency: 'EUR',
    rating: 4.2,
    departure: '10:00',
    arrival: '12:30',
    provider: 'Air France',
    deepLink: 'https://booking.com'
  },
  {
    id: 'f2',
    type: 'flight',
    title: 'Paris → Barcelona',
    description: 'Economy class with Vueling',
    price: 89,
    currency: 'EUR',
    rating: 3.8,
    departure: '14:15',
    arrival: '16:45',
    provider: 'Vueling',
    deepLink: 'https://booking.com'
  },
  {
    id: 'f3',
    type: 'flight',
    title: 'Paris → Amsterdam',
    description: 'Business class with KLM',
    price: 299,
    currency: 'EUR',
    rating: 4.5,
    departure: '08:30',
    arrival: '10:45',
    provider: 'KLM',
    deepLink: 'https://booking.com'
  },

  // Hotels
  {
    id: 'h1',
    type: 'hotel',
    title: 'Hotel Le Marais',
    description: '4-star boutique hotel in historic district',
    price: 120,
    currency: 'EUR',
    rating: 4.6,
    location: 'Le Marais, Paris',
    amenities: ['WiFi', 'Breakfast', 'Gym', 'Spa'],
    provider: 'Booking.com',
    deepLink: 'https://booking.com'
  },
  {
    id: 'h2',
    type: 'hotel',
    title: 'Hôtel de Crillon',
    description: '5-star luxury hotel near Champs-Élysées',
    price: 450,
    currency: 'EUR',
    rating: 4.9,
    location: 'Champs-Élysées, Paris',
    amenities: ['WiFi', 'Breakfast', 'Gym', 'Spa', 'Pool', 'Restaurant'],
    provider: 'Booking.com',
    deepLink: 'https://booking.com'
  },
  {
    id: 'h3',
    type: 'hotel',
    title: 'Generator Paris',
    description: 'Modern hostel with private rooms',
    price: 45,
    currency: 'EUR',
    rating: 4.1,
    location: 'Pigalle, Paris',
    amenities: ['WiFi', 'Kitchen', 'Bar', 'Lounge'],
    provider: 'Hostelworld',
    deepLink: 'https://hostelworld.com'
  },

  // Activities
  {
    id: 'a1',
    type: 'activity',
    title: 'Louvre Museum Skip-the-Line Tour',
    description: 'Guided tour with expert art historian',
    price: 45,
    currency: 'EUR',
    rating: 4.7,
    duration: '3 hours',
    provider: 'GetYourGuide',
    deepLink: 'https://getyourguide.com'
  },
  {
    id: 'a2',
    type: 'activity',
    title: 'Seine River Dinner Cruise',
    description: 'Romantic dinner with live music',
    price: 89,
    currency: 'EUR',
    rating: 4.4,
    duration: '2.5 hours',
    provider: 'Viator',
    deepLink: 'https://viator.com'
  },
  {
    id: 'a3',
    type: 'activity',
    title: 'Paris Food Tour',
    description: 'Taste local specialties in hidden gems',
    price: 65,
    currency: 'EUR',
    rating: 4.8,
    duration: '4 hours',
    provider: 'GetYourGuide',
    deepLink: 'https://getyourguide.com'
  }
]

const tabs = [
  { id: 'flights', label: 'Flights', icon: Plane, count: 3 },
  { id: 'hotels', label: 'Hotels', icon: Hotel, count: 3 },
  { id: 'activities', label: 'Activities', icon: MapPin, count: 3 }
]

export default function OffersPage() {
  const [activeTab, setActiveTab] = useState('flights')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('price')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const filteredOffers = mockOffers.filter(offer => {
    if (activeTab === 'flights' && offer.type !== 'flight') return false
    if (activeTab === 'hotels' && offer.type !== 'hotel') return false
    if (activeTab === 'activities' && offer.type !== 'activity') return false
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        offer.title.toLowerCase().includes(query) ||
        offer.description.toLowerCase().includes(query) ||
        offer.location?.toLowerCase().includes(query) ||
        offer.provider.toLowerCase().includes(query)
      )
    }
    
    return true
  })

  const sortedOffers = [...filteredOffers].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'name':
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  const toggleFavorite = (offerId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(offerId)) {
        newFavorites.delete(offerId)
      } else {
        newFavorites.add(offerId)
      }
      return newFavorites
    })
  }

  const getTabOffers = (tabId: string) => {
    return mockOffers.filter(offer => {
      if (tabId === 'flights') return offer.type === 'flight'
      if (tabId === 'hotels') return offer.type === 'hotel'
      if (tabId === 'activities') return offer.type === 'activity'
      return false
    })
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Browse <span className="gradient-text">Travel Offers</span>
          </h1>
          <p className="text-xl text-text/70 max-w-2xl mx-auto">
            Find the best deals on flights, hotels, and activities for your perfect trip.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text/50" />
              <input
                type="text"
                placeholder="Search destinations, hotels, activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field w-full pl-10"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field min-w-[150px]"
            >
              <option value="price">Sort by Price</option>
              <option value="rating">Sort by Rating</option>
              <option value="name">Sort by Name</option>
            </select>

            {/* Filter Button */}
            <button className="btn-secondary">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-card rounded-2xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary text-bg shadow-lg'
                  : 'text-text/70 hover:text-text hover:bg-white/5'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="font-medium">{tab.label}</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {getTabOffers(tab.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {sortedOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <OfferCard
                  offer={offer}
                  isFavorite={favorites.has(offer.id)}
                  onFavoriteToggle={() => toggleFavorite(offer.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {sortedOffers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-text mb-2">No offers found</h3>
            <p className="text-text/60 mb-6">
              Try adjusting your search criteria or browse all offers
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setActiveTab('flights')
              }}
              className="btn-primary"
            >
              View All Offers
            </button>
          </motion.div>
        )}

        {/* Load More */}
        {sortedOffers.length > 0 && (
          <div className="text-center mt-12">
            <button className="btn-secondary">
              Load More Offers
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
