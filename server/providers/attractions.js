/* Booking.com Attractions API provider using RapidAPI */
const DEFAULT_HOST = 'booking-com-api5.p.rapidapi.com';

export async function getAttractionDetails(slug, limit = 1, page = 1, currency = 'USD', language = 'en') {
  const apiKey = process.env.RAPIDAPI_KEY || '96d9b0dd5emsh5f6f78f433f3277p11936ejsn6688f0b06157';

  if (!apiKey) {
    return {
      attraction: mockAttractionDetails(slug),
      live: false,
      notice: 'RAPIDAPI_KEY missing — using mock attraction details.'
    };
  }

  try {
    const url = `https://${DEFAULT_HOST}/attraction/product-detail?slug=${slug}&limit=${limit}&page=${page}&currency_code=${currency}&languagecode=${language}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': DEFAULT_HOST,
        'x-rapidapi-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Attractions API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      attraction: mapToAttractionDetails(data, slug),
      live: true,
      notice: 'Attraction details provided via Booking.com API.'
    };
  } catch (error) {
    console.error('Attractions API error:', error.message);
    return {
      attraction: mockAttractionDetails(slug),
      live: false,
      notice: 'Attractions service unavailable — using mock details.'
    };
  }
}

export async function searchAttractions(query, limit = 10, page = 1, currency = 'USD', language = 'en') {
  const apiKey = process.env.RAPIDAPI_KEY || '96d9b0dd5emsh5f6f78f433f3277p11936ejsn6688f0b06157';

  // Validate query parameter
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return {
      attractions: mockAttractionSearch('Paris'), // Default to Paris if no valid query
      live: false,
      notice: 'Invalid query parameter — using default mock results.'
    };
  }

  if (!apiKey) {
    return {
      attractions: mockAttractionSearch(query),
      live: false,
      notice: 'RAPIDAPI_KEY missing — using mock attraction search.'
    };
  }

  try {
    // Since the search endpoint doesn't exist, we'll use a curated list of known attraction slugs
    // and fetch details for each one to create a search result
    const knownAttractions = getKnownAttractionsForDestination(query);
    
    if (knownAttractions.length === 0) {
      return {
        attractions: mockAttractionSearch(query),
        live: false,
        notice: 'No known attractions found for this destination — using mock results.'
      };
    }

    // Fetch details for each known attraction
    const attractionPromises = knownAttractions.slice(0, limit).map(async (attraction) => {
      try {
        const detailResponse = await fetch(`https://${DEFAULT_HOST}/attraction/product-detail?slug=${attraction.slug}&limit=1&page=1&currency_code=${currency}&languagecode=${language}`, {
          headers: {
            'x-rapidapi-host': DEFAULT_HOST,
            'x-rapidapi-key': apiKey
          }
        });

        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          return mapToAttractionFromDetails(detailData, attraction.slug);
        }
      } catch (error) {
        console.error(`Error fetching details for ${attraction.slug}:`, error.message);
      }
      return null;
    });

    const attractions = (await Promise.all(attractionPromises)).filter(attraction => attraction !== null);
    
    if (attractions.length > 0) {
      return {
        attractions: attractions,
        live: true,
        notice: 'Attraction search provided via Booking.com API.'
      };
    } else {
      return {
        attractions: mockAttractionSearch(query),
        live: false,
        notice: 'Failed to fetch attraction details — using mock results.'
      };
    }
  } catch (error) {
    console.error('Attractions search error:', error.message);
    return {
      attractions: mockAttractionSearch(query),
      live: false,
      notice: 'Attractions search unavailable — using mock results.'
    };
  }
}

