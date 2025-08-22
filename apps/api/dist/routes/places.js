"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.placesRoutes = placesRoutes;
const zod_1 = require("zod");
const places_service_1 = require("../services/places_service");
const PlacesSearchSchema = zod_1.z.object({
    query: zod_1.z.string().optional(),
    type: zod_1.z.enum(["restaurant", "poi", "museum", "park", "cafe", "hotel", "attraction"]).optional(),
    lat: zod_1.z.number().optional(),
    lng: zod_1.z.number().optional(),
    radius: zod_1.z.number().optional(),
});
async function placesRoutes(fastify) {
    // GET /v1/places - Search for places using Google Places API
    fastify.get("/places", {}, async (request, reply) => {
        const { query, type, lat, lng, radius = 5000 } = request.query;
        try {
            // Validate required parameters
            if (!lat || !lng) {
                return reply.status(400).send({
                    error: "Latitude and longitude are required parameters"
                });
            }
            // Get places from the service
            const places = await places_service_1.placesService.getPlaces(lat, lng, query, radius, type);
            return {
                places,
                count: places.length,
                query: query || 'nearby',
                location: { lat, lng },
                radius,
                type: type || 'all'
            };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: "Failed to search places" });
        }
    });
    // GET /v1/places/cache/stats - Get cache statistics
    fastify.get("/places/cache/stats", {}, async (request, reply) => {
        try {
            const stats = places_service_1.placesService.getCacheStats();
            return {
                cache: stats,
                message: "Cache statistics retrieved successfully"
            };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: "Failed to get cache stats" });
        }
    });
    // DELETE /v1/places/cache - Clear the places cache
    fastify.delete("/places/cache", {}, async (request, reply) => {
        try {
            places_service_1.placesService.clearCache();
            return {
                message: "Places cache cleared successfully"
            };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: "Failed to clear cache" });
        }
    });
}
