import pino from 'pino';

import { env } from '../config/env';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers.set-cookie',
      'request.headers.authorization',
      'request.headers.cookie',
      'response.headers.set-cookie'
    ],
    censor: '[Redacted]'
  }
});
