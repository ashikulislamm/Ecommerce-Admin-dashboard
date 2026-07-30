import { z } from 'zod';
import { AttributeType } from '@prisma/client';

export const createAttributeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Attribute name is required'),
    slug: z.string().trim().optional(),
    type: z.nativeEnum(AttributeType).optional().default(AttributeType.DROPDOWN),
    description: z.string().trim().optional(),
  }),
});

export const updateAttributeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Attribute name cannot be empty').optional(),
    slug: z.string().trim().optional(),
    type: z.nativeEnum(AttributeType).optional(),
    description: z.string().trim().optional(),
  }),
});

export const attributeQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    search: z.string().optional().transform((val) => (val?.trim() === '' ? undefined : val)),
    type: z
      .string()
      .optional()
      .transform((val) => (val?.trim() === '' ? undefined : val))
      .refine((val) => val === undefined || Object.values(AttributeType).includes(val as any), {
        message: 'Invalid attribute type',
      })
      .transform((val) => (val ? (val as AttributeType) : undefined)),
  }),
});

export const createAttributeValueSchema = z.object({
  body: z.object({
    value: z.string().trim().min(1, 'Value is required'),
    displayColor: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val),
        { message: 'Invalid hex color code format (e.g. #FF0000)' },
      ),
    imageMediaId: z
      .string()
      .optional()
      .transform((val) => (val?.trim() === '' ? undefined : val))
      .refine((val) => val === undefined || z.string().uuid().safeParse(val).success, {
        message: 'Invalid image media ID',
      }),
  }),
});

export const updateAttributeValueSchema = z.object({
  body: z.object({
    value: z.string().trim().min(1, 'Value cannot be empty').optional(),
    displayColor: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => !val || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val),
        { message: 'Invalid hex color code format (e.g. #FF0000)' },
      ),
    imageMediaId: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val?.trim() === '' ? null : val))
      .refine((val) => val === null || val === undefined || z.string().uuid().safeParse(val).success, {
        message: 'Invalid image media ID',
      }),
  }),
});