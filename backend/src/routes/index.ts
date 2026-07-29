import { Router } from 'express';
import healthRouter from './health.routes.js';
import { authRoutes } from '../modules/auth/index.js';
import { permissionRoutes } from '../modules/permissions/index.js';
import { roleRoutes } from '../modules/roles/index.js';
import { userRoutes } from '../modules/users/index.js';
import mediaRoutes from '../modules/media/media.routes.js';
import categoryRoutes from '../modules/categories/category.routes.js';
import brandRoutes from '../modules/brands/brand.routes.js';
import attributeRoutes from '../modules/attributes/attribute.routes.js';
import productRoutes from '../modules/products/product.routes.js';
import testRoutes from './test.routes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRoutes);
router.use('/permissions', permissionRoutes);
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);
router.use('/media', mediaRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/attributes', attributeRoutes);
router.use('/products', productRoutes);
router.use('/test', testRoutes);

export default router;