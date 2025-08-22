"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = healthRoutes;
async function healthRoutes(fastify) {
    fastify.get("/health", async (request, reply) => {
        return {
            status: "ok",
            timestamp: new Date().toISOString(),
            service: "tripweaver-api",
            version: "0.1.0",
        };
    });
}
