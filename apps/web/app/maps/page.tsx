'use client'
import React, { useState, useEffect } from 'react'
import { MapPin, Search, Navigation, Star, Clock, DollarSign, Filter, Layers, Share2, Download } from 'lucide-react'

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function Section({ id, className = '', children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cx('max-w-6xl mx-auto px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </section>
  )
}

function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={cx('rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm', className)}>{children}</div>
}

function Button({
  variant = 'solid',
  href,
  onClick,
  children,
}: {
  variant?: 'solid' | 'ghost'
  href?: string
  onClick?: any
  children: React.ReactNode
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[.99]'
  if (variant === 'ghost') {
    return (
      <a href={href || '#'} onClick={onClick} className={cx(base, 'bg-transparent text-slate-900 hover:bg-slate-50 ring-1 ring-slate-200')}>
        {children}
      </a>
    )
  }
  return (
    <a
      href={href || '#'}
      onClick={onClick}
      className={cx(base, 'text-slate-900 shadow-sm ring-1 ring-black/5')}
      style={{ background: 'linear-gradient(90deg,#fde047,#fbbf24,#f59e0b)' }}
    >
      {children}
    </a>
  )
}

function Input({ placeholder, icon, value, onChange }: {
  placeholder: string
  icon?: React.ReactNode
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
      )}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          'w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200/60',
          icon && 'pl-10'
        )}
      />
    </div>
  )
}

interface Place {
  id: string
  name: string
  type: 'attraction' | 'restaurant' | 'hotel' | 'transport'
  rating: number
  price: string
  distance: string
  time: string
  description: string
  coordinates: { lat: number; lng: number }
  image: string
}

function PlaceCard({ place, onClick }: { place: Place; onClick: () => void }) {
  return (
    <Card className="p-4 hover:shadow-md transition cursor-pointer" onClick={onClick}>
      <div className="flex gap-3">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-200/40 to-yellow-300/40 rounded-xl flex items-center justify-center flex-shrink-0">
          <div className="text-2xl">{place.image}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-slate-900 truncate">{place.name}</h3>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span>{place.rating}</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-2 line-clamp-2">{place.description}</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{place.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign size={12} />
              <span>{place.price}</span>
            </div>
            <div className="flex items-center gap-1">
              <Navigation size={12} />
              <span>{place.distance}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'px-3 py-1 rounded-full text-sm font-medium transition',
        active
          ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      )}
    >
      {label}
    </button>
  )
}

