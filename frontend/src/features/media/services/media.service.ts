import { apiClient } from '@/lib/api-client';
import type { MediaItem, MediaQuery } from '../types/media.types';

export const MediaService = {
  async getMedia(params: MediaQuery = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.mediaType) searchParams.set('mediaType', params.mediaType);

    const queryString = searchParams.toString();
    const endpoint = `/media${queryString ? `?${queryString}` : ''}`;
    const res = await apiClient<MediaItem[]>(endpoint, { method: 'GET' });
    return res.data;
  },

  async uploadSingle(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient<MediaItem>('/media/upload', {
      method: 'POST',
      body: formData,
    });
    return res.data;
  },

  async uploadMultiple(files: File[]) {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));

    const res = await apiClient<MediaItem[]>('/media/upload-multiple', {
      method: 'POST',
      body: formData,
    });
    return res.data;
  },

  async updateMedia(id: string, payload: { title?: string; altText?: string }) {
    const res = await apiClient<MediaItem>(`/media/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteMedia(id: string) {
    const res = await apiClient<null>(`/media/${id}`, { method: 'DELETE' });
    return res.data;
  },
};
