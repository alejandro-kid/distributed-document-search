import pino from 'pino';
import pinoHttp from 'pino-http';
import { NODE_ENV } from './config';

// Extend ServerResponse to include responseTime
declare module 'http' {
  interface ServerResponse {
    responseTime?: number;
  }
}

const isProduction = NODE_ENV === 'production';

const baseLogger = pino({
  level: isProduction ? 'info' : 'debug',
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }),
  base: null,
});

export const logger = baseLogger;

export const httpLogger = pinoHttp({
  logger: baseLogger,
  customLogLevel: (req, res, err) => {
    const staticFileExtensions = ['.js', '.css', '.map', '.ico', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.ttf'];

    // Skip logging for static files
    if (staticFileExtensions.some((ext) => req.url?.endsWith(ext))) {
      return 'silent';
    }

    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req) => {
    return `${req.method} ${req.url}`;
  },
  customErrorMessage: (req, _, err) => {
    return `${req.method} ${req.url} - Error: ${err.message}`;
  },
  serializers: {
    req: () => undefined, // Omit request object details
    res: () => undefined, // Omit response object details
    responseTime: () => undefined, // Omit response time
    err: pino.stdSerializers.err, // Keep error serialization for debugging
  },
});
