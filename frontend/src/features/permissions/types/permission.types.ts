export interface Permission {
  id: string;
  key: string;
  name: string;
  module: string;
  action: string;
  description: string | null;
  isCustom: boolean;
  permissionGroupId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionGroup {
  id: string;
  module: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
}

export interface PermissionQuery {
  page?: number;
  limit?: number;
  search?: string;
  module?: string;
  isCustom?: boolean;
}

export interface CreatePermissionPayload {
  module: string;
  action: string;
  name?: string;
  description?: string;
  isCustom?: boolean;
}

export interface UpdatePermissionPayload {
  name?: string;
  description?: string;
}
