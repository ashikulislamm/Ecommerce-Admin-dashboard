import fs from 'fs';
import path from 'path';
import { AppError } from '../../shared/errors/app-error.js';
import MediaRepository from './media.repository.js';
import { processAndSaveFile, UPLOAD_DIR, THUMB_DIR } from './media.upload.js';
import type { MediaQuery, UpdateMediaInput } from './media.types.js';

export class MediaService {
  static async uploadSingle(file?: Express.Multer.File, uploadedById?: string) {
    if (!file) {
      throw AppError.badRequest('No file uploaded.');
    }

    const processed = await processAndSaveFile(file);
    return MediaRepository.createMedia({
      ...processed,
      uploadedById,
    });
  }

  static async uploadMultiple(files?: Express.Multer.File[], uploadedById?: string) {
    if (!files || files.length === 0) {
      throw AppError.badRequest('No files uploaded.');
    }

    const results = [];
    for (const file of files) {
      const processed = await processAndSaveFile(file);
      const saved = await MediaRepository.createMedia({
        ...processed,
        uploadedById,
      });
      results.push(saved);
    }
    return results;
  }

  static async getMedia(query: MediaQuery) {
    return MediaRepository.findManyPaginated(query);
  }

  static async getMediaById(id: string) {
    const media = await MediaRepository.findById(id);
    if (!media) {
      throw AppError.notFound(`Media with ID "${id}" not found.`);
    }
    return media;
  }

  static async updateMedia(id: string, input: UpdateMediaInput) {
    await this.getMediaById(id);
    return MediaRepository.updateMedia(id, input);
  }

  static async deleteMedia(id: string) {
    const media = await this.getMediaById(id);

    // Rule: Attached media cannot be deleted
    const usageCount = await MediaRepository.countUsage(id);
    if (usageCount > 0) {
      throw AppError.conflict(
        `Cannot delete media because it is attached to ${usageCount} catalog item(s).`,
      );
    }

    // Delete DB Record
    await MediaRepository.deleteMedia(id);

    // Delete physical main file
    if (media.fileName) {
      const mainPath = path.join(UPLOAD_DIR, media.fileName);
      if (fs.existsSync(mainPath)) {
        try {
          fs.unlinkSync(mainPath);
        } catch (err) {
          // Log error silently
        }
      }
    }

    // Delete physical thumbnail file
    if (media.thumbnailUrl) {
      const thumbFileName = path.basename(media.thumbnailUrl);
      const thumbPath = path.join(THUMB_DIR, thumbFileName);
      if (fs.existsSync(thumbPath)) {
        try {
          fs.unlinkSync(thumbPath);
        } catch (err) {
          // Log error silently
        }
      }
    }

    return null;
  }
}

export default MediaService;