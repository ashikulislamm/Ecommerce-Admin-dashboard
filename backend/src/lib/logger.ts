import pino from 'pino';
import { env } from '../config/env.js';

const isDevelopment = env.NODE_ENV === 'development';

const logger = pino({
  level: isDevelopment ? 'debug' : 'info',

  // Pretty-print in development for readability
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,

  // Redact sensitive fields from logs
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.passwordHash',
      'req.body.token',
      'req.body.refreshToken',
      'res.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },
});

export default logger;