export type ProductType = 'SIMPLE' | 'VARIABLE';
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type VariantStatus = 'ACTIVE' | 'INACTIVE';

export interface ProductMediaItem {
  id: string;
  mediaId: string;
  isPrimary: boolean;
  displayOrder: number;
  media: {
    id: string;
    fileName: string;
    url: string;
    thumbnailUrl?: string;
    altText?: string;
  };
}

export interface VariantAttributeValueItem {
  id: string;
  attributeValueId: string;
  attributeValue: {
    id: string;
    value: string;
    displayColor?: string;
    attribute: {
      id: string;
      name: string;
      slug: string;
      type: string;
    };
  };
}

export interface ProductVariantItem {
  id: string;
  productId: string;
  sku: string;
  price: string | number;
  compareAtPrice?: string | number | null;
  costPrice?: string | number | null;
  stockQuantity: number;
  lowStockThreshold?: number | null;
  weight?: string | number | null;
  status: VariantStatus;
  variantAttributeValues: VariantAttributeValueItem[];
  variantMedia?: ProductMediaItem[];
}

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string | null;
  brandId?: string | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  productType: ProductType;
  status: ProductStatus;
  productCategories: Array<{
    id: string;
    categoryId: string;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  productMedia: ProductMediaItem[];
  variants: ProductVariantItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSimpleProductPayload {
  name: string;
  slug?: string;
  sku: string;
  description?: string;
  brandId?: string;
  categoryIds: string[];
  status?: ProductStatus;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  weight?: number;
  thumbnailMediaId?: string;
  galleryMediaIds?: string[];
}

export interface CreateVariantPayload {
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  weight?: number;
  status?: VariantStatus;
  attributeValueIds: string[];
  primaryMediaId?: string;
  mediaIds?: string[];
}

export interface CreateVariableProductPayload {
  name: string;
  slug?: string;
  sku: string;
  description?: string;
  brandId?: string;
  categoryIds: string[];
  status?: ProductStatus;
  thumbnailMediaId?: string;
  galleryMediaIds?: string[];
  variants: CreateVariantPayload[];
}

export interface GenerateVariantsMatrixPayload {
  attributeValueIdsGrouped: string[][];
  baseSku?: string;
}

export interface GeneratedVariantDraft {
  attributeValueIds: string[];
  suggestedSku: string;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  productType?: ProductType;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
