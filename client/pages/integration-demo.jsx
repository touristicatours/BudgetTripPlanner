import { useState } from 'react';
import { Card, Button, Input, Badge, Alert, LoadingSpinner, showToast } from '../components/ui/Kit';
import { AutoComplete } from '../components/ui/AutoComplete';
import { AIChat } from '../components/ui/AIChat';

export default function IntegrationDemoPage() {
  const [searchParams, setSearchParams] = useState({
    destination: 'New York',
    startDate: '2024-12-01',
    endDate: '2024-12-03',
    travelers: 2,
    budget: 2000
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({});

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/live/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      });
      
      const data = await response.json();
      setResults(data);
      
      // Track API status
      setApiStatus({
        flights: data.flightsLive || false,
        stays: data.staysLive || false,
        cars: data.carsLive || false,
        attractions: data.attractionsLive || false,
        autocomplete: data.autocomplete?.live || false
      });
      
      showToast('Search completed successfully!', 'success');
    } catch (error) {
      console.error('Search error:', error);
      showToast('Search failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDestinationSelect = (destination) => {
    setSearchParams(prev => ({ ...prev, destination }));
  };

  const updateSearchParams = (field, value) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotalCost = () => {
    if (!results) return 0;
    
    const flightCost = results.flights?.[0]?.price || 0;
    const stayCost = results.stays?.[0]?.price || 0;
    const carCost = results.cars?.[0]?.total || 0;
    const attractionCost = results.attractions?.[0]?.price || 0;
    
    return flightCost + stayCost + carCost + attractionCost;
  };

  const handleAIEnhancement = (enhancedParams, suggestions) => {
    setSearchParams(prev => ({ ...prev, ...enhancedParams }));
    showToast(`AI enhanced your search with ${suggestions.length} suggestions!`, 'success');
  };

  const testScenarios = [
    {
      name: 'Weekend in NYC',
      params: { destination: 'New York', startDate: '2024-12-06', endDate: '2024-12-08', travelers: 2, budget: 1500 }
    },
    {
      name: 'Week in Paris',
      params: { destination: 'Paris', startDate: '2024-12-15', endDate: '2024-12-22', travelers: 2, budget: 3000 }
    },
    {
      name: 'Business Trip to Chicago',
      params: { destination: 'Chicago', startDate: '2024-12-10', endDate: '2024-12-12', travelers: 1, budget: 1000 }
    }
  ];

  const runTestScenario = async (scenario) => {
    setSearchParams(scenario.params);
    setTimeout(() => handleSearch(), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🚀 Complete Integration Demo
          </h1>
          <p className="text-xl text-gray-600">
            Experience all integrated APIs working together: Flights, Stays, Cars, Auto-complete, and AI Chat
          </p>
        </div>

        {/* API Status Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">API Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl mb-2">✈️</div>
              <div className="font-semibold">Flights</div>
              <Badge variant={apiStatus.flights ? 'success' : 'warning'}>
                {apiStatus.flights ? 'Live' : 'Mock'}
              </Badge>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl mb-2">🏨</div>
              <div className="font-semibold">Stays</div>
              <Badge variant={apiStatus.stays ? 'success' : 'warning'}>
                {apiStatus.stays ? 'Live' : 'Mock'}
              </Badge>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl mb-2">🚗</div>
              <div className="font-semibold">Cars</div>
              <Badge variant={apiStatus.cars ? 'success' : 'warning'}>
                {apiStatus.cars ? 'Live' : 'Mock'}
              </Badge>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold">Attractions</div>
              <Badge variant={apiStatus.attractions ? 'success' : 'warning'}>
                {apiStatus.attractions ? 'Live' : 'Mock'}
              </Badge>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-semibold">AI Chat</div>
              <Badge variant="primary">Active</Badge>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Test Scenarios */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                🧪 Test Scenarios
              </h2>
              <div className="space-y-3">
                {testScenarios.map((scenario, index) => (
                  <Button
                    key={index}
                    onClick={() => runTestScenario(scenario)}
                    variant="secondary"
                    className="w-full text-left justify-start"
                  >
                    <div>
                      <div className="font-semibold">{scenario.name}</div>
                      <div className="text-sm text-gray-600">
                        {scenario.params.destination} • {scenario.params.travelers} traveler{scenario.params.travelers !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Search Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                🔍 Custom Search
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination
                  </label>
                  <AutoComplete
                    value={searchParams.destination}
                    onChange={(e) => updateSearchParams('destination', e.target.value)}
                    onSelect={handleDestinationSelect}
                    placeholder="Search destinations..."
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travelers
                  </label>
                  <Input
                    type="number"
                    value={searchParams.travelers}
                    onChange={(e) => updateSearchParams('travelers', parseInt(e.target.value))}
                    min="1"
                    max="10"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={searchParams.startDate}
                    onChange={(e) => updateSearchParams('startDate', e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={searchParams.endDate}
                    onChange={(e) => updateSearchParams('endDate', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <Button
                onClick={handleSearch}
                disabled={loading}
                className="w-full"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Search All Services'}
              </Button>
            </Card>

            {/* Results */}
            {results && (
              <Card className="p-6 mt-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  📊 Search Results
                </h2>
                
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Trip Summary
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Cost:</span>
                        <div className="text-2xl font-bold text-green-600">
                          ${calculateTotalCost().toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Flights:</span>
                        <div className="text-lg font-semibold text-blue-600">
                          ${results.flights?.flights?.[0]?.price || 0}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Stays:</span>
                        <div className="text-lg font-semibold text-purple-600">
                          ${results.stays?.stays?.[0]?.price || 0}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Cars:</span>
                        <div className="text-lg font-semibold text-orange-600">
                          ${results.cars?.[0]?.total || 0}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Attractions:</span>
                        <div className="text-lg font-semibold text-purple-600">
                          ${results.attractions?.[0]?.price || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flights */}
                  {results.flights?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">✈️ Flights</h3>
                      <div className="space-y-3">
                        {results.flights.slice(0, 3).map((flight, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold">{flight.airline}</div>
                                <div className="text-sm text-gray-600">
                                  {flight.departure} → {flight.arrival}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-blue-600">${flight.price}</div>
                                <Badge variant={results.flightsLive ? 'success' : 'warning'}>
                                  {results.flightsLive ? 'Live' : 'Mock'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stays */}
                  {results.stays?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🏨 Stays</h3>
                      <div className="space-y-3">
                        {results.stays.slice(0, 3).map((stay, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold">{stay.name}</div>
                                <div className="text-sm text-gray-600">{stay.location}</div>
                                <div className="text-sm text-gray-500">{stay.rating} ★</div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-purple-600">${stay.price}</div>
                                <Badge variant={results.staysLive ? 'success' : 'warning'}>
                                  {results.staysLive ? 'Live' : 'Mock'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cars */}
                  {results.cars?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🚗 Car Rentals</h3>
                      <div className="space-y-3">
                        {results.cars.slice(0, 3).map((car, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold">{car.name}</div>
                                <div className="text-sm text-gray-600">{car.company}</div>
                                <div className="text-sm text-gray-500">{car.type}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-orange-600">${car.total}</div>
                                <Badge variant={results.carsLive ? 'success' : 'warning'}>
                                  {results.carsLive ? 'Live' : 'Mock'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attractions */}
                  {results.attractions?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Attractions</h3>
                      <div className="space-y-3">
                        {results.attractions.slice(0, 3).map((attraction, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold">{attraction.name}</div>
                                <div className="text-sm text-gray-600">{attraction.location}</div>
                                <div className="text-sm text-gray-500">⭐ {attraction.rating} ({attraction.totalReviews} reviews)</div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-purple-600">${attraction.price}</div>
                                <Badge variant={results.attractionsLive ? 'success' : 'warning'}>
                                  {results.attractionsLive ? 'Live' : 'Mock'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* AI Chat */}
          <div className="lg:col-span-1">
            <AIChat onEnhanceSearch={handleAIEnhancement} />
          </div>
        </div>

        {/* Integration Features */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            🔗 Integrated Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">✈️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Flight Search</h3>
              <p className="text-gray-600 text-sm">
                Real-time flight search with Skyscanner API integration
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🏨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hotel Search</h3>
              <p className="text-gray-600 text-sm">
                Booking.com integration with map-based search and auto-complete
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Car Rentals</h3>
              <p className="text-gray-600 text-sm">
                Booking.com car rental API with location-based search
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Auto-complete</h3>
              <p className="text-gray-600 text-sm">
                Smart destination search with Booking.com auto-complete API
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Assistant</h3>
              <p className="text-gray-600 text-sm">
                OpenAI-powered chat assistant for trip planning
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Total Cost</h3>
              <p className="text-gray-600 text-sm">
                Automatic calculation of total trip cost across all services
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
