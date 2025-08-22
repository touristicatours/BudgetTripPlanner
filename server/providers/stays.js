/* Lodging provider using RapidAPI Booking/Hotels APIs with graceful fallback. */

const DEFAULT_HOSTS = [
  'booking-com.p.rapidapi.com',
  'hotels-com-provider.p.rapidapi.com'
];

export async function searchStaysLive(params) {
  const apiKey = process.env.RAPIDAPI_KEY;
  const hosts = (process.env.RAPIDAPI_STAYS_HOST || '').split(',').filter(Boolean);
  const hostList = hosts.length ? hosts : DEFAULT_HOSTS;

  if (!apiKey) {
    return { stays: mockStays(params), live: false, notice: 'RAPIDAPI_KEY missing — returning mock stays.' };
  }

  const errors = [];
  
  // Try map-based search first (more accurate for location-based results)
  try {
    const mapResult = await searchStaysByMap(params);
    if (mapResult.stays.length) return mapResult;
  } catch (e) {
    errors.push(`map_search: ${e.message}`);
  }

  // Fallback to traditional search
  for (const host of hostList) {
    try {
      // Try Booking.com locations + search
      const url = new URL(`https://${host}/v1/hotels/search`);
      url.searchParams.set('units', 'metric');
      url.searchParams.set('adults_number', String(params.travelers || 2));
      url.searchParams.set('checkout_date', params.endDate);
      url.searchParams.set('checkin_date', params.startDate);
      url.searchParams.set('dest_type', 'city');
      url.searchParams.set('dest_id', params.destination || '');
      url.searchParams.set('order_by', 'price');
      url.searchParams.set('currency', params.currency || 'USD');

      const res = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': host
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const stays = mapToStays(data, params);
      if (stays.length) return { stays, live: true };
    } catch (e) {
      errors.push(`${host}: ${e.message}`);
    }
  }

  return { stays: mockStays(params), live: false, notice: `Falling back to mock stays. Errors: ${errors.join(' | ')}` };
}

export async function searchStaysByMap(params) {
  const apiKey = process.env.RAPIDAPI_KEY;
  const host = 'apidojo-booking-v1.p.rapidapi.com';

  if (!apiKey) {
    return { stays: mockStays(params), live: false, notice: 'RAPIDAPI_KEY missing — returning mock stays.' };
  }

  try {
    // Get coordinates for the destination
    const coords = getCoordinatesFromDestination(params.destination);
    if (!coords) {
      throw new Error('Could not get coordinates for destination');
    }

    // Create bounding box around the coordinates (roughly 10km radius)
    const lat = coords.lat;
    const lng = coords.lng;
    const bbox = `${lat - 0.1},${lat + 0.1},${lng - 0.1},${lng + 0.1}`;

    const url = new URL(`https://${host}/properties/list-by-map`);
    url.searchParams.set('room_qty', '1');
    url.searchParams.set('guest_qty', String(params.travelers || 2));
    url.searchParams.set('bbox', bbox);
    url.searchParams.set('search_id', 'none');
    url.searchParams.set('price_filter_currencycode', params.currency || 'USD');
    url.searchParams.set('categories_filter', 'class::1,class::2,class::3,class::4,class::5');
    url.searchParams.set('languagecode', 'en-us');
    url.searchParams.set('travel_purpose', 'leisure');
    url.searchParams.set('order_by', 'popularity');
    url.searchParams.set('offset', '0');

    const res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': host
      }
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const stays = mapToStaysFromMap(data, params);
    
    if (stays.length) return { stays, live: true };
  } catch (e) {
    console.error('Map-based stays search error:', e.message);
  }

  return { stays: mockStays(params), live: false, notice: 'Map-based search failed — falling back to mock stays.' };
}

