import type { Response } from 'express';
import type { PaginationMeta } from '../types/common.types.js';

// --- Success Response Types ---

export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

// --- Error Response Types ---

export interface ErrorDetail {
  field?: string;
  message: string;
  [key: string]: unknown;
}

export interface ErrorBody {
  code: string;
  details: ErrorDetail[];
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: ErrorBody;
}

// --- Response Builder ---

export const ApiResponse = {
  /**
   * Send a standardized success response.
   *
   * Format:
   * { success: true, message, data, meta? }
   */
  success<T>(
    res: Response,
    statusCode: number,
    message: string,
    data: T,
    meta?: PaginationMeta,
  ): void {
    const body: SuccessResponse<T> = {
      success: true,
      message,
      data,
      ...(meta !== undefined ? { meta } : {}),
    };
    res.status(statusCode).json(body);
  },

  /**
   * Send a standardized error response.
   *
   * Format:
   * { success: false, message, error: { code, details } }
   */
  error(
    res: Response,
    statusCode: number,
    message: string,
    errorCode: string,
    details: ErrorDetail[] = [],
  ): void {
    const body: ErrorResponse = {
      success: false,
      message,
      error: {
        code: errorCode,
        details,
      },
    };
    res.status(statusCode).json(body);
  },
};

export default ApiResponse;