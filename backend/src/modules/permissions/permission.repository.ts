import prisma from '../../lib/prisma.js';
import type { PermissionQuery, CreatePermissionInput, UpdatePermissionInput, CreatePermissionGroupInput } from './permission.types.js';

export class PermissionRepository {
  static async findById(id: string) {
    return prisma.permission.findUnique({
      where: { id },
      include: {
        permissionGroup: true,
      },
    });
  }

  static async findByKey(key: string) {
    return prisma.permission.findUnique({
      where: { key },
    });
  }

  static async findByModuleAndAction(module: string, action: string) {
    return prisma.permission.findUnique({
      where: {
        module_action: {
          module,
          action,
        },
      },
    });
  }

  static async createPermission(data: CreatePermissionInput & { key: string; name: string; permissionGroupId: string }) {
    return prisma.permission.create({
      data: {
        key: data.key,
        name: data.name,
        module: data.module,
        action: data.action,
        description: data.description ?? null,
        isCustom: data.isCustom ?? false,
        permissionGroupId: data.permissionGroupId,
      },
      include: {
        permissionGroup: true,
      },
    });
  }

  static async updatePermission(id: string, data: UpdatePermissionInput) {
    return prisma.permission.update({
      where: { id },
      data,
      include: {
        permissionGroup: true,
      },
    });
  }

  static async deletePermission(id: string) {
    return prisma.permission.delete({
      where: { id },
    });
  }

  static async countRoleAssignments(permissionId: string): Promise<number> {
    return prisma.rolePermission.count({
      where: { permissionId },
    });
  }

  static async findManyPaginated(params: PermissionQuery) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { key: { contains: params.search, mode: 'insensitive' } },
        { name: { contains: params.search, mode: 'insensitive' } },
        { module: { contains: params.search, mode: 'insensitive' } },
        { action: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.module) {
      where.module = params.module.toLowerCase();
    }

    if (typeof params.isCustom === 'boolean') {
      where.isCustom = params.isCustom;
    }

    const [items, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ module: 'asc' }, { action: 'asc' }],
        include: {
          permissionGroup: true,
        },
      }),
      prisma.permission.count({ where }),
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

  static async findPermissionGroup(module: string) {
    return prisma.permissionGroup.findUnique({
      where: { module: module.toLowerCase() },
    });
  }

  static async createPermissionGroup(data: CreatePermissionGroupInput) {
    return prisma.permissionGroup.create({
      data: {
        module: data.module.toLowerCase(),
        name: data.name,
        description: data.description ?? null,
      },
    });
  }

  static async listPermissionGroups() {
    return prisma.permissionGroup.findMany({
      orderBy: { name: 'asc' },
      include: {
        permissions: {
          orderBy: { action: 'asc' },
        },
      },
    });
  }
}

export default PermissionRepository;