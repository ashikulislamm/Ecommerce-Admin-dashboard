// Authenticated user attached to req.user after authentication middleware
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  roleId: string;
  roleName: string;
  status: string;
}

// Pagination input params
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

// Pagination metadata returned in API responses
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Sort order values
export type SortOrder = 'asc' | 'desc';

// Parsed query options
export interface QueryOptions {
  page: number;
  limit: number;
  skip: number;
  search?: string;
  sortBy?: string;
  sortOrder: SortOrder;
}

// JWT payload shape for access tokens
export interface AccessTokenPayload {
  sub: string;    // user ID
  email: string;
  roleId: string;
  type: 'access';
}

// JWT payload shape for refresh tokens
export interface RefreshTokenPayload {
  sub: string;    // user ID
  sessionId: string;
  type: 'refresh';
}