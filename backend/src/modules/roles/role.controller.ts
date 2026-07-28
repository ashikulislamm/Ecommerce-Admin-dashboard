import type { Request, Response } from 'express';
import RoleService from './role.service.js';
import { ApiResponse } from '../../shared/responses/api-response.js';

export class RoleController {
  /**
   * POST /api/v1/roles
   */
  static async create(req: Request, res: Response): Promise<void> {
    const role = await RoleService.createRole(req.body);
    ApiResponse.success(res, 201, 'Role created successfully', role);
  }

  /**
   * GET /api/v1/roles
   */
  static async list(req: Request, res: Response): Promise<void> {
    const result = await RoleService.getRoles(req.query as any);
    ApiResponse.success(res, 200, 'Roles retrieved successfully', result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  }

  /**
   * GET /api/v1/roles/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    const role = await RoleService.getRoleById(req.params.id as string);
    ApiResponse.success(res, 200, 'Role retrieved successfully', role);
  }

  /**
   * PATCH /api/v1/roles/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    const role = await RoleService.updateRole(req.params.id as string, req.body);
    ApiResponse.success(res, 200, 'Role updated successfully', role);
  }

  /**
   * DELETE /api/v1/roles/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    await RoleService.deleteRole(req.params.id as string);
    ApiResponse.success(res, 200, 'Role deleted successfully', null);
  }

  /**
   * POST /api/v1/roles/:id/permissions
   */
  static async assignPermission(req: Request, res: Response): Promise<void> {
    const result = await RoleService.assignPermission(
      req.params.id as string,
      req.body.permissionId,
    );
    ApiResponse.success(res, 200, 'Permission assigned to role successfully', result);
  }

  /**
   * DELETE /api/v1/roles/:id/permissions/:permissionId
   */
  static async revokePermission(req: Request, res: Response): Promise<void> {
    await RoleService.revokePermission(
      req.params.id as string,
      req.params.permissionId as string,
    );
    ApiResponse.success(res, 200, 'Permission revoked from role successfully', null);
  }

  /**
   * POST /api/v1/roles/:id/permissions/grant-all
   */
  static async grantAllPermissions(req: Request, res: Response): Promise<void> {
    const role = await RoleService.grantAllPermissions(req.params.id as string);
    ApiResponse.success(res, 200, 'All permissions granted to role successfully', role);
  }
}

export default RoleController;