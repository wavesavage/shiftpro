import { NextRequest, NextResponse } from "next/server";

const KV_URL = process.env.KV_REST_API_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || "";

// Route-specific rate limits: [maxRequests, windowSeconds]
const ROUTE_LIMITS: Record<string, [number, number]> = {
  "/api/messages":  [30, 60],   // 30/min — prevent message spam
  "/api/documents": [10, 60],   // 10/min — file uploads are heavy
  "/api/push":      [20, 60],   // 20/min — push sends
  "/api/employee":  [60, 60],   // 60/min — general employee actions
  "/api/requests":  [30, 60],   // 30/min — swap/timeoff
  "/api/shifts":    [40, 60],   // 40/min — schedule operations
  "/api/org":       [20, 60],   // 20/min — org settings
  "/api/user":      [20, 60],   // 20/min — user updates
  "/api/portal-settings": [20, 60],
};

const DEFAULT_LIMIT: [number, number] = [60, 60]; // 60 requests per minute

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Only process API routes
  if (!path.startsWith("/api/")) return NextResponse.next();

  // ── XSS PROTECTION — block dangerous query params ──
  const url = req.nextUrl.toString();
  const xssPatterns = [
    /<script/i, /javascript\s*:/i, /on\w+\s*=/i, /<iframe/i, /<object/i,
    /<embed/i, /document\.(cookie|write)/i, /eval\s*\(/i, /alert\s*\(/i,
  ];
  const queryString = req.nextUrl.search || "";
  if (xssPatterns.some(p => p.test(queryString) || p.test(decodeURIComponent(queryString)))) {
    console.warn(`[xss] BLOCKED suspicious query: ${getClientIp(req)} on ${path}`);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // ── RATE LIMITING ──

  // Skip rate limiting if no Redis configured
  if (!KV_URL || !KV_TOKEN) return NextResponse.next();

  const ip = getClientIp(req);

  // Find matching route limit
  const routeKey = Object.keys(ROUTE_LIMITS).find(r => path.startsWith(r));
  const [maxReq, windowSec] = routeKey ? ROUTE_LIMITS[routeKey] : DEFAULT_LIMIT;

  const now = Math.floor(Date.now() / 1000);
  const windowKey = `rl:${path.split("/").slice(0, 3).join("/")}:${ip}:${Math.floor(now / windowSec)}`;

  try {
    // INCR counter
    const res = await fetch(`${KV_URL}/incr/${encodeURIComponent(windowKey)}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
    });
    const data = await res.json();
    const count = data.result || 1;

    // Set TTL on first hit
    if (count === 1) {
      fetch(`${KV_URL}/expire/${encodeURIComponent(windowKey)}/${windowSec}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
      }).catch(() => {});
    }

    const remaining = Math.max(0, maxReq - count);
    const resetIn = windowSec - (now % windowSec);

    // Rate limited
    if (count > maxReq) {
      console.warn(`[rate-limit] BLOCKED ${ip} on ${path} — ${count}/${maxReq} in ${windowSec}s`);
      return NextResponse.json(
        { error: "Too many requests. Please wait and try again.", retryAfter: resetIn },
        {
          status: 429,
          headers: {
            "Retry-After": String(resetIn),
            "X-RateLimit-Limit": String(maxReq),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(resetIn),
          },
        }
      );
    }

    // Add rate limit + security headers to successful responses
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(maxReq));
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    response.headers.set("X-RateLimit-Reset", String(resetIn));
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    return response;
  } catch (e) {
    // Redis failure — don't block the request
    return NextResponse.next();
  }
}

export const config = {
  matcher: "/api/:path*",
};
