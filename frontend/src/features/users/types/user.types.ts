import type { Role } from '@/features/roles/types/role.types';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roleId: string;
  role?: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  status?: UserStatus;
}

export interface CreateUserPayload {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  roleId: string;
  status?: UserStatus;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
}
