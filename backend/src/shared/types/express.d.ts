import type { AuthenticatedUser } from './common.types.js';

declare global {
  namespace Express {
    interface Request {
      /** Unique request ID — set by requestId middleware */
      id: string;
      /** Authenticated user — set by authenticate middleware */
      user?: AuthenticatedUser;
    }
  }
}

export {};