export async function autoCompleteDestinations(query) {
  const apiKey = process.env.RAPIDAPI_KEY;
  const host = 'booking-com18.p.rapidapi.com';

  if (!apiKey) {
    return { suggestions: mockDestinations(query), live: false, notice: 'RAPIDAPI_KEY missing — returning mock suggestions.' };
  }

  try {
    const url = new URL(`https://${host}/stays/auto-complete`);
    url.searchParams.set('query', query);

    const res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': host
      }
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const suggestions = mapToDestinations(data);
    
    if (suggestions.length) return { suggestions, live: true };
  } catch (e) {
    console.error('Auto-complete API error:', e.message);
  }

  return { suggestions: mockDestinations(query), live: false, notice: 'Falling back to mock suggestions.' };
}

function mapToDestinations(raw) {
  const results = [];
  const list = raw?.data || raw?.suggestions || raw?.results || [];
  
  for (const item of list) {
    const name = item.name || item.display_name || item.title || '';
    const type = item.type || item.category || 'city';
    const country = item.country || item.country_name || '';
    const id = item.dest_id || item.id || item.place_id || '';
    
    if (name && id) {
      results.push({
        id,
        name,
        type,
        country,
        fullName: country ? `${name}, ${country}` : name
      });
    }
  }
  
  return results.slice(0, 10); // Limit to 10 suggestions
}

function mockDestinations(query) {
  const popularDestinations = [
    { name: 'New York', country: 'United States', type: 'city' },
    { name: 'Tokyo', country: 'Japan', type: 'city' },
    { name: 'Paris', country: 'France', type: 'city' },
    { name: 'London', country: 'United Kingdom', type: 'city' },
    { name: 'Los Angeles', country: 'United States', type: 'city' },
    { name: 'Chicago', country: 'United States', type: 'city' },
    { name: 'Miami', country: 'United States', type: 'city' },
    { name: 'Las Vegas', country: 'United States', type: 'city' },
    { name: 'San Francisco', country: 'United States', type: 'city' },
    { name: 'Seattle', country: 'United States', type: 'city' },
    { name: 'Boston', country: 'United States', type: 'city' },
    { name: 'Washington DC', country: 'United States', type: 'city' },
    { name: 'Orlando', country: 'United States', type: 'city' },
    { name: 'Denver', country: 'United States', type: 'city' },
    { name: 'Phoenix', country: 'United States', type: 'city' },
    { name: 'Atlanta', country: 'United States', type: 'city' },
    { name: 'Dallas', country: 'United States', type: 'city' },
    { name: 'Houston', country: 'United States', type: 'city' },
    { name: 'Barcelona', country: 'Spain', type: 'city' },
    { name: 'Rome', country: 'Italy', type: 'city' },
    { name: 'Amsterdam', country: 'Netherlands', type: 'city' },
    { name: 'Berlin', country: 'Germany', type: 'city' },
    { name: 'Vienna', country: 'Austria', type: 'city' },
    { name: 'Prague', country: 'Czech Republic', type: 'city' },
    { name: 'Budapest', country: 'Hungary', type: 'city' },
    { name: 'Krakow', country: 'Poland', type: 'city' },
    { name: 'Warsaw', country: 'Poland', type: 'city' }
  ];

  const filtered = popularDestinations.filter(dest => 
    dest.name.toLowerCase().includes(query.toLowerCase()) ||
    dest.country.toLowerCase().includes(query.toLowerCase())
  );

  return filtered.map((dest, idx) => ({
    id: `mock_${idx}`,
    name: dest.name,
    type: dest.type,
    country: dest.country,
    fullName: `${dest.name}, ${dest.country}`
  })).slice(0, 8);
}

function mapToStays(raw, params) {
  const results = [];
  const nights = Math.max(1, Math.ceil((new Date(params.endDate) - new Date(params.startDate)) / (24*3600*1000)));
  const list = raw?.result || raw?.data || [];
  for (const item of list) {
    const priceNight = item.price_breakdown?.net_amount?.value || item.minPrice || item.price || 120;
    const name = item.hotel_name || item.name || 'Stay';
    const stars = item.class || item.starRating || 3;
    results.push({
      id: item.hotel_id || item.id || `stay_${name}`,
      name,
      stars: Math.round(stars),
      nightly: Math.round(priceNight),
      nights,
      total: Math.round(priceNight * nights),
      location: params.destination,
      type: 'Hotel'
    });
  }
  return results.slice(0, 10);
}

