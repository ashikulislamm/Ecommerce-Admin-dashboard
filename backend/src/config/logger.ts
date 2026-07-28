import pinoHttp from 'pino-http';
import logger from '../lib/logger.js';

// HTTP request/response logger using pino-http
// Binds request ID to every log line automatically
export const httpLogger = pinoHttp({
  logger,

  // Use the request ID already attached by requestId middleware
  genReqId: (req) => req.id as string,

  // Customize what is logged per request
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },

  customSuccessMessage: (req, res) =>
    `${req.method} ${req.url} ${res.statusCode}`,

  customErrorMessage: (req, res) =>
    `${req.method} ${req.url} ${res.statusCode}`,

  // Serialize request — exclude sensitive headers
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      remoteAddress: req.remoteAddress,
      userAgent: req.headers?.['user-agent'],
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});

export default httpLogger;