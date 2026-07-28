import crypto from 'node:crypto';

/**
 * Generate a cryptographically secure random opaque refresh token.
 * 40 bytes = 80 hex characters = ~320 bits of entropy.
 *
 * Never use Math.random() or timestamps for token generation.
 */
export const generateOpaqueRefreshToken = (): string => {
  return crypto.randomBytes(40).toString('hex');
};

/**
 * Deterministically hash a raw refresh token using SHA-256 for database lookup.
 *
 * Raw refresh token is sent only in HttpOnly cookies and is never stored in DB.
 * The database stores only hash(rawRefreshToken).
 */
export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
