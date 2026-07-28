import { apiClient } from '@/lib/api-client';
import type {
  Permission,
  PermissionGroup,
  PermissionQuery,
  CreatePermissionPayload,
  UpdatePermissionPayload,
} from '../types/permission.types';

export const PermissionService = {
  async getPermissions(params: PermissionQuery = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.module) searchParams.set('module', params.module);
    if (typeof params.isCustom === 'boolean') searchParams.set('isCustom', String(params.isCustom));

    const queryString = searchParams.toString();
    const endpoint = `/permissions${queryString ? `?${queryString}` : ''}`;
    return apiClient<Permission[]>(endpoint, { method: 'GET' });
  },

  async getPermissionGroups() {
    return apiClient<PermissionGroup[]>('/permissions/groups', { method: 'GET' });
  },

  async createPermission(payload: CreatePermissionPayload) {
    return apiClient<Permission>('/permissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updatePermission(id: string, payload: UpdatePermissionPayload) {
    return apiClient<Permission>(`/permissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deletePermission(id: string) {
    return apiClient<null>(`/permissions/${id}`, { method: 'DELETE' });
  },
};
