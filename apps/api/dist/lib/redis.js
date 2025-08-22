"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
exports.connectRedis = connectRedis;
exports.getCachedData = getCachedData;
exports.setCachedData = setCachedData;
const redis_1 = require("redis");
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
exports.redis = (0, redis_1.createClient)({
    url: redisUrl,
});
// Silent error handling to reduce console spam
exports.redis.on("error", () => {
    // Completely silent - no logging
});
async function connectRedis() {
    try {
        // Attempt to connect, but don't block server startup if Redis is unavailable
        const connectPromise = exports.redis.connect();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("redis-connect-timeout")), 1000));
        await Promise.race([connectPromise, timeoutPromise]);
        if (exports.redis.isOpen) {
            console.log("✅ Connected to Redis");
        }
    }
    catch (error) {
        // Silent fail - allow server to continue without Redis
    }
}
async function getCachedData(key) {
    try {
        if (!exports.redis.isOpen)
            return null;
        const data = await exports.redis.get(key);
        return data ? JSON.parse(data) : null;
    }
    catch (error) {
        return null;
    }
}
async function setCachedData(key, data, ttl = 3600) {
    try {
        if (!exports.redis.isOpen)
            return;
        await exports.redis.setEx(key, ttl, JSON.stringify(data));
    }
    catch (error) {
        // Silent fail
    }
}
