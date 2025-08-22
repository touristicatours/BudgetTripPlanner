import { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Alert, LoadingSpinner, showToast } from '../components/ui/Kit';
import { AutoComplete } from '../components/ui/AutoComplete';
import { AIChat } from '../components/ui/AIChat';

export default function AllInOneDemoPage() {
  const [searchParams, setSearchParams] = useState({
    destination: 'Paris',
    startDate: '2024-12-01',
    endDate: '2024-12-03',
    travelers: 2
  });
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({});
  const [errors, setErrors] = useState({});

  // Predefined test scenarios
  const testScenarios = [
    {
      name: 'Week in Paris',
      params: { destination: 'Paris', startDate: '2024-12-01', endDate: '2024-12-07', travelers: 2 }
    },
    {
      name: 'Yogyakarta Adventure',
      params: { destination: 'Yogyakarta', startDate: '2024-12-01', endDate: '2024-12-05', travelers: 2 }
    },
    {
      name: 'New York Weekend',
      params: { destination: 'New York', startDate: '2024-12-01', endDate: '2024-12-03', travelers: 2 }
    },
    {
      name: 'London Getaway',
      params: { destination: 'London', startDate: '2024-12-01', endDate: '2024-12-04', travelers: 2 }
    }
  ];

  const handleSearch = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      const response = await fetch('http://localhost:4000/api/live/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
      
      // Track API status
      setApiStatus({
        flights: data.flightsLive || false,
        stays: data.staysLive || false,
        cars: data.carsLive || false,
        attractions: data.attractionsLive || false
      });

      showToast('Search completed successfully!', 'success');
    } catch (error) {
      console.error('Search error:', error);
      setErrors({ search: error.message });
      showToast('Search failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const runTestScenario = async (scenario) => {
    setSearchParams(scenario.params);
    setLoading(true);
    setErrors({});
    
    try {
      const response = await fetch('http://localhost:4000/api/live/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario.params)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
      
      setApiStatus({
        flights: data.flightsLive || false,
        stays: data.staysLive || false,
        cars: data.carsLive || false,
        attractions: data.attractionsLive || false
      });

      showToast(`${scenario.name} completed!`, 'success');
    } catch (error) {
      console.error('Test scenario error:', error);
      setErrors({ test: error.message });
      showToast(`Test scenario failed: ${error.message}`, 'error');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 All-in-One Trip Planner
          </h1>
          <p className="text-xl text-gray-600">
            Complete trip planning with real-time API integration
          </p>
        </div>

        {/* API Status Dashboard */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">API Status Dashboard</h2>
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
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Search & Test Scenarios */}
          <div className="lg:col-span-1 space-y-6">
            {/* Test Scenarios */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Quick Test Scenarios</h3>
                <div className="space-y-3">
                  {testScenarios.map((scenario, index) => (
                    <Button
                      key={index}
                      onClick={() => runTestScenario(scenario)}
                      disabled={loading}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <span className="mr-2">⚡</span>
                      {scenario.name}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Custom Search */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Custom Search</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination
                    </label>
                    <AutoComplete
                      value={searchParams.destination}
                      onChange={(e) => updateSearchParams('destination', e.target.value)}
                      onSelect={handleDestinationSelect}
                      placeholder="Enter destination..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={searchParams.startDate}
                        onChange={(e) => updateSearchParams('startDate', e.target.value)}
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
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Travelers
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={searchParams.travelers}
                      onChange={(e) => updateSearchParams('travelers', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? <LoadingSpinner /> : '🔍 Search Everything'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* AI Chat Assistant */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Travel Assistant</h3>
                <AIChat onEnhanceSearch={handleAIEnhancement} />
              </div>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Search Results</h3>
                
                {errors.search && (
                  <Alert variant="error" className="mb-4">
                    Search Error: {errors.search}
                  </Alert>
                )}

                {errors.test && (
                  <Alert variant="error" className="mb-4">
                    Test Error: {errors.test}
                  </Alert>
                )}

                {loading && (
                  <div className="text-center py-8">
                    <LoadingSpinner />
                    <p className="mt-2 text-gray-600">Searching across all APIs...</p>
                  </div>
                )}

                {results && !loading && (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">💰 Total Trip Cost</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Flights:</span>
                          <div className="text-lg font-semibold text-blue-600">
                            ${results.flights?.[0]?.price || 0}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Stays:</span>
                          <div className="text-lg font-semibold text-purple-600">
                            ${results.stays?.[0]?.price || 0}
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
                          <div className="text-lg font-semibold text-green-600">
                            ${results.attractions?.[0]?.price || 0}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xl font-bold text-gray-900">
                          Total: ${calculateTotalCost()}
                        </div>
                      </div>
                    </div>

                    {/* Flights */}
                    {results.flights?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">✈️ Flights</h4>
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
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">🏨 Stays</h4>
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
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">🚗 Car Rentals</h4>
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
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">🎯 Attractions</h4>
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
                                  <div className="text-lg font-bold text-green-600">${attraction.price}</div>
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

                    {!results.flights?.length && !results.stays?.length && !results.cars?.length && !results.attractions?.length && (
                      <div className="text-center py-8 text-gray-500">
                        No results found. Try a different search or check the API status.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
