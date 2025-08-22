/* Live flights provider using RapidAPI Skyscanner variants. */

const DEFAULT_HOSTS = [
  'skyscanner80.p.rapidapi.com',
  'skyscanner44.p.rapidapi.com',
  'skyscanner50.p.rapidapi.com',
  'skyscanner48.p.rapidapi.com'
];

export async function searchFlightsLive(params) {
  const apiKey = process.env.RAPIDAPI_KEY;
  const hosts = (process.env.RAPIDAPI_SKYSCANNER_HOST || '').split(',').filter(Boolean);
  const hostList = hosts.length ? hosts : DEFAULT_HOSTS;

  if (!apiKey) {
    return { flights: mockFlights(params), live: false, notice: 'RAPIDAPI_KEY missing — returning mock flights.' };
  }

  // Set default origin if not provided (common departure cities)
  const origin = params.origin || 'JFK'; // Default to JFK for US flights
  const destination = params.destination;

  const errors = [];
  for (const host of hostList) {
    try {
      // Try multiple endpoint variations for Skyscanner
      const endpoints = [
        `/search-extended`,
        `/api/v1/flights/search-sync`,
        `/flights/search`,
        `/search`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const url = new URL(`https://${host}${endpoint}`);
          
          // Set parameters based on endpoint type
          if (endpoint.includes('search-sync')) {
            url.searchParams.set('originSkyId', origin);
            url.searchParams.set('destinationSkyId', destination);
            url.searchParams.set('date', params.startDate);
          } else {
            url.searchParams.set('adults', String(params.travelers || 1));
            url.searchParams.set('origin', origin);
            url.searchParams.set('destination', destination);
            url.searchParams.set('departureDate', params.startDate);
          }
          
          if (params.endDate) url.searchParams.set('returnDate', params.endDate);
          url.searchParams.set('currency', params.currency || 'USD');
          url.searchParams.set('market', params.market || 'US');
          url.searchParams.set('locale', params.locale || 'en-US');

          const res = await fetch(url, {
            headers: {
              'X-RapidAPI-Key': apiKey,
              'X-RapidAPI-Host': host
            },
          });
          
          if (!res.ok) {
            const errorText = await res.text();
            if (errorText.includes("API doesn't exists") || errorText.includes("not found")) {
              continue; // Try next endpoint
            }
            throw new Error(`HTTP ${res.status}: ${errorText}`);
          }
          
          const data = await res.json();
          const flights = mapSkyscannerToFlights(data, params);
          if (flights.length) return { flights, live: true };
        } catch (endpointError) {
          // Continue to next endpoint
          continue;
        }
      }
    } catch (e) {
      errors.push(`${host}: ${e.message}`);
    }
  }

  console.log('Skyscanner API errors:', errors);
  return { flights: mockFlights(params), live: false, notice: `Skyscanner API endpoints unavailable — using realistic mock flights. Errors: ${errors.join(' | ')}` };
}

function mapSkyscannerToFlights(raw, params) {
  // Normalize various possible shapes; if unknown, return empty → provider will fallback
  const results = [];
  const list = raw?.itineraries || raw?.data || raw?.results || [];
  const origin = params.origin || 'JFK';
  
  for (const item of list) {
    // Heuristic mapping
    const price = item.price?.raw || item.price || item.itineraryPricing?.[0]?.price?.amount || item.minPrice || 0;
    const legs = item.legs || item.leg || [];
    const durationHours = Math.round(((legs?.[0]?.durationInMinutes || legs?.[0]?.duration || 0) / 60) || 0);
    const depart = legs?.[0]?.departure || params.startDate + 'T08:00:00';
    const arrive = legs?.[0]?.arrival || params.startDate + 'T16:00:00';
    const airline = item.carriers?.marketing?.[0]?.name || item.carrier?.name || 'Airline';
    results.push({
      id: item.id || cryptoRandomId(),
      airline,
      origin: origin,
      destination: params.destination,
      depart,
      arrive,
      durationHours: durationHours || 8,
      pricePer: Math.round(Number(price) || 250),
      total: Math.round((Number(price) || 250) * (params.travelers || 1))
    });
  }
  return results.slice(0, 10);
}

function mockFlights(params) {
  const travelers = params.travelers || 1;
  const origin = params.origin || 'JFK';
  const destination = params.destination;
  
  // Real airline names for more realistic mock data
  const airlines = [
    { name: 'American Airlines', code: 'AA' },
    { name: 'Delta Air Lines', code: 'DL' },
    { name: 'United Airlines', code: 'UA' },
    { name: 'Air France', code: 'AF' },
    { name: 'British Airways', code: 'BA' },
    { name: 'Lufthansa', code: 'LH' }
  ];
  
  const list = [];
  for (let i = 0; i < 6; i++) {
    const airline = airlines[i % airlines.length];
    const base = 280 + i * 60; // More realistic pricing
    const durationHours = 7 + (i % 2); // 7-8 hours for transatlantic
    
    // Calculate realistic departure and arrival times
    const departHour = 8 + (i * 2) % 12; // Spread departures throughout the day
    const arriveHour = departHour + durationHours;
    
    list.push({
      id: `mock_flt_${i}`,
      airline: airline.name,
      airlineCode: airline.code,
      origin: origin,
      destination: destination,
      depart: `${params.startDate || '2024-12-01'}T${departHour.toString().padStart(2, '0')}:${(i * 15) % 60}:00`,
      arrive: `${params.startDate || '2024-12-01'}T${arriveHour.toString().padStart(2, '0')}:${(i * 15) % 60}:00`,
      durationHours: durationHours,
      pricePer: base,
      total: base * travelers,
      stops: i % 2 === 0 ? 0 : 1, // Some direct, some with stops
      cabin: i % 3 === 0 ? 'Economy' : i % 3 === 1 ? 'Premium Economy' : 'Business'
    });
  }
  return list;
}

function cryptoRandomId() {
  return `id_${Math.random().toString(36).slice(2, 10)}`;
}