function mapToAttractionDetails(raw, slug) {
  try {
    if (!raw || !raw.data || !raw.data.data || !raw.data.data.attractionsProduct) {
      return mockAttractionDetails(slug);
    }

    const product = raw.data.data.attractionsProduct.getProduct;
    
    return {
      id: product.id || slug,
      slug: product.slug || slug,
      name: product.name || 'Unknown Attraction',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      isBookable: product.isBookable || false,
      primaryPhoto: product.primaryPhoto?.small || null,
      photos: product.photos?.map(photo => photo.small) || [],
      location: product.ufiDetails?.bCityName || 'Unknown Location',
      country: product.ufiDetails?.url?.country || 'Unknown',
      price: product.representativePrice?.publicAmount || 0,
      currency: product.representativePrice?.currency || 'USD',
      rating: product.reviewsStats?.combinedNumericStats?.average || 0,
      totalReviews: product.reviewsStats?.combinedNumericStats?.total || 0,
      reviewScore: product.reviewsStats?.combinedNumericStats?.reviewScore || 'UNKNOWN',
      duration: product.itinerary?.duration?.value || 'PT8H',
      highlights: product.highlights?.map(h => h.type) || [],
      whatsIncluded: product.whatsIncluded || [],
      notIncluded: product.notIncluded || [],
      operatedBy: product.operatedBy || 'Unknown Operator',
      cancellationPolicy: {
        hasFreeCancellation: product.cancellationPolicy?.hasFreeCancellation || false,
        percentage: product.cancellationPolicy?.percentage || 0,
        period: product.cancellationPolicy?.period || 'P1D'
      },
      flags: product.flags?.map(flag => flag.flag) || [],
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error mapping attraction details:', error);
    return mockAttractionDetails(slug);
  }
}

function mapToAttractionSearch(raw, query) {
  try {
    if (!raw || !raw.data || !raw.data.attractions) {
      return mockAttractionSearch(query);
    }

    return raw.data.attractions.map(attraction => ({
      id: attraction.id || `attraction-${Date.now()}-${Math.random()}`,
      slug: attraction.slug || '',
      name: attraction.name || 'Unknown Attraction',
      description: attraction.description || '',
      location: attraction.location || query,
      price: attraction.price || 0,
      currency: attraction.currency || 'USD',
      rating: attraction.rating || 0,
      totalReviews: attraction.totalReviews || 0,
      imageUrl: attraction.primaryPhoto || null,
      isBookable: attraction.isBookable || false
    }));
  } catch (error) {
    console.error('Error mapping attraction search:', error);
    return mockAttractionSearch(query);
  }
}

function mockAttractionDetails(slug) {
  return {
    id: slug,
    slug: slug,
    name: 'Borobudur Temple Tour',
    description: 'Experience the world\'s largest Buddhist temple with a guided tour including climb to the top.',
    shortDescription: 'Guided tour of Borobudur Temple with special access to climb to the top.',
    isBookable: true,
    primaryPhoto: 'https://example.com/borobudur.jpg',
    photos: [
      'https://example.com/borobudur1.jpg',
      'https://example.com/borobudur2.jpg',
      'https://example.com/borobudur3.jpg'
    ],
    location: 'Yogyakarta',
    country: 'Indonesia',
    price: 149,
    currency: 'USD',
    rating: 4.8,
    totalReviews: 110,
    reviewScore: 'EXCEPTIONAL',
    duration: 'PT8H',
    highlights: ['itinerary_private_tour', 'guest_pickup'],
    whatsIncluded: [
      'Entrance Fee on Program Tour',
      'Parking',
      'Entrance Ticket TO THE TOP Borobudur temple',
      'Experience Tourism Driver/ Guide with English Speaking'
    ],
    notIncluded: [
      'Lunch',
      'Personal Expense',
      'Tipping Driver',
      'Local Guide ( Optional )'
    ],
    operatedBy: 'Asmaradhana Borobudur Tours',
    cancellationPolicy: {
      hasFreeCancellation: true,
      percentage: 100,
      period: 'P1D'
    },
    flags: ['bestseller', 'aiBadgesSkipTheLine', 'aiBadgesPickup'],
    lastUpdated: new Date().toISOString()
  };
}

function getKnownAttractionsForDestination(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }
  const destination = query.toLowerCase();
  
  // Paris attractions
  if (destination.includes('paris') || destination.includes('france')) {
    return [
      { slug: 'paris-eiffel-tower-skip-the-line-ticket', name: 'Eiffel Tower Skip-the-Line Ticket' },
      { slug: 'paris-louvre-museum-guided-tour', name: 'Louvre Museum Guided Tour' },
      { slug: 'paris-seine-river-cruise', name: 'Seine River Cruise' },
      { slug: 'paris-versailles-palace-tour', name: 'Versailles Palace Tour' },
      { slug: 'paris-montmartre-walking-tour', name: 'Montmartre Walking Tour' }
    ];
  }
  
  // New York attractions
  if (destination.includes('new york') || destination.includes('nyc') || destination.includes('manhattan')) {
    return [
      { slug: 'new-york-empire-state-building-ticket', name: 'Empire State Building Ticket' },
      { slug: 'new-york-statue-of-liberty-tour', name: 'Statue of Liberty Tour' },
      { slug: 'new-york-times-square-walking-tour', name: 'Times Square Walking Tour' },
      { slug: 'new-york-central-park-tour', name: 'Central Park Tour' },
      { slug: 'new-york-broadway-show-ticket', name: 'Broadway Show Ticket' }
    ];
  }
  
  // London attractions
  if (destination.includes('london') || destination.includes('england') || destination.includes('uk')) {
    return [
      { slug: 'london-big-ben-tower-bridge-tour', name: 'Big Ben & Tower Bridge Tour' },
      { slug: 'london-british-museum-guided-tour', name: 'British Museum Guided Tour' },
      { slug: 'london-thames-river-cruise', name: 'Thames River Cruise' },
      { slug: 'london-buckingham-palace-tour', name: 'Buckingham Palace Tour' },
      { slug: 'london-westminster-abbey-tour', name: 'Westminster Abbey Tour' }
    ];
  }
  
  // Tokyo attractions
  if (destination.includes('tokyo') || destination.includes('japan')) {
    return [
      { slug: 'tokyo-sensoji-temple-tour', name: 'Sensoji Temple Tour' },
      { slug: 'tokyo-tokyo-tower-ticket', name: 'Tokyo Tower Ticket' },
      { slug: 'tokyo-shibuya-crossing-tour', name: 'Shibuya Crossing Tour' },
      { slug: 'tokyo-tsukiji-fish-market-tour', name: 'Tsukiji Fish Market Tour' },
      { slug: 'tokyo-mount-fuji-day-trip', name: 'Mount Fuji Day Trip' }
    ];
  }
  
  // Rome attractions
  if (destination.includes('rome') || destination.includes('italy')) {
    return [
      { slug: 'rome-colosseum-guided-tour', name: 'Colosseum Guided Tour' },
      { slug: 'rome-vatican-museums-tour', name: 'Vatican Museums Tour' },
      { slug: 'rome-trevi-fountain-tour', name: 'Trevi Fountain Tour' },
      { slug: 'rome-pantheon-tour', name: 'Pantheon Tour' },
      { slug: 'rome-roman-forum-tour', name: 'Roman Forum Tour' }
    ];
  }
  
  // Barcelona attractions
  if (destination.includes('barcelona') || destination.includes('spain')) {
    return [
      { slug: 'barcelona-sagrada-familia-tour', name: 'Sagrada Familia Tour' },
      { slug: 'barcelona-park-guell-tour', name: 'Park Guell Tour' },
      { slug: 'barcelona-casa-batllo-tour', name: 'Casa Batllo Tour' },
      { slug: 'barcelona-gothic-quarter-tour', name: 'Gothic Quarter Tour' },
      { slug: 'barcelona-montserrat-day-trip', name: 'Montserrat Day Trip' }
    ];
  }
  
  // Yogyakarta attractions (using the real slug we know works)
  if (destination.includes('yogyakarta') || destination.includes('indonesia') || destination.includes('java')) {
    return [
      { slug: 'prgsnhbbbkga-borobudur-temple-climb-to-the-top-prambanan-temple-1-day-tour', name: 'Borobudur Temple Tour' },
      { slug: 'yogyakarta-prambanan-temple-tour', name: 'Prambanan Temple Tour' },
      { slug: 'yogyakarta-city-tour', name: 'Yogyakarta City Tour' },
      { slug: 'yogyakarta-mount-merapi-tour', name: 'Mount Merapi Tour' },
      { slug: 'yogyakarta-sultan-palace-tour', name: 'Sultan Palace Tour' }
    ];
  }
  
  // Default to empty array if no matches
  return [];
}

