import prisma from '../../lib/prisma.js';

export class AuthorizationService {
  /**
   * Check dynamically if a user's role has the requested permission name.
   *
   * Security rules:
   * 1. Evaluates permissions from live database (never trusts client claims or JWT payload)
   * 2. Role permission changes take effect immediately without requiring re-login
   * 3. Handles SUPER_ADMIN role with full permission grant
   */
  static async hasPermission(
    roleId: string,
    requiredPermission: string,
  ): Promise<boolean> {
    // Check if role is SUPER_ADMIN
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      select: { name: true },
    });

    if (!role) return false;

    // SUPER_ADMIN has full system access
    if (role.name === 'SUPER_ADMIN') {
      return true;
    }

    // Load active permissions for this role
    const count = await prisma.rolePermission.count({
      where: {
        roleId,
        permission: {
          name: requiredPermission,
        },
      },
    });

    return count > 0;
  }

  /**
   * Get all permission names assigned to a role.
   */
  static async getRolePermissions(roleId: string): Promise<string[]> {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      select: { name: true },
    });

    if (!role) return [];

    if (role.name === 'SUPER_ADMIN') {
      const allPermissions = await prisma.permission.findMany({
        select: { name: true },
      });
      return allPermissions.map((p) => p.name);
    }

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: {
          select: { name: true },
        },
      },
    });

    return rolePermissions.map((rp) => rp.permission.name);
  }
}

export default AuthorizationService;
