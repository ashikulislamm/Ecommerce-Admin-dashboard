import type { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service';
import {
  createSimpleProductSchema,
  createVariableProductSchema,
  updateProductSchema,
  generateVariantsSchema,
} from './product.schema';

export class ProductController {
  static async createSimple(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createSimpleProductSchema.parse(req.body);
      const product = await ProductService.createSimpleProduct(validated as any);
      res.status(201).json({
        success: true,
        message: 'Simple product created successfully',
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }

  static async createVariable(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createVariableProductSchema.parse(req.body);
      const product = await ProductService.createVariableProduct(validated as any);
      res.status(201).json({
        success: true,
        message: 'Variable product created successfully',
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }

  static async generateMatrix(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = generateVariantsSchema.parse(req.body);
      const baseSku = (req.body.baseSku as string) || 'PROD';
      const matrix = ProductService.generateVariantMatrix(validated as any, baseSku);
      res.status(200).json({
        success: true,
        message: 'Variant matrix generated successfully',
        data: matrix,
      });
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

      const result = await ProductService.getProducts(query);
      res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: result.data,
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      res.status(200).json({
        success: true,
        message: 'Product retrieved successfully',
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = updateProductSchema.parse(req.body);
      const product = await ProductService.updateProduct(id, validated as any);
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ProductService.deleteProduct(id);
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        data: null,
      });
    } catch (err) {
      next(err);
    }
  }
}