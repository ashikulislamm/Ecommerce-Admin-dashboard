import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaFolderService } from '../services/media-folder.service';
import { toast } from '@/lib/toast';
import type { CreateMediaFolderInput, UpdateMediaFolderInput } from '../types/media-folder.types';

export const MEDIA_FOLDERS_KEY = ['media-folders', 'tree'];

export function useMediaFolders() {
  const queryClient = useQueryClient();

  const { data: folderTree = [], isLoading, error } = useQuery({
    queryKey: MEDIA_FOLDERS_KEY,
    queryFn: mediaFolderService.getTree,
  });

  const createFolderMutation = useMutation({
    mutationFn: (input: CreateMediaFolderInput) => mediaFolderService.createFolder(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: MEDIA_FOLDERS_KEY });
      toast.success(`Folder "${data.name}" created successfully`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create folder');
    },
  });

  const updateFolderMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMediaFolderInput }) =>
      mediaFolderService.updateFolder(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_FOLDERS_KEY });
      toast.success('Folder updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update folder');
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => mediaFolderService.deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_FOLDERS_KEY });
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('Folder deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete folder');
    },
  });

  const moveMediaMutation = useMutation({
    mutationFn: ({ mediaIds, targetFolderId }: { mediaIds: string[]; targetFolderId: string | null }) =>
      mediaFolderService.moveMedia(mediaIds, targetFolderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_FOLDERS_KEY });
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('Media moved successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to move media');
    },
  });

  return {
    folderTree,
    isLoading,
    error,
    createFolder: createFolderMutation.mutateAsync,
    isCreating: createFolderMutation.isPending,
    updateFolder: updateFolderMutation.mutateAsync,
    isUpdating: updateFolderMutation.isPending,
    deleteFolder: deleteFolderMutation.mutateAsync,
    isDeleting: deleteFolderMutation.isPending,
    moveMedia: moveMediaMutation.mutateAsync,
    isMoving: moveMediaMutation.isPending,
  };
}
