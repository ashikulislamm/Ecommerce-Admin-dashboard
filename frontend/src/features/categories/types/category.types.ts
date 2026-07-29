export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parent?: CategoryItem;
  children?: CategoryItem[];
  imageMediaId: string | null;
  imageMedia?: any;
  status: CategoryStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    children: number;
    productCategories: number;
  };
}

export interface CategoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string;
  status?: CategoryStatus;
}
