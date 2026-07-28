import type { Permission } from '@/features/permissions/types/permission.types';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  rolePermissions?: Array<{
    id: string;
    roleId: string;
    permissionId: string;
    permission: Permission;
  }>;
  _count?: {
    users: number;
    rolePermissions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RoleQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissionIds?: string[];
}
