import { apiClient } from '@/lib/api-client';
import type {
  ProductItem,
  ProductQuery,
  CreateSimpleProductPayload,
  CreateVariableProductPayload,
  GenerateVariantsMatrixPayload,
  GeneratedVariantDraft,
} from '../types/product.types';

export const productService = {
  getProducts: async (params?: ProductQuery) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.brandId) searchParams.set('brandId', params.brandId);
    if (params?.productType) searchParams.set('productType', params.productType);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.minPrice !== undefined) searchParams.set('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined) searchParams.set('maxPrice', String(params.maxPrice));
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    const res = await apiClient<ProductItem[]>(endpoint, { method: 'GET' });
    return res;
  },

  getProductById: async (id: string) => {
    const res = await apiClient<ProductItem>(`/products/${id}`, {
      method: 'GET',
    });
    return res.data;
  },

  createSimpleProduct: async (payload: CreateSimpleProductPayload) => {
    const res = await apiClient<ProductItem>('/products/simple', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  createVariableProduct: async (payload: CreateVariableProductPayload) => {
    const res = await apiClient<ProductItem>('/products/variable', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  generateVariantMatrix: async (payload: GenerateVariantsMatrixPayload) => {
    const res = await apiClient<GeneratedVariantDraft[]>('/products/generate-matrix', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  updateProduct: async (id: string, payload: Partial<CreateSimpleProductPayload>) => {
    const res = await apiClient<ProductItem>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  deleteProduct: async (id: string) => {
    const res = await apiClient<null>(`/products/${id}`, {
      method: 'DELETE',
    });
    return res;
  },
};
