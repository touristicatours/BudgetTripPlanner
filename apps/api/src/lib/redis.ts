import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = createClient({
  url: redisUrl,
});

// Silent error handling to reduce console spam
redis.on("error", () => {
  // Completely silent - no logging
});

export async function connectRedis() {
  try {
    // Attempt to connect, but don't block server startup if Redis is unavailable
    const connectPromise = redis.connect();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("redis-connect-timeout")), 1000));
    await Promise.race([connectPromise, timeoutPromise]);
    if (redis.isOpen) {
      console.log("✅ Connected to Redis");
    }
  } catch (error) {
    // Silent fail - allow server to continue without Redis
  }
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    if (!redis.isOpen) return null;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
}

export async function setCachedData<T>(key: string, data: T, ttl = 3600): Promise<void> {
  try {
    if (!redis.isOpen) return;
    await redis.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {
    // Silent fail
  }
}
