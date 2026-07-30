import { z } from 'zod';
import { MediaType } from '@prisma/client';

export const updateMediaSchema = z.object({
  body: z.object({
    title: z.string().trim().optional(),
    altText: z.string().trim().optional(),
  }),
});

export const mediaQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    search: z.string().optional().transform((val) => (val?.trim() === '' ? undefined : val)),
    mediaType: z
      .string()
      .optional()
      .transform((val) => (val?.trim() === '' ? undefined : val))
      .refine((val) => val === undefined || Object.values(MediaType).includes(val as any), {
        message: 'Invalid media type',
      })
      .transform((val) => (val ? (val as MediaType) : undefined)),
    uploadedById: z
      .string()
      .optional()
      .transform((val) => (val?.trim() === '' ? undefined : val)),
  }),
});