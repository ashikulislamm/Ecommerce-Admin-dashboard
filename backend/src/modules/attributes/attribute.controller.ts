import type { Request, Response } from 'express';
import AttributeService from './attribute.service.js';
import { ApiResponse } from '../../shared/responses/api-response.js';

export class AttributeController {
  static async list(req: Request, res: Response): Promise<void> {
    const result = await AttributeService.getAttributes(req.query as any);
    ApiResponse.success(res, 200, 'Attributes retrieved successfully', result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  }

  static async create(req: Request, res: Response): Promise<void> {
    const attribute = await AttributeService.createAttribute(req.body);
    ApiResponse.success(res, 201, 'Attribute created successfully', attribute);
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const attribute = await AttributeService.getAttributeById(req.params.id as string);
    ApiResponse.success(res, 200, 'Attribute retrieved successfully', attribute);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const attribute = await AttributeService.updateAttribute(req.params.id as string, req.body);
    ApiResponse.success(res, 200, 'Attribute updated successfully', attribute);
  }

  static async delete(req: Request, res: Response): Promise<void> {
    await AttributeService.deleteAttribute(req.params.id as string);
    ApiResponse.success(res, 200, 'Attribute deleted successfully', null);
  }

  // --- Attribute Values ---

  static async createValue(req: Request, res: Response): Promise<void> {
    const attributeId = req.params.id as string;
    const value = await AttributeService.createAttributeValue(attributeId, req.body);
    ApiResponse.success(res, 201, 'Attribute value created successfully', value);
  }

  static async updateValue(req: Request, res: Response): Promise<void> {
    const valueId = req.params.valueId as string;
    const value = await AttributeService.updateAttributeValue(valueId, req.body);
    ApiResponse.success(res, 200, 'Attribute value updated successfully', value);
  }

  static async deleteValue(req: Request, res: Response): Promise<void> {
    const valueId = req.params.valueId as string;
    await AttributeService.deleteAttributeValue(valueId);
    ApiResponse.success(res, 200, 'Attribute value deleted successfully', null);
  }
}

export default AttributeController;