import type { Request, Response } from 'express';
import PermissionService from './permission.service.js';
import { ApiResponse } from '../../shared/responses/api-response.js';

export class PermissionController {
  /**
   * POST /api/v1/permissions
   */
  static async create(req: Request, res: Response): Promise<void> {
    const permission = await PermissionService.createPermission(req.body);
    ApiResponse.success(res, 201, 'Permission created successfully', permission);
  }

  /**
   * GET /api/v1/permissions
   */
  static async list(req: Request, res: Response): Promise<void> {
    const result = await PermissionService.getPermissions(req.query as any);
    ApiResponse.success(res, 200, 'Permissions retrieved successfully', result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  }

  /**
   * GET /api/v1/permissions/groups
   */
  static async listGroups(_req: Request, res: Response): Promise<void> {
    const groups = await PermissionService.getPermissionGroups();
    ApiResponse.success(res, 200, 'Permission groups retrieved successfully', groups);
  }

  /**
   * POST /api/v1/permissions/groups
   */
  static async createGroup(req: Request, res: Response): Promise<void> {
    const group = await PermissionService.createPermissionGroup(req.body);
    ApiResponse.success(res, 201, 'Permission group created successfully', group);
  }

  /**
   * GET /api/v1/permissions/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    const permission = await PermissionService.getPermissionById(req.params.id as string);
    ApiResponse.success(res, 200, 'Permission retrieved successfully', permission);
  }

  /**
   * PATCH /api/v1/permissions/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    const permission = await PermissionService.updatePermission(
      req.params.id as string,
      req.body,
    );
    ApiResponse.success(res, 200, 'Permission updated successfully', permission);
  }

  /**
   * DELETE /api/v1/permissions/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    await PermissionService.deletePermission(req.params.id as string);
    ApiResponse.success(res, 200, 'Permission deleted successfully', null);
  }
}

export default PermissionController;