import { useState } from 'react';
import { Card, Button, Input, Select, Badge, Alert, LoadingSpinner, showToast } from '../components/ui/Kit';
import { AutoComplete } from '../components/ui/AutoComplete';
import { AIChat } from '../components/ui/AIChat';

export default function DemoPage() {
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 2
  });
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [testScenarios, setTestScenarios] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);

  // Predefined test scenarios to showcase different combinations
  const predefinedTests = [
    {
      id: 'scenario-1',
      name: '🌍 International Adventure',
      description: 'Test auto-complete + map-based search for international destinations',
      params: {
        origin: 'NYC',
        destination: 'Tokyo',
        startDate: '2024-06-01',
        endDate: '2024-06-08',
        travelers: 2
      },
      expected: {
        flights: '6+ flights',
        stays: '6+ stays (map-based)',
        cars: '6+ car rentals',
        features: ['Auto-complete', 'Map-based search', 'International pricing']
      }
    },
    {
      id: 'scenario-2',
      name: '🇪🇺 European Getaway',
      description: 'Test European destinations with multiple travelers',
      params: {
        origin: 'LAX',
        destination: 'Paris',
        startDate: '2024-07-15',
        endDate: '2024-07-22',
        travelers: 4
      },
      expected: {
        flights: '6+ flights',
        stays: '6+ stays (map-based)',
        cars: '6+ car rentals',
        features: ['Multi-traveler pricing', 'European destinations', 'Summer dates']
      }
    },
    {
      id: 'scenario-3',
      name: '🇺🇸 Domestic Trip',
      description: 'Test domestic US travel with different accommodation types',
      params: {
        origin: 'CHI',
        destination: 'Miami',
        startDate: '2024-08-10',
        endDate: '2024-08-15',
        travelers: 2
      },
      expected: {
        flights: '6+ flights',
        stays: '6+ stays (map-based)',
        cars: '6+ car rentals',
        features: ['Domestic pricing', 'Hotel variety', 'Short trip']
      }
    },
    {
      id: 'scenario-4',
      name: '🎯 Auto-Complete Demo',
      description: 'Test the intelligent destination suggestions',
      params: {
        origin: 'SFO',
        destination: '', // Will be filled by auto-complete
        startDate: '2024-09-01',
        endDate: '2024-09-07',
        travelers: 3
      },
      expected: {
        flights: '6+ flights',
        stays: '6+ stays (map-based)',
        cars: '6+ car rentals',
        features: ['Smart suggestions', 'Real-time search', 'Multiple options']
      }
    }
  ];

  const handleSearch = async () => {
    if (!searchParams.destination || !searchParams.startDate || !searchParams.endDate) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/live/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      });
      
      const data = await response.json();
      setSearchResults(data);
      
      // Add to test scenarios
      const newTest = {
        id: `test-${Date.now()}`,
        name: `🔍 Custom Search: ${searchParams.destination}`,
        description: `Search for ${searchParams.travelers} travelers from ${searchParams.origin || 'Any'} to ${searchParams.destination}`,
        params: { ...searchParams },
        results: data,
        timestamp: new Date().toISOString()
      };
      setTestScenarios(prev => [newTest, ...prev.slice(0, 4)]);
      
      showToast('Search completed successfully!', 'success');
    } catch (error) {
      console.error('Search error:', error);
      showToast('Search failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const runPredefinedTest = async (test) => {
    setCurrentTest(test);
    setSearchParams(test.params);
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:4000/api/live/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.params)
      });
      
      const data = await response.json();
      setSearchResults(data);
      
      // Add to test scenarios
      const newTest = {
        ...test,
        results: data,
        timestamp: new Date().toISOString()
      };
      setTestScenarios(prev => [newTest, ...prev.slice(0, 4)]);
      
      showToast(`${test.name} completed!`, 'success');
    } catch (error) {
      console.error('Test error:', error);
      showToast('Test failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDestinationSelect = (destination) => {
    setSelectedDestination(destination);
    showToast(`Selected: ${destination.fullName}`, 'success');
  };

  const updateSearchParams = (field, value) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  const handleAIEnhancement = (enhancedParams, suggestions) => {
    setSearchParams(prev => ({ ...prev, ...enhancedParams }));
    showToast(`AI enhanced your search with ${suggestions.length} suggestions!`, 'success');
  };

  const calculateTotalCost = () => {
    if (!searchResults) return 0;
    
    const flightCost = searchResults.flights?.[0]?.price || 0;
    const stayCost = searchResults.stays?.[0]?.total || 0;
    const carCost = searchResults.cars?.[0]?.total || 0;
    
    return flightCost + stayCost + carCost;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 BudgetTripPlanner Integration Demo
          </h1>
          <p className="text-xl text-gray-600">
            Experience how auto-complete, map-based search, and car rentals work together
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Test Scenarios */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                🧪 Test Scenarios
              </h2>
              
              <div className="space-y-4">
                {predefinedTests.map((test) => (
                  <div key={test.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">{test.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                    
                    <div className="text-xs text-gray-500 mb-3">
                      <div><strong>From:</strong> {test.params.origin || 'Any'}</div>
                      <div><strong>To:</strong> {test.params.destination}</div>
                      <div><strong>Travelers:</strong> {test.params.travelers}</div>
                      <div><strong>Duration:</strong> {Math.ceil((new Date(test.params.endDate) - new Date(test.params.startDate)) / (24*3600*1000))} days</div>
                    </div>

                    <div className="space-y-1 mb-3">
                      {test.expected.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-xs">
                          <span className="text-green-500 mr-1">✓</span>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => runPredefinedTest(test)}
                      disabled={loading}
                      size="sm"
                      className="w-full"
                    >
                      {loading && currentTest?.id === test.id ? (
                        <div className="flex items-center space-x-2">
                          <LoadingSpinner size="xs" />
                          <span>Running...</span>
                        </div>
                      ) : (
                        'Run Test'
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Search Form */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                🔍 Custom Search
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origin
                  </label>
                  <Input
                    value={searchParams.origin}
                    onChange={(e) => updateSearchParams('origin', e.target.value)}
                    placeholder="e.g., NYC, LAX, CHI"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination *
                  </label>
                  <AutoComplete
                    value={searchParams.destination}
                    onChange={(e) => updateSearchParams('destination', e.target.value)}
                    placeholder="Start typing to see suggestions..."
                    onSelect={handleDestinationSelect}
                    className="w-full"
                  />
                  {selectedDestination && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm text-green-800">
                          Selected: {selectedDestination.fullName}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
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
                      End Date *
                    </label>
                    <Input
                      type="date"
                      value={searchParams.endDate}
                      onChange={(e) => updateSearchParams('endDate', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travelers
                  </label>
                  <Select
                    value={searchParams.travelers}
                    onChange={(e) => updateSearchParams('travelers', parseInt(e.target.value))}
                    className="w-full"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Traveler' : 'Travelers'}</option>
                    ))}
                  </Select>
                </div>

                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span>Searching...</span>
                    </div>
                  ) : (
                    '🔍 Search Everything'
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* AI Chat Assistant */}
          <div className="lg:col-span-1">
            <AIChat onEnhanceSearch={handleAIEnhancement} />
          </div>

          {/* Results Display */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                📊 Integration Results
              </h2>
              
              {!searchResults && !loading && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-500">
                    Run a test scenario or perform a custom search to see integration results
                  </p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-500 mt-4">Testing integration...</p>
                </div>
              )}

              {searchResults && (
                <div className="space-y-6">
                  {/* Integration Status */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl mb-1">✈️</div>
                      <div className="text-sm font-medium text-blue-800">Flights</div>
                      <div className="text-xs text-blue-600">
                        {searchResults.flightsLive ? 'Live API' : 'Mock Data'}
                      </div>
                      <div className="text-lg font-bold text-blue-900">
                        {searchResults.flights?.length || 0}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl mb-1">🏨</div>
                      <div className="text-sm font-medium text-green-800">Stays</div>
                      <div className="text-xs text-green-600">
                        {searchResults.staysLive ? 'Map-Based' : 'Mock Data'}
                      </div>
                      <div className="text-lg font-bold text-green-900">
                        {searchResults.stays?.length || 0}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl mb-1">🚗</div>
                      <div className="text-sm font-medium text-purple-800">Cars</div>
                      <div className="text-xs text-purple-600">
                        {searchResults.carsLive ? 'Live API' : 'Mock Data'}
                      </div>
                      <div className="text-lg font-bold text-purple-900">
                        {searchResults.cars?.length || 0}
                      </div>
                    </div>
                  </div>

                  {/* Total Cost Estimate */}
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-gray-900 mb-2">💰 Total Cost Estimate</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Flight:</span>
                        <div className="font-semibold">${searchResults.flights?.[0]?.price || 0}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Stay:</span>
                        <div className="font-semibold">${searchResults.stays?.[0]?.total || 0}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Car:</span>
                        <div className="font-semibold">${searchResults.cars?.[0]?.total || 0}</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-orange-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold text-orange-600">${calculateTotalCost()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Results */}
                  {searchResults.stays && searchResults.stays.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        🏨 Sample Accommodations
                      </h3>
                      <div className="space-y-2">
                        {searchResults.stays.slice(0, 2).map((stay, index) => (
                          <div key={stay.id} className="p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{stay.name}</div>
                                <div className="text-sm text-gray-500">
                                  {stay.stars}⭐ • {stay.type}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">${stay.nightly}/night</div>
                                <div className="text-sm text-gray-500">${stay.total} total</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Integration Notices */}
                  <div className="space-y-2">
                    {searchResults.flightsNotice && (
                      <Alert type="info" title="Flights Integration">
                        {searchResults.flightsNotice}
                      </Alert>
                    )}
                    {searchResults.staysNotice && (
                      <Alert type="info" title="Map-Based Search">
                        {searchResults.staysNotice}
                      </Alert>
                    )}
                    {searchResults.carsNotice && (
                      <Alert type="info" title="Car Rental Integration">
                        {searchResults.carsNotice}
                      </Alert>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Test History */}
        {testScenarios.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              📈 Test History & Integration Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testScenarios.map((test, index) => (
                <Card key={test.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{test.name}</h3>
                    <Badge variant="primary">
                      {typeof window !== 'undefined' 
                        ? new Date(test.timestamp).toLocaleTimeString() 
                        : new Date(test.timestamp).toISOString()}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{test.description}</p>
                  
                  {test.results && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Flights:</span>
                        <span className="font-medium">{test.results.flights?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Stays:</span>
                        <span className="font-medium">{test.results.stays?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cars:</span>
                        <span className="font-medium">{test.results.cars?.length || 0}</span>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Total Cost:</span>
                          <span className="text-orange-600">
                            ${(test.results.flights?.[0]?.price || 0) + 
                              (test.results.stays?.[0]?.total || 0) + 
                              (test.results.cars?.[0]?.total || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Integration Features */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            🔗 How Everything Works Together
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Auto-Complete</h3>
              <p className="text-gray-600 text-sm">
                Real-time destination suggestions with 25+ popular cities worldwide
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Map-Based Search</h3>
              <p className="text-gray-600 text-sm">
                Geographic bounding boxes for precise location-based accommodation results
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Car Rentals</h3>
              <p className="text-gray-600 text-sm">
                Complete vehicle rental integration with multiple types and pricing
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cost Integration</h3>
              <p className="text-gray-600 text-sm">
                Automatic total cost calculation combining flights, stays, and cars
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
