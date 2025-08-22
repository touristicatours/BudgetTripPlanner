'use client'
import React, { useState } from 'react'

export default function TripsPage() {
  const [trips] = useState([
    {
      id: 1,
      name: 'Paris Adventure',
      destination: 'Paris, France',
      dates: 'Oct 1-4, 2024',
      travelers: 2,
      budget: '€1000',
      status: 'active',
      progress: 65,
      image: '🗼'
    },
    {
      id: 2,
      name: 'Tokyo Discovery',
      destination: 'Tokyo, Japan',
      dates: 'Dec 15-22, 2024',
      travelers: 1,
      budget: '¥150,000',
      status: 'planning',
      progress: 30,
      image: '🗾'
    },
    {
      id: 3,
      name: 'New York City Break',
      destination: 'New York, USA',
      dates: 'Mar 10-15, 2025',
      travelers: 3,
      budget: '$2000',
      status: 'completed',
      progress: 100,
      image: '🗽'
    }
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createStep, setCreateStep] = useState(1)
  const [tripData, setTripData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: '',
    interests: [],
    accommodation: '',
    transportation: ''
  })

  const interests = [
    'Culture & History', 'Food & Dining', 'Nature & Outdoors', 
    'Shopping', 'Nightlife', 'Adventure', 'Relaxation', 'Art & Museums'
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'planning': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-slate-100 text-slate-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'planning': return 'Planning'
      case 'completed': return 'Completed'
      default: return 'Unknown'
    }
  }

  const handleInterestToggle = (interest: string) => {
    setTripData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleNext = () => {
    if (createStep < 4) setCreateStep(createStep + 1)
  }

  const handleBack = () => {
    if (createStep > 1) setCreateStep(createStep - 1)
  }

  const handleCreateTrip = () => {
    // Here you would save the trip and redirect to the workspace
    console.log('Creating trip:', tripData)
    // Redirect to workspace with the new trip
    window.location.href = '/workspace'
  }

  const resetCreateForm = () => {
    setTripData({
      destination: '',
      startDate: '',
      endDate: '',
      travelers: 1,
      budget: '',
      interests: [],
      accommodation: '',
      transportation: ''
    })
    setCreateStep(1)
    setShowCreateModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffbea] via-[#fff8e1] to-[#fffde7]">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b border-amber-200/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="size-8 rounded-xl bg-yellow-400 text-slate-900 grid place-items-center font-black">TW</div>
              <span className="font-semibold">TripWeaver</span>
            </a>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl text-white font-medium transition active:scale-[.99] shadow-sm ring-1 ring-black/5"
                style={{ background: 'linear-gradient(90deg,#fde047,#fbbf24,#f59e0b)' }}
              >
                ➕ New Trip
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Trips</h1>
          <p className="text-slate-600">Manage and view all your travel adventures</p>
        </div>

        {/* Trips Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map(trip => (
            <div 
              key={trip.id}
              className="bg-white/80 backdrop-blur rounded-2xl ring-1 ring-amber-200/50 shadow-sm p-6 hover:shadow-md transition cursor-pointer"
              onClick={() => window.location.href = `/workspace?id=${trip.id}`}
            >
              {/* Trip Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{trip.image}</div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                  {getStatusText(trip.status)}
                </span>
              </div>

              {/* Trip Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{trip.name}</h3>
                  <p className="text-slate-600 text-sm">{trip.destination}</p>
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    📅 <span>{trip.dates}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    👥 <span>{trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    💰 <span>{trip.budget}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{trip.progress}%</span>
                  </div>
                  <div className="w-full bg-amber-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${trip.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-amber-200/50">
                  <button className="flex-1 px-3 py-2 text-sm bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition ring-1 ring-amber-200">
                    View Details
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition">
                    ⋯
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Trip Card */}
          <div 
            className="bg-white/60 backdrop-blur rounded-2xl ring-1 ring-amber-200/50 border-2 border-dashed border-amber-300/50 p-6 hover:bg-white/80 transition cursor-pointer flex flex-col items-center justify-center text-center"
            onClick={() => setShowCreateModal(true)}
          >
            <div className="text-4xl mb-4">✨</div>
            <h3 className="font-semibold text-slate-900 mb-2">Create New Trip</h3>
            <p className="text-slate-600 text-sm mb-4">Start planning your next adventure</p>
            <button 
              className="px-4 py-2 rounded-xl text-white font-medium transition active:scale-[.99] shadow-sm ring-1 ring-black/5"
              style={{ background: 'linear-gradient(90deg,#fde047,#fbbf24,#f59e0b)' }}
            >
              Plan Trip
            </button>
          </div>
        </div>

        {/* Empty State */}
        {trips.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No trips yet</h3>
            <p className="text-slate-600 mb-6">Start planning your first adventure!</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-xl text-white font-medium transition active:scale-[.99] shadow-sm ring-1 ring-black/5"
              style={{ background: 'linear-gradient(90deg,#fde047,#fbbf24,#f59e0b)' }}
            >
              Plan Your First Trip
            </button>
          </div>
        )}
      </div>

      {/* Create Trip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-amber-200/50">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-slate-900">Create New Trip</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Step {createStep} of 4</span>
                  <div className="w-24 bg-amber-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(createStep / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <button 
                onClick={resetCreateForm}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {createStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Where do you want to go?</h3>
                    <input
                      type="text"
                      placeholder="Enter destination (e.g., Paris, France)"
                      value={tripData.destination}
                      onChange={(e) => setTripData(prev => ({ ...prev, destination: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white/50"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={tripData.startDate}
                        onChange={(e) => setTripData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={tripData.endDate}
                        onChange={(e) => setTripData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {createStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Who's traveling?</h3>
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium text-slate-700">Number of travelers:</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setTripData(prev => ({ ...prev, travelers: Math.max(1, prev.travelers - 1) }))}
                          className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium">{tripData.travelers}</span>
                        <button
                          onClick={() => setTripData(prev => ({ ...prev, travelers: prev.travelers + 1 }))}
                          className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Budget (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., $1000, €800"
                      value={tripData.budget}
                      onChange={(e) => setTripData(prev => ({ ...prev, budget: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white/50"
                    />
                  </div>
                </div>
              )}

              {createStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">What interests you?</h3>
                    <p className="text-slate-600 mb-4">Select all that apply to help us personalize your trip</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {interests.map(interest => (
                        <button
                          key={interest}
                          onClick={() => handleInterestToggle(interest)}
                          className={`p-3 rounded-xl border transition ${
                            tripData.interests.includes(interest)
                              ? 'bg-amber-100 border-amber-300 text-amber-800'
                              : 'bg-white/50 border-amber-200/50 text-slate-700 hover:bg-amber-50/50'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {createStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Final preferences</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Accommodation preference</label>
                        <select
                          value={tripData.accommodation}
                          onChange={(e) => setTripData(prev => ({ ...prev, accommodation: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white/50"
                        >
                          <option value="">Select preference</option>
                          <option value="budget">Budget-friendly</option>
                          <option value="mid-range">Mid-range</option>
                          <option value="luxury">Luxury</option>
                          <option value="unique">Unique experiences</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Transportation preference</label>
                        <select
                          value={tripData.transportation}
                          onChange={(e) => setTripData(prev => ({ ...prev, transportation: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white/50"
                        >
                          <option value="">Select preference</option>
                          <option value="public">Public transportation</option>
                          <option value="walking">Walking/biking</option>
                          <option value="car">Car rental</option>
                          <option value="mix">Mix of options</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-amber-200/50">
                <button
                  onClick={handleBack}
                  disabled={createStep === 1}
                  className={`px-6 py-3 rounded-xl transition ${
                    createStep === 1
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-amber-50/50'
                  }`}
                >
                  ← Back
                </button>
                
                {createStep < 4 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 rounded-xl text-white font-medium transition active:scale-[.99] shadow-sm ring-1 ring-black/5"
                    style={{ background: 'linear-gradient(90deg,#fde047,#fbbf24,#f59e0b)' }}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleCreateTrip}
                    className="px-6 py-3 rounded-xl text-white font-medium transition active:scale-[.99] shadow-sm ring-1 ring-black/5"
                    style={{ background: 'linear-gradient(90deg,#fde047,#fbbf24,#f59e0b)' }}
                  >
                    Create My Trip ✨
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
