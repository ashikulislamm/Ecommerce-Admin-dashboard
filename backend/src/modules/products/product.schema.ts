import { z } from 'zod';

// Simple product schema
export const createSimpleProductSchema = z
  .object({
    name: z.string().min(1, 'Product name is required').max(200),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
      .optional(),
    sku: z.string().min(1, 'SKU is required').max(100),
    description: z.string().optional(),
    brandId: z.string().uuid().optional(),
    categoryIds: z.array(z.string().uuid()).min(1, 'At least one category is required'),
    status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).optional().default('DRAFT'),
    price: z.number().min(0, 'Price cannot be negative'),
    compareAtPrice: z.number().min(0, 'Compare-at price cannot be negative').optional(),
    costPrice: z.number().min(0, 'Cost price cannot be negative').optional(),
    stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative'),
    lowStockThreshold: z.number().int().min(0).optional(),
    weight: z.number().min(0).optional(),
    thumbnailMediaId: z.string().uuid().optional(),
    galleryMediaIds: z.array(z.string().uuid()).optional(),
  })
  .refine(
    (data) => {
      if (data.compareAtPrice !== undefined && data.compareAtPrice !== null) {
        return data.compareAtPrice >= data.price;
      }
      return true;
    },
    {
      message: 'Sale price (compareAtPrice) must be greater than or equal to regular price',
      path: ['compareAtPrice'],
    },
  );

// Variant schema
export const createVariantSchema = z
  .object({
    sku: z.string().min(1, 'Variant SKU is required').max(100),
    price: z.number().min(0, 'Variant price cannot be negative'),
    compareAtPrice: z.number().min(0, 'Variant compare-at price cannot be negative').optional(),
    costPrice: z.number().min(0, 'Variant cost price cannot be negative').optional(),
    stockQuantity: z.number().int().min(0, 'Variant stock quantity cannot be negative'),
    lowStockThreshold: z.number().int().min(0).optional(),
    weight: z.number().min(0).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
    attributeValueIds: z.array(z.string().uuid()).min(1, 'Variant must have at least one attribute value'),
    primaryMediaId: z.string().uuid().optional(),
    mediaIds: z.array(z.string().uuid()).optional(),
  })
  .refine(
    (data) => {
      if (data.compareAtPrice !== undefined && data.compareAtPrice !== null) {
        return data.compareAtPrice >= data.price;
      }
      return true;
    },
    {
      message: 'Variant sale price (compareAtPrice) must be greater than or equal to regular price',
      path: ['compareAtPrice'],
    },
  );

// Variable product schema
export const createVariableProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  sku: z.string().min(1, 'Product base SKU is required').max(100),
  description: z.string().optional(),
  brandId: z.string().uuid().optional(),
  categoryIds: z.array(z.string().uuid()).min(1, 'At least one category is required'),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).optional().default('DRAFT'),
  thumbnailMediaId: z.string().uuid().optional(),
  galleryMediaIds: z.array(z.string().uuid()).optional(),
  variants: z
    .array(createVariantSchema)
    .min(1, 'Variable product must have at least one variant')
    .refine(
      (variants) => {
        const skus = variants.map((v) => v.sku);
        return new Set(skus).size === skus.length;
      },
      {
        message: 'Duplicate SKUs found among variants',
        path: ['variants'],
      },
    )
    .refine(
      (variants) => {
        const comboKeys = variants.map((v) => [...v.attributeValueIds].sort().join(':'));
        return new Set(comboKeys).size === comboKeys.length;
      },
      {
        message: 'Duplicate attribute combinations found among variants',
        path: ['variants'],
      },
    ),
});

// Update product schema
export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  sku: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  brandId: z.string().uuid().nullable().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  price: z.number().min(0).optional(),
  compareAtPrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional(),
  thumbnailMediaId: z.string().uuid().nullable().optional(),
  galleryMediaIds: z.array(z.string().uuid()).optional(),
  variants: z.array(createVariantSchema).optional(),
});

// Matrix variant generation schema
export const generateVariantsSchema = z.object({
  attributeValueIdsGrouped: z
    .array(z.array(z.string().uuid()).min(1))
    .min(1, 'Provide at least one group of attribute values'),
});