function mapToStaysFromMap(raw, params) {
  const results = [];
  const nights = Math.max(1, Math.ceil((new Date(params.endDate) - new Date(params.startDate)) / (24*3600*1000)));
  const list = raw?.data || raw?.properties || raw?.results || [];
  
  for (const item of list) {
    const priceNight = item.price_breakdown?.gross_amount?.value || 
                      item.price_breakdown?.net_amount?.value || 
                      item.min_price || 
                      item.price || 
                      120;
    const name = item.hotel_name || item.name || item.property_name || 'Stay';
    const stars = item.class || item.star_rating || item.rating || 3;
    const type = item.property_type || item.accommodation_type || 'Hotel';
    
    results.push({
      id: item.hotel_id || item.property_id || item.id || `stay_${name}`,
      name,
      stars: Math.round(stars),
      nightly: Math.round(priceNight),
      nights,
      total: Math.round(priceNight * nights),
      location: params.destination,
      type: type.charAt(0).toUpperCase() + type.slice(1)
    });
  }
  return results.slice(0, 10);
}

function getCoordinatesFromDestination(destination) {
  // Simple coordinate mapping for popular destinations
  const coordinates = {
    'new york': { lat: 40.7128, lng: -74.0060 },
    'nyc': { lat: 40.7128, lng: -74.0060 },
    'tokyo': { lat: 35.6762, lng: 139.6503 },
    'paris': { lat: 48.8566, lng: 2.3522 },
    'london': { lat: 51.5074, lng: -0.1278 },
    'los angeles': { lat: 34.0522, lng: -118.2437 },
    'chicago': { lat: 41.8781, lng: -87.6298 },
    'miami': { lat: 25.7617, lng: -80.1918 },
    'las vegas': { lat: 36.1699, lng: -115.1398 },
    'san francisco': { lat: 37.7749, lng: -122.4194 },
    'seattle': { lat: 47.6062, lng: -122.3321 },
    'boston': { lat: 42.3601, lng: -71.0589 },
    'washington dc': { lat: 38.9072, lng: -77.0369 },
    'orlando': { lat: 28.5383, lng: -81.3792 },
    'denver': { lat: 39.7392, lng: -104.9903 },
    'phoenix': { lat: 33.4484, lng: -112.0740 },
    'atlanta': { lat: 33.7490, lng: -84.3880 },
    'dallas': { lat: 32.7767, lng: -96.7970 },
    'houston': { lat: 29.7604, lng: -95.3698 },
    'barcelona': { lat: 41.3851, lng: 2.1734 },
    'rome': { lat: 41.9028, lng: 12.4964 },
    'amsterdam': { lat: 52.3676, lng: 4.9041 },
    'berlin': { lat: 52.5200, lng: 13.4050 },
    'vienna': { lat: 48.2082, lng: 16.3738 },
    'prague': { lat: 50.0755, lng: 14.4378 },
    'budapest': { lat: 47.4979, lng: 19.0402 },
    'krakow': { lat: 50.0647, lng: 19.9450 },
    'warsaw': { lat: 52.2297, lng: 21.0122 }
  };

  const key = destination.toLowerCase().trim();
  return coordinates[key] || null;
}

function mockStays(params) {
  const nights = Math.max(1, Math.ceil((new Date(params.endDate) - new Date(params.startDate)) / (24*3600*1000)) || 3);
  return Array.from({ length: 6 }).map((_, idx) => {
    const nightly = 80 + (idx % 3) * 30;
    return {
      id: `mock_sty_${idx}`,
      name: `${params.destination} Hotel ${idx + 1}`,
      stars: 3 + (idx % 3),
      nightly,
      nights,
      total: nightly * nights,
      location: params.destination,
      type: idx % 2 === 0 ? 'Hotel' : 'Apartment'
    };
  });
}



