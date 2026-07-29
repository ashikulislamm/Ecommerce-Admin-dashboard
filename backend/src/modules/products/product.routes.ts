import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/permission.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize('products:read'), ProductController.getProducts);
router.post('/simple', authorize('products:create'), ProductController.createSimple);
router.post('/variable', authorize('products:create'), ProductController.createVariable);
router.post('/generate-matrix', authorize('products:create'), ProductController.generateMatrix);
router.get('/:id', authorize('products:read'), ProductController.getProductById);
router.put('/:id', authorize('products:update'), ProductController.updateProduct);
router.delete('/:id', authorize('products:delete'), ProductController.deleteProduct);

export default router;