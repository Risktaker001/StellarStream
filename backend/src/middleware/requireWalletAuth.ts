import { Request, Response, NextFunction } from 'express';
import {
  getStoredNonce,
  consumeNonce,
  verifyStellarSignature,
} from '../lib/signatureAuth.js';

function getWalletAuthFromRequest(req: Request): {
  address: string | null;
  nonce: string | null;
  signature: string | null;
} {
  const fromHeaders = {
    address: typeof req.headers['x-stellar-address'] === 'string' ? req.headers['x-stellar-address'].trim() : null,
    nonce: typeof req.headers['x-auth-nonce'] === 'string' ? req.headers['x-auth-nonce'].trim() : null,
    signature: typeof req.headers['x-auth-signature'] === 'string' ? req.headers['x-auth-signature'].trim() : null,
  };
  if (fromHeaders.address && fromHeaders.nonce && fromHeaders.signature) {
    return fromHeaders;
  }
  const body = req.body as Record<string, unknown> | undefined;
  if (body && typeof body === 'object') {
    const address = typeof body.address === 'string' ? body.address.trim() : null;
    const nonce = typeof body.nonce === 'string' ? body.nonce.trim() : null;
    const signature = typeof body.signature === 'string' ? body.signature.trim() : null;
    if (address && nonce && signature) return { address, nonce, signature };
  }
  return { address: null, nonce: null, signature: null };
}

/**
 * Middleware that requires wallet signature auth. Reads address, nonce, signature from
 * headers (X-Stellar-Address, X-Auth-Nonce, X-Auth-Signature) or body.
 * Consumes nonce (one-time use), verifies ED25519 signature, then sets
 * req.walletAddress and req.walletAuthenticated.
 */
export async function requireWalletAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { address, nonce, signature } = getWalletAuthFromRequest(req);

  if (!address || !nonce || !signature) {
    res.status(401).json({
      error: 'Missing wallet auth',
      code: 'MISSING_WALLET_AUTH',
    });
    return;
  }

  if (!address.startsWith('G') || address.length < 56) {
    res.status(401).json({
      error: 'Invalid Stellar address',
      code: 'INVALID_ADDRESS',
    });
    return;
  }

  try {
    const stored = await getStoredNonce(nonce);
    const consumed = await consumeNonce(nonce);
    if (!stored || !consumed) {
      res.status(401).json({
        error: 'Invalid or expired nonce',
        code: 'INVALID_NONCE',
      });
      return;
    }

    const valid = verifyStellarSignature({ address, nonce, signatureBase64: signature });
    if (!valid) {
      res.status(401).json({
        error: 'Invalid signature',
        code: 'INVALID_SIGNATURE',
      });
      return;
    }

    req.walletAddress = address;
    req.walletAuthenticated = true;
    next();
  } catch {
    res.status(503).json({
      error: 'Auth unavailable',
      message: 'Service temporarily unable to verify signature. Try again later.',
    });
  }
}
