import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt.
 * Never store or log the plaintext password.
 */
export const hashPassword = async (plaintext: string): Promise<string> => {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
};

/**
 * Securely compare a plaintext password against a bcrypt hash.
 * Constant-time comparison prevents timing attacks.
 */
export const comparePassword = async (
  plaintext: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(plaintext, hash);
};