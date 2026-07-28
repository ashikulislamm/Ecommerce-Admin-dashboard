import { Router, Request, Response } from 'express';
import { databaseHealthCheck } from '../config/database.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const health = await databaseHealthCheck();

  if (health.connected) {
    res.status(200).json({
      success: true,
      message: 'Database connection is healthy',
      data: {
        status: 'healthy',
        timestamp: health.timestamp,
        latencyMs: health.latencyMs,
      },
    });
  } else {
    res.status(503).json({
      success: false,
      message: 'Database connection failed',
      error: health.error,
      data: {
        status: 'unhealthy',
        timestamp: health.timestamp,
      },
    });
  }
});

export default router;