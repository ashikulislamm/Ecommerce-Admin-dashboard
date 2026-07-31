import type { Request, Response, NextFunction } from 'express';
import MediaFolderService from './media-folder.service.js';
import { ApiResponse } from '../../shared/responses/api-response.js';

export class MediaFolderController {
  static async createFolder(req: Request, res: Response, next: NextFunction) {
    try {
      const folder = await MediaFolderService.createFolder(req.body);
      return ApiResponse.success(res, 201, 'Media folder created successfully', folder);
    } catch (err) {
      next(err);
    }
  }

  static async getTree(_req: Request, res: Response, next: NextFunction) {
    try {
      const tree = await MediaFolderService.getTree();
      return ApiResponse.success(res, 200, 'Media folder tree retrieved successfully', tree);
    } catch (err) {
      next(err);
    }
  }

  static async getFolderById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await MediaFolderService.getFolderById(id);
      return ApiResponse.success(res, 200, 'Media folder details retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  }

  static async updateFolder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const folder = await MediaFolderService.updateFolder(id, req.body);
      return ApiResponse.success(res, 200, 'Media folder updated successfully', folder);
    } catch (err) {
      next(err);
    }
  }

  static async deleteFolder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await MediaFolderService.deleteFolder(id);
      return ApiResponse.success(res, 200, 'Media folder deleted successfully', null);
    } catch (err) {
      next(err);
    }
  }

  static async moveMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const { mediaIds, targetFolderId } = req.body;
      const result = await MediaFolderService.moveMediaToFolder(mediaIds, targetFolderId || null);
      return ApiResponse.success(res, 200, `Moved ${result.count} media item(s) successfully`, result);
    } catch (err) {
      next(err);
    }
  }
}

export default MediaFolderController;
