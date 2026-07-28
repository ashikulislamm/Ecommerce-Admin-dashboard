import type { UserStatus } from '../../generated/prisma/index.js';

export interface CreateUserInput {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  roleId: string;
  status?: UserStatus;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  status?: UserStatus;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roleId: string;
  role?: {
    id: string;
    name: string;
    description: string | null;
  };
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}