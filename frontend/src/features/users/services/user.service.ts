import { apiClient } from '@/lib/api-client';
import type { User, UserQuery, CreateUserPayload, UpdateUserPayload, UserStatus } from '../types/user.types';

export const UserService = {
  async getUsers(params: UserQuery = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.roleId) searchParams.set('roleId', params.roleId);
    if (params.status) searchParams.set('status', params.status);

    const queryString = searchParams.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    return apiClient<User[]>(endpoint, { method: 'GET' });
  },

  async getUserById(id: string) {
    return apiClient<User>(`/users/${id}`, { method: 'GET' });
  },

  async createUser(payload: CreateUserPayload) {
    return apiClient<User>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateUser(id: string, payload: UpdateUserPayload) {
    return apiClient<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async updateUserRole(id: string, roleId: string) {
    return apiClient<User>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ roleId }),
    });
  },

  async updateUserStatus(id: string, status: UserStatus) {
    return apiClient<User>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteUser(id: string) {
    return apiClient<null>(`/users/${id}`, { method: 'DELETE' });
  },
};
