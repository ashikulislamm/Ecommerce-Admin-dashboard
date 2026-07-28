import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../shared/errors/app-error.js';
import prisma from '../lib/prisma.js';
import { BEARER_PREFIX } from '../shared/constants/auth.constants.js';

/**
 * Authentication middleware.
 *
 * Enforces verified JWT-based authentication on protected routes.
 *
 * Flow:
 * 1. Extract Bearer token from Authorization header
 * 2. Verify JWT signature and expiration
 * 3. Load the user from the database (NOT from JWT payload — prevents stale data)
 * 4. Verify user is ACTIVE
 * 5. Attach safe user information to req.user
 *
 * Security guarantees:
 * - Never trusts client-provided user IDs (req.body, req.headers, etc.)
 * - Always verifies against live database data
 * - Inactive users are rejected even with valid tokens
 * - Token type mismatch is rejected
 *
 * Usage:
 *   router.use(authenticate)  — at router level
 *   router.get('/me', authenticate, handler)  — at route level
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
      throw AppError.unauthorized('Authorization header is required (Bearer token)');
    }

    const token = authHeader.slice(BEARER_PREFIX.length).trim();

    if (!token) {
      throw AppError.unauthorized('Access token is missing');
    }

    // Verify JWT — throws AppError on invalid/expired token
    const payload = verifyAccessToken(token);

    // Load live user from database — do NOT trust JWT payload alone
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        roleId: true,
        role: {
          select: { name: true },
        },
      },
    });

    if (!user) {
      throw AppError.unauthorized('User account not found');
    }

    if (user.status !== 'ACTIVE') {
      throw AppError.unauthorized('User account is inactive');
    }

    // Build display name from firstName + lastName (or email as fallback)
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

    // Attach safe user context — never expose passwordHash, tokens, or secrets
    req.user = {
      id: user.id,
      email: user.email,
      name,
      roleId: user.roleId,
      roleName: user.role.name,
      status: user.status,
    };

    next();
  } catch (err) {
    next(err);
  }
};

export default authenticate;