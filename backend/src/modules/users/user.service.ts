import bcrypt from 'bcrypt';
import { AppError } from '../../shared/errors/app-error.js';
import UserRepository from './user.repository.js';
import RoleRepository from '../roles/role.repository.js';
import AuthorizationService from '../auth/authorization.service.js';
import type { CreateUserInput, UpdateUserInput, UserQuery } from './user.types.js';
import type { UserStatus } from '@prisma/client';

const BCRYPT_SALT_ROUNDS = 10;

export class UserService {
  /**
   * Create a new user with bcrypt password hashing
   */
  static async createUser(input: CreateUserInput) {
    const email = input.email.trim().toLowerCase();

    // Check duplicate email
    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      throw AppError.conflict(`User with email "${email}" already exists.`);
    }

    // Verify role existence
    const role = await RoleRepository.findById(input.roleId);
    if (!role) {
      throw AppError.notFound(`Role with ID "${input.roleId}" not found.`);
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

    return UserRepository.createUser({
      ...input,
      email,
      passwordHash,
    });
  }

  /**
   * List users with pagination, search, role, and status filters
   */
  static async getUsers(query: UserQuery) {
    return UserRepository.findManyPaginated(query);
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw AppError.notFound(`User with ID "${id}" not found.`);
    }
    return user;
  }

  /**
   * Update user details
   */
  static async updateUser(id: string, input: UpdateUserInput) {
    const user = await this.getUserById(id);

    if (input.email && input.email.trim().toLowerCase() !== user.email) {
      const email = input.email.trim().toLowerCase();
      const existing = await UserRepository.findByEmail(email);
      if (existing) {
        throw AppError.conflict(`User with email "${email}" already exists.`);
      }
    }

    return UserRepository.updateUser(id, input);
  }

  /**
   * Change user role with security rule checks
   * Security Rules:
   * 1. Self Role Change Rejection: User cannot change their own role.
   * 2. Privilege Boundary Enforcement: Requester cannot grant a role with higher permissions than they possess.
   */
  static async updateUserRole(
    targetUserId: string,
    newRoleId: string,
    requester: { id: string; roleId: string; roleName: string },
  ) {
    // 1. Self Role Change Rejection
    if (targetUserId === requester.id) {
      throw AppError.forbidden('Security Violation: You cannot change your own role.');
    }

    await this.getUserById(targetUserId);

    const targetRole = await RoleRepository.findById(newRoleId);
    if (!targetRole) {
      throw AppError.notFound(`Target role with ID "${newRoleId}" not found.`);
    }

    // 2. Privilege Boundary Enforcement
    if (requester.roleName !== 'SUPER_ADMIN') {
      const requesterPerms = await AuthorizationService.getRolePermissions(requester.roleId);
      const targetRolePerms = targetRole.rolePermissions.map((rp) => rp.permission.key);

      const requesterPermSet = new Set(requesterPerms);
      const hasUnassignedPerms = targetRolePerms.some((perm) => !requesterPermSet.has(perm));

      if (hasUnassignedPerms) {
        throw AppError.forbidden(
          'Security Violation: You cannot assign a role with privileges exceeding your own.',
        );
      }
    }

    return UserRepository.updateUserRole(targetUserId, newRoleId);
  }

  /**
   * Update user status (Active / Inactive / Suspended)
   * Security Rules:
   * 1. Self Deactivation Rejection: User cannot deactivate themselves.
   * 2. Session Revocation: Immediately revoke all refresh sessions if deactivated.
   */
  static async updateUserStatus(
    targetUserId: string,
    status: UserStatus,
    requesterId: string,
  ) {
    // Self Deactivation Rejection
    if (targetUserId === requesterId && (status === 'INACTIVE' || status === 'SUSPENDED')) {
      throw AppError.forbidden('Security Violation: You cannot deactivate your own account.');
    }

    await this.getUserById(targetUserId);

    const updatedUser = await UserRepository.updateUserStatus(targetUserId, status);

    // If deactivated or suspended, immediately revoke all refresh sessions
    if (status === 'INACTIVE' || status === 'SUSPENDED') {
      await UserRepository.revokeAllUserSessions(targetUserId);
    }

    return updatedUser;
  }

  /**
   * Delete user safely
   * Security Rules:
   * 1. Self Deletion Rejection: User cannot delete themselves.
   * 2. Session Revocation: Immediately revoke all refresh sessions.
   */
  static async deleteUser(targetUserId: string, requesterId: string) {
    if (targetUserId === requesterId) {
      throw AppError.forbidden('Security Violation: You cannot delete your own account.');
    }

    await this.getUserById(targetUserId);

    // Revoke sessions immediately
    await UserRepository.revokeAllUserSessions(targetUserId);

    return UserRepository.deleteUser(targetUserId);
  }
}

export default UserService;