function mapToAttractionFromDetails(raw, slug) {
  try {
    if (!raw || !raw.data || !raw.data.data || !raw.data.data.attractionsProduct) {
      return null;
    }

    const product = raw.data.data.attractionsProduct.getProduct;
    
    return {
      id: product.id || slug,
      slug: product.slug || slug,
      name: product.name || 'Unknown Attraction',
      description: product.description || '',
      location: product.ufiDetails?.bCityName || 'Unknown Location',
      country: product.ufiDetails?.url?.country || 'Unknown',
      price: product.representativePrice?.publicAmount || 0,
      currency: product.representativePrice?.currency || 'USD',
      rating: product.reviewsStats?.combinedNumericStats?.average || 0,
      totalReviews: product.reviewsStats?.combinedNumericStats?.total || 0,
      imageUrl: product.primaryPhoto?.small || null,
      isBookable: product.isBookable || false
    };
  } catch (error) {
    console.error('Error mapping attraction from details:', error);
    return null;
  }
}

function mockAttractionSearch(query) {
  const destination = query.toLowerCase();
  
  // Paris mock attractions
  if (destination.includes('paris') || destination.includes('france')) {
    return [
      {
        id: 'paris-eiffel-1',
        slug: 'paris-eiffel-tower-skip-the-line-ticket',
        name: 'Eiffel Tower Skip-the-Line Ticket',
        description: 'Skip the long lines and enjoy priority access to the iconic Eiffel Tower',
        location: 'Paris, France',
        price: 45,
        currency: 'USD',
        rating: 4.7,
        totalReviews: 1250,
        imageUrl: 'https://example.com/eiffel-tower.jpg',
        isBookable: true
      },
      {
        id: 'paris-louvre-1',
        slug: 'paris-louvre-museum-guided-tour',
        name: 'Louvre Museum Guided Tour',
        description: 'Explore the world\'s largest art museum with an expert guide',
        location: 'Paris, France',
        price: 65,
        currency: 'USD',
        rating: 4.6,
        totalReviews: 890,
        imageUrl: 'https://example.com/louvre.jpg',
        isBookable: true
      },
      {
        id: 'paris-seine-1',
        slug: 'paris-seine-river-cruise',
        name: 'Seine River Cruise',
        description: 'Enjoy a romantic cruise along the Seine River with stunning city views',
        location: 'Paris, France',
        price: 35,
        currency: 'USD',
        rating: 4.5,
        totalReviews: 567,
        imageUrl: 'https://example.com/seine-cruise.jpg',
        isBookable: true
      },
      {
        id: 'paris-versailles-1',
        slug: 'paris-versailles-palace-tour',
        name: 'Versailles Palace Tour',
        description: 'Visit the magnificent Palace of Versailles with its stunning gardens',
        location: 'Paris, France',
        price: 85,
        currency: 'USD',
        rating: 4.8,
        totalReviews: 432,
        imageUrl: 'https://example.com/versailles.jpg',
        isBookable: true
      },
      {
        id: 'paris-montmartre-1',
        slug: 'paris-montmartre-walking-tour',
        name: 'Montmartre Walking Tour',
        description: 'Discover the artistic neighborhood of Montmartre and Sacré-Cœur',
        location: 'Paris, France',
        price: 28,
        currency: 'USD',
        rating: 4.4,
        totalReviews: 345,
        imageUrl: 'https://example.com/montmartre.jpg',
        isBookable: true
      }
    ];
  }
  
  // Default mock attractions
  const attractions = [
    {
      id: 'attraction-1',
      slug: 'borobudur-temple-tour',
      name: 'Borobudur Temple Tour',
      description: 'Guided tour of the world\'s largest Buddhist temple',
      location: query,
      price: 149,
      currency: 'USD',
      rating: 4.8,
      totalReviews: 110,
      imageUrl: 'https://example.com/borobudur.jpg',
      isBookable: true
    },
    {
      id: 'attraction-2',
      slug: 'prambanan-temple-tour',
      name: 'Prambanan Temple Tour',
      description: 'Explore the second largest Hindu temple in the world',
      location: query,
      price: 89,
      currency: 'USD',
      rating: 4.6,
      totalReviews: 85,
      imageUrl: 'https://example.com/prambanan.jpg',
      isBookable: true
    },
    {
      id: 'attraction-3',
      slug: 'city-tour',
      name: 'City Tour',
      description: 'Discover the cultural heart of the city',
      location: query,
      price: 65,
      currency: 'USD',
      rating: 4.4,
      totalReviews: 72,
      imageUrl: 'https://example.com/city-tour.jpg',
      isBookable: true
    }
  ];

  return attractions;
}
