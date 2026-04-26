import { createHash } from 'crypto';
import { Keypair } from '@stellar/stellar-sdk';
import { redis } from './redis.js';

const NONCE_PREFIX = 'auth:nonce:';
const NONCE_TTL_SEC = 300;
const SIGN_MESSAGE_PREFIX = 'Stellar Signed Message:\n';

/**
 * Get stored nonce from Redis if it exists.
 */
export async function getStoredNonce(nonce: string): Promise<string | null> {
  const key = NONCE_PREFIX + nonce;
  const value = await redis.get(key);
  return value;
}

/**
 * Consume (delete) nonce from Redis. Returns true if the key existed (valid one-time use).
 */
export async function consumeNonce(nonce: string): Promise<boolean> {
  const key = NONCE_PREFIX + nonce;
  const deleted = await redis.del(key);
  return deleted > 0;
}

/**
 * Store a new nonce in Redis with TTL. Key: auth:nonce:<nonce>
 */
export async function storeNonce(nonce: string): Promise<void> {
  const key = NONCE_PREFIX + nonce;
  await redis.set(key, nonce, 'EX', NONCE_TTL_SEC);
}

/**
 * Verify Stellar (Freighter) signature: message = "Stellar Signed Message:\n" + nonce,
 * wallet signs SHA256(message). Signature is base64. Address is G... (base32 ED25519).
 */
export function verifyStellarSignature(params: {
  address: string;
  nonce: string;
  signatureBase64: string;
}): boolean {
  const { address, nonce, signatureBase64 } = params;

  if (!address || !nonce || !signatureBase64) return false;
  if (!address.startsWith('G') || address.length < 56) return false;

  try {
    const message = SIGN_MESSAGE_PREFIX + nonce;
    const hash = createHash('sha256').update(message, 'utf8').digest();

    const signature = Buffer.from(signatureBase64, 'base64');
    if (signature.length !== 64) return false;

    const keypair = Keypair.fromPublicKey(address);
    return keypair.verify(hash, signature);
  } catch {
    return false;
  }
}
