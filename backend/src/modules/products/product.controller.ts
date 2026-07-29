import type { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service.js';
import { ApiResponse } from '../../shared/responses/api-response.js';

export class ProductController {
  static async createSimple(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.createSimpleProduct(req.body as any);
      return ApiResponse.success(res, 201, 'Simple product created successfully', product);
    } catch (err) {
      next(err);
    }
  }

  static async createVariable(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.createVariableProduct(req.body as any);
      return ApiResponse.success(res, 201, 'Variable product created successfully', product);
    } catch (err) {
      next(err);
    }
  }

  static async generateMatrix(req: Request, res: Response, next: NextFunction) {
    try {
      const baseSku = (req.body.baseSku as string) || 'PROD';
      const matrix = ProductService.generateVariantMatrix(req.body as any, baseSku);
      return ApiResponse.success(res, 200, 'Variant matrix generated successfully', matrix);
    } catch (err) {
      next(err);
    }
  }

  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        search: req.query.search as string,
        categoryId: req.query.categoryId as string,
        brandId: req.query.brandId as string,
        productType: req.query.productType as any,
        status: req.query.status as any,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      };

      const result = await ProductService.getProducts(query as any);
      return ApiResponse.success(
        res,
        200,
        'Products retrieved successfully',
        result.data,
        result.meta,
      );
    } catch (err) {
      next(err);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = await ProductService.getProductById(id);
      return ApiResponse.success(res, 200, 'Product retrieved successfully', product);
    } catch (err) {
      next(err);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = await ProductService.updateProduct(id, req.body as any);
      return ApiResponse.success(res, 200, 'Product updated successfully', product);
    } catch (err) {
      next(err);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await ProductService.deleteProduct(id);
      return ApiResponse.success(res, 200, 'Product deleted successfully', null);
    } catch (err) {
      next(err);
    }
  }
}

export default ProductController;