import { AppError } from '../../shared/errors/app-error.js';
import PermissionRepository from './permission.repository.js';
import { PERMISSION_KEY_REGEX } from './permission.constants.js';
import type { CreatePermissionInput, UpdatePermissionInput, PermissionQuery, CreatePermissionGroupInput } from './permission.types.js';

export class PermissionService {
  /**
   * Create standard or custom permission
   */
  static async createPermission(input: CreatePermissionInput) {
    const module = input.module.trim().toLowerCase();
    const action = input.action.trim().toLowerCase();
    const key = `${module}:${action}`;

    if (!PERMISSION_KEY_REGEX.test(key)) {
      throw AppError.badRequest(
        `Invalid permission format "${key}". Module and action must start with a letter and contain only lowercase alphanumeric characters, hyphens or underscores.`,
      );
    }

    // Check duplicate key
    const existing = await PermissionRepository.findByKey(key);
    if (existing) {
      throw AppError.conflict(`Permission with key "${key}" already exists.`);
    }

    // Find or create matching PermissionGroup for this module
    let group = await PermissionRepository.findPermissionGroup(module);
    if (!group) {
      const groupName = module.charAt(0).toUpperCase() + module.slice(1);
      group = await PermissionRepository.createPermissionGroup({
        module,
        name: groupName,
        description: `${groupName} permissions`,
      });
    }

    const name = input.name?.trim() || `${action.toUpperCase()} ${module.toUpperCase()}`;

    return PermissionRepository.createPermission({
      module,
      action,
      key,
      name,
      description: input.description,
      isCustom: input.isCustom ?? false,
      permissionGroupId: group.id,
    });
  }

  /**
   * List permissions with pagination, search, and filters
   */
  static async getPermissions(query: PermissionQuery) {
    return PermissionRepository.findManyPaginated(query);
  }

  /**
   * Get permission by ID
   */
  static async getPermissionById(id: string) {
    const permission = await PermissionRepository.findById(id);
    if (!permission) {
      throw AppError.notFound(`Permission with ID "${id}" not found.`);
    }
    return permission;
  }

  /**
   * Update permission details
   */
  static async updatePermission(id: string, input: UpdatePermissionInput) {
    await this.getPermissionById(id);
    return PermissionRepository.updatePermission(id, input);
  }

  /**
   * Delete permission safely
   * Rule: Cannot delete permission if assigned to one or more roles. Return 409 Conflict.
   */
  static async deletePermission(id: string) {
    await this.getPermissionById(id);

    const assignmentCount = await PermissionRepository.countRoleAssignments(id);
    if (assignmentCount > 0) {
      throw AppError.conflict(
        `Cannot delete permission because it is assigned to ${assignmentCount} role(s).`,
      );
    }

    return PermissionRepository.deletePermission(id);
  }

  /**
   * List permission groups
   */
  static async getPermissionGroups() {
    return PermissionRepository.listPermissionGroups();
  }

  /**
   * Create permission group
   */
  static async createPermissionGroup(input: CreatePermissionGroupInput) {
    const module = input.module.trim().toLowerCase();
    const existing = await PermissionRepository.findPermissionGroup(module);
    if (existing) {
      throw AppError.conflict(`Permission group for module "${module}" already exists.`);
    }
    return PermissionRepository.createPermissionGroup({
      ...input,
      module,
    });
  }
}

export default PermissionService;