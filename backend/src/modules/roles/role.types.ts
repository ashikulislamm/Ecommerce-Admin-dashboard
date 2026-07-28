export interface CreateRoleInput {
  name: string;
  description?: string;
  isSystemRole?: boolean;
  permissionIds?: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export interface RoleQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  userCount?: number;
  permissionCount?: number;
  permissions?: Array<{
    id: string;
    key: string;
    name: string;
    module: string;
    action: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}