import { env } from '../../config/env.js';

interface Config {
  port: number;
  nodeEnv: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;

  // Database
  databaseUrl: string;
  directUrl?: string;

  // CORS
  corsOrigin: string;

  // JWT
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;

  // Cookie
  cookieSecret: string;

  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMax: number;

  // Upload
  uploadDir: string;
  maxFileSize: number;
}

const config: Config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',

  databaseUrl: env.DATABASE_URL,
  directUrl: env.DIRECT_URL,

  corsOrigin: env.CORS_ORIGIN,

  jwtAccessSecret: env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
  jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,

  cookieSecret: env.COOKIE_SECRET,

  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: env.RATE_LIMIT_MAX,

  uploadDir: env.UPLOAD_DIR,
  maxFileSize: env.MAX_FILE_SIZE,
};

export default config;
