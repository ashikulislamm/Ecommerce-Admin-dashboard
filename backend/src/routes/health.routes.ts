import { Router, type Request, type Response } from 'express';
import { databaseHealthCheck } from '../config/database.js';
import { ApiResponse } from '../shared/responses/api-response.js';
import { asyncHandler } from '../shared/utils/async-handler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const health = await databaseHealthCheck();

    if (health.connected) {
      ApiResponse.success(res, 200, 'Service is healthy', {
        status: 'healthy',
        database: 'connected',
        timestamp: health.timestamp,
        latencyMs: health.latencyMs,
      });
    } else {
      ApiResponse.error(
        res,
        503,
        'Database connection failed',
        'DATABASE_UNAVAILABLE',
        [{ message: health.error ?? 'Unknown database error' }],
      );
    }
  }),
);

export default router;