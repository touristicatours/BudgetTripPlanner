"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRoutes = searchRoutes;
const zod_1 = require("zod");
const SearchFlightsSchema = zod_1.z.object({
    origin: zod_1.z.string(),
    destination: zod_1.z.string(),
    dates: zod_1.z.object({
        start: zod_1.z.string(),
        end: zod_1.z.string(),
    }),
    pax: zod_1.z.number().int().min(1),
    budget: zod_1.z.number().optional(),
});
const SearchHotelsSchema = zod_1.z.object({
    destination: zod_1.z.string(),
    dates: zod_1.z.object({
        start: zod_1.z.string(),
        end: zod_1.z.string(),
    }),
    pax: zod_1.z.number().int().min(1),
    area: zod_1.z.string().optional(),
});
const SearchActivitiesSchema = zod_1.z.object({
    destination: zod_1.z.string(),
    date: zod_1.z.string(),
    categories: zod_1.z.array(zod_1.z.string()).optional(),
    budget: zod_1.z.number().optional(),
});
// Mock data for search results
const mockFlights = [
    {
        id: "flight-1",
        title: "Direct Flight to Paris",
        price: 450,
        currency: "USD",
        supplier: "kiwi",
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
        supplier: "booking",
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
        supplier: "booking",
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
        supplier: "airbnb",
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
        supplier: "gyg",
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
        supplier: "gyg",
        url: "https://www.getyourguide.com/paris-l16/food-tasting",
        duration: "2h 30m",
        rating: 4.9,
        category: "Food & Drink",
        location: "Le Marais, Paris"
    }
];
async function searchRoutes(fastify) {
    // POST /v1/search/flights
    fastify.post("/flights", {}, async (request, reply) => {
        const { origin, destination, dates, pax, budget } = request.body;
        try {
            // Return mock flight data
            const offers = mockFlights.map(flight => ({
                ...flight,
                title: flight.title.replace('Paris', destination)
            }));
            return { offers };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: "Failed to search flights" });
        }
    });
    // POST /v1/search/hotels
    fastify.post("/hotels", {}, async (request, reply) => {
        const { destination, dates, pax, area } = request.body;
        try {
            // Return mock hotel data
            const offers = mockHotels.map(hotel => ({
                ...hotel,
                title: hotel.title.replace('Paris', destination)
            }));
            return { offers };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: "Failed to search hotels" });
        }
    });
    // POST /v1/search/activities
    fastify.post("/activities", {}, async (request, reply) => {
        const { destination, date, categories, budget } = request.body;
        try {
            // Return mock activity data
            const offers = mockActivities.map(activity => ({
                ...activity,
                title: activity.title.replace('Paris', destination)
            }));
            return { offers };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: "Failed to search activities" });
        }
    });
}
