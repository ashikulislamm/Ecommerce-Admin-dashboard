import type { MediaType } from '../../generated/prisma/index.js';

export interface MediaQuery {
  page?: number;
  limit?: number;
  search?: string;
  mediaType?: MediaType;
  uploadedById?: string;
}

export interface UpdateMediaInput {
  title?: string;
  altText?: string;
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
}