export type Offer = {
  id: string;
  title: string;
  price: number;
  currency: string;
  supplier: "kiwi" | "booking" | "airbnb" | "gyg";
  url?: string;
  lat?: number;
  lng?: number;
  startAt?: string;
  endAt?: string;
  extra?: Record<string, any>;
};

export type TripPreferences = {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  currency: string;
  budgetTotal: number;
  pace: "relaxed" | "moderate" | "fast";
  interests: string[];
  dietary: string[];
  mustSee: string[];
};

export type DayItem = {
  time: string;
  title: string;
  category: "flight" | "hotel" | "activity" | "sightseeing" | "food" | "transport" | "rest";
  lat?: number;
  lng?: number;
  durationMin?: number;
  estCost: number;
  notes: string;
  booking: {
    type: "flight" | "hotel" | "tour" | "ticket" | "none";
    operator: string | null;
    url: string | null;
  };
};

export type Day = {
  date: string;
  summary: string;
  items: DayItem[];
  subtotal: number;
};

export type Itinerary = {
  currency: string;
  estimatedTotal: number;
  days: Day[];
};

export type SearchParams = {
  origin?: string;
  destination: string;
  dates?: {
    start: string;
    end: string;
  };
  pax?: number;
  budget?: number;
  area?: string;
  categories?: string[];
  date?: string;
};

export type RemarkableSight = {
  title: string;
  lat: number;
  lng: number;
  tags: string[];
  estCost: number;
  open?: string;
  close?: string;
  closed?: string[];
};

export type RemarkableCity = {
  city: string;
  country: string;
  sights: RemarkableSight[];
  signatureFoods: string[];
};
