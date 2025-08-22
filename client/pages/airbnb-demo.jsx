import { useState } from 'react';
import { Card, Button, Input, Badge, Alert, LoadingSpinner, showToast } from '../components/ui/Kit';

export default function AirbnbDemoPage() {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('USA');
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      showToast('Please enter a destination query', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/airbnb/destinations?query=${encodeURIComponent(query)}&country=${encodeURIComponent(country)}`);
      const data = await response.json();
      
      setDestinations(data.destinations || []);
      setApiStatus({
        live: data.live,
        notice: data.notice
      });
      
      showToast(`Found ${data.destinations?.length || 0} Airbnb destinations!`, 'success');
    } catch (error) {
      console.error('Airbnb search error:', error);
      showToast('Search failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const popularQueries = [
    { query: 'Chicago', country: 'USA' },
    { query: 'New York', country: 'USA' },
    { query: 'Los Angeles', country: 'USA' },
    { query: 'Miami', country: 'USA' },
    { query: 'San Francisco', country: 'USA' },
    { query: 'Paris', country: 'France' },
    { query: 'London', country: 'UK' },
    { query: 'Tokyo', country: 'Japan' }
  ];

  const handleQuickSearch = (quickQuery, quickCountry) => {
    setQuery(quickQuery);
    setCountry(quickCountry);
    // Trigger search after setting the values
    setTimeout(() => {
      setQuery(quickQuery);
      setCountry(quickCountry);
      handleSearch();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏠 Airbnb Destination Search Demo
          </h1>
          <p className="text-xl text-gray-600">
            Explore Airbnb destinations with real-time search and fallback data
          </p>
        </div>

        {/* API Status */}
        {apiStatus && (
          <div className="mb-6">
            <Alert 
              variant={apiStatus.live ? 'success' : 'warning'}
              title={apiStatus.live ? 'Live API Connected' : 'Using Mock Data'}
            >
              {apiStatus.notice}
            </Alert>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                🔍 Search Destinations
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination Query
                  </label>
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., Chicago, New York, Paris..."
                    className="w-full"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USA">USA</option>
                    <option value="France">France</option>
                    <option value="UK">UK</option>
                    <option value="Japan">Japan</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="Italy">Italy</option>
                  </select>
                </div>

                <Button
                  onClick={handleSearch}
                  disabled={loading || !query.trim()}
                  className="w-full"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Search Destinations'}
                </Button>
              </div>

              {/* Quick Search Buttons */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Quick Searches
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {popularQueries.map((item, index) => (
                    <Button
                      key={index}
                      onClick={() => handleQuickSearch(item.query, item.country)}
                      variant="secondary"
                      size="sm"
                      className="text-xs"
                    >
                      {item.query}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                📍 Search Results
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                  <span className="ml-3 text-gray-600">Searching Airbnb destinations...</span>
                </div>
              ) : destinations.length > 0 ? (
                <div className="space-y-4">
                  {destinations.map((destination) => (
                    <div
                      key={destination.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {destination.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {destination.fullName}
                          </p>
                          <p className="text-sm text-gray-500 mb-3">
                            {destination.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              {destination.country}
                            </span>
                            {destination.region && (
                              <span className="flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                {destination.region}
                              </span>
                            )}
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                              Popularity: {destination.popularity}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant="primary">
                            {destination.type}
                          </Badge>
                          {destination.coordinates && (
                            <div className="text-xs text-gray-500 text-right">
                              <div>Lat: {destination.coordinates.lat}</div>
                              <div>Lng: {destination.coordinates.lng}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No destinations found
                  </h3>
                  <p className="text-gray-600">
                    Try searching for a different destination or country
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Integration Info */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            🔗 Airbnb Integration Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Search</h3>
              <p className="text-gray-600 text-sm">
                Search Airbnb destinations with live API integration
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Coverage</h3>
              <p className="text-gray-600 text-sm">
                Support for multiple countries and regions worldwide
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rich Data</h3>
              <p className="text-gray-600 text-sm">
                Detailed destination information with coordinates and popularity
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fallback System</h3>
              <p className="text-gray-600 text-sm">
                Robust mock data when API is unavailable
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
