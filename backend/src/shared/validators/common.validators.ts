import { z } from 'zod';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../constants/app.constants.js';

/** Reusable Zod schema for pagination query parameters */
export const paginationQuerySchema = z.object({
  page: z.coerce
    .number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(MAX_LIMIT, `Limit cannot exceed ${MAX_LIMIT}`)
    .default(DEFAULT_LIMIT),
});

/** Reusable Zod schema for CUID/UUID string IDs */
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

/** Reusable slug schema */
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

/** Sort order enum */
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');