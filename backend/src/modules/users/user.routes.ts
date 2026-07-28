import { Router } from 'express';
import UserController from './user.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/permission.middleware.js';
import {
  createUserSchema,
  updateUserSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  userQuerySchema,
} from './user.schema.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get(
  '/',
  authorize('users:read'),
  validate(userQuerySchema),
  UserController.list,
);

router.post(
  '/',
  authorize('users:create'),
  validate(createUserSchema),
  UserController.create,
);

router.get(
  '/:id',
  authorize('users:read'),
  UserController.getById,
);

router.patch(
  '/:id',
  authorize('users:update'),
  validate(updateUserSchema),
  UserController.update,
);

router.patch(
  '/:id/role',
  authorize('users:update'),
  validate(updateUserRoleSchema),
  UserController.updateRole,
);

router.patch(
  '/:id/status',
  authorize('users:update'),
  validate(updateUserStatusSchema),
  UserController.updateStatus,
);

router.delete(
  '/:id',
  authorize('users:delete'),
  UserController.delete,
);

export default router;