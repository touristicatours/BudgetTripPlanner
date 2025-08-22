import { z } from "zod";

export const TripPreferencesSchema = z.object({
  destination: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  travelers: z.number().int().min(1).max(10),
  currency: z.string().length(3),
  budgetTotal: z.number().int().min(1),
  pace: z.enum(["relaxed", "moderate", "fast"]),
  interests: z.array(z.string()),
  dietary: z.array(z.string()),
  mustSee: z.array(z.string()),
});

export const SearchParamsSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().min(1),
  dates: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
  pax: z.number().int().min(1).optional(),
  budget: z.number().int().min(1).optional(),
  area: z.string().optional(),
  categories: z.array(z.string()).optional(),
  date: z.string().optional(),
});

export const DayItemSchema = z.object({
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  title: z.string().min(1),
  category: z.enum(["flight", "hotel", "activity", "sightseeing", "food", "transport", "rest"]),
  lat: z.number().optional(),
  lng: z.number().optional(),
  durationMin: z.number().int().min(1).optional(),
  estCost: z.number().int().min(0),
  notes: z.string(),
  booking: z.object({
    type: z.enum(["flight", "hotel", "tour", "ticket", "none"]),
    operator: z.string().nullable(),
    url: z.string().url().nullable(),
  }),
});

export const DaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  summary: z.string(),
  items: z.array(DayItemSchema),
  subtotal: z.number().int().min(0),
});

export const ItinerarySchema = z.object({
  currency: z.string().length(3),
  estimatedTotal: z.number().int().min(0),
  days: z.array(DaySchema),
});

export const OfferSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number().int().min(0),
  currency: z.string().length(3),
  supplier: z.enum(["kiwi", "booking", "airbnb", "gyg"]),
  url: z.string().url().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  extra: z.record(z.any()).optional(),
});

export const RemarkableSightSchema = z.object({
  title: z.string(),
  lat: z.number(),
  lng: z.number(),
  tags: z.array(z.string()),
  estCost: z.number().int().min(0),
  open: z.string().optional(),
  close: z.string().optional(),
  closed: z.array(z.string()).optional(),
});

export const RemarkableCitySchema = z.object({
  city: z.string(),
  country: z.string(),
  sights: z.array(RemarkableSightSchema),
  signatureFoods: z.array(z.string()),
});
