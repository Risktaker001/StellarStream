import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { prisma } from '../lib/db.js';

function getApiKeyFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const xApiKey = req.headers['x-api-key'];
  if (typeof xApiKey === 'string') {
    return xApiKey.trim();
  }
  return null;
}

function hashKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

/**
 * Validates x-api-key (or Bearer token) against the ApiKey table.
 * Sets req.authenticated, req.authenticatedKeyId, and req.apiKeyRateLimit.
 * Does not block unauthenticated requests — rate limiter handles tiering.
 */
export async function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  req.authenticated = false;

  const raw = getApiKeyFromRequest(req);
  if (!raw) {
    next();
    return;
  }

  const keyHash = hashKey(raw);

  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      select: { id: true, isActive: true, rateLimit: true },
    });

    if (apiKey?.isActive) {
      req.authenticated = true;
      req.authenticatedKeyId = apiKey.id;
      req.apiKeyRateLimit = apiKey.rateLimit;

      // Fire-and-forget: update lastUsedAt without blocking the request
      prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      }).catch(() => { /* non-critical */ });
    }
  } catch {
    // DB error: fail open (don't block traffic), treat as unauthenticated
  }

  next();
}
