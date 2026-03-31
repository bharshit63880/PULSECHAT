import type { CookieOptions } from 'express';

import { env } from './env';

export const REFRESH_TOKEN_COOKIE_NAME = 'pulse_refresh_token';

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.COOKIE_SECURE,
  domain: env.COOKIE_DOMAIN || undefined,
  path: '/api/v1/auth',
  maxAge: 1000 * 60 * 60 * 24 * 30
};
