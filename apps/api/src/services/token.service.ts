import jwt from 'jsonwebtoken';
import type { SignOptions, Secret } from 'jsonwebtoken';

import { env } from '../config/env';
import { AppError } from '../errors/AppError';

type AccessTokenPayload = {
  userId: string;
  sessionId: string;
  deviceId: string;
};

export type RefreshTokenPayload = {
  userId: string;
  sessionId: string;
  deviceId: string;
  iat: number;
  exp: number;
};

const accessTokenSecret: Secret = env.JWT_SECRET;
const refreshTokenSecret: Secret = env.REFRESH_TOKEN_SECRET;

export const signAccessToken = (payload: AccessTokenPayload) =>
  jwt.sign(payload, accessTokenSecret, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn']
  });

export const signRefreshToken = (payload: AccessTokenPayload) =>
  jwt.sign(payload, refreshTokenSecret, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn']
  });

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, accessTokenSecret) as AccessTokenPayload;
  } catch {
    throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, refreshTokenSecret) as RefreshTokenPayload;
  } catch {
    throw new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
  }
};
