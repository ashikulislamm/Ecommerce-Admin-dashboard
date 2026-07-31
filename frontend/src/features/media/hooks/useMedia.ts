import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MediaService } from '../services/media.service';
import type { MediaQuery } from '../types/media.types';

export const MEDIA_QUERY_KEYS = {
  all: ['media'] as const,
  list: (query: MediaQuery & { folderId?: string | null }) => [...MEDIA_QUERY_KEYS.all, 'list', query] as const,
};

export function useMedia(query: MediaQuery & { folderId?: string | null } = {}) {
  return useQuery({
    queryKey: MEDIA_QUERY_KEYS.list(query),
    queryFn: () => MediaService.getMedia(query),
  });
}

export function useUploadMediaSingle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, folderId }: { file: File; folderId?: string | null }) =>
      MediaService.uploadSingle(file, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
    },
  });
}

export function useUploadMediaMultiple() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ files, folderId }: { files: File[]; folderId?: string | null }) =>
      MediaService.uploadMultiple(files, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
    },
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { title?: string; altText?: string; folderId?: string | null } }) =>
      MediaService.updateMedia(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => MediaService.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
    },
  });
}
