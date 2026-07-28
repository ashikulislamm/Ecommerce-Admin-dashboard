import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from '../shared/errors/app-error.js';
import prisma from '../lib/prisma.js';

/**
 * Authorization middleware factory.
 *
 * Verifies that the authenticated user has the required permission.
 *
 * MUST be used AFTER authenticate middleware.
 *
 * Flow:
 * 1. Confirm req.user is populated (authenticate ran)
 * 2. Load role permissions from the database (server-side — never trust client claims)
 * 3. Check if the required permission is present
 * 4. Allow or reject (403)
 *
 * Security:
 * - Permissions are loaded from the database, not from JWT claims
 * - Changes to permissions take effect immediately without requiring re-login
 * - Never uses hardcoded role name checks as the primary authorization mechanism
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

      // Load current permissions for the user's role from the database
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { roleId: req.user.roleId },
        include: {
          permission: {
            select: { name: true },
          },
        },
      });

      const permissionNames = rolePermissions.map((rp) => rp.permission.name);

      if (!permissionNames.includes(requiredPermission)) {
        throw AppError.forbidden(
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