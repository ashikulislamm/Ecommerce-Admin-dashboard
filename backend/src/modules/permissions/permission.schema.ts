import { z } from 'zod';
import { PERMISSION_KEY_REGEX } from './permission.constants.js';

export const createPermissionSchema = z.object({
  body: z.object({
    module: z
      .string()
      .trim()
      .min(1, 'Module is required')
      .transform((val) => val.toLowerCase()),
    action: z
      .string()
      .trim()
      .min(1, 'Action is required')
      .transform((val) => val.toLowerCase()),
    name: z.string().trim().optional(),
    description: z.string().trim().optional(),
    isCustom: z.boolean().optional().default(false),
  }).refine(
    (data) => {
      const key = `${data.module}:${data.action}`;
      return PERMISSION_KEY_REGEX.test(key);
    },
    {
      message:
        'Invalid permission key format. Module and action must start with a lowercase letter and contain only lowercase alphanumeric characters, underscores, or hyphens (e.g. product:create)',
      path: ['action'],
    },
  ),
});

export const updatePermissionSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name cannot be empty').optional(),
    description: z.string().trim().optional(),
  }),
});

export const createPermissionGroupSchema = z.object({
  body: z.object({
    module: z
      .string()
      .trim()
      .min(1, 'Module is required')
      .transform((val) => val.toLowerCase()),
    name: z.string().trim().min(1, 'Name is required'),
    description: z.string().trim().optional(),
  }),
});

export const permissionQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    search: z.string().optional().transform((val) => (val?.trim() === '' ? undefined : val)),
    module: z.string().optional().transform((val) => (val?.trim() === '' ? undefined : val)),
    isCustom: z
      .string()
      .optional()
      .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  }),
});