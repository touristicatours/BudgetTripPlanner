/* Booking.com API provider using RapidAPI */
const DEFAULT_HOST = 'booking-data.p.rapidapi.com';

export async function getHotelAvailability(hotelId, checkIn = null, checkOut = null) {
  const apiKey = process.env.RAPIDAPI_KEY || '96d9b0dd5emsh5f6f78f433f3277p11936ejsn6688f0b06157';

  if (!apiKey) {
    return {
      availability: mockHotelAvailability(hotelId),
      live: false,
      notice: 'RAPIDAPI_KEY missing — using mock hotel availability.'
    };
  }

  try {
    let url = `https://${DEFAULT_HOST}/booking-app/hotel/detail/availability-calendar?hotel_id=${hotelId}`;
    
    // Add date parameters if provided (using correct parameter names)
    if (checkIn && checkOut) {
      url += `&checkin_date=${checkIn}&checkout_date=${checkOut}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': DEFAULT_HOST,
        'x-rapidapi-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Booking.com API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      availability: mapToHotelAvailability(data, hotelId),
      live: true,
      notice: 'Hotel availability provided via Booking.com API.'
    };
  } catch (error) {
    console.error('Booking.com availability error:', error.message);
    return {
      availability: mockHotelAvailability(hotelId),
      live: false,
      notice: 'Booking.com service unavailable — using mock availability.'
    };
  }
}

export async function searchHotels(query, checkIn = null, checkOut = null, guests = 1) {
  const apiKey = process.env.RAPIDAPI_KEY || '96d9b0dd5emsh5f6f78f433f3277p11936ejsn6688f0b06157';

  if (!apiKey) {
    return {
      hotels: mockHotelSearch(query),
      live: false,
      notice: 'RAPIDAPI_KEY missing — using mock hotel search.'
    };
  }

  try {
    let url = `https://${DEFAULT_HOST}/booking-app/hotel/search?query=${encodeURIComponent(query)}&guests=${guests}`;
    
    if (checkIn && checkOut) {
      url += `&check_in=${checkIn}&check_out=${checkOut}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': DEFAULT_HOST,
        'x-rapidapi-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Booking.com search error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      hotels: mapToHotelSearch(data, query),
      live: true,
      notice: 'Hotel search provided via Booking.com API.'
    };
  } catch (error) {
    console.error('Booking.com search error:', error.message);
    return {
      hotels: mockHotelSearch(query),
      live: false,
      notice: 'Booking.com search unavailable — using mock results.'
    };
  }
}

function mapToHotelAvailability(raw, hotelId) {
  try {
    if (!raw || !raw.data || !raw.data.days) {
      return mockHotelAvailability(hotelId);
    }

    const calendar = raw.data.days.map(day => ({
      date: day.checkin,
      available: day.available,
      price: parseInt(day.avgPriceFormatted.replace(/[^0-9]/g, '')) || 0,
      currency: 'USD',
      lengthOfStay: day.lengthOfStay,
      minLengthOfStay: day.minLengthOfStay
    }));

    const availableDays = calendar.filter(day => day.available);
    const prices = availableDays.map(day => day.price).filter(price => price > 0);

    return {
      hotelId: hotelId,
      calendar: calendar,
      availability: availableDays,
      rates: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0,
        average: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
        currency: 'USD'
      },
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error mapping hotel availability:', error);
    return mockHotelAvailability(hotelId);
  }
}

function mapToHotelSearch(raw, query) {
  try {
    if (!raw || !raw.data) {
      return mockHotelSearch(query);
    }

    return raw.data.map(hotel => ({
      id: hotel.id || `hotel-${Date.now()}-${Math.random()}`,
      name: hotel.name || 'Unknown Hotel',
      address: hotel.address || '',
      city: hotel.city || '',
      country: hotel.country || '',
      rating: hotel.rating || 0,
      price: hotel.price || 0,
      currency: hotel.currency || 'USD',
      imageUrl: hotel.image_url || null,
      amenities: hotel.amenities || [],
      description: hotel.description || `Hotel in ${query}`
    }));
  } catch (error) {
    console.error('Error mapping hotel search:', error);
    return mockHotelSearch(query);
  }
}

function mockHotelAvailability(hotelId) {
  const today = new Date();
  const calendar = [];
  
  // Generate 30 days of availability
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    calendar.push({
      date: date.toISOString().split('T')[0],
      available: Math.random() > 0.1, // 90% availability
      price: Math.floor(Math.random() * 200) + 100, // $100-$300
      currency: 'USD'
    });
  }

  return {
    hotelId: hotelId,
    calendar: calendar,
    availability: calendar.filter(day => day.available),
    rates: {
      min: 100,
      max: 300,
      average: 200,
      currency: 'USD'
    },
    lastUpdated: new Date().toISOString()
  };
}

function mockHotelSearch(query) {
  const hotels = [
    {
      id: 'hotel-1',
      name: 'Grand Hotel',
      address: '123 Main Street',
      city: query,
      country: 'USA',
      rating: 4.5,
      price: 250,
      currency: 'USD',
      imageUrl: null,
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'],
      description: `Luxury hotel in ${query} with excellent amenities`
    },
    {
      id: 'hotel-2',
      name: 'Comfort Inn',
      address: '456 Oak Avenue',
      city: query,
      country: 'USA',
      rating: 3.8,
      price: 150,
      currency: 'USD',
      imageUrl: null,
      amenities: ['WiFi', 'Breakfast', 'Parking'],
      description: `Comfortable accommodation in ${query}`
    },
    {
      id: 'hotel-3',
      name: 'Boutique Hotel',
      address: '789 Pine Street',
      city: query,
      country: 'USA',
      rating: 4.2,
      price: 180,
      currency: 'USD',
      imageUrl: null,
      amenities: ['WiFi', 'Bar', 'Spa'],
      description: `Charming boutique hotel in ${query}`
    }
  ];

  return hotels;
}
