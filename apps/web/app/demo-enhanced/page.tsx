"use client";
import { useState } from "react";
import EnhancedItineraryViewer from "@/src/components/EnhancedItineraryViewer";

// Mock data with ML-powered features
const mockForm = {
  destination: "Paris",
  startDate: "2024-06-15",
  endDate: "2024-06-17",
  travelers: 2,
  budget: 1500,
  currency: "EUR",
  pace: "moderate",
  interests: ["art", "food", "culture"]
};

const mockItinerary = [
  {
    day: 1,
    title: "Day 1 in Paris",
    activities: [
      {
        timeOfDay: "morning",
        name: "Musée du Louvre",
        note: "Rue de Rivoli, 75001 Paris (4.7★) • ML Score: 0.94",
        category: "culture",
        cost: "17 EUR",
        rating: 4.7,
        user_ratings_total: 8900,
        price_level: 3,
        placeId: "ChIJD3uTd9hx5kcR1IQvGfr8dbk",
        address: "Rue de Rivoli, 75001 Paris, France",
        lat: 48.8606,
        lng: 2.3376,
        mlScore: 0.94
      },
      {
        timeOfDay: "afternoon",
        name: "Le Petit Bistrot",
        note: "123 Rue de la Paix, 75001 Paris (4.5★) • ML Score: 0.87",
        category: "food",
        cost: "45 EUR",
        rating: 4.5,
        user_ratings_total: 1250,
        price_level: 2,
        placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        address: "123 Rue de la Paix, 75001 Paris, France",
        lat: 48.8566,
        lng: 2.3522,
        mlScore: 0.87
      },
      {
        timeOfDay: "evening",
        name: "Eiffel Tower",
        note: "Champ de Mars, 5 Avenue Anatole France, 75007 Paris (4.6★) • ML Score: 0.91",
        category: "must-see",
        cost: "26 EUR",
        rating: 4.6,
        user_ratings_total: 12500,
        price_level: 3,
        placeId: "ChIJD7fiBh9u5kcRYJSMaMOCCwQ",
        address: "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
        lat: 48.8584,
        lng: 2.2945,
        mlScore: 0.91
      }
    ]
  },
  {
    day: 2,
    title: "Day 2 in Paris",
    activities: [
      {
        timeOfDay: "morning",
        name: "Jardin des Tuileries",
        note: "Place de la Concorde, 75001 Paris (4.3★) • ML Score: 0.82",
        category: "nature",
        cost: "Free",
        rating: 4.3,
        user_ratings_total: 3200,
        price_level: 0,
        placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        address: "Place de la Concorde, 75001 Paris, France",
        lat: 48.8550,
        lng: 2.3500,
        mlScore: 0.82
      },
      {
        timeOfDay: "afternoon",
        name: "Café de Flore",
        note: "172 Boulevard Saint-Germain, 75006 Paris (4.2★) • ML Score: 0.79",
        category: "food",
        cost: "35 EUR",
        rating: 4.2,
        user_ratings_total: 2100,
        price_level: 2,
        placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        address: "172 Boulevard Saint-Germain, 75006 Paris, France",
        lat: 48.8530,
        lng: 2.3340,
        mlScore: 0.79
      },
      {
        timeOfDay: "evening",
        name: "Arc de Triomphe",
        note: "Place Charles de Gaulle, 75008 Paris (4.4★) • ML Score: 0.85",
        category: "sightseeing",
        cost: "13 EUR",
        rating: 4.4,
        user_ratings_total: 5600,
        price_level: 2,
        placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        address: "Place Charles de Gaulle, 75008 Paris, France",
        lat: 48.8738,
        lng: 2.2950,
        mlScore: 0.85
      }
    ]
  }
];

export default function DemoEnhancedPage() {
  const [showFeatures, setShowFeatures] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Enhanced Itinerary Viewer
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Showcasing ML-powered recommendations with dynamic data display
          </p>
          
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showFeatures ? "Hide" : "Show"} New Features
          </button>
        </div>

        {/* Feature Highlights */}
        {showFeatures && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">🎯 New ML-Powered Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">⭐</div>
                <h3 className="font-semibold mb-1">Star Ratings</h3>
                <p className="text-sm text-gray-600">Display Google Places ratings with visual stars</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">👥</div>
                <h3 className="font-semibold mb-1">Review Counts</h3>
                <p className="text-sm text-gray-600">Show number of user reviews for credibility</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">💰</div>
                <h3 className="font-semibold mb-1">Price Levels</h3>
                <p className="text-sm text-gray-600">Visual price indicators (€, €€, €€€, €€€€)</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold mb-1">ML Scores</h3>
                <p className="text-sm text-gray-600">Personalization scores from AI engine</p>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">🔄</div>
                <h3 className="font-semibold mb-1">Refresh Recommendations</h3>
                <p className="text-sm text-gray-600">Get fresh AI-powered suggestions for the same trip</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">👍👎</div>
                <h3 className="font-semibold mb-1">Feedback System</h3>
                <p className="text-sm text-gray-600">Rate recommendations to improve future suggestions</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Itinerary Viewer */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <EnhancedItineraryViewer 
            form={mockForm} 
            itinerary={mockItinerary} 
            tripId="demo-trip-123"
          />
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">🔧 Technical Implementation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Frontend Enhancements</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• React component with TypeScript interfaces</li>
                <li>• Dynamic star rating rendering</li>
                <li>• Interactive feedback buttons</li>
                <li>• Real-time refresh functionality</li>
                <li>• Responsive design with Tailwind CSS</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Backend Integration</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• ML-powered recommendation engine</li>
                <li>• Google Places API integration</li>
                <li>• Feedback collection and storage</li>
                <li>• Real-time data updates</li>
                <li>• RESTful API endpoints</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
