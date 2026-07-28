import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Role name is required')
      .max(50, 'Role name must be 50 characters or less'),
    description: z.string().trim().optional(),
    permissionIds: z.array(z.string().uuid('Invalid permission ID')).optional(),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Role name cannot be empty')
      .max(50, 'Role name must be 50 characters or less')
      .optional(),
    description: z.string().trim().optional(),
    permissionIds: z.array(z.string().uuid('Invalid permission ID')).optional(),
  }),
});

export const rolePermissionAssignSchema = z.object({
  body: z.object({
    permissionId: z.string().uuid('Invalid permission ID'),
  }),
});

export const setRolePermissionsSchema = z.object({
  body: z.object({
    permissionIds: z.array(z.string().uuid('Invalid permission ID')),
  }),
});

export const roleQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    search: z.string().optional(),
  }),
});