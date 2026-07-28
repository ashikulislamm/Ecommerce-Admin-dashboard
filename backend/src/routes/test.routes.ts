import { Router, type Request, type Response } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/permission.middleware.js';
import { ApiResponse } from '../shared/responses/api-response.js';

const router = Router();

/**
 * Protected test route — verifies authentication pipeline
 * GET /api/v1/test/protected
 */
router.get('/protected', authenticate, (req: Request, res: Response) => {
  ApiResponse.success(res, 200, 'Access granted to protected route', {
    user: req.user,
  });
});

/**
 * Authorized test route — verifies authentication + authorization pipeline
 * GET /api/v1/test/product-access
 */
router.get(
  '/product-access',
  authenticate,
  authorize('products.read'),
  (req: Request, res: Response) => {
    ApiResponse.success(res, 200, 'Access granted to product reading feature', {
      user: req.user,
      permission: 'products.read',
    });
  },
);

export default router;
