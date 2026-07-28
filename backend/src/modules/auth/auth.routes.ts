import { Router } from 'express';
import AuthController from './auth.controller.js';
import { loginSchema } from './auth.schema.js';
import { validateBody } from '../../middlewares/validation.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';

const router = Router();

/**
 * Public auth routes
 */
router.post('/login', validateBody(loginSchema), asyncHandler(AuthController.login));
router.post('/refresh', asyncHandler(AuthController.refresh));
router.post('/logout', asyncHandler(AuthController.logout));

/**
 * Protected auth routes (requires valid access token)
 */
router.get('/session', authenticate, asyncHandler(AuthController.getSession));

export default router;