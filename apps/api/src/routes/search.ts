import { FastifyInstance } from "fastify";
import { z } from "zod";

const SearchFlightsSchema = z.object({
  origin: z.string(),
  destination: z.string(),
  dates: z.object({
    start: z.string(),
    end: z.string(),
  }),
  pax: z.number().int().min(1),
  budget: z.number().optional(),
});

const SearchHotelsSchema = z.object({
  destination: z.string(),
  dates: z.object({
    start: z.string(),
    end: z.string(),
  }),
  pax: z.number().int().min(1),
  area: z.string().optional(),
});

const SearchActivitiesSchema = z.object({
  destination: z.string(),
  date: z.string(),
  categories: z.array(z.string()).optional(),
  budget: z.number().optional(),
});

// Mock data for search results
const mockFlights = [
  {
    id: "flight-1",
    title: "Direct Flight to Paris",
    price: 450,
    currency: "USD",
    supplier: "kiwi" as const,
    url: "https://www.kiwi.com/us/booking?token=mock-token-1",
    startAt: "2024-06-15T10:00:00Z",
    endAt: "2024-06-15T14:30:00Z",
    duration: "4h 30m",
    stops: 0,
    airlines: ["Air France"]
  },
  {
    id: "flight-2",
    title: "Connecting Flight to Paris",
    price: 320,
    currency: "USD",
    supplier: "booking" as const,
    url: "https://www.booking.com/flights/from-nyc/to-paris",
    startAt: "2024-06-15T08:00:00Z",
    endAt: "2024-06-15T16:45:00Z",
    duration: "8h 45m",
    stops: 1,
    airlines: ["Delta", "Air France"]
  }
];

const mockHotels = [
  {
    id: "hotel-1",
    title: "Luxury Hotel in Paris",
    price: 200,
    currency: "USD",
    supplier: "booking" as const,
    url: "https://www.booking.com/hotel/fr/luxury-paris",
    rating: 4.8,
    amenities: ["WiFi", "Pool", "Spa", "Restaurant"],
    location: "Champs-Élysées, Paris"
  },
  {
    id: "hotel-2",
    title: "Cozy Airbnb in Montmartre",
    price: 150,
    currency: "USD",
    supplier: "airbnb" as const,
    url: "https://www.airbnb.com/rooms/mock-room-1",
    rating: 4.9,
    amenities: ["WiFi", "Kitchen", "Balcony"],
    location: "Montmartre, Paris"
  }
];

const mockActivities = [
  {
    id: "activity-1",
    title: "Paris City Tour",
    price: 50,
    currency: "USD",
    supplier: "gyg" as const,
    url: "https://www.getyourguide.com/paris-l16/paris-city-tour",
    duration: "3h",
    rating: 4.7,
    category: "Sightseeing",
    location: "Paris, France"
  },
  {
    id: "activity-2",
    title: "Food Tasting Experience",
    price: 75,
    currency: "USD",
    supplier: "gyg" as const,
    url: "https://www.getyourguide.com/paris-l16/food-tasting",
    duration: "2h 30m",
    rating: 4.9,
    category: "Food & Drink",
    location: "Le Marais, Paris"
  }
];

export async function searchRoutes(fastify: FastifyInstance) {
  // POST /v1/search/flights
  fastify.post("/flights", {}, async (request, reply) => {
    const { origin, destination, dates, pax, budget } = request.body as z.infer<typeof SearchFlightsSchema>;

    try {
      // Return mock flight data
      const offers = mockFlights.map(flight => ({
        ...flight,
        title: flight.title.replace('Paris', destination)
      }));

      return { offers };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Failed to search flights" });
    }
  });

  // POST /v1/search/hotels
  fastify.post("/hotels", {}, async (request, reply) => {
    const { destination, dates, pax, area } = request.body as z.infer<typeof SearchHotelsSchema>;

    try {
      // Return mock hotel data
      const offers = mockHotels.map(hotel => ({
        ...hotel,
        title: hotel.title.replace('Paris', destination)
      }));

      return { offers };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Failed to search hotels" });
    }
  });

  // POST /v1/search/activities
  fastify.post("/activities", {}, async (request, reply) => {
    const { destination, date, categories, budget } = request.body as z.infer<typeof SearchActivitiesSchema>;

    try {
      // Return mock activity data
      const offers = mockActivities.map(activity => ({
        ...activity,
        title: activity.title.replace('Paris', destination)
      }));

      return { offers };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Failed to search activities" });
    }
  });
}
