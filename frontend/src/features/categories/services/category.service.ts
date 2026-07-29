import { apiClient } from '@/lib/api-client';
import type { CategoryItem, CategoryQuery } from '../types/category.types';

export const CategoryService = {
  async getTree() {
    const res = await apiClient<CategoryItem[]>('/categories/tree', { method: 'GET' });
    return res.data;
  },

  async getCategories(params: CategoryQuery = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.parentId) searchParams.set('parentId', params.parentId);
    if (params.status) searchParams.set('status', params.status);

    const queryString = searchParams.toString();
    const endpoint = `/categories${queryString ? `?${queryString}` : ''}`;
    const res = await apiClient<CategoryItem[]>(endpoint, { method: 'GET' });
    return res.data;
  },

  async createCategory(payload: any) {
    const res = await apiClient<CategoryItem>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateCategory(id: string, payload: any) {
    const res = await apiClient<CategoryItem>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteCategory(id: string) {
    const res = await apiClient<null>(`/categories/${id}`, { method: 'DELETE' });
    return res.data;
  },
};
