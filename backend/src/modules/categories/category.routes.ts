import { Router } from 'express';
import CategoryController from './category.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/permission.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
} from './category.schema.js';

const router = Router();

// All category endpoints require authentication
router.use(authenticate);

// Tree endpoint
router.get(
  '/tree',
  authorize('categories:read'),
  CategoryController.tree,
);

// CRUD endpoints
router.get(
  '/',
  authorize('categories:read'),
  validate(categoryQuerySchema),
  CategoryController.list,
);

router.post(
  '/',
  authorize('categories:create'),
  validate(createCategorySchema),
  CategoryController.create,
);

router.get(
  '/:id',
  authorize('categories:read'),
  CategoryController.getById,
);

router.patch(
  '/:id',
  authorize('categories:update'),
  validate(updateCategorySchema),
  CategoryController.update,
);

router.delete(
  '/:id',
  authorize('categories:delete'),
  CategoryController.delete,
);

export default router;