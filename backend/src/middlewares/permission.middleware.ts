import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from '../shared/errors/app-error.js';
import AuthorizationService from '../modules/auth/authorization.service.js';

/**
 * Authorization middleware factory.
 *
 * Verifies that the authenticated user has the required permission.
 *
 * MUST be used AFTER authenticate middleware.
 *
 * Flow:
 * 1. Confirm req.user is populated (authenticate ran)
 * 2. Delegate to AuthorizationService to dynamically check DB permissions
 * 3. Allow (next()) or reject with 403 Forbidden
 *
 * Security:
 * - 401 is used if req.user is missing (unauthenticated)
 * - 403 is used if req.user lacks permission (unauthorized)
 * - Permissions are checked dynamically against server-side data
 * - Permission changes take effect immediately without requiring re-login
 *
 * Usage:
 *   router.post('/products', authenticate, authorize('products.create'), handler)
 *   router.delete('/users/:id', authenticate, authorize('users.delete'), handler)
 */
export const authorize = (requiredPermission: string): RequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw AppError.unauthorized('Authentication is required before authorization');
      }

      const hasPerm = await AuthorizationService.hasPermission(
        req.user.roleId,
        requiredPermission,
      );

      if (!hasPerm) {
        throw new AppError(
          403,
          'AUTH_FORBIDDEN',
          `You do not have the required permission: "${requiredPermission}"`,
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default authorize;