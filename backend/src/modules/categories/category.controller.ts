import type { Request, Response } from 'express';
import CategoryService from './category.service.js';
import { ApiResponse } from '../../shared/responses/api-response.js';

export class CategoryController {
  static async tree(_req: Request, res: Response): Promise<void> {
    const tree = await CategoryService.getCategoryTree();
    ApiResponse.success(res, 200, 'Category tree retrieved successfully', tree);
  }

  static async list(req: Request, res: Response): Promise<void> {
    const result = await CategoryService.getCategories(req.query as any);
    ApiResponse.success(res, 200, 'Categories retrieved successfully', result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  }

  static async create(req: Request, res: Response): Promise<void> {
    const category = await CategoryService.createCategory(req.body);
    ApiResponse.success(res, 201, 'Category created successfully', category);
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const category = await CategoryService.getCategoryById(req.params.id as string);
    ApiResponse.success(res, 200, 'Category retrieved successfully', category);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const category = await CategoryService.updateCategory(req.params.id as string, req.body);
    ApiResponse.success(res, 200, 'Category updated successfully', category);
  }

  static async delete(req: Request, res: Response): Promise<void> {
    await CategoryService.deleteCategory(req.params.id as string);
    ApiResponse.success(res, 200, 'Category deleted successfully', null);
  }
}

export default CategoryController;