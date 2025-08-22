import { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Alert, LoadingSpinner, showToast } from '../components/ui/Kit';
import { AutoComplete } from '../components/ui/AutoComplete';
import { AIChat } from '../components/ui/AIChat';

export default function UnifiedDemoPage() {
  const [activeTab, setActiveTab] = useState('overview');
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
  const [selectedScenario, setSelectedScenario] = useState(null);

  // Predefined test scenarios
  const testScenarios = [
    {
      id: 'paris-week',
      name: 'Week in Paris',
      description: 'Complete Paris experience with all attractions',
      icon: '🗼',
      params: { destination: 'Paris', startDate: '2024-12-01', endDate: '2024-12-07', travelers: 2 },
      highlights: ['Eiffel Tower', 'Louvre Museum', 'Seine Cruise', 'Versailles']
    },
    {
      id: 'yogyakarta-adventure',
      name: 'Yogyakarta Adventure',
      description: 'Indonesian temple exploration with live data',
      icon: '🏛️',
      params: { destination: 'Yogyakarta', startDate: '2024-12-01', endDate: '2024-12-05', travelers: 2 },
      highlights: ['Borobudur Temple', 'Prambanan Temple', 'Mount Merapi', 'Sultan Palace']
    },
    {
      id: 'nyc-weekend',
      name: 'New York Weekend',
      description: 'Fast-paced NYC experience',
      icon: '🗽',
      params: { destination: 'New York', startDate: '2024-12-01', endDate: '2024-12-03', travelers: 2 },
      highlights: ['Empire State Building', 'Times Square', 'Central Park', 'Broadway']
    },
    {
      id: 'london-getaway',
      name: 'London Getaway',
      description: 'British culture and history',
      icon: '🇬🇧',
      params: { destination: 'London', startDate: '2024-12-01', endDate: '2024-12-04', travelers: 2 },
      highlights: ['Big Ben', 'British Museum', 'Buckingham Palace', 'Westminster Abbey']
    }
  ];

  const handleSearch = async () => {
    setLoading(true);
    setErrors({});
    setActiveTab('results');
    
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
    setSelectedScenario(scenario);
    setSearchParams(scenario.params);
    setLoading(true);
    setErrors({});
    setActiveTab('results');
    
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

  const handleBookFlight = async (flight) => {
    try {
      const userInfo = { userId: 'user_1', name: 'Demo User' };
      const contactInfo = { email: 'demo@example.com', phone: '+1234567890' };
      
      const response = await fetch('http://localhost:4000/api/bookings/flight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightId: flight.id,
          flightData: { ...flight, travelers: searchParams.travelers },
          userInfo,
          contactInfo
        })
      });
      
      const result = await response.json();
      if (result.success) {
        showToast(result.message, 'success');
      } else {
        showToast('Failed to book flight', 'error');
      }
    } catch (error) {
      console.error('Error booking flight:', error);
      showToast('Failed to book flight', 'error');
    }
  };

  const handleBookHotel = async (hotel) => {
    try {
      const userInfo = { userId: 'user_1', name: 'Demo User' };
      const contactInfo = { email: 'demo@example.com', phone: '+1234567890' };
      
      const response = await fetch('http://localhost:4000/api/bookings/hotel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId: hotel.id,
          hotelData: {
            name: hotel.name,
            price: hotel.price,
            checkIn: searchParams.startDate,
            checkOut: searchParams.endDate,
            guests: searchParams.travelers
          },
          userInfo,
          contactInfo
        })
      });
      
      const result = await response.json();
      if (result.success) {
        showToast(result.message, 'success');
      } else {
        showToast('Failed to book hotel', 'error');
      }
    } catch (error) {
      console.error('Error booking hotel:', error);
      showToast('Failed to book hotel', 'error');
    }
  };

  const handleBookCar = async (car) => {
    try {
      const userInfo = { userId: 'user_1', name: 'Demo User' };
      const contactInfo = { email: 'demo@example.com', phone: '+1234567890' };
      
      const response = await fetch('http://localhost:4000/api/bookings/car', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: car.id,
          carData: {
            carType: car.type,
            company: car.company,
            total: car.total,
            pickUpDate: searchParams.startDate,
            dropOffDate: searchParams.endDate
          },
          userInfo,
          contactInfo
        })
      });
      
      const result = await response.json();
      if (result.success) {
        showToast(result.message, 'success');
      } else {
        showToast('Failed to book car', 'error');
      }
    } catch (error) {
      console.error('Error booking car:', error);
      showToast('Failed to book car', 'error');
    }
  };

  const handleBookAttraction = async (attraction) => {
    try {
      const userInfo = { userId: 'user_1', name: 'Demo User' };
      const contactInfo = { email: 'demo@example.com', phone: '+1234567890' };
      
      const response = await fetch('http://localhost:4000/api/bookings/attraction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attractionId: attraction.id,
          attractionData: {
            name: attraction.name,
            price: attraction.price,
            date: searchParams.startDate,
            tickets: searchParams.travelers
          },
          userInfo,
          contactInfo
        })
      });
      
      const result = await response.json();
      if (result.success) {
        showToast(result.message, 'success');
      } else {
        showToast('Failed to book attraction', 'error');
      }
    } catch (error) {
      console.error('Error booking attraction:', error);
      showToast('Failed to book attraction', 'error');
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '🏠' },
    { id: 'search', name: 'Search', icon: '🔍' },
    { id: 'results', name: 'Results', icon: '📊' },
    { id: 'ai', name: 'AI Assistant', icon: '🤖' },
    { id: 'status', name: 'API Status', icon: '⚡' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🚀 BudgetTripPlanner
              </h1>
              <p className="text-gray-600 mt-1">
                Complete trip planning with real-time API integration
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="success" className="text-sm">
                All Systems Operational
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Hero Section */}
              <div className="text-center py-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Plan Your Perfect Trip
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Discover flights, hotels, car rentals, and attractions all in one place. 
                  Get real-time pricing and availability from multiple travel APIs.
                </p>
                <Button onClick={() => setActiveTab('search')} size="lg">
                  Start Planning Now
                </Button>
              </div>

              {/* Quick Start Scenarios */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Quick Start Scenarios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {testScenarios.map((scenario) => (
                    <Card key={scenario.id} className="hover:shadow-lg transition-shadow duration-200">
                      <div className="p-6">
                        <div className="text-4xl mb-4">{scenario.icon}</div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {scenario.name}
                        </h4>
                        <p className="text-gray-600 text-sm mb-4">
                          {scenario.description}
                        </p>
                        <div className="space-y-2 mb-4">
                          {scenario.highlights.map((highlight, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-500">
                              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                              {highlight}
                            </div>
                          ))}
                        </div>
                        <Button
                          onClick={() => runTestScenario(scenario)}
                          className="w-full"
                          variant="outline"
                        >
                          Try This Trip
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Features Grid */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <div className="p-6 text-center">
                      <div className="text-3xl mb-4">✈️</div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Flight Search</h4>
                      <p className="text-gray-600">Real-time flight prices and availability from Skyscanner</p>
                    </div>
                  </Card>
                  <Card>
                    <div className="p-6 text-center">
                      <div className="text-3xl mb-4">🏨</div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Hotel Booking</h4>
                      <p className="text-gray-600">Find the perfect stay with Booking.com integration</p>
                    </div>
                  </Card>
                  <Card>
                    <div className="p-6 text-center">
                      <div className="text-3xl mb-4">🎯</div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Attractions</h4>
                      <p className="text-gray-600">Discover local attractions and activities</p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <div className="p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Plan Your Trip</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination
                      </label>
                      <AutoComplete
                        value={searchParams.destination}
                        onChange={(e) => updateSearchParams('destination', e.target.value)}
                        onSelect={handleDestinationSelect}
                        placeholder="Where do you want to go?"
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
                        Number of Travelers
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
                      size="lg"
                    >
                      {loading ? <LoadingSpinner /> : '🔍 Search Everything'}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              {errors.search && (
                <Alert variant="error">
                  Search Error: {errors.search}
                </Alert>
              )}

              {errors.test && (
                <Alert variant="error">
                  Test Error: {errors.test}
                </Alert>
              )}

              {loading && (
                <div className="text-center py-12">
                  <LoadingSpinner />
                  <p className="mt-4 text-gray-600">Searching across all APIs...</p>
                </div>
              )}

              {results && !loading && (
                <div className="space-y-6">
                  {/* Cost Summary */}
                  <Card>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">💰 Trip Cost Summary</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl mb-2">✈️</div>
                          <div className="text-sm text-gray-600">Flights</div>
                          <div className="text-lg font-bold text-blue-600">
                            ${results.flights?.[0]?.price || 0}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl mb-2">🏨</div>
                          <div className="text-sm text-gray-600">Hotels</div>
                          <div className="text-lg font-bold text-purple-600">
                            ${results.stays?.[0]?.price || 0}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl mb-2">🚗</div>
                          <div className="text-sm text-gray-600">Cars</div>
                          <div className="text-lg font-bold text-orange-600">
                            ${results.cars?.[0]?.total || 0}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl mb-2">🎯</div>
                          <div className="text-sm text-gray-600">Attractions</div>
                          <div className="text-lg font-bold text-green-600">
                            ${results.attractions?.[0]?.price || 0}
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            Total: ${calculateTotalCost()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Results Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Flights */}
                    {results.flights?.length > 0 && (
                      <Card>
                        <div className="p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">✈️</span>
                            Flights
                            <Badge variant={results.flightsLive ? 'success' : 'warning'} className="ml-2">
                              {results.flightsLive ? 'Live' : 'Mock'}
                            </Badge>
                          </h4>
                          <div className="space-y-3">
                            {results.flights.slice(0, 3).map((flight, index) => (
                              <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-semibold">{flight.airline}</div>
                                    <div className="text-sm text-gray-600">
                                      {flight.origin} → {flight.destination}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {flight.depart} - {flight.arrive} ({flight.durationHours}h)
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-blue-600">${flight.total}</div>
                                    <Button
                                      onClick={() => handleBookFlight(flight)}
                                      variant="primary"
                                      size="small"
                                      className="mt-2"
                                    >
                                      Book Flight
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Stays */}
                    {results.stays?.length > 0 && (
                      <Card>
                        <div className="p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">🏨</span>
                            Hotels
                            <Badge variant={results.staysLive ? 'success' : 'warning'} className="ml-2">
                              {results.staysLive ? 'Live' : 'Mock'}
                            </Badge>
                          </h4>
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
                                    <Button
                                      onClick={() => handleBookHotel(stay)}
                                      variant="primary"
                                      size="small"
                                      className="mt-2"
                                    >
                                      Book Hotel
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Cars */}
                    {results.cars?.length > 0 && (
                      <Card>
                        <div className="p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">🚗</span>
                            Car Rentals
                            <Badge variant={results.carsLive ? 'success' : 'warning'} className="ml-2">
                              {results.carsLive ? 'Live' : 'Mock'}
                            </Badge>
                          </h4>
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
                                    <Button
                                      onClick={() => handleBookCar(car)}
                                      variant="primary"
                                      size="small"
                                      className="mt-2"
                                    >
                                      Book Car
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Attractions */}
                    {results.attractions?.length > 0 && (
                      <Card>
                        <div className="p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">🎯</span>
                            Attractions
                            <Badge variant={results.attractionsLive ? 'success' : 'warning'} className="ml-2">
                              {results.attractionsLive ? 'Live' : 'Mock'}
                            </Badge>
                          </h4>
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
                                    <Button
                                      onClick={() => handleBookAttraction(attraction)}
                                      variant="primary"
                                      size="small"
                                      className="mt-2"
                                    >
                                      Book Tickets
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>

                  {!results.flights?.length && !results.stays?.length && !results.cars?.length && !results.attractions?.length && (
                    <Card>
                      <div className="p-12 text-center">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
                        <p className="text-gray-600 mb-4">Try a different search or check the API status.</p>
                        <Button onClick={() => setActiveTab('search')}>
                          Try Another Search
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI Assistant Tab */}
          {activeTab === 'ai' && (
            <div className="max-w-4xl mx-auto">
              <Card>
                <div className="p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">🤖 AI Travel Assistant</h3>
                  <p className="text-gray-600 mb-6">
                    Get personalized travel recommendations and enhance your search with AI assistance.
                  </p>
                  <AIChat onEnhanceSearch={handleAIEnhancement} />
                </div>
              </Card>
            </div>
          )}

          {/* API Status Tab */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              <Card>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">⚡ API Status Dashboard</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 text-center">
                      <div className="text-3xl mb-2">✈️</div>
                      <div className="font-semibold">Flights</div>
                      <Badge variant={apiStatus.flights ? 'success' : 'warning'} className="mt-2">
                        {apiStatus.flights ? 'Live' : 'Mock'}
                      </Badge>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-3xl mb-2">🏨</div>
                      <div className="font-semibold">Hotels</div>
                      <Badge variant={apiStatus.stays ? 'success' : 'warning'} className="mt-2">
                        {apiStatus.stays ? 'Live' : 'Mock'}
                      </Badge>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-3xl mb-2">🚗</div>
                      <div className="font-semibold">Cars</div>
                      <Badge variant={apiStatus.cars ? 'success' : 'warning'} className="mt-2">
                        {apiStatus.cars ? 'Live' : 'Mock'}
                      </Badge>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-3xl mb-2">🎯</div>
                      <div className="font-semibold">Attractions</div>
                      <Badge variant={apiStatus.attractions ? 'success' : 'warning'} className="mt-2">
                        {apiStatus.attractions ? 'Live' : 'Mock'}
                      </Badge>
                    </Card>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">System Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Server Status:</span>
                        <Badge variant="success">Online</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">API Version:</span>
                        <span className="font-medium">v1.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">
                          {typeof window !== 'undefined' 
                            ? new Date().toLocaleString() 
                            : new Date().toISOString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
                    <div className="space-y-3">
                      <Button onClick={() => setActiveTab('search')} className="w-full" variant="outline">
                        🔍 New Search
                      </Button>
                      <Button onClick={() => setActiveTab('overview')} className="w-full" variant="outline">
                        🏠 Back to Overview
                      </Button>
                      <Button onClick={() => setActiveTab('ai')} className="w-full" variant="outline">
                        🤖 AI Assistant
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
