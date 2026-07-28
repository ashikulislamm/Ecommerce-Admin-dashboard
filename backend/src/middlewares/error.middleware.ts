import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/app-error.js';
import { ApiResponse } from '../shared/responses/api-response.js';
import { isPrismaError, formatPrismaError } from '../utils/prismaErrors.js';
import logger from '../lib/logger.js';
import config from '../app/config/index.js';

/**
 * Global Express error handler.
 *
 * Catches all errors forwarded via next(err) and maps them to
 * standardized API error responses.
 *
 * Error categories handled:
 * - AppError          → operational/known errors (400–503)
 * - ZodError          → Zod validation errors (422)
 * - Prisma errors     → database constraint/not-found/init errors
 * - SyntaxError       → malformed JSON body (400)
 * - JWT errors        → handled upstream by AppError, caught here as fallback
 * - Unexpected errors → 500 (never expose internals in production)
 *
 * Logging:
 * - All 500 errors are logged with request ID, error message, and stack trace
 * - Operational errors (4xx) are logged at warn level
 *
 * MUST be registered as the LAST middleware in app.ts (4 arguments required).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const requestId = req.id ?? 'unknown';

  // --- 1. AppError (known operational error) ---
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ requestId, err }, `AppError 500: ${err.message}`);
    } else {
      logger.warn({ requestId, errorCode: err.errorCode }, err.message);
    }

    ApiResponse.error(
      res,
      err.statusCode,
      err.message,
      err.errorCode,
      err.details,
    );
    return;
  }

  // --- 2. Zod validation error ---
  if (err instanceof ZodError) {
    logger.warn({ requestId }, 'Zod validation error');

    const details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    ApiResponse.error(res, 422, 'Validation failed', 'VALIDATION_ERROR', details);
    return;
  }

  // --- 3. Prisma database errors ---
  if (isPrismaError(err)) {
    const formatted = formatPrismaError(err);
    logger.warn(
      { requestId, prismaCode: formatted.code },
      `Prisma error: ${formatted.message}`,
    );

    ApiResponse.error(
      res,
      formatted.statusCode,
      formatted.message,
      formatted.code,
      [],
    );
    return;
  }

  // --- 4. Malformed JSON (SyntaxError from express.json()) ---
  if (
    err instanceof SyntaxError &&
    'status' in err &&
    (err as { status: number }).status === 400
  ) {
    logger.warn({ requestId }, 'Malformed JSON in request body');

    ApiResponse.error(
      res,
      400,
      'Malformed JSON in request body',
      'BAD_REQUEST',
      [],
    );
    return;
  }

  // --- 5. Unexpected/unknown error (never expose internals in production) ---
  logger.error(
    {
      requestId,
      err,
      stack: err instanceof Error ? err.stack : undefined,
    },
    `Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
  );

  const message = config.isProduction
    ? 'An unexpected error occurred'
    : err instanceof Error
      ? err.message
      : 'An unexpected error occurred';

  ApiResponse.error(res, 500, message, 'INTERNAL_SERVER_ERROR', []);
};

export default errorHandler;