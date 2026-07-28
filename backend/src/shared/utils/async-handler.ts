import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/**
 * Wraps an async Express route handler and forwards any thrown errors
 * to Express's next() error handler — eliminating repetitive try/catch blocks.
 *
 * Usage:
 *   router.get('/items', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;