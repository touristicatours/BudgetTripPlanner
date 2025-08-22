/* Booking management provider for all travel services */

// In-memory storage for bookings (in production, this would be a database)
let bookings = [];
let bookingIdCounter = 1;

export async function createBooking(bookingData) {
  const {
    type, // 'flight', 'hotel', 'car', 'attraction'
    serviceId,
    serviceName,
    price,
    travelers = 1,
    dates,
    userInfo,
    contactInfo,
    specialRequests = ''
  } = bookingData;

  const booking = {
    id: `booking_${bookingIdCounter++}`,
    type,
    serviceId,
    serviceName,
    price,
    travelers,
    dates,
    userInfo,
    contactInfo,
    specialRequests,
    status: 'pending', // pending, confirmed, cancelled, completed
    bookingDate: new Date().toISOString(),
    confirmationCode: generateConfirmationCode(),
    paymentStatus: 'pending', // pending, paid, refunded
    notes: []
  };

  bookings.push(booking);
  
  // Simulate booking confirmation process
  await simulateBookingConfirmation(booking);
  
  return {
    success: true,
    booking,
    message: `Booking created successfully! Confirmation code: ${booking.confirmationCode}`
  };
}

export async function getBookings(userId = null, filters = {}) {
  let filteredBookings = [...bookings];
  
  if (userId) {
    filteredBookings = filteredBookings.filter(b => b.userInfo?.userId === userId);
  }
  
  if (filters.type) {
    filteredBookings = filteredBookings.filter(b => b.type === filters.type);
  }
  
  if (filters.status) {
    filteredBookings = filteredBookings.filter(b => b.status === filters.status);
  }
  
  if (filters.dateFrom) {
    filteredBookings = filteredBookings.filter(b => 
      new Date(b.dates.start) >= new Date(filters.dateFrom)
    );
  }
  
  if (filters.dateTo) {
    filteredBookings = filteredBookings.filter(b => 
      new Date(b.dates.start) <= new Date(filters.dateTo)
    );
  }
  
  return {
    bookings: filteredBookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)),
    total: filteredBookings.length
  };
}

export async function getBooking(bookingId) {
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }
  return booking;
}

export async function updateBooking(bookingId, updates) {
  const bookingIndex = bookings.findIndex(b => b.id === bookingId);
  if (bookingIndex === -1) {
    throw new Error('Booking not found');
  }
  
  const updatedBooking = {
    ...bookings[bookingIndex],
    ...updates,
    lastUpdated: new Date().toISOString()
  };
  
  bookings[bookingIndex] = updatedBooking;
  
  return {
    success: true,
    booking: updatedBooking,
    message: 'Booking updated successfully'
  };
}

export async function cancelBooking(bookingId, reason = '') {
  const booking = await getBooking(bookingId);
  
  if (booking.status === 'cancelled') {
    throw new Error('Booking is already cancelled');
  }
  
  if (booking.status === 'completed') {
    throw new Error('Cannot cancel completed booking');
  }
  
  const updatedBooking = {
    ...booking,
    status: 'cancelled',
    cancellationDate: new Date().toISOString(),
    cancellationReason: reason,
    lastUpdated: new Date().toISOString()
  };
  
  const bookingIndex = bookings.findIndex(b => b.id === bookingId);
  bookings[bookingIndex] = updatedBooking;
  
  return {
    success: true,
    booking: updatedBooking,
    message: 'Booking cancelled successfully'
  };
}

export async function addBookingNote(bookingId, note) {
  const booking = await getBooking(bookingId);
  
  const newNote = {
    id: `note_${Date.now()}`,
    text: note,
    timestamp: new Date().toISOString(),
    type: 'user' // user, system, agent
  };
  
  const updatedBooking = {
    ...booking,
    notes: [...booking.notes, newNote],
    lastUpdated: new Date().toISOString()
  };
  
  const bookingIndex = bookings.findIndex(b => b.id === bookingId);
  bookings[bookingIndex] = updatedBooking;
  
  return {
    success: true,
    booking: updatedBooking,
    note: newNote
  };
}

// Helper functions
function generateConfirmationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function simulateBookingConfirmation(booking) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Simulate different confirmation rates based on service type
  const confirmationRates = {
    flight: 0.95,
    hotel: 0.98,
    car: 0.90,
    attraction: 0.99
  };
  
  const rate = confirmationRates[booking.type] || 0.95;
  const isConfirmed = Math.random() < rate;
  
  if (isConfirmed) {
    booking.status = 'confirmed';
    booking.confirmationDate = new Date().toISOString();
    booking.notes.push({
      id: `note_${Date.now()}`,
      text: `Booking confirmed by ${booking.type} provider`,
      timestamp: new Date().toISOString(),
      type: 'system'
    });
  } else {
    booking.status = 'failed';
    booking.notes.push({
      id: `note_${Date.now()}`,
      text: `Booking failed - ${booking.type} provider unavailable`,
      timestamp: new Date().toISOString(),
      type: 'system'
    });
  }
}

// Mock data for testing
export function getMockBookings() {
  return [
    {
      id: 'booking_1',
      type: 'flight',
      serviceId: 'flight_123',
      serviceName: 'American Airlines - JFK to CDG',
      price: 560,
      travelers: 2,
      dates: { start: '2024-12-01', end: '2024-12-03' },
      userInfo: { userId: 'user_1', name: 'John Doe' },
      contactInfo: { email: 'john@example.com', phone: '+1234567890' },
      status: 'confirmed',
      bookingDate: '2024-11-15T10:30:00Z',
      confirmationCode: 'ABC12345',
      paymentStatus: 'paid'
    },
    {
      id: 'booking_2',
      type: 'hotel',
      serviceId: 'hotel_456',
      serviceName: 'Hotel Ritz Paris',
      price: 800,
      travelers: 2,
      dates: { start: '2024-12-01', end: '2024-12-03' },
      userInfo: { userId: 'user_1', name: 'John Doe' },
      contactInfo: { email: 'john@example.com', phone: '+1234567890' },
      status: 'confirmed',
      bookingDate: '2024-11-15T11:00:00Z',
      confirmationCode: 'DEF67890',
      paymentStatus: 'paid'
    }
  ];
}
