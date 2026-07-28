import { AppError } from '../../shared/errors/app-error.js';
import RoleRepository from './role.repository.js';
import type { CreateRoleInput, UpdateRoleInput, RoleQuery } from './role.types.js';

export class RoleService {
  /**
   * Create new role with permission assignments
   */
  static async createRole(input: CreateRoleInput) {
    const normalizedName = input.name.trim().toUpperCase();

    // Check duplicate name
    const existing = await RoleRepository.findByName(normalizedName);
    if (existing) {
      throw AppError.conflict(`Role with name "${normalizedName}" already exists.`);
    }

    return RoleRepository.createRole({
      ...input,
      normalizedName,
    });
  }

  /**
   * Get roles with pagination and search
   */
  static async getRoles(query: RoleQuery) {
    return RoleRepository.findManyPaginated(query);
  }

  /**
   * Get role by ID
   */
  static async getRoleById(id: string) {
    const role = await RoleRepository.findById(id);
    if (!role) {
      throw AppError.notFound(`Role with ID "${id}" not found.`);
    }
    return role;
  }

  /**
   * Update role
   */
  static async updateRole(id: string, input: UpdateRoleInput) {
    const role = await this.getRoleById(id);

    // Prevent renaming protected system roles
    if (role.isSystemRole || role.name === 'SUPER_ADMIN') {
      if (input.name && input.name.trim().toUpperCase() !== role.name) {
        throw AppError.forbidden(`System role "${role.name}" cannot be renamed.`);
      }
    }

    // Check name duplicate if changing name
    if (input.name) {
      const normalizedName = input.name.trim().toUpperCase();
      if (normalizedName !== role.name) {
        const existing = await RoleRepository.findByName(normalizedName);
        if (existing) {
          throw AppError.conflict(`Role with name "${normalizedName}" already exists.`);
        }
      }
    }

    return RoleRepository.updateRole(id, input);
  }

  /**
   * Delete role safely
   * Security Rules:
   * 1. System roles cannot be deleted.
   * 2. Cannot delete role if assigned users exist -> 409 Conflict.
   * 3. Cannot delete role if it causes RBAC Lockout -> 400 Bad Request.
   */
  static async deleteRole(id: string) {
    const role = await this.getRoleById(id);

    if (role.isSystemRole || role.name === 'SUPER_ADMIN') {
      throw AppError.forbidden(`Protected system role "${role.name}" cannot be deleted.`);
    }

    const assignedUsersCount = await RoleRepository.countAssignedUsers(id);
    if (assignedUsersCount > 0) {
      throw AppError.conflict(
        `Cannot delete role because ${assignedUsersCount} user(s) are currently assigned to this role. Reassign users before deleting the role.`,
      );
    }

    // Check RBAC Lockout Protection
    const activeManagers = await RoleRepository.countActiveRoleManagers();
    if (activeManagers <= 1 && (role.name === 'ADMIN' || role.name === 'SUPER_ADMIN')) {
      throw AppError.badRequest(
        'Operation rejected: Removing this administrative role would risk RBAC lockout.',
      );
    }

    return RoleRepository.deleteRole(id);
  }

  /**
   * Assign single permission to role
   */
  static async assignPermission(roleId: string, permissionId: string) {
    await this.getRoleById(roleId);
    return RoleRepository.assignPermission(roleId, permissionId);
  }

  /**
   * Revoke single permission from role
   */
  static async revokePermission(roleId: string, permissionId: string) {
    const role = await this.getRoleById(roleId);

    // Prevent stripping critical permissions from SUPER_ADMIN
    if (role.name === 'SUPER_ADMIN') {
      throw AppError.forbidden('Permissions cannot be revoked from the SUPER_ADMIN system role.');
    }

    return RoleRepository.revokePermission(roleId, permissionId);
  }

  /**
   * Grant all system permissions to a role
   */
  static async grantAllPermissions(roleId: string) {
    await this.getRoleById(roleId);
    return RoleRepository.grantAllPermissions(roleId);
  }
}

export default RoleService;