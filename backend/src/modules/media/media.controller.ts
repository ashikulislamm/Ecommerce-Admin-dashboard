import type { Request, Response } from 'express';
import MediaService from './media.service.js';
import { ApiResponse } from '../../shared/responses/api-response.js';

export class MediaController {
  static async uploadSingle(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id;
    const folderId = req.body?.folderId || null;
    const media = await MediaService.uploadSingle(req.file, userId, folderId);
    ApiResponse.success(res, 201, 'File uploaded successfully', media);
  }

  static async uploadMultiple(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id;
    const folderId = req.body?.folderId || null;
    const files = req.files as Express.Multer.File[];
    const mediaList = await MediaService.uploadMultiple(files, userId, folderId);
    ApiResponse.success(res, 201, 'Files uploaded successfully', mediaList);
  }

  static async list(req: Request, res: Response): Promise<void> {
    const result = await MediaService.getMedia(req.query as any);
    ApiResponse.success(res, 200, 'Media list retrieved successfully', result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const media = await MediaService.getMediaById(req.params.id as string);
    ApiResponse.success(res, 200, 'Media retrieved successfully', media);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const media = await MediaService.updateMedia(req.params.id as string, req.body);
    ApiResponse.success(res, 200, 'Media metadata updated successfully', media);
  }

  static async delete(req: Request, res: Response): Promise<void> {
    await MediaService.deleteMedia(req.params.id as string);
    ApiResponse.success(res, 200, 'Media deleted successfully', null);
  }
}

export default MediaController;