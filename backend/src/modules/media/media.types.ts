import type { MediaType } from '@prisma/client';

export interface MediaQuery {
  page?: number;
  limit?: number;
  search?: string;
  mediaType?: MediaType;
  uploadedById?: string;
  folderId?: string;
}

export interface UpdateMediaInput {
  title?: string;
  altText?: string;
  folderId?: string | null;
}

export interface ProcessedMediaFile {
  originalName: string;
  fileName: string;
  storageKey: string;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  mediaType: MediaType;
  folderId?: string | null;
}