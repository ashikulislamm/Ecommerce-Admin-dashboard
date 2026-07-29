import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MediaService } from '../services/media.service';
import type { MediaQuery } from '../types/media.types';

export const MEDIA_QUERY_KEYS = {
  all: ['media'] as const,
  list: (query: MediaQuery) => [...MEDIA_QUERY_KEYS.all, 'list', query] as const,
};

export function useMedia(query: MediaQuery = {}) {
  return useQuery({
    queryKey: MEDIA_QUERY_KEYS.list(query),
    queryFn: () => MediaService.getMedia(query),
  });
}

export function useUploadMediaSingle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => MediaService.uploadSingle(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEYS.all });
    },
  });
}

export function useUploadMediaMultiple() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => MediaService.uploadMultiple(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEYS.all });
    },
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { title?: string; altText?: string } }) =>
      MediaService.updateMedia(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEYS.all });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => MediaService.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEYS.all });
    },
  });
}
