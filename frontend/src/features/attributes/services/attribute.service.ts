import { apiClient } from '@/lib/api-client';
import type { AttributeItem, AttributeQuery, AttributeValueItem } from '../types/attribute.types';

export const AttributeService = {
  async getAttributes(params: AttributeQuery = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.type) searchParams.set('type', params.type);

    const queryString = searchParams.toString();
    const endpoint = `/attributes${queryString ? `?${queryString}` : ''}`;
    const res = await apiClient<AttributeItem[]>(endpoint, { method: 'GET' });
    return res.data;
  },

  async createAttribute(payload: any) {
    const res = await apiClient<AttributeItem>('/attributes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateAttribute(id: string, payload: any) {
    const res = await apiClient<AttributeItem>(`/attributes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteAttribute(id: string) {
    const res = await apiClient<null>(`/attributes/${id}`, { method: 'DELETE' });
    return res.data;
  },

  // Value APIs
  async createAttributeValue(attributeId: string, payload: any) {
    const res = await apiClient<AttributeValueItem>(`/attributes/${attributeId}/values`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteAttributeValue(attributeId: string, valueId: string) {
    const res = await apiClient<null>(`/attributes/${attributeId}/values/${valueId}`, {
      method: 'DELETE',
    });
    return res.data;
  },
};
