import { z } from 'zod';
import { BrandStatus } from '@prisma/client';

export const createBrandSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Brand name is required'),
    slug: z.string().trim().optional(),
    description: z.string().trim().optional(),
    logoMediaId: z
      .string()
      .optional()
      .transform((val) => (val?.trim() === '' ? undefined : val))
      .refine((val) => val === undefined || z.string().uuid().safeParse(val).success, {
        message: 'Invalid logo media ID',
      }),
    status: z.nativeEnum(BrandStatus).optional().default(BrandStatus.ACTIVE),
  }),
});

export const updateBrandSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Brand name cannot be empty').optional(),
    slug: z.string().trim().optional(),
    description: z.string().trim().optional(),
    logoMediaId: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val?.trim() === '' ? null : val))
      .refine((val) => val === null || val === undefined || z.string().uuid().safeParse(val).success, {
        message: 'Invalid logo media ID',
      }),
    status: z.nativeEnum(BrandStatus).optional(),
  }),
});

export const brandQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    search: z.string().optional().transform((val) => (val?.trim() === '' ? undefined : val)),
    status: z
      .string()
      .optional()
      .transform((val) => (val?.trim() === '' ? undefined : val))
      .refine((val) => val === undefined || Object.values(BrandStatus).includes(val as any), {
        message: 'Invalid status',
      })
      .transform((val) => (val ? (val as BrandStatus) : undefined)),
  }),
});