export default function MapsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>(['attraction', 'restaurant', 'hotel'])
  const [mapView, setMapView] = useState<'map' | 'satellite' | 'terrain'>('map')

  const filters = [
    { key: 'attraction', label: 'Attractions', icon: '🏛️' },
    { key: 'restaurant', label: 'Restaurants', icon: '🍽️' },
    { key: 'hotel', label: 'Hotels', icon: '🏨' },
    { key: 'transport', label: 'Transport', icon: '🚇' },
  ]

  const mockPlaces: Place[] = [
    {
      id: '1',
      name: 'Eiffel Tower',
      type: 'attraction',
      rating: 4.7,
      price: '€26',
      distance: '0.5 km',
      time: '2-3 hours',
      description: 'Iconic iron lattice tower on the Champ de Mars in Paris',
      coordinates: { lat: 48.8584, lng: 2.2945 },
      image: '🗼'
    },
    {
      id: '2',
      name: 'Louvre Museum',
      type: 'attraction',
      rating: 4.6,
      price: '€17',
      distance: '1.2 km',
      time: '3-4 hours',
      description: 'World\'s largest art museum and a historic monument',
      coordinates: { lat: 48.8606, lng: 2.3376 },
      image: '🏛️'
    },
    {
      id: '3',
      name: 'Le Jules Verne',
      type: 'restaurant',
      rating: 4.8,
      price: '€€€',
      distance: '0.3 km',
      time: '2 hours',
      description: 'Michelin-starred restaurant in the Eiffel Tower',
      coordinates: { lat: 48.8584, lng: 2.2945 },
      image: '🍽️'
    },
    {
      id: '4',
      name: 'Hotel Ritz Paris',
      type: 'hotel',
      rating: 4.9,
      price: '€€€€',
      distance: '0.8 km',
      time: 'Check-in 3 PM',
      description: 'Luxury hotel in the heart of Paris',
      coordinates: { lat: 48.8674, lng: 2.3295 },
      image: '🏨'
    },
    {
      id: '5',
      name: 'Champs-Élysées',
      type: 'attraction',
      rating: 4.5,
      price: 'Free',
      distance: '1.5 km',
      time: '1-2 hours',
      description: 'Famous avenue in Paris, known for shopping and landmarks',
      coordinates: { lat: 48.8698, lng: 2.3077 },
      image: '🛍️'
    },
    {
      id: '6',
      name: 'Metro Station',
      type: 'transport',
      rating: 4.2,
      price: '€1.90',
      distance: '0.2 km',
      time: '5 min',
      description: 'Nearest metro station for easy transportation',
      coordinates: { lat: 48.8584, lng: 2.2945 },
      image: '🚇'
    }
  ]

  const filteredPlaces = mockPlaces.filter(place => 
    activeFilters.includes(place.type) &&
    (searchQuery === '' || place.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const toggleFilter = (filterKey: string) => {
    setActiveFilters(prev => 
      prev.includes(filterKey) 
        ? prev.filter(f => f !== filterKey)
        : [...prev, filterKey]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffbea] via-[#fff8e1] to-[#fffde7] text-slate-900">
      {/* Subtle glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[52rem] rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(60% 60% at 50% 50%, rgba(253,224,71,.45), rgba(251,191,36,.25), transparent 70%)' }}
        />
      </div>

      {/* Header */}
      <header className="pt-10 pb-8">
        <Section>
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-black leading-[1.05] mb-4">
              Interactive Travel Map
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto">
              Explore destinations, discover attractions, and plan your route with our interactive map.
            </p>
          </div>
        </Section>
      </header>

      {/* Map Interface */}
      <Section className="pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] relative overflow-hidden">
              {/* Map Controls */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button variant="ghost" onClick={() => setMapView('map')}>
                  <Layers size={16} />
                  Map
                </Button>
                <Button variant="ghost" onClick={() => setMapView('satellite')}>
                  <Layers size={16} />
                  Satellite
                </Button>
                <Button variant="ghost" onClick={() => setMapView('terrain')}>
                  <Layers size={16} />
                  Terrain
                </Button>
              </div>

              {/* Search Overlay */}
              <div className="absolute top-4 left-4 z-10 w-80">
                <Input
                  placeholder="Search places, attractions, restaurants..."
                  icon={<Search size={16} />}
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>

              {/* Map Placeholder */}
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-200/60 to-amber-300/60 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin size={24} className="text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Interactive Map</h3>
                  <p className="text-slate-600 mb-4">Map integration coming soon</p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="ghost">
                      <Share2 size={16} />
                      Share
                    </Button>
                    <Button variant="ghost">
                      <Download size={16} />
                      Export
                    </Button>
                  </div>
                </div>
              </div>

              {/* Map Pins */}
              <div className="absolute inset-0 pointer-events-none">
                {filteredPlaces.map((place, index) => (
                  <div
                    key={place.id}
                    className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer pointer-events-auto"
                    style={{
                      left: `${20 + (index * 15)}%`,
                      top: `${30 + (index * 10)}%`
                    }}
                    onClick={() => setSelectedPlace(place)}
                  >
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm shadow-lg hover:scale-110 transition">
                      {place.image}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Filters */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Filters</h3>
              <div className="space-y-3">
                {filters.map((filter) => (
                  <div key={filter.key} className="flex items-center gap-3">
                    <span className="text-lg">{filter.icon}</span>
                    <FilterChip
                      label={filter.label}
                      active={activeFilters.includes(filter.key)}
                      onClick={() => toggleFilter(filter.key)}
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Places List */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Nearby Places</h3>
                <span className="text-sm text-slate-500">{filteredPlaces.length} found</span>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onClick={() => setSelectedPlace(place)}
                  />
                ))}
              </div>
            </Card>

            {/* Selected Place Details */}
            {selectedPlace && (
              <Card className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Place Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-200/40 to-yellow-300/40 rounded-xl flex items-center justify-center">
                      <div className="text-xl">{selectedPlace.image}</div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{selectedPlace.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span>{selectedPlace.rating}</span>
                        <span>•</span>
                        <span>{selectedPlace.price}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{selectedPlace.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <span>{selectedPlace.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Navigation size={14} className="text-slate-400" />
                      <span>{selectedPlace.distance}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1">
                      <Navigation size={16} />
                      Directions
                    </Button>
                    <Button variant="ghost" className="flex-1">
                      <Share2 size={16} />
                      Share
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section className="pb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Map Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-200/60 to-blue-300/60 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MapPin size={24} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Interactive Pins</h3>
            <p className="text-sm text-slate-600">Click on map pins to see detailed information about places</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-200/60 to-green-300/60 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Filter size={24} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Smart Filtering</h3>
            <p className="text-sm text-slate-600">Filter places by type, rating, and distance</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-200/60 to-purple-300/60 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Navigation size={24} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Route Planning</h3>
            <p className="text-sm text-slate-600">Plan optimal routes between destinations</p>
          </Card>
        </div>
      </Section>
    </div>
  )
}
