import { env } from '../../config/env.js';

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  directUrl?: string;
  corsOrigin: string;
}

const config: Config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  databaseUrl: env.DATABASE_URL,
  directUrl: env.DIRECT_URL,
  corsOrigin: env.CORS_ORIGIN,
};

export default config;
