export interface MockFlight {
  id: string;
  title: string;
  price: number;
  currency: string;
  supplier: 'kiwi' | 'booking';
  url?: string;
  startAt?: string;
  endAt?: string;
  duration?: string;
  stops?: number;
  airlines?: string[];
}

export interface MockHotel {
  id: string;
  title: string;
  price: number;
  currency: string;
  supplier: 'booking' | 'airbnb';
  url?: string;
  rating?: number;
  amenities?: string[];
  location?: string;
}

export interface MockActivity {
  id: string;
  title: string;
  price: number;
  currency: string;
  supplier: 'gyg';
  url?: string;
  duration?: string;
  rating?: number;
  category?: string;
  location?: string;
}

export interface MockItineraryDay {
  date: string;
  summary: string;
  items: MockItineraryItem[];
  subtotal: number;
}

export interface MockItineraryItem {
  time: string;
  title: string;
  category: 'flight' | 'hotel' | 'activity' | 'sightseeing' | 'food' | 'transport' | 'rest';
  lat?: number;
  lng?: number;
  durationMin?: number;
  estCost: number;
  notes: string;
  booking: {
    type: 'flight' | 'hotel' | 'tour' | 'ticket' | 'none';
    operator: string | null;
    url: string | null;
  };
}

export interface MockItinerary {
  currency: string;
  estimatedTotal: number;
  days: MockItineraryDay[];
}

// Mock flight data
export const mockFlights: MockFlight[] = [
  {
    id: 'flight-1',
    title: 'Direct Flight to Paris',
    price: 450,
    currency: 'USD',
    supplier: 'kiwi',
    url: 'https://www.kiwi.com/us/booking?token=mock-token-1',
    startAt: '2024-06-15T10:00:00Z',
    endAt: '2024-06-15T14:30:00Z',
    duration: '4h 30m',
    stops: 0,
    airlines: ['Air France']
  },
  {
    id: 'flight-2',
    title: 'Connecting Flight to Paris',
    price: 320,
    currency: 'USD',
    supplier: 'booking',
    url: 'https://www.booking.com/flights/from-nyc/to-paris',
    startAt: '2024-06-15T08:00:00Z',
    endAt: '2024-06-15T16:45:00Z',
    duration: '8h 45m',
    stops: 1,
    airlines: ['Delta', 'Air France']
  },
  {
    id: 'flight-3',
    title: 'Premium Flight to Paris',
    price: 850,
    currency: 'USD',
    supplier: 'kiwi',
    url: 'https://www.kiwi.com/us/booking?token=mock-token-3',
    startAt: '2024-06-15T12:00:00Z',
    endAt: '2024-06-15T16:00:00Z',
    duration: '4h 0m',
    stops: 0,
    airlines: ['Lufthansa']
  }
];

// Mock hotel data
export const mockHotels: MockHotel[] = [
  {
    id: 'hotel-1',
    title: 'Luxury Hotel in Paris',
    price: 200,
    currency: 'USD',
    supplier: 'booking',
    url: 'https://www.booking.com/hotel/fr/luxury-paris',
    rating: 4.8,
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'],
    location: 'Champs-Élysées, Paris'
  },
  {
    id: 'hotel-2',
    title: 'Cozy Airbnb in Montmartre',
    price: 150,
    currency: 'USD',
    supplier: 'airbnb',
    url: 'https://www.airbnb.com/rooms/mock-room-1',
    rating: 4.9,
    amenities: ['WiFi', 'Kitchen', 'Balcony'],
    location: 'Montmartre, Paris'
  },
  {
    id: 'hotel-3',
    title: 'Boutique Hotel in Le Marais',
    price: 180,
    currency: 'USD',
    supplier: 'booking',
    url: 'https://www.booking.com/hotel/fr/boutique-marais',
    rating: 4.6,
    amenities: ['WiFi', 'Bar', 'Garden'],
    location: 'Le Marais, Paris'
  }
];

