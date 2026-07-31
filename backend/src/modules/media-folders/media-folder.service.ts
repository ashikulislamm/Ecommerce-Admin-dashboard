import { AppError } from '../../shared/errors/app-error.js';
import MediaFolderRepository from './media-folder.repository.js';
import type {
  CreateMediaFolderInput,
  UpdateMediaFolderInput,
  MediaFolderTreeNode,
} from './media-folder.types.js';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export class MediaFolderService {
  static async createFolder(input: CreateMediaFolderInput) {
    const name = input.name.trim();
    const slug = slugify(name);
    const parentId = input.parentId || null;

    if (parentId) {
      const parent = await MediaFolderRepository.findById(parentId);
      if (!parent || parent.deletedAt) {
        throw AppError.notFound(`Parent folder with ID "${parentId}" not found.`);
      }
    }

    const existing = await MediaFolderRepository.findByParentAndSlug(parentId, slug);
    if (existing) {
      throw AppError.conflict(`A folder named "${name}" already exists in this directory.`);
    }

    return MediaFolderRepository.create({
      name,
      slug,
      parentId,
    });
  }

  static async getTree(): Promise<MediaFolderTreeNode[]> {
    const folders = await MediaFolderRepository.findAllFlat();

    // Map into recursive tree structure
    const folderMap = new Map<string, MediaFolderTreeNode>();
    folders.forEach((f) => {
      folderMap.set(f.id, {
        id: f.id,
        name: f.name,
        slug: f.slug,
        parentId: f.parentId,
        mediaCount: f._count.media,
        children: [],
      });
    });

    const rootNodes: MediaFolderTreeNode[] = [];
    folderMap.forEach((node) => {
      if (node.parentId && folderMap.has(node.parentId)) {
        folderMap.get(node.parentId)!.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }

  static async getFolderById(id: string) {
    const folder = await MediaFolderRepository.findById(id);
    if (!folder || folder.deletedAt) {
      throw AppError.notFound(`Media folder with ID "${id}" not found.`);
    }

    // Build breadcrumbs path
    const breadcrumbs: Array<{ id: string; name: string }> = [];
    let current: any = folder;
    while (current) {
      breadcrumbs.unshift({ id: current.id, name: current.name });
      if (current.parentId) {
        current = await MediaFolderRepository.findById(current.parentId);
      } else {
        current = null;
      }
    }

    return {
      folder,
      breadcrumbs,
    };
  }

  static async updateFolder(id: string, input: UpdateMediaFolderInput) {
    const existing = await MediaFolderRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw AppError.notFound(`Media folder with ID "${id}" not found.`);
    }

    let slug = existing.slug;
    if (input.name && input.name.trim() !== existing.name) {
      slug = slugify(input.name.trim());
      const duplicate = await MediaFolderRepository.findByParentAndSlug(
        input.parentId !== undefined ? input.parentId : existing.parentId,
        slug,
      );
      if (duplicate && duplicate.id !== id) {
        throw AppError.conflict(`A folder named "${input.name.trim()}" already exists in this directory.`);
      }
    }

    // Circular dependency check if moving parentId
    if (input.parentId !== undefined && input.parentId !== existing.parentId) {
      if (input.parentId === id) {
        throw AppError.badRequest('A folder cannot be its own parent.');
      }
      if (input.parentId) {
        let ancestorId: string | null = input.parentId;
        while (ancestorId) {
          if (ancestorId === id) {
            throw AppError.badRequest('Circular folder hierarchy detected. Cannot move folder under its own child.');
          }
          const ancestor = await MediaFolderRepository.findById(ancestorId);
          ancestorId = ancestor?.parentId || null;
        }
      }
    }

    return MediaFolderRepository.update(id, {
      name: input.name?.trim(),
      slug,
      parentId: input.parentId !== undefined ? input.parentId : existing.parentId,
    });
  }

  static async deleteFolder(id: string) {
    const existing = await MediaFolderRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw AppError.notFound(`Media folder with ID "${id}" not found.`);
    }

    if (existing._count.children > 0) {
      throw AppError.conflict(`Cannot delete folder because it contains ${existing._count.children} subfolder(s).`);
    }

    if (existing._count.media > 0) {
      throw AppError.conflict(`Cannot delete folder because it contains ${existing._count.media} media file(s). Move or delete files first.`);
    }

    return MediaFolderRepository.delete(id);
  }

  static async moveMediaToFolder(mediaIds: string[], targetFolderId: string | null) {
    if (targetFolderId) {
      const folder = await MediaFolderRepository.findById(targetFolderId);
      if (!folder || folder.deletedAt) {
        throw AppError.notFound(`Target media folder with ID "${targetFolderId}" not found.`);
      }
    }

    return MediaFolderRepository.moveMediaToFolder(mediaIds, targetFolderId);
  }
}

export default MediaFolderService;
