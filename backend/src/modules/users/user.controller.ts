import type { Request, Response } from 'express';
import UserService from './user.service.js';
import { ApiResponse } from '../../shared/responses/api-response.js';

export class UserController {
  /**
   * POST /api/v1/users
   */
  static async create(req: Request, res: Response): Promise<void> {
    const user = await UserService.createUser(req.body);
    ApiResponse.success(res, 201, 'User created successfully', user);
  }

  /**
   * GET /api/v1/users
   */
  static async list(req: Request, res: Response): Promise<void> {
    const result = await UserService.getUsers(req.query as any);
    ApiResponse.success(res, 200, 'Users retrieved successfully', result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  }

  /**
   * GET /api/v1/users/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    const user = await UserService.getUserById(req.params.id as string);
    ApiResponse.success(res, 200, 'User retrieved successfully', user);
  }

  /**
   * PATCH /api/v1/users/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    const user = await UserService.updateUser(req.params.id as string, req.body);
    ApiResponse.success(res, 200, 'User updated successfully', user);
  }

  /**
   * PATCH /api/v1/users/:id/role
   */
  static async updateRole(req: Request, res: Response): Promise<void> {
    const user = await UserService.updateUserRole(
      req.params.id as string,
      req.body.roleId,
      req.user!,
    );
    ApiResponse.success(res, 200, 'User role updated successfully', user);
  }

  /**
   * PATCH /api/v1/users/:id/status
   */
  static async updateStatus(req: Request, res: Response): Promise<void> {
    const user = await UserService.updateUserStatus(
      req.params.id as string,
      req.body.status,
      req.user!.id,
    );
    ApiResponse.success(res, 200, 'User status updated successfully', user);
  }

  /**
   * DELETE /api/v1/users/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    await UserService.deleteUser(req.params.id as string, req.user!.id);
    ApiResponse.success(res, 200, 'User deleted successfully', null);
  }
}

export default UserController;