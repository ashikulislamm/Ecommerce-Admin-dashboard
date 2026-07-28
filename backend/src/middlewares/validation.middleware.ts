import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { ApiResponse } from '../shared/responses/api-response.js';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Zod validation middleware factory.
 *
 * Validates request body, query, or params against a Zod schema.
 * Supports full request object schemas ({ body: ..., query: ..., params: ... })
 * or target-specific schemas.
 */
export const validate = (
  schema: ZodSchema,
  target?: ValidationTarget,
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const dataToValidate: unknown = target
      ? req[target]
      : {
          body: req.body,
          query: req.query,
          params: req.params,
        };

    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      ApiResponse.error(res, 422, 'Validation failed', 'VALIDATION_ERROR', details);
      return;
    }

    if (result.data && typeof result.data === 'object') {
      const parsedData = result.data as Record<string, unknown>;

      if (parsedData.body !== undefined) {
        req.body = parsedData.body;
      }
      if (parsedData.query !== undefined) {
        Object.defineProperty(req, 'query', {
          value: parsedData.query,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      if (parsedData.params !== undefined) {
        Object.defineProperty(req, 'params', {
          value: parsedData.params,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      if (target && parsedData.body === undefined && parsedData.query === undefined && parsedData.params === undefined) {
        if (target === 'body') {
          req.body = parsedData;
        } else if (target === 'query') {
          Object.defineProperty(req, 'query', {
            value: parsedData,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        } else if (target === 'params') {
          Object.defineProperty(req, 'params', {
            value: parsedData,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
      }
    }

    next();
  };
};

export default validate;

export const validateBody = (schema: ZodSchema): RequestHandler =>
  validate(schema, 'body');

export const validateQuery = (schema: ZodSchema): RequestHandler =>
  validate(schema, 'query');

export const validateParams = (schema: ZodSchema): RequestHandler =>
  validate(schema, 'params');