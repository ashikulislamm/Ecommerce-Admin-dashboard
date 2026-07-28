import { apiClient } from '@/lib/api-client';
import type { Role, RoleQuery, CreateRolePayload, UpdateRolePayload } from '../types/role.types';

export const RoleService = {
  async getRoles(params: RoleQuery = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);

    const queryString = searchParams.toString();
    const endpoint = `/roles${queryString ? `?${queryString}` : ''}`;
    return apiClient<Role[]>(endpoint, { method: 'GET' });
  },

  async getRoleById(id: string) {
    return apiClient<Role>(`/roles/${id}`, { method: 'GET' });
  },

  async createRole(payload: CreateRolePayload) {
    return apiClient<Role>('/roles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateRole(id: string, payload: UpdateRolePayload) {
    return apiClient<Role>(`/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteRole(id: string) {
    return apiClient<null>(`/roles/${id}`, { method: 'DELETE' });
  },

  async assignPermission(roleId: string, permissionId: string) {
    return apiClient<any>(`/roles/${roleId}/permissions`, {
      method: 'POST',
      body: JSON.stringify({ permissionId }),
    });
  },

  async revokePermission(roleId: string, permissionId: string) {
    return apiClient<null>(`/roles/${roleId}/permissions/${permissionId}`, {
      method: 'DELETE',
    });
  },

  async grantAllPermissions(roleId: string) {
    return apiClient<Role>(`/roles/${roleId}/permissions/grant-all`, {
      method: 'POST',
    });
  },
};
