import { FastifyInstance } from "fastify";
import { z } from "zod";
import { placesService } from "../services/places_service";

const PlacesSearchSchema = z.object({
  query: z.string().optional(),
  type: z.enum(["restaurant", "poi", "museum", "park", "cafe", "hotel", "attraction"]).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radius: z.number().optional(),
});

export async function placesRoutes(fastify: FastifyInstance) {
  // GET /v1/places - Search for places using Google Places API
  fastify.get("/places", {}, async (request, reply) => {
    const { query, type, lat, lng, radius = 5000 } = request.query as z.infer<typeof PlacesSearchSchema>;

    try {
      // Validate required parameters
      if (!lat || !lng) {
        return reply.status(400).send({ 
          error: "Latitude and longitude are required parameters" 
        });
      }

      // Get places from the service
      const places = await placesService.getPlaces(lat, lng, query, radius, type);

      return {
        places,
        count: places.length,
        query: query || 'nearby',
        location: { lat, lng },
        radius,
        type: type || 'all'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Failed to search places" });
    }
  });

  // GET /v1/places/cache/stats - Get cache statistics
  fastify.get("/places/cache/stats", {}, async (request, reply) => {
    try {
      const stats = placesService.getCacheStats();
      return {
        cache: stats,
        message: "Cache statistics retrieved successfully"
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Failed to get cache stats" });
    }
  });

  // DELETE /v1/places/cache - Clear the places cache
  fastify.delete("/places/cache", {}, async (request, reply) => {
    try {
      placesService.clearCache();
      return {
        message: "Places cache cleared successfully"
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Failed to clear cache" });
    }
  });
}
