import rateLimit from 'express-rate-limit';

import { env } from '../config/env';
import { errorResponse } from '@chat-app/shared';

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_request, response) => {
    response
      .status(429)
      .json(errorResponse('RATE_LIMITED', 'Too many requests. Please try again shortly.'));
  }
});

export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_request, response) => {
    response
      .status(429)
      .json(errorResponse('AUTH_RATE_LIMITED', 'Too many auth attempts. Please try again later.'));
  }
});
