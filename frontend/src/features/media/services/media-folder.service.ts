import { apiClient } from '@/lib/api-client';
import type {
  MediaFolderTreeNode,
  CreateMediaFolderInput,
  UpdateMediaFolderInput,
} from '../types/media-folder.types';

export const mediaFolderService = {
  getTree: async (): Promise<MediaFolderTreeNode[]> => {
    const res = await apiClient<MediaFolderTreeNode[]>('/media-folders/tree', { method: 'GET' });
    return res.data;
  },

  getFolderById: async (id: string) => {
    const res = await apiClient<{
      folder: any;
      breadcrumbs: Array<{ id: string; name: string }>;
    }>(`/media-folders/${id}`, { method: 'GET' });
    return res.data;
  },

  createFolder: async (input: CreateMediaFolderInput) => {
    const res = await apiClient<any>('/media-folders', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return res.data;
  },

  updateFolder: async (id: string, input: UpdateMediaFolderInput) => {
    const res = await apiClient<any>(`/media-folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return res.data;
  },

  deleteFolder: async (id: string) => {
    const res = await apiClient<null>(`/media-folders/${id}`, { method: 'DELETE' });
    return res.data;
  },

  moveMedia: async (mediaIds: string[], targetFolderId: string | null) => {
    const res = await apiClient<any>('/media-folders/move-media', {
      method: 'POST',
      body: JSON.stringify({ mediaIds, targetFolderId }),
    });
    return res.data;
  },
};
