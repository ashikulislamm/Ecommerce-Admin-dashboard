import prisma from '../../lib/prisma.js';
import type { MediaQuery, UpdateMediaInput, ProcessedMediaFile } from './media.types.js';

export class MediaRepository {
  static async findById(id: string) {
    return prisma.media.findUnique({
      where: { id },
    });
  }

  static async createMedia(data: ProcessedMediaFile & { uploadedById?: string; folderId?: string | null }) {
    return prisma.media.create({
      data: {
        originalName: data.originalName,
        fileName: data.fileName,
        storageKey: data.storageKey,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        width: data.width,
        height: data.height,
        mediaType: data.mediaType,
        uploadedById: data.uploadedById ?? null,
        folderId: data.folderId ?? null,
      },
    });
  }

  static async updateMedia(id: string, data: UpdateMediaInput) {
    return prisma.media.update({
      where: { id },
      data,
    });
  }

  static async deleteMedia(id: string) {
    return prisma.media.delete({
      where: { id },
    });
  }

  static async countUsage(mediaId: string): Promise<number> {
    const [brandCount, productMediaCount, variantMediaCount, attributeValueMediaCount, categoryCount, attributeValueCount] =
      await Promise.all([
        prisma.brand.count({ where: { logoMediaId: mediaId } }),
        prisma.productMedia.count({ where: { mediaId } }),
        prisma.variantMedia.count({ where: { mediaId } }),
        prisma.attributeValueMedia.count({ where: { mediaId } }),
        prisma.category.count({ where: { imageMediaId: mediaId } }),
        prisma.attributeValue.count({ where: { imageMediaId: mediaId } }),
      ]);

    return (
      brandCount +
      productMediaCount +
      variantMediaCount +
      attributeValueMediaCount +
      categoryCount +
      attributeValueCount
    );
  }

  static async findManyPaginated(params: MediaQuery) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { originalName: { contains: params.search, mode: 'insensitive' } },
        { fileName: { contains: params.search, mode: 'insensitive' } },
        { title: { contains: params.search, mode: 'insensitive' } },
        { altText: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.mediaType) {
      where.mediaType = params.mediaType;
    }

    if (params.uploadedById) {
      where.uploadedById = params.uploadedById;
    }

    if (params.folderId === 'root') {
      where.folderId = null;
    } else if (params.folderId && params.folderId !== 'all') {
      where.folderId = params.folderId;
    }

    const [items, total] = await Promise.all([
      prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.media.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  }
}

export default MediaRepository;