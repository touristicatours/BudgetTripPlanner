'use client'

import { motion } from 'framer-motion'
import { 
  Heart, 
  Star, 
  MapPin, 
  Clock, 
  Plane, 
  Hotel, 
  MapPin as MapPinIcon,
  ExternalLink,
  Calendar,
  Users
} from 'lucide-react'

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

interface OfferCardProps {
  offer: Offer
  isFavorite: boolean
  onFavoriteToggle: () => void
}

export function OfferCard({ offer, isFavorite, onFavoriteToggle }: OfferCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: offer.currency,
    }).format(amount)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return <Plane className="h-5 w-5" />
      case 'hotel':
        return <Hotel className="h-5 w-5" />
      case 'activity':
        return <MapPinIcon className="h-5 w-5" />
      default:
        return <MapPinIcon className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'flight':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'hotel':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'activity':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'flight':
        return 'Flight'
      case 'hotel':
        return 'Hotel'
      case 'activity':
        return 'Activity'
      default:
        return 'Offer'
    }
  }

  const handleBookNow = () => {
    if (offer.deepLink) {
      window.open(offer.deepLink, '_blank')
    }
  }

  return (
    <motion.div
      className="card group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${getTypeColor(offer.type)}`}>
            {getTypeIcon(offer.type)}
          </div>
          <span className="text-xs font-medium text-text/60">
            {getTypeLabel(offer.type)}
          </span>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFavoriteToggle()
          }}
          className="p-2 rounded-full hover:bg-white/5 transition-colors"
        >
          <Heart 
            className={`h-5 w-5 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-text/40 hover:text-red-500'
            }`} 
          />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 className="font-semibold text-text text-lg leading-tight">
          {offer.title}
        </h3>
        
        <p className="text-text/70 text-sm leading-relaxed">
          {offer.description}
        </p>

        {/* Flight-specific details */}
        {offer.type === 'flight' && offer.departure && offer.arrival && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-text/70">
                {offer.departure} - {offer.arrival}
              </span>
            </div>
          </div>
        )}

        {/* Hotel-specific details */}
        {offer.type === 'hotel' && offer.location && (
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-text/70">{offer.location}</span>
          </div>
        )}

        {/* Activity-specific details */}
        {offer.type === 'activity' && offer.duration && (
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-text/70">{offer.duration}</span>
          </div>
        )}

        {/* Amenities for hotels */}
        {offer.type === 'hotel' && offer.amenities && offer.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {offer.amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/5 rounded-full text-xs text-text/60"
              >
                {amenity}
              </span>
            ))}
            {offer.amenities.length > 3 && (
              <span className="px-2 py-1 bg-white/5 rounded-full text-xs text-text/60">
                +{offer.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Rating */}
        {offer.rating && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-text">
                {offer.rating}
              </span>
            </div>
            <span className="text-xs text-text/50">•</span>
            <span className="text-xs text-text/50">{offer.provider}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
        <div>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(offer.price)}
          </div>
          <div className="text-xs text-text/50">
            {offer.type === 'hotel' ? 'per night' : offer.type === 'flight' ? 'per person' : 'per person'}
          </div>
        </div>

        <button
          onClick={handleBookNow}
          className="btn-primary text-sm px-4 py-2"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Book Now
        </button>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  )
}
