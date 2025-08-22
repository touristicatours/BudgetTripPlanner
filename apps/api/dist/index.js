"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const health_1 = require("./routes/health");
const ai_1 = require("./routes/ai");
const search_1 = require("./routes/search");
const places_1 = require("./routes/places");
const redis_1 = require("./lib/redis");
const fastify = (0, fastify_1.default)({
    logger: true,
});
async function start() {
    try {
        // Register plugins
        await fastify.register(cors_1.default, {
            origin: true,
        });
        await fastify.register(helmet_1.default);
        await fastify.register(rate_limit_1.default, {
            max: 100,
            timeWindow: "1 minute",
        });
        // Register routes
        await fastify.register(health_1.healthRoutes, { prefix: "/v1" });
        await fastify.register(ai_1.aiRoutes, { prefix: "/v1/ai" });
        await fastify.register(search_1.searchRoutes, { prefix: "/v1/search" });
        await fastify.register(places_1.placesRoutes, { prefix: "/v1/places" });
        // Connect to Redis
        await (0, redis_1.connectRedis)();
        await fastify.listen({ port: 3001, host: "0.0.0.0" });
        console.log("🚀 TripWeaver API server running on port 3001");
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
start();
