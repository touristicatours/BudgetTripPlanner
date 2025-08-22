import { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert, LoadingSpinner } from '../components/ui/Kit';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Load bookings from localStorage
    const savedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    setBookings(savedBookings);
    setLoading(false);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'pending': return '⏳';
      case 'cancelled': return '❌';
      case 'completed': return '🎉';
      default: return '📋';
    }
  };

  const cancelBooking = (bookingId) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled', cancelledAt: new Date().toISOString() }
          : booking
      );
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
      setBookings(updatedBookings);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">Manage all your travel bookings in one place</p>
        </div>
        <Button onClick={() => window.history.back()}>
          Back to Planning
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {[
          { key: 'all', label: 'All Bookings', count: bookings.length },
          { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
          { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
          { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
          { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gradient-sunset rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? "You haven't made any bookings yet. Start planning your trip to create bookings!"
              : `No ${filter} bookings found.`
            }
          </p>
          {filter === 'all' && (
            <Button onClick={() => window.location.href = '/plan'}>
              Start Planning
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{getStatusIcon(booking.status)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.type === 'flight' && '✈️'} 
                        {booking.type === 'hotel' && '🏨'} 
                        {booking.type === 'activity' && '🎯'} 
                        {booking.type === 'restaurant' && '🍽️'} 
                        {booking.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Booking ID: {booking.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">
                        {typeof window !== 'undefined' 
                          ? new Date(booking.date).toLocaleDateString() 
                          : new Date(booking.date).toISOString().split('T')[0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-medium text-orange-600">${booking.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Booked On</p>
                      <p className="font-medium">
                        {typeof window !== 'undefined' 
                          ? new Date(booking.bookedAt).toLocaleDateString() 
                          : new Date(booking.bookedAt).toISOString().split('T')[0]}
                      </p>
                    </div>
                  </div>

                  {booking.details && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-600 mb-1">Details:</p>
                      <p className="text-sm">{booking.details}</p>
                    </div>
                  )}

                  {booking.status === 'confirmed' && (
                    <Alert variant="success" className="mb-4">
                      <strong>Confirmed!</strong> Your booking is confirmed. Check your email for details.
                    </Alert>
                  )}

                  {booking.status === 'pending' && (
                    <Alert variant="warning" className="mb-4">
                      <strong>Pending Confirmation</strong> We're processing your booking. You'll receive confirmation soon.
                    </Alert>
                  )}

                  {booking.status === 'cancelled' && (
                    <Alert variant="danger" className="mb-4">
                      <strong>Cancelled</strong> This booking has been cancelled.
                      {booking.cancelledAt && (
                        <span className="block text-sm">
                          Cancelled on: {typeof window !== 'undefined' 
                            ? new Date(booking.cancelledAt).toLocaleDateString() 
                            : new Date(booking.cancelledAt).toISOString().split('T')[0]}
                        </span>
                      )}
                    </Alert>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  {booking.status === 'confirmed' && (
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  )}
                  {booking.status === 'pending' && (
                    <Button variant="outline" size="sm" onClick={() => cancelBooking(booking.id)}>
                      Cancel
                    </Button>
                  )}
                  {booking.status === 'confirmed' && (
                    <Button variant="outline" size="sm" onClick={() => cancelBooking(booking.id)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Summary */}
      {bookings.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
              <p className="text-sm text-gray-600">Total Bookings</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                ${bookings.reduce((sum, b) => sum + b.price, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
              <p className="text-sm text-gray-600">Confirmed</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

