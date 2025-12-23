import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter
// In production, use Redis or Upstash
const rateLimitStore = new Map<
  string,
  { count: number; resetTime: number }
>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute

function checkRateLimit(key: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // New window
    const resetTime = now + RATE_LIMIT_WINDOW;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime,
    };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  rateLimitStore.set(key, record);

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - record.count,
    resetTime: record.resetTime,
  };
}

function validateApiKey(apiKey: string): boolean {
  // TODO: Validate against database
  // For development, accept any non-empty key starting with 'yg_'
  const validKey = process.env.API_KEY || 'yg_dev_key';
  return apiKey === validKey;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy for non-API routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Skip authentication for health check endpoints
  if (pathname === '/api/proxy' && request.method === 'GET') {
    return NextResponse.next();
  }

  // API Key validation
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing API key. Provide x-api-key header.' },
      { status: 401 }
    );
  }

  if (!validateApiKey(apiKey)) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }

  // Rate limiting
  const rateLimitKey = `ratelimit:${apiKey}:${pathname}`;
  const rateLimit = checkRateLimit(rateLimitKey);

  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil(
      (rateLimit.resetTime - Date.now()) / 1000
    );

    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        },
      }
    );
  }

  // Add rate limit headers to response
  const response = NextResponse.next();
  response.headers.set(
    'X-RateLimit-Limit',
    RATE_LIMIT_MAX_REQUESTS.toString()
  );
  response.headers.set(
    'X-RateLimit-Remaining',
    rateLimit.remaining.toString()
  );
  response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
