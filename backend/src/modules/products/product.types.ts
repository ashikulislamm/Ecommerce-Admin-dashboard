import type { ProductType, ProductStatus, VariantStatus } from '@prisma/client';

export interface CreateSimpleProductInput {
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

export interface VariantAttributeValueInput {
  attributeValueId: string;
}

export interface CreateVariantInput {
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

export interface CreateVariableProductInput {
  name: string;
  slug?: string;
  sku: string;
  description?: string;
  brandId?: string;
  categoryIds: string[];
  status?: ProductStatus;
  thumbnailMediaId?: string;
  galleryMediaIds?: string[];
  variants: CreateVariantInput[];
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  sku?: string;
  description?: string;
  brandId?: string;
  categoryIds?: string[];
  status?: ProductStatus;
  price?: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  weight?: number;
  thumbnailMediaId?: string;
  galleryMediaIds?: string[];
  variants?: CreateVariantInput[];
}

export interface GenerateVariantsMatrixInput {
  attributeValueIdsGrouped: string[][]; // e.g. [[redId, blueId], [smallId, mediumId]]
}

export interface GeneratedVariantDraft {
  attributeValueIds: string[];
  suggestedSku: string;
}

export interface ProductFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  productType?: ProductType;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'name' | 'price' | 'sku';
  sortOrder?: 'asc' | 'desc';
}