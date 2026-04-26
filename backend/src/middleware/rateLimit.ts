import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { redis } from '../lib/redis.js';

const PUBLIC_POINTS = 100;
const PUBLIC_DURATION_SEC = 60;
const DEFAULT_PARTNER_POINTS = 1000;
const PARTNER_DURATION_SEC = 60;

// Sensitive endpoints: 5 req/min (auth challenge, webhook register)
const SENSITIVE_POINTS = 5;
const SENSITIVE_DURATION_SEC = 60;

const publicLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:public',
  points: PUBLIC_POINTS,
  duration: PUBLIC_DURATION_SEC,
});

// Default partner limiter — used when no per-key override is needed
const defaultPartnerLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:partner',
  points: DEFAULT_PARTNER_POINTS,
  duration: PARTNER_DURATION_SEC,
});

const sensitiveLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:sensitive',
  points: SENSITIVE_POINTS,
  duration: SENSITIVE_DURATION_SEC,
});

/** Returns a per-key limiter when the key has a custom rateLimit value. */
function getPartnerLimiter(_keyId: string, points: number): RateLimiterRedis {
  if (points === DEFAULT_PARTNER_POINTS) return defaultPartnerLimiter;
  return new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: `rl:partner:${points}`,
    points,
    duration: PARTNER_DURATION_SEC,
  });
}

function getRateLimitKey(req: Request): string {
  if (req.authenticated && req.authenticatedKeyId) {
    return `apikey:${req.authenticatedKeyId}`;
  }
  return req.ip ?? req.socket?.remoteAddress ?? 'unknown';
}

/** Attach X-RateLimit-Limit and X-RateLimit-Remaining headers to the response. */
function setRateLimitHeaders(res: Response, limit: number, rateLimiterRes: RateLimiterRes): void {
  res.set('X-RateLimit-Limit', String(limit));
  res.set('X-RateLimit-Remaining', String(rateLimiterRes.remainingPoints));
}

/**
 * Tiered rate limit:
 *   - Public (unauthenticated): 100 req/min by IP
 *   - Partner (authenticated API key): per-key rateLimit from DB (default 1000 req/min)
 *
 * Returns X-RateLimit-Limit and X-RateLimit-Remaining headers on every response.
 */
export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  const key = getRateLimitKey(req);

  let limiter: RateLimiterRedis;
  let limit: number;

  if (req.authenticated && req.authenticatedKeyId) {
    const points = req.apiKeyRateLimit ?? DEFAULT_PARTNER_POINTS;
    limiter = getPartnerLimiter(req.authenticatedKeyId, points);
    limit = points;
  } else {
    limiter = publicLimiter;
    limit = PUBLIC_POINTS;
  }

  limiter
    .consume(key)
    .then((rateLimiterRes) => {
      setRateLimitHeaders(res, limit, rateLimiterRes);
      next();
    })
    .catch((rejRes) => {
      if (rejRes instanceof Error) {
        res.status(503).json({
          error: 'Rate limit unavailable',
          message: 'Service temporarily unable to check rate limit. Try again later.',
        });
        return;
      }
      const rlRes = rejRes as RateLimiterRes;
      const secs = Math.round((rlRes.msBeforeNext ?? 1000) / 1000) || 1;
      res.set('Retry-After', String(secs));
      res.set('X-RateLimit-Limit', String(limit));
      res.set('X-RateLimit-Remaining', '0');
      res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${secs} seconds.`,
      });
    });
}

/**
 * Strict rate limit for sensitive endpoints (/auth/challenge, /webhook/register):
 * 5 req/min per IP. Returns X-RateLimit-Limit and X-RateLimit-Remaining headers.
 */
export function sensitiveRateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip ?? req.socket?.remoteAddress ?? 'unknown';

  sensitiveLimiter
    .consume(key)
    .then((rateLimiterRes) => {
      setRateLimitHeaders(res, SENSITIVE_POINTS, rateLimiterRes);
      next();
    })
    .catch((rejRes) => {
      if (rejRes instanceof Error) {
        res.status(503).json({
          error: 'Rate limit unavailable',
          message: 'Service temporarily unable to check rate limit. Try again later.',
        });
        return;
      }
      const rlRes = rejRes as RateLimiterRes;
      const secs = Math.round((rlRes.msBeforeNext ?? 1000) / 1000) || 1;
      res.set('Retry-After', String(secs));
      res.set('X-RateLimit-Limit', String(SENSITIVE_POINTS));
      res.set('X-RateLimit-Remaining', '0');
      res.status(429).json({
        error: 'Too Many Requests',
        message: `Sensitive endpoint rate limit exceeded. Try again in ${secs} seconds.`,
      });
    });
}
