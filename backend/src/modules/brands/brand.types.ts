import type { BrandStatus } from '../../generated/prisma/index.js';

export interface BrandQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: BrandStatus;
}

export interface CreateBrandInput {
  name: string;
  slug?: string;
  description?: string;
  logoMediaId?: string;
  status?: BrandStatus;
}

export interface UpdateBrandInput {
  name?: string;
  slug?: string;
  description?: string;
  logoMediaId?: string;
  status?: BrandStatus;
}