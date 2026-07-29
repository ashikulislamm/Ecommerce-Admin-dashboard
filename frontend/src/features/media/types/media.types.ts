export type MediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';

export interface MediaItem {
  id: string;
  originalName: string;
  fileName: string;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  mediaType: MediaType;
  title: string | null;
  altText: string | null;
  uploadedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaQuery {
  page?: number;
  limit?: number;
  search?: string;
  mediaType?: MediaType;
}
