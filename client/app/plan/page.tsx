'use client';

import { ChatWizard } from '@/components/ChatWizard'
import { ItineraryPreview } from '@/components/ItineraryPreview'

export default function PlanPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Plan Your <span className="gradient-text">Perfect Trip</span>
          </h1>
          <p className="text-xl text-text/70 max-w-2xl mx-auto">
            Chat with our AI travel concierge to create a personalized itinerary 
            that fits your style, budget, and preferences.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Chat Wizard */}
          <div className="order-2 lg:order-1">
            <ChatWizard />
          </div>

          {/* Right: Itinerary Preview */}
          <div className="order-1 lg:order-2">
            <ItineraryPreview />
          </div>
        </div>
      </div>
    </div>
  )
}
