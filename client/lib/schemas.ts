import { z } from 'zod';

export const itineraryRequestSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  budgetTotal: z.number().positive('Budget must be positive'),
  travelers: z.number().int().min(1, 'At least 1 traveler required'),
  pace: z.enum(['relaxed', 'standard', 'intense']),
  interests: z.array(z.string()),
  mustSee: z.array(z.string()),
  currency: z.string().optional(),
});

export const bookingSchema = z.object({
  type: z.enum(['flight', 'hotel', 'tour', 'ticket', 'none']),
  operator: z.string().nullable(),
  externalUrl: z.string().nullable(),
  id: z.string().nullable(),
});

export const itineraryItemSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  title: z.string().min(1, 'Title is required'),
  category: z.enum(['food', 'sightseeing', 'activity', 'transport', 'rest']),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  estCost: z.number().nonnegative('Cost must be non-negative'),
  notes: z.string(),
  booking: bookingSchema,
});

export const itineraryDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  summary: z.string().min(1, 'Summary is required'),
  items: z.array(itineraryItemSchema),
  subtotal: z.number().nonnegative('Subtotal must be non-negative'),
});

export const itineraryResponseSchema = z.object({
  currency: z.string().min(1, 'Currency is required'),
  totalDays: z.number().int().positive('Total days must be positive'),
  dailyBudgetTarget: z.number().positive('Daily budget target must be positive'),
  estimatedTotal: z.number().nonnegative('Estimated total must be non-negative'),
  days: z.array(itineraryDaySchema),
});

export type ItineraryRequest = z.infer<typeof itineraryRequestSchema>;
export type ItineraryResponse = z.infer<typeof itineraryResponseSchema>;
