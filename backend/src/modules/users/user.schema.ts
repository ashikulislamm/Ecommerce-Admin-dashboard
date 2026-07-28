import { z } from 'zod';
import { UserStatus } from '../../generated/prisma/index.js';

export const createUserSchema = z.object({
  body: z.object({
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Invalid email address')
      .transform((val) => val.toLowerCase()),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long'),
    roleId: z.string().min(1, 'Role ID is required').uuid('Invalid role ID'),
    status: z.nativeEnum(UserStatus).optional().default(UserStatus.ACTIVE),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .transform((val) => val.toLowerCase())
      .optional(),
  }),
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    roleId: z.string().min(1, 'Role ID is required').uuid('Invalid role ID'),
  }),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(UserStatus),
  }),
});

export const userQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    search: z.string().optional().transform((val) => (val?.trim() === '' ? undefined : val)),
    roleId: z
      .string()
      .optional()
      .transform((val) => (val?.trim() === '' ? undefined : val))
      .refine((val) => val === undefined || z.string().uuid().safeParse(val).success, {
        message: 'Invalid role ID format',
      }),
    status: z
      .string()
      .optional()
      .transform((val) => (val?.trim() === '' ? undefined : val))
      .refine((val) => val === undefined || Object.values(UserStatus).includes(val as any), {
        message: 'Invalid status',
      })
      .transform((val) => (val ? (val as UserStatus) : undefined)),
  }),
});