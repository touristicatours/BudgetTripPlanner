import { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Alert, LoadingSpinner, showToast } from '../components/ui/Kit';

export default function BookingsManagerPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [bookingForm, setBookingForm] = useState({
    type: 'flight',
    serviceId: '',
    serviceName: '',
    price: 0,
    travelers: 1,
    dates: { start: '', end: '' },
    userInfo: { name: '', email: '', phone: '' },
    contactInfo: { email: '', phone: '' },
    specialRequests: ''
  });

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`http://localhost:4000/api/bookings?${queryParams}`);
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showToast('Failed to fetch bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingForm)
      });
      
      const result = await response.json();
      if (result.success) {
        showToast(result.message, 'success');
        setShowBookingForm(false);
        setBookingForm({
          type: 'flight',
          serviceId: '',
          serviceName: '',
          price: 0,
          travelers: 1,
          dates: { start: '', end: '' },
          userInfo: { name: '', email: '', phone: '' },
          contactInfo: { email: '', phone: '' },
          specialRequests: ''
        });
        fetchBookings();
      } else {
        showToast('Failed to create booking', 'error');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      showToast('Failed to create booking', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId, reason = '') => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      const result = await response.json();
      if (result.success) {
        showToast(result.message, 'success');
        fetchBookings();
      } else {
        showToast('Failed to cancel booking', 'error');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showToast('Failed to cancel booking', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (bookingId, note) => {
    try {
      const response = await fetch(`http://localhost:4000/api/bookings/${bookingId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });
      
      const result = await response.json();
      if (result.success) {
        showToast('Note added successfully', 'success');
        fetchBookings();
      } else {
        showToast('Failed to add note', 'error');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      showToast('Failed to add note', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'yellow';
      case 'cancelled': return 'red';
      case 'completed': return 'blue';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'flight': return '✈️';
      case 'hotel': return '🏨';
      case 'car': return '🚗';
      case 'attraction': return '🎯';
      default: return '📋';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Manager</h1>
          <p className="text-gray-600">Manage all your travel bookings in one place</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Types</option>
                <option value="flight">Flight</option>
                <option value="hotel">Hotel</option>
                <option value="car">Car</option>
                <option value="attraction">Attraction</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <Button onClick={() => setShowBookingForm(true)} variant="primary">
              + New Booking
            </Button>
            <Button onClick={fetchBookings} variant="secondary">
              Refresh
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Bookings List */}
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{getTypeIcon(booking.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{booking.serviceName}</h3>
                      <Badge color={getStatusColor(booking.status)}>{booking.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Price:</span> {formatPrice(booking.price)}
                      </div>
                      <div>
                        <span className="font-medium">Travelers:</span> {booking.travelers}
                      </div>
                      <div>
                        <span className="font-medium">Dates:</span> {formatDate(booking.dates.start)} - {formatDate(booking.dates.end)}
                      </div>
                      <div>
                        <span className="font-medium">Confirmation:</span> {booking.confirmationCode}
                      </div>
                    </div>
                    {booking.notes && booking.notes.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Notes:</div>
                        <div className="space-y-1">
                          {booking.notes.slice(-2).map((note) => (
                            <div key={note.id} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              {note.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => setSelectedBooking(booking)}
                    variant="secondary"
                    size="small"
                  >
                    View Details
                  </Button>
                  {booking.status === 'pending' || booking.status === 'confirmed' ? (
                    <Button
                      onClick={() => handleCancelBooking(booking.id)}
                      variant="danger"
                      size="small"
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {bookings.length === 0 && !loading && (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-4">Create your first booking to get started</p>
            <Button onClick={() => setShowBookingForm(true)} variant="primary">
              Create Booking
            </Button>
          </Card>
        )}

        {/* Booking Form Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create New Booking</h2>
                <Button
                  onClick={() => setShowBookingForm(false)}
                  variant="secondary"
                  size="small"
                >
                  ✕
                </Button>
              </div>
              
              <form onSubmit={handleCreateBooking} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                    <select
                      value={bookingForm.type}
                      onChange={(e) => setBookingForm({ ...bookingForm, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="flight">Flight</option>
                      <option value="hotel">Hotel</option>
                      <option value="car">Car</option>
                      <option value="attraction">Attraction</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                    <Input
                      value={bookingForm.serviceName}
                      onChange={(e) => setBookingForm({ ...bookingForm, serviceName: e.target.value })}
                      placeholder="e.g., American Airlines - JFK to CDG"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <Input
                      type="number"
                      value={bookingForm.price}
                      onChange={(e) => setBookingForm({ ...bookingForm, price: parseFloat(e.target.value) })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Travelers</label>
                    <Input
                      type="number"
                      value={bookingForm.travelers}
                      onChange={(e) => setBookingForm({ ...bookingForm, travelers: parseInt(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <Input
                      type="date"
                      value={bookingForm.dates.start}
                      onChange={(e) => setBookingForm({ 
                        ...bookingForm, 
                        dates: { ...bookingForm.dates, start: e.target.value }
                      })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <Input
                      type="date"
                      value={bookingForm.dates.end}
                      onChange={(e) => setBookingForm({ 
                        ...bookingForm, 
                        dates: { ...bookingForm.dates, end: e.target.value }
                      })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <Input
                    type="email"
                    value={bookingForm.contactInfo.email}
                    onChange={(e) => setBookingForm({ 
                      ...bookingForm, 
                      contactInfo: { ...bookingForm.contactInfo, email: e.target.value }
                    })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                  <textarea
                    value={bookingForm.specialRequests}
                    onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows="3"
                    placeholder="Any special requests or notes..."
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? <LoadingSpinner size="small" /> : 'Create Booking'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Booking Details</h2>
                <Button
                  onClick={() => setSelectedBooking(null)}
                  variant="secondary"
                  size="small"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(selectedBooking.type)}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedBooking.serviceName}</h3>
                    <Badge color={getStatusColor(selectedBooking.status)}>{selectedBooking.status}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Confirmation Code:</span>
                    <div className="text-gray-600">{selectedBooking.confirmationCode}</div>
                  </div>
                  <div>
                    <span className="font-medium">Booking Date:</span>
                    <div className="text-gray-600">{formatDate(selectedBooking.bookingDate)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Price:</span>
                    <div className="text-gray-600">{formatPrice(selectedBooking.price)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Travelers:</span>
                    <div className="text-gray-600">{selectedBooking.travelers}</div>
                  </div>
                  <div>
                    <span className="font-medium">Start Date:</span>
                    <div className="text-gray-600">{formatDate(selectedBooking.dates.start)}</div>
                  </div>
                  <div>
                    <span className="font-medium">End Date:</span>
                    <div className="text-gray-600">{formatDate(selectedBooking.dates.end)}</div>
                  </div>
                </div>

                {selectedBooking.notes && selectedBooking.notes.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <div className="space-y-2">
                      {selectedBooking.notes.map((note) => (
                        <div key={note.id} className="bg-gray-50 p-3 rounded text-sm">
                          <div className="text-gray-600">{note.text}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {typeof window !== 'undefined' 
                              ? new Date(note.timestamp).toLocaleString() 
                              : new Date(note.timestamp).toISOString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4">
                  {selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed' ? (
                    <Button
                      onClick={() => {
                        handleCancelBooking(selectedBooking.id);
                        setSelectedBooking(null);
                      }}
                      variant="danger"
                    >
                      Cancel Booking
                    </Button>
                  ) : null}
                  <Button
                    onClick={() => setSelectedBooking(null)}
                    variant="secondary"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
