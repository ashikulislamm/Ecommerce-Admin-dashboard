import { Router } from 'express';
import AttributeController from './attribute.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/permission.middleware.js';
import {
  createAttributeSchema,
  updateAttributeSchema,
  attributeQuerySchema,
  createAttributeValueSchema,
  updateAttributeValueSchema,
} from './attribute.schema.js';

const router = Router();

// All attribute endpoints require authentication
router.use(authenticate);

router.get(
  '/',
  authorize('attributes:read'),
  validate(attributeQuerySchema),
  AttributeController.list,
);

router.post(
  '/',
  authorize('attributes:create'),
  validate(createAttributeSchema),
  AttributeController.create,
);

router.get(
  '/:id',
  authorize('attributes:read'),
  AttributeController.getById,
);

router.patch(
  '/:id',
  authorize('attributes:update'),
  validate(updateAttributeSchema),
  AttributeController.update,
);

router.delete(
  '/:id',
  authorize('attributes:delete'),
  AttributeController.delete,
);

// --- Attribute Values ---

router.post(
  '/:id/values',
  authorize('attributes:update'),
  validate(createAttributeValueSchema),
  AttributeController.createValue,
);

router.patch(
  '/:id/values/:valueId',
  authorize('attributes:update'),
  validate(updateAttributeValueSchema),
  AttributeController.updateValue,
);

router.delete(
  '/:id/values/:valueId',
  authorize('attributes:update'),
  AttributeController.deleteValue,
);

export default router;