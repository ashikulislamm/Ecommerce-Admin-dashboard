export interface CreatePermissionInput {
  module: string;
  action: string;
  name?: string;
  description?: string;
  isCustom?: boolean;
}

export interface UpdatePermissionInput {
  name?: string;
  description?: string;
}

export interface CreatePermissionGroupInput {
  module: string;
  name: string;
  description?: string;
}

export interface PermissionQuery {
  page?: number;
  limit?: number;
  search?: string;
  module?: string;
  isCustom?: boolean;
}

export interface PermissionResponse {
  id: string;
  key: string;
  name: string;
  module: string;
  action: string;
  description: string | null;
  isCustom: boolean;
  permissionGroupId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionGroupResponse {
  id: string;
  module: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  permissions?: PermissionResponse[];
}