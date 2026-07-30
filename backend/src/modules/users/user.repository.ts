import prisma from '../../lib/prisma.js';
import type { UserQuery, CreateUserInput, UpdateUserInput } from './user.types.js';
import type { UserStatus } from '@prisma/client';

export const USER_SELECT_FIELDS = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  roleId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  role: {
    select: {
      id: true,
      name: true,
      description: true,
      isSystemRole: true,
    },
  },
};

export class UserRepository {
  static async findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: USER_SELECT_FIELDS,
    });
  }

  static async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
      select: USER_SELECT_FIELDS,
    });
  }

  static async createUser(data: CreateUserInput & { passwordHash: string }) {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        roleId: data.roleId,
        status: data.status ?? 'ACTIVE',
      },
      select: USER_SELECT_FIELDS,
    });
  }

  static async updateUser(id: string, data: UpdateUserInput) {
    const updateData: any = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email.toLowerCase();

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: USER_SELECT_FIELDS,
    });
  }

  static async updateUserRole(id: string, roleId: string) {
    return prisma.user.update({
      where: { id },
      data: { roleId },
      select: USER_SELECT_FIELDS,
    });
  }

  static async updateUserStatus(id: string, status: UserStatus) {
    return prisma.user.update({
      where: { id },
      data: { status },
      select: USER_SELECT_FIELDS,
    });
  }

  static async softDeleteUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'INACTIVE',
      },
      select: USER_SELECT_FIELDS,
    });
  }

  /**
   * Immediately revoke all active refresh sessions for a user upon deactivation
   */
  static async revokeAllUserSessions(userId: string) {
    return prisma.refreshSession.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  static async findManyPaginated(params: UserQuery) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (params.search) {
      where.OR = [
        { email: { contains: params.search, mode: 'insensitive' } },
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.roleId) {
      where.roleId = params.roleId;
    }

    if (params.status) {
      where.status = params.status;
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: USER_SELECT_FIELDS,
      }),
      prisma.user.count({ where }),
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
}

export default UserRepository;