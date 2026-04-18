// Rate limiting using Upstash Redis
// Uses existing KV_REST_API_URL and KV_REST_API_TOKEN env vars

const KV_URL = process.env.KV_REST_API_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || "";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // seconds
}

// Simple sliding window rate limiter using Upstash REST API
export async function rateLimit(
  key: string,
  maxRequests: number = 60,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  if (!KV_URL || !KV_TOKEN) {
    // No Redis configured — allow all (graceful degradation)
    return { allowed: true, remaining: maxRequests, resetIn: 0 };
  }

  const now = Math.floor(Date.now() / 1000);
  const windowKey = `rl:${key}:${Math.floor(now / windowSeconds)}`;

  try {
    // INCR the counter for this window
    const incrRes = await fetch(`${KV_URL}/incr/${encodeURIComponent(windowKey)}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
    });
    const incrData = await incrRes.json();
    const count = incrData.result || 1;

    // Set TTL on first request in window
    if (count === 1) {
      await fetch(`${KV_URL}/expire/${encodeURIComponent(windowKey)}/${windowSeconds}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
      });
    }

    const remaining = Math.max(0, maxRequests - count);
    const resetIn = windowSeconds - (now % windowSeconds);

    return {
      allowed: count <= maxRequests,
      remaining,
      resetIn,
    };
  } catch (e) {
    // Redis error — allow request (don't break the app)
    console.error("[rate-limit] Redis error:", (e as Error).message);
    return { allowed: true, remaining: maxRequests, resetIn: 0 };
  }
}

// Pre-configured limiters for different route types
export const limiters = {
  // General API: 60 requests per minute
  api: (ip: string) => rateLimit(`api:${ip}`, 60, 60),

  // Auth/login: 10 attempts per minute (prevent brute force)
  auth: (ip: string) => rateLimit(`auth:${ip}`, 10, 60),

  // Messages: 30 per minute (prevent spam)
  messages: (ip: string) => rateLimit(`msg:${ip}`, 30, 60),

  // File uploads: 10 per minute
  uploads: (ip: string) => rateLimit(`upload:${ip}`, 10, 60),

  // Push sends: 20 per minute
  push: (ip: string) => rateLimit(`push:${ip}`, 20, 60),
};
