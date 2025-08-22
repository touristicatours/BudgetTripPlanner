/* Airbnb destination search provider using RapidAPI */
const DEFAULT_HOST = 'airbnb19.p.rapidapi.com';

export async function searchAirbnbDestinations(query, country = 'USA') {
  const apiKey = process.env.RAPIDAPI_KEY || '96d9b0dd5emsh5f6f78f433f3277p11936ejsn6688f0b06157';

  if (!apiKey) {
    return {
      destinations: mockAirbnbDestinations(query, country),
      live: false,
      notice: 'RAPIDAPI_KEY missing — using mock Airbnb destinations.'
    };
  }

  try {
    const url = `https://${DEFAULT_HOST}/api/v1/searchDestination?query=${encodeURIComponent(query)}&country=${encodeURIComponent(country)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': DEFAULT_HOST,
        'x-rapidapi-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Airbnb API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      destinations: mapToAirbnbDestinations(data, query),
      live: true,
      notice: 'Airbnb destinations provided via RapidAPI.'
    };
  } catch (error) {
    console.error('Airbnb destination search error:', error.message);
    return {
      destinations: mockAirbnbDestinations(query, country),
      live: false,
      notice: 'Airbnb service unavailable — using mock destinations.'
    };
  }
}

function mapToAirbnbDestinations(raw, query) {
  try {
    if (!raw || !raw.data) {
      return mockAirbnbDestinations(query);
    }

    return raw.data.map(item => ({
      id: item.id || `airbnb-${Date.now()}-${Math.random()}`,
      name: item.name || item.title || 'Unknown Destination',
      fullName: item.fullName || item.name || item.title || 'Unknown Destination',
      type: 'airbnb',
      country: item.country || 'Unknown',
      region: item.region || item.state || '',
      coordinates: item.coordinates || null,
      popularity: item.popularity || 0,
      imageUrl: item.imageUrl || null,
      description: item.description || `Airbnb destination: ${item.name || query}`
    }));
  } catch (error) {
    console.error('Error mapping Airbnb destinations:', error);
    return mockAirbnbDestinations(query);
  }
}

function mockAirbnbDestinations(query, country = 'USA') {
  const baseDestinations = [
    {
      id: 'airbnb-chicago',
      name: 'Chicago',
      fullName: 'Chicago, Illinois, USA',
      type: 'airbnb',
      country: 'USA',
      region: 'Illinois',
      coordinates: { lat: 41.8781, lng: -87.6298 },
      popularity: 95,
      imageUrl: null,
      description: `Popular Airbnb destination in ${country}: ${query}`
    },
    {
      id: 'airbnb-newyork',
      name: 'New York',
      fullName: 'New York, New York, USA',
      type: 'airbnb',
      country: 'USA',
      region: 'New York',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      popularity: 98,
      imageUrl: null,
      description: `Popular Airbnb destination in ${country}: ${query}`
    },
    {
      id: 'airbnb-losangeles',
      name: 'Los Angeles',
      fullName: 'Los Angeles, California, USA',
      type: 'airbnb',
      country: 'USA',
      region: 'California',
      coordinates: { lat: 34.0522, lng: -118.2437 },
      popularity: 92,
      imageUrl: null,
      description: `Popular Airbnb destination in ${country}: ${query}`
    },
    {
      id: 'airbnb-miami',
      name: 'Miami',
      fullName: 'Miami, Florida, USA',
      type: 'airbnb',
      country: 'USA',
      region: 'Florida',
      coordinates: { lat: 25.7617, lng: -80.1918 },
      popularity: 88,
      imageUrl: null,
      description: `Popular Airbnb destination in ${country}: ${query}`
    },
    {
      id: 'airbnb-sanfrancisco',
      name: 'San Francisco',
      fullName: 'San Francisco, California, USA',
      type: 'airbnb',
      country: 'USA',
      region: 'California',
      coordinates: { lat: 37.7749, lng: -122.4194 },
      popularity: 90,
      imageUrl: null,
      description: `Popular Airbnb destination in ${country}: ${query}`
    }
  ];

  // Filter destinations that match the query
  const matchingDestinations = baseDestinations.filter(dest => 
    dest.name.toLowerCase().includes(query.toLowerCase()) ||
    dest.fullName.toLowerCase().includes(query.toLowerCase()) ||
    dest.region.toLowerCase().includes(query.toLowerCase())
  );

  return matchingDestinations.length > 0 ? matchingDestinations : baseDestinations.slice(0, 3);
}
