export type Pace = 'relaxed' | 'standard' | 'intense';

export type Category = 'food' | 'sightseeing' | 'activity' | 'transport' | 'rest';

export type BookingType = 'flight' | 'hotel' | 'tour' | 'ticket' | 'none';

export interface Booking {
  type: BookingType;
  operator: string | null;
  externalUrl: string | null;
  id: string | null;
}

export interface ItineraryItem {
  time: string;
  title: string;
  category: Category;
  lat: number | null;
  lng: number | null;
  estCost: number;
  notes: string;
  booking: Booking;
}

export interface ItineraryDay {
  date: string;
  summary: string;
  items: ItineraryItem[];
  subtotal: number;
}

export interface ItineraryResponse {
  currency: string;
  totalDays: number;
  dailyBudgetTarget: number;
  estimatedTotal: number;
  days: ItineraryDay[];
}

export interface ItineraryRequest {
  destination: string;
  startDate: string;
  endDate: string;
  budgetTotal: number;
  travelers: number;
  pace: Pace;
  interests: string[];
  mustSee: string[];
  currency?: string;
}

export interface ActivityOffer {
  id: string;
  title: string;
  price: number;
  currency: string;
  url: string;
}

export interface FlightOffer {
  id: string;
  airline: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  price: number;
  currency: string;
}

export interface HotelOffer {
  id: string;
  name: string;
  location: string;
  price: number;
  currency: string;
  rating: number;
  url: string;
}
