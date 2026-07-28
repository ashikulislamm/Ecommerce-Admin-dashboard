import type { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../shared/responses/api-response.js';

/**
 * 404 Not Found middleware.
 *
 * Catches all requests that did not match any registered route.
 * Returns a standard JSON error response — never HTML.
 *
 * Must be registered AFTER all routes and BEFORE the error handler.
 */
export const notFound = (_req: Request, res: Response, _next: NextFunction): void => {
  ApiResponse.error(
    res,
    404,
    'The requested route does not exist',
    'ROUTE_NOT_FOUND',
    [],
  );
};

export default notFound;