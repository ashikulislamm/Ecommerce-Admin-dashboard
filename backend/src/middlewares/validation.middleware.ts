import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { ApiResponse } from '../shared/responses/api-response.js';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Zod validation middleware factory.
 *
 * Validates request body, query, or params against a Zod schema.
 * On failure, returns a standard VALIDATION_ERROR response with field-level details.
 * On success, replaces the target with the parsed (coerced/transformed) value.
 *
 * Usage:
 *   router.post('/users', validate(createUserSchema), asyncHandler(userController.create))
 *   router.get('/users', validate(paginationQuerySchema, 'query'), asyncHandler(userController.list))
 */
export const validate = (
  schema: ZodSchema,
  target: ValidationTarget = 'body',
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      ApiResponse.error(res, 422, 'Validation failed', 'VALIDATION_ERROR', details);
      return;
    }

    // Replace the target with the parsed/coerced data (e.g. string "1" → number 1)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any)[target] = result.data;
    next();
  };
};

export default validate;

// --- Convenience shorthand exports ---

export const validateBody = (schema: ZodSchema): RequestHandler =>
  validate(schema, 'body');

export const validateQuery = (schema: ZodSchema): RequestHandler =>
  validate(schema, 'query');

export const validateParams = (schema: ZodSchema): RequestHandler =>
  validate(schema, 'params');