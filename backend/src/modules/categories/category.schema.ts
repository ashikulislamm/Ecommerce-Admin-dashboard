import { z } from 'zod';
import { CategoryStatus } from '@prisma/client';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Category name is required'),
    slug: z.string().trim().optional(),
    description: z.string().trim().optional(),
    parentId: z
      .string()
      .optional()
      .transform((val) => (val?.trim() === '' ? undefined : val))
      .refine((val) => val === undefined || z.string().uuid().safeParse(val).success, {
        message: 'Invalid parent category ID',
      }),
    imageMediaId: z
      .string()
      .optional()
      .transform((val) => (val?.trim() === '' ? undefined : val))
      .refine((val) => val === undefined || z.string().uuid().safeParse(val).success, {
        message: 'Invalid image media ID',
      }),
    status: z.nativeEnum(CategoryStatus).optional().default(CategoryStatus.ACTIVE),
    sortOrder: z.coerce.number().int().optional().default(0),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Category name cannot be empty').optional(),
    slug: z.string().trim().optional(),
    description: z.string().trim().optional(),
    parentId: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val?.trim() === '' ? null : val))
      .refine((val) => val === null || val === undefined || z.string().uuid().safeParse(val).success, {
        message: 'Invalid parent category ID',
      }),
    imageMediaId: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val?.trim() === '' ? null : val))
      .refine((val) => val === null || val === undefined || z.string().uuid().safeParse(val).success, {
        message: 'Invalid image media ID',
      }),
    status: z.nativeEnum(CategoryStatus).optional(),
    sortOrder: z.coerce.number().int().optional(),
  }),
});

export const categoryQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    search: z.string().optional().transform((val) => (val?.trim() === '' ? undefined : val)),
    parentId: z
      .string()
      .optional()
      .transform((val) => (val?.trim() === '' ? undefined : val)),
    status: z
      .string()
      .optional()
      .transform((val) => (val?.trim() === '' ? undefined : val))
      .refine((val) => val === undefined || Object.values(CategoryStatus).includes(val as any), {
        message: 'Invalid status',
      })
      .transform((val) => (val ? (val as CategoryStatus) : undefined)),
  }),
});