import type { ErrorCodeType } from './error-codes.js';

export interface AppErrorDetail {
  field?: string;
  message: string;
  [key: string]: unknown;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCodeType;
  public readonly details: AppErrorDetail[];
  /** True = known/expected operational error. False = unexpected programming error. */
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    errorCode: ErrorCodeType,
    message: string,
    details: AppErrorDetail[] = [],
    isOperational = true,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = isOperational;

    // Maintain correct prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // --- Convenience factory methods ---

  static badRequest(message: string, details: AppErrorDetail[] = []): AppError {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static tokenExpired(message = 'Access token has expired'): AppError {
    return new AppError(401, 'TOKEN_EXPIRED', message);
  }

  static tokenInvalid(message = 'Invalid access token'): AppError {
    return new AppError(401, 'TOKEN_INVALID', message);
  }

  static forbidden(message = 'You do not have permission to perform this action'): AppError {
    return new AppError(403, 'FORBIDDEN', message);
  }

  static notFound(resource = 'Resource'): AppError {
    return new AppError(404, 'NOT_FOUND', `${resource} not found`);
  }

  static conflict(message: string, details: AppErrorDetail[] = []): AppError {
    return new AppError(409, 'CONFLICT', message, details);
  }

  static validationError(details: AppErrorDetail[]): AppError {
    return new AppError(422, 'VALIDATION_ERROR', 'Validation failed', details);
  }

  static internal(message = 'An unexpected error occurred'): AppError {
    return new AppError(500, 'INTERNAL_SERVER_ERROR', message, [], false);
  }
}