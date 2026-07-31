import prisma from '../../lib/prisma.js';
import type { CreateMediaFolderInput, UpdateMediaFolderInput } from './media-folder.types.js';

export class MediaFolderRepository {
  static async findById(id: string) {
    return prisma.mediaFolder.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            media: { where: { deletedAt: null } },
            children: { where: { deletedAt: null } },
          },
        },
      },
    });
  }

  static async findByParentAndSlug(parentId: string | null, slug: string) {
    return prisma.mediaFolder.findFirst({
      where: {
        parentId: parentId || null,
        slug,
        deletedAt: null,
      },
    });
  }

  static async create(data: CreateMediaFolderInput & { slug: string }) {
    return prisma.mediaFolder.create({
      data: {
        name: data.name,
        slug: data.slug,
        parentId: data.parentId || null,
      },
    });
  }

  static async update(id: string, data: UpdateMediaFolderInput & { slug?: string }) {
    return prisma.mediaFolder.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.mediaFolder.delete({
      where: { id },
    });
  }

  static async findAllFlat() {
    return prisma.mediaFolder.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            media: { where: { deletedAt: null } },
          },
        },
      },
    });
  }

  static async moveMediaToFolder(mediaIds: string[], targetFolderId: string | null) {
    return prisma.media.updateMany({
      where: {
        id: { in: mediaIds },
      },
      data: {
        folderId: targetFolderId,
      },
    });
  }
}

export default MediaFolderRepository;
