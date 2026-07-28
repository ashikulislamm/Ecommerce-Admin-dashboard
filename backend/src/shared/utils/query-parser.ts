import { parsePagination } from './pagination.js';
import type { QueryOptions, SortOrder } from '../types/common.types.js';
import { AppError } from '../errors/app-error.js';

interface RawQuery {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  [key: string]: string | string[] | undefined;
}

interface QueryParserOptions {
  /** Whitelist of allowed sort field names. Prevents arbitrary field injection. */
  allowedSortFields?: string[];
  /** Default sort field. */
  defaultSortBy?: string;
  /** Default sort order. */
  defaultSortOrder?: SortOrder;
}

/**
 * Parse and validate API query string parameters safely.
 *
 * Validates:
 * - Pagination (page, limit)
 * - Search term
 * - Sort field (against allowedSortFields whitelist)
 * - Sort order (asc | desc)
 *
 * Never allows arbitrary client input into orderBy without whitelist validation.
 */
export const parseQuery = (
  query: RawQuery,
  options: QueryParserOptions = {},
): QueryOptions => {
  const {
    allowedSortFields = [],
    defaultSortBy,
    defaultSortOrder = 'desc',
  } = options;

  // Pagination
  const { page, limit, skip } = parsePagination({
    page: query.page,
    limit: query.limit,
  });

  // Search
  const search = query.search?.trim() || undefined;

  // Sort field
  let sortBy: string | undefined;
  if (query.sortBy) {
    const requestedField = query.sortBy.trim();
    if (allowedSortFields.length > 0 && !allowedSortFields.includes(requestedField)) {
      throw AppError.badRequest(
        `Invalid sort field: "${requestedField}". Allowed fields: ${allowedSortFields.join(', ')}.`,
      );
    }
    sortBy = requestedField;
  } else {
    sortBy = defaultSortBy;
  }

  // Sort order
  const rawSortOrder = query.sortOrder?.toLowerCase();
  let sortOrder: SortOrder = defaultSortOrder;
  if (rawSortOrder !== undefined) {
    if (rawSortOrder !== 'asc' && rawSortOrder !== 'desc') {
      throw AppError.badRequest('sortOrder must be "asc" or "desc".');
    }
    sortOrder = rawSortOrder as SortOrder;
  }

  return {
    page,
    limit,
    skip,
    search,
    sortBy,
    sortOrder,
  };
};

export default parseQuery;
