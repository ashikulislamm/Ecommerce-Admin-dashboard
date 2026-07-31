import { apiClient } from '@/lib/api-client';
import type { MediaItem, MediaQuery } from '../types/media.types';

export const MediaService = {
  async getMedia(params: MediaQuery & { folderId?: string | null } = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.mediaType) searchParams.set('mediaType', params.mediaType);
    if (params.folderId) searchParams.set('folderId', params.folderId);

    const queryString = searchParams.toString();
    const endpoint = `/media${queryString ? `?${queryString}` : ''}`;
    const res = await apiClient<MediaItem[]>(endpoint, { method: 'GET' });
    return res.data;
  },

  async uploadSingle(file: File, folderId?: string | null) {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folderId', folderId);
    }

    const res = await apiClient<MediaItem>('/media/upload', {
      method: 'POST',
      body: formData,
    });
    return res.data;
  },

  async uploadMultiple(files: File[], folderId?: string | null) {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    if (folderId) {
      formData.append('folderId', folderId);
    }

    const res = await apiClient<MediaItem[]>('/media/upload-multiple', {
      method: 'POST',
      body: formData,
    });
    return res.data;
  },

  async updateMedia(id: string, payload: { title?: string; altText?: string; folderId?: string | null }) {
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
