import { describe, it, expect } from 'vitest';
import { itineraryRequestSchema, itineraryResponseSchema } from '../lib/schemas';

describe('Itinerary API', () => {
  it('should validate itinerary request schema', () => {
    const validRequest = {
      destination: 'Paris, France',
      startDate: '2025-09-10',
      endDate: '2025-09-13',
      budgetTotal: 600,
      travelers: 2,
      pace: 'relaxed' as const,
      interests: ['food', 'history', 'art'],
      mustSee: ['Louvre', 'Eiffel Tower'],
    };

    const result = itineraryRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should validate itinerary response schema', () => {
    const validResponse = {
      currency: 'EUR',
      totalDays: 3,
      dailyBudgetTarget: 200,
      estimatedTotal: 580,
      days: [
        {
          date: '2025-09-10',
          summary: 'Arrival and exploration of central Paris',
          items: [
            {
              time: '09:30',
              title: 'Croissant & coffee near hotel',
              category: 'food' as const,
              lat: null,
              lng: null,
              estCost: 15,
              notes: 'Start the day with a classic French breakfast',
              booking: {
                type: 'none' as const,
                operator: null,
                externalUrl: null,
                id: null,
              },
            },
          ],
          subtotal: 15,
        },
      ],
    };

    const result = itineraryResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it('should reject invalid request data', () => {
    const invalidRequest = {
      destination: '',
      startDate: 'invalid-date',
      endDate: '2025-09-13',
      budgetTotal: -100,
      travelers: 0,
      pace: 'invalid-pace',
      interests: 'not-an-array',
      mustSee: ['Louvre'],
    };

    const result = itineraryRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });
});
