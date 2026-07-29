import { apiClient } from '@/lib/api-client';
import type { BrandItem, BrandQuery } from '../types/brand.types';

export const BrandService = {
  async getBrands(params: BrandQuery = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);

    const queryString = searchParams.toString();
    const endpoint = `/brands${queryString ? `?${queryString}` : ''}`;
    const res = await apiClient<BrandItem[]>(endpoint, { method: 'GET' });
    return res.data;
  },

  async createBrand(payload: any) {
    const res = await apiClient<BrandItem>('/brands', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateBrand(id: string, payload: any) {
    const res = await apiClient<BrandItem>(`/brands/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteBrand(id: string) {
    const res = await apiClient<null>(`/brands/${id}`, { method: 'DELETE' });
    return res.data;
  },
};
