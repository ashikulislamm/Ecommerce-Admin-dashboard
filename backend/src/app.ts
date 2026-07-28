import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import healthRouter from './routes/health.routes.js';
import { httpLogger } from './config/logger.js';
import config from './app/config/index.js';
import {
  requestId,
  globalRateLimiter,
  notFound,
  errorHandler,
} from './middlewares/index.js';
import { JSON_BODY_LIMIT } from './shared/constants/app.constants.js';
import { ApiResponse } from './shared/responses/api-response.js';

const app = express();

// ============================================================
// MIDDLEWARE ORDER — intentional and security-conscious
// ============================================================

// 1. Request ID — must be first so all subsequent logs include the ID
app.use(requestId);

// 2. HTTP request logger — binds request ID from step 1
app.use(httpLogger);

// 3. Helmet — security headers (Content-Security-Policy, HSTS, etc.)
app.use(helmet());

// 4. CORS — environment-driven origin, credentials support for HttpOnly cookies
app.use(
  cors({
    origin: config.corsOrigin === '*' ? '*' : config.corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,         // Required for HttpOnly cookie exchange
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
  }),
);

// 5. JSON body parser — limited to 10mb to prevent large payload abuse
app.use(express.json({ limit: JSON_BODY_LIMIT }));

// 6. URL-encoded body parser
app.use(express.urlencoded({ extended: true, limit: JSON_BODY_LIMIT }));

// 7. Cookie parser — required for HttpOnly refresh token reading
app.use(cookieParser(config.cookieSecret));

// 8. Global rate limiter — applied before routes to protect all endpoints
app.use('/api/v1', globalRateLimiter);

// ============================================================
// ROUTES
// ============================================================

// Health check (public — no auth, no rate limit)
app.use('/health', healthRouter);

// Root info endpoint
app.get('/', (_req: Request, res: Response) => {
  ApiResponse.success(res, 200, 'Ecommerce Admin Dashboard API is running', {
    version: '1.0.0',
    docs: '/api/v1',
  });
});

// All API routes
app.use('/api/v1', routes);

// ============================================================
// ERROR HANDLING — must be last
// ============================================================

// 9. 404 handler — catches unmatched routes
app.use(notFound);

// 10. Global error handler — catches all errors forwarded via next(err)
app.use(errorHandler);

export default app;
