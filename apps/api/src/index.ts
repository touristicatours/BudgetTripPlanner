import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

import { healthRoutes } from "./routes/health";
import { aiRoutes } from "./routes/ai";
import { searchRoutes } from "./routes/search";
import { placesRoutes } from "./routes/places";
import aiExplanationsRoutes from "./routes/ai_explanations";
import { healthScoringRoutes } from "./routes/health_scoring";
import { proactiveTipsRoutes } from './routes/proactive_tips';
import { collaborationRoutes } from './routes/collaboration';
import { subscriptionRoutes } from './routes/subscription';
import { SocketService } from './services/socket_service';
import { connectRedis } from "./lib/redis";

const fastify = Fastify({
  logger: true,
});

async function start() {
  try {
    // Register plugins
    await fastify.register(cors, {
      origin: true,
    });

    await fastify.register(helmet);

    await fastify.register(rateLimit, {
      max: 100,
      timeWindow: "1 minute",
    });

    // Register routes
    await fastify.register(healthRoutes, { prefix: "/v1" });
    await fastify.register(aiRoutes, { prefix: "/v1/ai" });
    await fastify.register(searchRoutes, { prefix: "/v1/search" });
    await fastify.register(placesRoutes, { prefix: "/v1/places" });
    await fastify.register(aiExplanationsRoutes);
    await fastify.register(healthScoringRoutes);
    await fastify.register(proactiveTipsRoutes);
    await fastify.register(collaborationRoutes);
    await fastify.register(subscriptionRoutes);

    // Connect to Redis
    await connectRedis();

    await fastify.listen({ port: 3001, host: "0.0.0.0" });
    console.log("🚀 TripWeaver API server running on port 3001");

    // Initialize Socket.IO after server starts
    const server = fastify.server;
    const socketService = new SocketService(server);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
