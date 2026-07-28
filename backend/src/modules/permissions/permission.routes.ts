import { Router } from 'express';
import PermissionController from './permission.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/permission.middleware.js';
import {
  createPermissionSchema,
  updatePermissionSchema,
  createPermissionGroupSchema,
  permissionQuerySchema,
} from './permission.schema.js';

const router = Router();

// All permission routes require authentication
router.use(authenticate);

// Permission Groups endpoints
router.get(
  '/groups',
  authorize('permissions:read'),
  PermissionController.listGroups,
);

router.post(
  '/groups',
  authorize('permissions:create'),
  validate(createPermissionGroupSchema),
  PermissionController.createGroup,
);

// Permission CRUD endpoints
router.get(
  '/',
  authorize('permissions:read'),
  validate(permissionQuerySchema),
  PermissionController.list,
);

router.post(
  '/',
  authorize('permissions:create'),
  validate(createPermissionSchema),
  PermissionController.create,
);

router.get(
  '/:id',
  authorize('permissions:read'),
  PermissionController.getById,
);

router.patch(
  '/:id',
  authorize('permissions:update'),
  validate(updatePermissionSchema),
  PermissionController.update,
);

router.delete(
  '/:id',
  authorize('permissions:delete'),
  PermissionController.delete,
);

export default router;