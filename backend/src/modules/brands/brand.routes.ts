import { Router } from 'express';
import BrandController from './brand.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/permission.middleware.js';
import { createBrandSchema, updateBrandSchema, brandQuerySchema } from './brand.schema.js';

const router = Router();

// All brand endpoints require authentication
router.use(authenticate);

router.get(
  '/',
  authorize('brands:read'),
  validate(brandQuerySchema),
  BrandController.list,
);

router.post(
  '/',
  authorize('brands:create'),
  validate(createBrandSchema),
  BrandController.create,
);

router.get(
  '/:id',
  authorize('brands:read'),
  BrandController.getById,
);

router.patch(
  '/:id',
  authorize('brands:update'),
  validate(updateBrandSchema),
  BrandController.update,
);

router.delete(
  '/:id',
  authorize('brands:delete'),
  BrandController.delete,
);

export default router;