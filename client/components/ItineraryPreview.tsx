'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Euro, 
  Users, 
  TrendingUp,
  RefreshCw,
  Download,
  Share2
} from 'lucide-react'

interface ItineraryItem {
  time: string
  title: string
  category: 'flight' | 'hotel' | 'activity' | 'sightseeing' | 'food' | 'transport' | 'rest'
  lat?: number
  lng?: number
  durationMin?: number
  estCost: number
  notes?: string
  booking?: {
    type: 'flight' | 'hotel' | 'tour' | 'ticket' | 'none'
    operator?: string
    url?: string
  }
}

interface ItineraryDay {
  date: string
  summary: string
  items: ItineraryItem[]
  subtotal: number
}

interface Itinerary {
  currency: string
  estimatedTotal: number
  days: ItineraryDay[]
}

// Mock data for preview
const mockItinerary: Itinerary = {
  currency: 'EUR',
  estimatedTotal: 1250,
  days: [
    {
      date: '2024-06-15',
      summary: 'Arrival and city exploration',
      subtotal: 180,
      items: [
        {
          time: '10:00',
          title: 'Arrive at Charles de Gaulle Airport',
          category: 'flight',
          estCost: 0,
          notes: 'Flight already booked'
        },
        {
          time: '12:00',
          title: 'Check-in at Hotel Le Marais',
          category: 'hotel',
          estCost: 120,
          notes: 'Located in historic district'
        },
        {
          time: '14:00',
          title: 'Lunch at Le Petit Bistrot',
          category: 'food',
          estCost: 25,
          notes: 'Traditional French cuisine'
        },
        {
          time: '16:00',
          title: 'Eiffel Tower Visit',
          category: 'sightseeing',
          estCost: 35,
          notes: 'Skip-the-line tickets recommended'
        }
      ]
    },
    {
      date: '2024-06-16',
      summary: 'Cultural exploration and museums',
      subtotal: 95,
      items: [
        {
          time: '09:00',
          title: 'Breakfast at hotel',
          category: 'food',
          estCost: 15,
          notes: 'Included in room rate'
        },
        {
          time: '10:30',
          title: 'Louvre Museum',
          category: 'sightseeing',
          estCost: 17,
          notes: 'Free on first Sunday of month'
        },
        {
          time: '14:00',
          title: 'Lunch at Café Marly',
          category: 'food',
          estCost: 45,
          notes: 'Overlooking Louvre courtyard'
        },
        {
          time: '16:00',
          title: 'Notre-Dame Cathedral',
          category: 'sightseeing',
          estCost: 0,
          notes: 'Free entry, donations welcome'
        },
        {
          time: '18:00',
          title: 'Evening walk along Seine',
          category: 'sightseeing',
          estCost: 0,
          notes: 'Beautiful sunset views'
        }
      ]
    }
  ]
}

export function ItineraryPreview() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(0)

  // Use mock data for now
  const currentItinerary = itinerary || mockItinerary

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      flight: '✈️',
      hotel: '🏨',
      activity: '🎯',
      sightseeing: '🏛️',
      food: '🍽️',
      transport: '🚗',
      rest: '😴'
    }
    return icons[category] || '📍'
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      flight: 'bg-blue-500/20 text-blue-400',
      hotel: 'bg-purple-500/20 text-purple-400',
      activity: 'bg-green-500/20 text-green-400',
      sightseeing: 'bg-orange-500/20 text-orange-400',
      food: 'bg-red-500/20 text-red-400',
      transport: 'bg-gray-500/20 text-gray-400',
      rest: 'bg-yellow-500/20 text-yellow-400'
    }
    return colors[category] || 'bg-gray-500/20 text-gray-400'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentItinerary.currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="card h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-text">Itinerary Preview</h3>
          <p className="text-sm text-text/60">Your personalized travel plan</p>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 rounded-lg bg-card border border-white/10 hover:border-primary/30 transition-colors">
            <RefreshCw className="h-4 w-4 text-text/60" />
          </button>
          <button className="p-2 rounded-lg bg-card border border-white/10 hover:border-primary/30 transition-colors">
            <Download className="h-4 w-4 text-text/60" />
          </button>
          <button className="p-2 rounded-lg bg-card border border-white/10 hover:border-primary/30 transition-colors">
            <Share2 className="h-4 w-4 text-text/60" />
          </button>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 mb-6 border border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-text">Budget Overview</h4>
          <span className="text-sm text-text/60">
            {formatCurrency(currentItinerary.estimatedTotal)}
          </span>
        </div>
        
        {/* Budget Gauge */}
        <div className="relative">
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-secondary to-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (currentItinerary.estimatedTotal / 1500) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-text/60 mt-1">
            <span>€0</span>
            <span>€1500</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div>
            <div className="text-lg font-semibold text-primary">
              {currentItinerary.days.length}
            </div>
            <div className="text-xs text-text/60">Days</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-secondary">
              {currentItinerary.days.reduce((sum, day) => sum + day.items.length, 0)}
            </div>
            <div className="text-xs text-text/60">Activities</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-accent">
              {formatCurrency(Math.round(currentItinerary.estimatedTotal / currentItinerary.days.length))}
            </div>
            <div className="text-xs text-text/60">Per Day</div>
          </div>
        </div>
      </div>

      {/* Days Navigation */}
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        {currentItinerary.days.map((day, index) => (
          <button
            key={day.date}
            onClick={() => setSelectedDay(index)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg border transition-all duration-200 ${
              selectedDay === index
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-white/10 bg-card hover:border-primary/30 text-text/70'
            }`}
          >
            <div className="text-xs font-medium">Day {index + 1}</div>
            <div className="text-xs opacity-75">{formatDate(day.date)}</div>
          </button>
        ))}
      </div>

      {/* Selected Day Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {selectedDay !== null && (
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <h4 className="text-lg font-semibold text-text mb-1">
                  {formatDate(currentItinerary.days[selectedDay].date)}
                </h4>
                <p className="text-sm text-text/60">
                  {currentItinerary.days[selectedDay].summary}
                </p>
                <div className="text-sm text-primary font-medium mt-1">
                  Total: {formatCurrency(currentItinerary.days[selectedDay].subtotal)}
                </div>
              </div>

              {/* Day Items */}
              <div className="space-y-3">
                {currentItinerary.days[selectedDay].items.map((item, itemIndex) => (
                  <motion.div
                    key={itemIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: itemIndex * 0.1 }}
                    className="bg-card/50 border border-white/5 rounded-xl p-4 hover:border-primary/20 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-2xl">{getCategoryIcon(item.category)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-primary">
                              {item.time}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(item.category)}`}>
                              {item.category}
                            </span>
                          </div>
                          <h5 className="font-medium text-text mb-1">{item.title}</h5>
                          {item.notes && (
                            <p className="text-sm text-text/60">{item.notes}</p>
                          )}
                          {item.durationMin && (
                            <div className="flex items-center space-x-1 text-xs text-text/50 mt-2">
                              <Clock className="h-3 w-3" />
                              <span>{item.durationMin} min</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-semibold text-primary">
                          {formatCurrency(item.estCost)}
                        </div>
                        {item.booking && item.booking.type !== 'none' && (
                          <button className="text-xs text-secondary hover:text-primary transition-colors">
                            Book Now
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t border-white/10">
        <button className="flex-1 btn-secondary">
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate Day
        </button>
        <button className="flex-1 btn-primary">
          <TrendingUp className="h-4 w-4 mr-2" />
          View Offers
        </button>
      </div>
    </div>
  )
}
