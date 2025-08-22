import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          🗺️ BudgetTripPlanner
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          AI-powered travel itinerary generator with budget awareness. 
          Create personalized, day-by-day travel plans that fit your budget and preferences.
        </p>
        <Link
          href="/plan"
          className="inline-block bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Start Planning Your Trip
        </Link>
      </div>
    </div>
  );
}
