import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  PORT: z.coerce.number().default(8080),

  // Database
  DATABASE_URL: z
    .string({ message: 'DATABASE_URL environment variable is required' })
    .min(1, 'DATABASE_URL cannot be empty'),
  DIRECT_URL: z.string().optional(),

  // CORS
  CORS_ORIGIN: z.string().optional().default('http://localhost:3000'),

  // JWT
  JWT_ACCESS_SECRET: z
    .string({ message: 'JWT_ACCESS_SECRET is required' })
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z
    .string({ message: 'JWT_REFRESH_SECRET is required' })
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Cookie
  COOKIE_SECRET: z
    .string({ message: 'COOKIE_SECRET is required' })
    .min(32, 'COOKIE_SECRET must be at least 32 characters'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  // Upload
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE: z.coerce.number().default(5 * 1024 * 1024), // 5MB
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('Environment configuration validation failed fast.');
  }

  return result.data;
};

export const env = parseEnv();
export default env;