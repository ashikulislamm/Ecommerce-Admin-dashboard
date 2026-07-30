import type { CategoryStatus } from '@prisma/client';

export interface CategoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string;
  status?: CategoryStatus;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  imageMediaId?: string;
  status?: CategoryStatus;
  sortOrder?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  imageMediaId?: string;
  status?: CategoryStatus;
  sortOrder?: number;
}

export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  status: CategoryStatus;
  sortOrder: number;
  imageMediaId: string | null;
  imageMedia?: any;
  children: CategoryTreeNode[];
  createdAt: Date;
  updatedAt: Date;
}