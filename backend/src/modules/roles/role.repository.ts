import prisma from '../../lib/prisma.js';
import type { RoleQuery, CreateRoleInput, UpdateRoleInput } from './role.types.js';

export class RoleRepository {
  static async findById(id: string) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
            rolePermissions: true,
          },
        },
      },
    });
  }

  static async findByName(name: string) {
    return prisma.role.findUnique({
      where: { name: name.trim().toUpperCase() },
    });
  }

  static async countAssignedUsers(roleId: string): Promise<number> {
    return prisma.user.count({
      where: { roleId },
    });
  }

  static async findManyPaginated(params: RoleQuery) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: {
              users: true,
              rolePermissions: true,
            },
          },
        },
      }),
      prisma.role.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  }

  static async createRole(data: CreateRoleInput & { normalizedName: string }) {
    return prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          name: data.normalizedName,
          description: data.description ?? null,
          isSystemRole: data.isSystemRole ?? false,
        },
      });

      if (data.permissionIds && data.permissionIds.length > 0) {
        // Filter unique permission IDs
        const uniquePermIds = Array.from(new Set(data.permissionIds));
        await tx.rolePermission.createMany({
          data: uniquePermIds.map((permissionId) => ({
            roleId: role.id,
            permissionId,
          })),
        });
      }

      return role;
    });
  }

  static async updateRole(id: string, data: UpdateRoleInput) {
    return prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name.trim().toUpperCase();
      if (data.description !== undefined) updateData.description = data.description;

      const role = await tx.role.update({
        where: { id },
        data: updateData,
      });

      if (data.permissionIds !== undefined) {
        // Delete existing relationships
        await tx.rolePermission.deleteMany({
          where: { roleId: id },
        });

        // Re-insert unique permissions
        if (data.permissionIds.length > 0) {
          const uniqueIds = Array.from(new Set(data.permissionIds));
          await tx.rolePermission.createMany({
            data: uniqueIds.map((permissionId) => ({
              roleId: id,
              permissionId,
            })),
          });
        }
      }

      return role;
    });
  }

  static async deleteRole(id: string) {
    return prisma.role.delete({
      where: { id },
    });
  }

  static async assignPermission(roleId: string, permissionId: string) {
    return prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
      update: {},
      create: {
        roleId,
        permissionId,
      },
    });
  }

  static async revokePermission(roleId: string, permissionId: string) {
    return prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId,
      },
    });
  }

  static async grantAllPermissions(roleId: string) {
    return prisma.$transaction(async (tx) => {
      const allPermissions = await tx.permission.findMany({
        select: { id: true },
      });

      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      if (allPermissions.length > 0) {
        await tx.rolePermission.createMany({
          data: allPermissions.map((p) => ({
            roleId,
            permissionId: p.id,
          })),
        });
      }

      return tx.role.findUnique({
        where: { id: roleId },
        include: {
          rolePermissions: {
            include: { permission: true },
          },
        },
      });
    });
  }

  /**
   * Count how many active non-deleted users possess role/permission management capabilities
   */
  static async countActiveRoleManagers(): Promise<number> {
    const roles = await prisma.role.findMany({
      where: {
        OR: [
          { name: 'SUPER_ADMIN' },
          {
            rolePermissions: {
              some: {
                permission: {
                  key: { in: ['roles:update', 'roles:delete', 'roles:create', 'roles:read'] },
                },
              },
            },
          },
        ],
      },
      select: { id: true },
    });

    const roleIds = roles.map((r) => r.id);

    return prisma.user.count({
      where: {
        roleId: { in: roleIds },
        status: 'ACTIVE',
        deletedAt: null,
      },
    });
  }
}

export default RoleRepository;