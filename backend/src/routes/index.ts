import { Router } from 'express';
import healthRouter from './health.routes.js';
import { authRoutes } from '../modules/auth/index.js';
import { permissionRoutes } from '../modules/permissions/index.js';
import { roleRoutes } from '../modules/roles/index.js';
import { userRoutes } from '../modules/users/index.js';
import testRoutes from './test.routes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRoutes);
router.use('/permissions', permissionRoutes);
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);
router.use('/test', testRoutes);

export default router;