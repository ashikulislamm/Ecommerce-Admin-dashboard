import { Router } from 'express';
import healthRouter from './health.routes.js';
import { authRoutes } from '../modules/auth/index.js';
import testRoutes from './test.routes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRoutes);
router.use('/test', testRoutes);

export default router;