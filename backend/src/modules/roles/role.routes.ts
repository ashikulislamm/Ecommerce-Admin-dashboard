import { Router } from 'express';
import RoleController from './role.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/permission.middleware.js';
import {
  createRoleSchema,
  updateRoleSchema,
  rolePermissionAssignSchema,
  roleQuerySchema,
} from './role.schema.js';

const router = Router();

// All role endpoints require authentication
router.use(authenticate);

router.get(
  '/',
  authorize('roles:read'),
  validate(roleQuerySchema),
  RoleController.list,
);

router.post(
  '/',
  authorize('roles:create'),
  validate(createRoleSchema),
  RoleController.create,
);

router.get(
  '/:id',
  authorize('roles:read'),
  RoleController.getById,
);

router.patch(
  '/:id',
  authorize('roles:update'),
  validate(updateRoleSchema),
  RoleController.update,
);

router.delete(
  '/:id',
  authorize('roles:delete'),
  RoleController.delete,
);

router.post(
  '/:id/permissions',
  authorize('roles:update'),
  validate(rolePermissionAssignSchema),
  RoleController.assignPermission,
);

router.delete(
  '/:id/permissions/:permissionId',
  authorize('roles:update'),
  RoleController.revokePermission,
);

router.post(
  '/:id/permissions/grant-all',
  authorize('roles:update'),
  RoleController.grantAllPermissions,
);

export default router;