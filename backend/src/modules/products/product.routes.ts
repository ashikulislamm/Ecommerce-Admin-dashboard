import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/permission.middleware.js';
import { validateBody } from '../../middlewares/validation.middleware.js';
import {
  createSimpleProductSchema,
  createVariableProductSchema,
  updateProductSchema,
  generateVariantsSchema,
} from './product.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('products:read'), ProductController.getProducts);
router.post(
  '/simple',
  authorize('products:create'),
  validateBody(createSimpleProductSchema),
  ProductController.createSimple,
);
router.post(
  '/variable',
  authorize('products:create'),
  validateBody(createVariableProductSchema),
  ProductController.createVariable,
);
router.post(
  '/generate-matrix',
  authorize('products:create'),
  validateBody(generateVariantsSchema),
  ProductController.generateMatrix,
);
router.get('/:id', authorize('products:read'), ProductController.getProductById);
router.put(
  '/:id',
  authorize('products:update'),
  validateBody(updateProductSchema),
  ProductController.updateProduct,
);
router.delete('/:id', authorize('products:delete'), ProductController.deleteProduct);

export default router;