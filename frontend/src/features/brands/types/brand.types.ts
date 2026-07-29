export type BrandStatus = 'ACTIVE' | 'INACTIVE';

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoMediaId: string | null;
  logoMedia?: any;
  status: BrandStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface BrandQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: BrandStatus;
}
