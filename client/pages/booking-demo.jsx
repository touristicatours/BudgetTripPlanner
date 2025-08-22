import { useState } from 'react';
import { Card, Button, Input, Badge, Alert, LoadingSpinner, showToast } from '../components/ui/Kit';

export default function BookingDemoPage() {
  const [hotelId, setHotelId] = useState('558480');
  const [checkIn, setCheckIn] = useState('2024-12-01');
  const [checkOut, setCheckOut] = useState('2024-12-03');
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);

  const handleCheckAvailability = async () => {
    if (!hotelId.trim()) {
      showToast('Please enter a hotel ID', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/booking/availability/${hotelId}?checkIn=${checkIn}&checkOut=${checkOut}`);
      const data = await response.json();
      
      setAvailability(data.availability);
      setApiStatus({
        live: data.live,
        notice: data.notice
      });
      
      showToast(`Found ${data.availability?.availability?.length || 0} available days!`, 'success');
    } catch (error) {
      console.error('Booking availability error:', error);
      showToast('Availability check failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const popularHotels = [
    { id: '558480', name: 'Hotel Example 1' },
    { id: '123456', name: 'Hotel Example 2' },
    { id: '789012', name: 'Hotel Example 3' }
  ];

  const handleQuickCheck = (quickHotelId) => {
    setHotelId(quickHotelId);
    // Trigger availability check after setting the value
    setTimeout(() => {
      setHotelId(quickHotelId);
      handleCheckAvailability();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏨 Booking.com Hotel Availability Demo
          </h1>
          <p className="text-xl text-gray-600">
            Check real-time hotel availability with Booking.com API integration
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
                🔍 Check Availability
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hotel ID
                  </label>
                  <Input
                    value={hotelId}
                    onChange={(e) => setHotelId(e.target.value)}
                    placeholder="e.g., 558480"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Date
                  </label>
                  <Input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Date
                  </label>
                  <Input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={handleCheckAvailability}
                  disabled={loading || !hotelId.trim()}
                  className="w-full"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Check Availability'}
                </Button>
              </div>

              {/* Quick Check Buttons */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Quick Checks
                </h3>
                <div className="space-y-2">
                  {popularHotels.map((hotel) => (
                    <Button
                      key={hotel.id}
                      onClick={() => handleQuickCheck(hotel.id)}
                      variant="secondary"
                      size="sm"
                      className="w-full text-left justify-start"
                    >
                      {hotel.name} (ID: {hotel.id})
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
                📅 Availability Results
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                  <span className="ml-3 text-gray-600">Checking hotel availability...</span>
                </div>
              ) : availability ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Hotel ID: {availability.hotelId}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Available Days:</span>
                        <span className="ml-2 text-blue-600">{availability.availability?.length || 0}</span>
                      </div>
                      <div>
                        <span className="font-medium">Price Range:</span>
                        <span className="ml-2 text-blue-600">
                          ${availability.rates?.min || 0} - ${availability.rates?.max || 0}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Average Price:</span>
                        <span className="ml-2 text-blue-600">${availability.rates?.average || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Calendar */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Availability Calendar
                    </h3>
                    <div className="grid grid-cols-7 gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                      
                      {availability.calendar?.slice(0, 35).map((day, index) => (
                        <div
                          key={index}
                          className={`p-2 text-center text-sm rounded-lg border ${
                            day.available 
                              ? 'bg-green-100 border-green-300 text-green-800' 
                              : 'bg-red-100 border-red-300 text-red-800'
                          }`}
                        >
                          <div className="font-medium">
                            {new Date(day.date).getDate()}
                          </div>
                          {day.available && (
                            <div className="text-xs">
                              ${day.price}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Available Days List */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Available Dates
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {availability.availability?.slice(0, 12).map((day, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-3 hover:border-green-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">
                                {new Date(day.date).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-600">
                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">
                                ${day.price}
                              </div>
                              <div className="text-xs text-gray-500">
                                Min stay: {day.minLengthOfStay} night{day.minLengthOfStay !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏨</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No availability data
                  </h3>
                  <p className="text-gray-600">
                    Enter a hotel ID and check availability to see results
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Integration Info */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            🔗 Booking.com Integration Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Availability</h3>
              <p className="text-gray-600 text-sm">
                Check hotel availability with live Booking.com data
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dynamic Pricing</h3>
              <p className="text-gray-600 text-sm">
                Real-time pricing information for each available date
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rich Data</h3>
              <p className="text-gray-600 text-sm">
                Detailed availability with minimum stay requirements
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
