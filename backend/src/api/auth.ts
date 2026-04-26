import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { storeNonce } from '../lib/signatureAuth.js';

const NONCE_BYTES = 32;

/**
 * GET /api/v1/auth/nonce
 * Returns a one-time nonce for challenge-response auth. Client signs this with their Stellar wallet.
 */
export async function getNonce(_req: Request, res: Response): Promise<void> {
  try {
    const nonce = randomBytes(NONCE_BYTES).toString('hex');
    await storeNonce(nonce);
    res.json({ nonce });
  } catch {
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Unable to issue nonce. Try again later.',
    });
  }
}

/**
 * GET /api/v1/auth/me
 * Protected route: requires X-Stellar-Address, X-Auth-Nonce, X-Auth-Signature headers.
 * Returns the authenticated wallet address.
 */
export function getMe(req: Request, res: Response): void {
  res.json({ address: req.walletAddress });
}
