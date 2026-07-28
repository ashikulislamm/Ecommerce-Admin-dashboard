import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { REQUEST_ID_HEADER } from '../shared/constants/auth.constants.js';

/**
 * Request ID middleware.
 *
 * Generates a cryptographically random UUID v4 for every incoming request.
 * Attaches it to:
 *   - req.id (available throughout the request lifecycle)
 *   - X-Request-ID response header (for client tracing)
 *
 * Security: We deliberately do NOT trust or reuse client-provided X-Request-ID
 * values to prevent clients from injecting arbitrary trace IDs into server logs.
 */
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const id = randomUUID();
  req.id = id;
  res.setHeader(REQUEST_ID_HEADER, id);
  next();
};

export default requestId;