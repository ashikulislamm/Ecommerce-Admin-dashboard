import rateLimit from 'express-rate-limit';
import config from '../app/config/index.js';
import { ApiResponse } from '../shared/responses/api-response.js';

/**
 * Global API rate limiter.
 *
 * Applies to all /api/v1 routes.
 * Returns a standard JSON error response on limit exceeded.
 * Configurable via RATE_LIMIT_WINDOW_MS and RATE_LIMIT_MAX env vars.
 *
 * Design: This global limiter acts as a base layer.
 * Stricter route-specific limiters (e.g. login, password reset) can be
 * added at the router level in future phases without changing this.
 */
export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,   // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,    // Disable X-RateLimit-* legacy headers

  // Return our standard JSON error format instead of the default HTML/text
  handler: (_req, res) => {
    ApiResponse.error(
      res,
      429,
      'Too many requests. Please try again later.',
      'RATE_LIMIT_EXCEEDED',
      [],
    );
  },

  // Skip rate limiting in test environment
  skip: () => config.isTest,
});

export default globalRateLimiter;