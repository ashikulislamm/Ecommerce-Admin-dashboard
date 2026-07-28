import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../constants/app.constants.js';
import type { PaginationParams } from '../types/common.types.js';
import { AppError } from '../errors/app-error.js';

interface RawPaginationQuery {
  page?: string | number;
  limit?: string | number;
}

/**
 * Parse and validate pagination query parameters.
 *
 * Returns: { page, limit, skip }
 * Defaults: page=1, limit=20
 * Maximum limit: 100
 */
export const parsePagination = (query: RawPaginationQuery): PaginationParams => {
  const rawPage = Number(query.page ?? DEFAULT_PAGE);
  const rawLimit = Number(query.limit ?? DEFAULT_LIMIT);

  if (!Number.isInteger(rawPage) || rawPage < 1) {
    throw AppError.badRequest('Page must be a positive integer greater than 0.');
  }

  if (!Number.isInteger(rawLimit) || rawLimit < 1) {
    throw AppError.badRequest('Limit must be a positive integer greater than 0.');
  }

  const limit = Math.min(rawLimit, MAX_LIMIT);
  const skip = (rawPage - 1) * limit;

  return {
    page: rawPage,
    limit,
    skip,
  };
};

/**
 * Build PaginationMeta for API responses.
 */
export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number,
) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

export default parsePagination;