// Mock activity data
export const mockActivities: MockActivity[] = [
  {
    id: 'activity-1',
    title: 'Paris City Tour',
    price: 50,
    currency: 'USD',
    supplier: 'gyg',
    url: 'https://www.getyourguide.com/paris-l16/paris-city-tour',
    duration: '3h',
    rating: 4.7,
    category: 'Sightseeing',
    location: 'Paris, France'
  },
  {
    id: 'activity-2',
    title: 'Food Tasting Experience',
    price: 75,
    currency: 'USD',
    supplier: 'gyg',
    url: 'https://www.getyourguide.com/paris-l16/food-tasting',
    duration: '2h 30m',
    rating: 4.9,
    category: 'Food & Drink',
    location: 'Le Marais, Paris'
  },
  {
    id: 'activity-3',
    title: 'Louvre Museum Skip-the-Line',
    price: 35,
    currency: 'USD',
    supplier: 'gyg',
    url: 'https://www.getyourguide.com/paris-l16/louvre-skip-line',
    duration: '2h',
    rating: 4.8,
    category: 'Museums',
    location: 'Louvre, Paris'
  },
  {
    id: 'activity-4',
    title: 'Eiffel Tower Summit Access',
    price: 45,
    currency: 'USD',
    supplier: 'gyg',
    url: 'https://www.getyourguide.com/paris-l16/eiffel-tower-summit',
    duration: '1h 30m',
    rating: 4.6,
    category: 'Sightseeing',
    location: 'Eiffel Tower, Paris'
  }
];

// Mock itinerary data
export const mockItinerary: MockItinerary = {
  currency: 'USD',
  estimatedTotal: 1250,
  days: [
    {
      date: '2024-06-15',
      summary: 'Arrival and first day in Paris',
      subtotal: 450,
      items: [
        {
          time: '10:00',
          title: 'Flight to Paris',
          category: 'flight',
          durationMin: 270,
          estCost: 450,
          notes: 'Direct flight from NYC to Paris',
          booking: {
            type: 'flight',
            operator: 'Air France',
            url: 'https://www.kiwi.com/us/booking?token=mock-token-1'
          }
        },
        {
          time: '14:30',
          title: 'Check-in at Hotel',
          category: 'hotel',
          durationMin: 30,
          estCost: 0,
          notes: 'Check-in at Luxury Hotel in Paris',
          booking: {
            type: 'hotel',
            operator: 'Luxury Hotel',
            url: 'https://www.booking.com/hotel/fr/luxury-paris'
          }
        },
        {
          time: '16:00',
          title: 'Eiffel Tower Visit',
          category: 'sightseeing',
          durationMin: 90,
          estCost: 45,
          notes: 'Skip-the-line access to Eiffel Tower',
          booking: {
            type: 'ticket',
            operator: 'GetYourGuide',
            url: 'https://www.getyourguide.com/paris-l16/eiffel-tower-summit'
          }
        },
        {
          time: '18:30',
          title: 'Dinner at Local Bistro',
          category: 'food',
          durationMin: 90,
          estCost: 60,
          notes: 'Traditional French cuisine',
          booking: {
            type: 'none',
            operator: null,
            url: null
          }
        }
      ]
    },
    {
      date: '2024-06-16',
      summary: 'Cultural day in Paris',
      subtotal: 800,
      items: [
        {
          time: '09:00',
          title: 'Louvre Museum',
          category: 'sightseeing',
          durationMin: 120,
          estCost: 35,
          notes: 'Skip-the-line access to Louvre',
          booking: {
            type: 'ticket',
            operator: 'GetYourGuide',
            url: 'https://www.getyourguide.com/paris-l16/louvre-skip-line'
          }
        },
        {
          time: '12:00',
          title: 'Lunch at Café',
          category: 'food',
          durationMin: 60,
          estCost: 25,
          notes: 'Light lunch at local café',
          booking: {
            type: 'none',
            operator: null,
            url: null
          }
        },
        {
          time: '14:00',
          title: 'Paris City Tour',
          category: 'activity',
          durationMin: 180,
          estCost: 50,
          notes: 'Guided city tour of Paris',
          booking: {
            type: 'tour',
            operator: 'GetYourGuide',
            url: 'https://www.getyourguide.com/paris-l16/paris-city-tour'
          }
        },
        {
          time: '18:00',
          title: 'Dinner at Fine Restaurant',
          category: 'food',
          durationMin: 120,
          estCost: 120,
          notes: 'Fine dining experience',
          booking: {
            type: 'none',
            operator: null,
            url: null
          }
        }
      ]
    }
  ]
};

// Mock AI responses
export const mockAIResponses = {
  greeting: "Hi! I'm your AI travel assistant. I can help you plan the perfect trip to Paris! What's your budget for this adventure?",
  budgetQuestion: "Great! I understand you want to go to Paris. What's your budget for this adventure?",
  interestsQuestion: "What are your main interests? (e.g., art, food, history, shopping, nightlife)",
  dietaryQuestion: "Do you have any dietary restrictions or preferences?",
  paceQuestion: "How would you describe your travel pace? (relaxed, moderate, or fast-paced)",
  confirmation: "Perfect! I have all the information I need. Let me create a personalized itinerary for your trip to Paris!"
};
