import { z } from 'zod';

export const createMediaFolderSchema = z.object({
  name: z.string().trim().min(1, 'Folder name is required').max(100),
  parentId: z.string().uuid('Invalid parent folder ID').optional().nullable(),
});

export const updateMediaFolderSchema = z.object({
  name: z.string().trim().min(1, 'Folder name is required').max(100).optional(),
  parentId: z.string().uuid('Invalid parent folder ID').optional().nullable(),
});

export const moveMediaSchema = z.object({
  mediaIds: z.array(z.string().uuid('Invalid media ID')).min(1, 'Select at least one media item to move'),
  targetFolderId: z.string().uuid('Invalid target folder ID').optional().nullable(),
});
