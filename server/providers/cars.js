/* Car rental provider using RapidAPI Booking.com car rental API with graceful fallback. */

const DEFAULT_HOST = 'booking-com15.p.rapidapi.com';

export async function searchCarsLive(params) {
  const apiKey = process.env.RAPIDAPI_KEY;
  const host = process.env.RAPIDAPI_CARS_HOST || DEFAULT_HOST;

  if (!apiKey) {
    return { cars: mockCars(params), live: false, notice: 'RAPIDAPI_KEY missing — returning mock car rentals.' };
  }

  try {
    // Convert destination to coordinates (simplified - in production you'd use a geocoding service)
    const coordinates = getCoordinatesFromDestination(params.destination);
    
    // Format dates for API (YYYY-MM-DD format)
    const pickUpDate = new Date(params.startDate).toISOString().split('T')[0];
    const dropOffDate = new Date(params.endDate).toISOString().split('T')[0];
    
    const url = new URL(`https://${host}/api/v1/cars/searchCarRentals`);
    url.searchParams.set('pick_up_latitude', coordinates.lat);
    url.searchParams.set('pick_up_longitude', coordinates.lng);
    url.searchParams.set('drop_off_latitude', coordinates.lat);
    url.searchParams.set('drop_off_longitude', coordinates.lng);
    url.searchParams.set('pick_up_date', pickUpDate);
    url.searchParams.set('drop_off_date', dropOffDate);
    url.searchParams.set('pick_up_time', '10:00');
    url.searchParams.set('drop_off_time', '10:00');
    url.searchParams.set('driver_age', '30');
    url.searchParams.set('currency_code', params.currency || 'USD');
    url.searchParams.set('location', 'US');

    const res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': host
      }
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const cars = mapToCars(data, params);
    
    if (cars.length) return { cars, live: true };
  } catch (e) {
    console.error('Car rental API error:', e.message);
  }

  return { cars: mockCars(params), live: false, notice: 'Falling back to mock car rentals.' };
}

function mapToCars(raw, params) {
  const results = [];
  const days = Math.max(1, Math.ceil((new Date(params.endDate) - new Date(params.startDate)) / (24*3600*1000)));
  
  // Handle different possible response structures
  const list = raw?.data || raw?.results || raw?.cars || [];
  
  for (const item of list) {
    const pricePerDay = item.price_per_day || item.daily_rate || item.price || 50;
    const name = item.car_name || item.vehicle_name || item.name || 'Rental Car';
    const type = item.car_type || item.vehicle_type || 'Economy';
    const company = item.rental_company || item.company || 'Car Rental';
    
    results.push({
      id: item.id || `car_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      company,
      pricePerDay: Math.round(pricePerDay),
      days,
      total: Math.round(pricePerDay * days),
      location: params.destination,
      features: item.features || ['AC', 'Automatic', 'GPS'],
      image: item.image_url || null
    });
  }
  
  return results.slice(0, 8); // Limit to 8 results
}

function mockCars(params) {
  const days = Math.max(1, Math.ceil((new Date(params.endDate) - new Date(params.startDate)) / (24*3600*1000)));
  const carTypes = ['Economy', 'Compact', 'Midsize', 'Full-size', 'SUV', 'Luxury'];
  const companies = ['Hertz', 'Avis', 'Enterprise', 'Budget', 'Alamo', 'National'];
  
  return Array.from({ length: 6 }).map((_, idx) => {
    const pricePerDay = 30 + (idx % 4) * 20 + Math.floor(Math.random() * 15);
    return {
      id: `mock_car_${idx}`,
      name: `${carTypes[idx % carTypes.length]} Car`,
      type: carTypes[idx % carTypes.length],
      company: companies[idx % companies.length],
      pricePerDay,
      days,
      total: pricePerDay * days,
      location: params.destination,
      features: ['AC', 'Automatic', 'GPS', 'Bluetooth'],
      image: null
    };
  });
}

function getCoordinatesFromDestination(destination) {
  // Simplified coordinate mapping - in production, use a proper geocoding service
  const coordinates = {
    'New York': { lat: 40.7128, lng: -74.0060 },
    'NYC': { lat: 40.7128, lng: -74.0060 },
    'Tokyo': { lat: 35.6762, lng: 139.6503 },
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'London': { lat: 51.5074, lng: -0.1278 },
    'Los Angeles': { lat: 34.0522, lng: -118.2437 },
    'LA': { lat: 34.0522, lng: -118.2437 },
    'Chicago': { lat: 41.8781, lng: -87.6298 },
    'Miami': { lat: 25.7617, lng: -80.1918 },
    'Las Vegas': { lat: 36.1699, lng: -115.1398 },
    'San Francisco': { lat: 37.7749, lng: -122.4194 },
    'Seattle': { lat: 47.6062, lng: -122.3321 },
    'Boston': { lat: 42.3601, lng: -71.0589 },
    'Washington DC': { lat: 38.9072, lng: -77.0369 },
    'Orlando': { lat: 28.5383, lng: -81.3792 },
    'Denver': { lat: 39.7392, lng: -104.9903 },
    'Phoenix': { lat: 33.4484, lng: -112.0740 },
    'Atlanta': { lat: 33.7490, lng: -84.3880 },
    'Dallas': { lat: 32.7767, lng: -96.7970 },
    'Houston': { lat: 29.7604, lng: -95.3698 }
  };
  
  // Try to find exact match first
  for (const [city, coords] of Object.entries(coordinates)) {
    if (destination.toLowerCase().includes(city.toLowerCase())) {
      return coords;
    }
  }
  
  // Default to NYC coordinates if no match found
  return { lat: 40.7128, lng: -74.0060 };
}
