import type { Request, Response } from 'express';
import BrandService from './brand.service.js';
import { ApiResponse } from '../../shared/responses/api-response.js';

export class BrandController {
  static async list(req: Request, res: Response): Promise<void> {
    const result = await BrandService.getBrands(req.query as any);
    ApiResponse.success(res, 200, 'Brands retrieved successfully', result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  }

  static async create(req: Request, res: Response): Promise<void> {
    const brand = await BrandService.createBrand(req.body);
    ApiResponse.success(res, 201, 'Brand created successfully', brand);
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const brand = await BrandService.getBrandById(req.params.id as string);
    ApiResponse.success(res, 200, 'Brand retrieved successfully', brand);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const brand = await BrandService.updateBrand(req.params.id as string, req.body);
    ApiResponse.success(res, 200, 'Brand updated successfully', brand);
  }

  static async delete(req: Request, res: Response): Promise<void> {
    await BrandService.deleteBrand(req.params.id as string);
    ApiResponse.success(res, 200, 'Brand deleted successfully', null);
  }
}

export default BrandController;