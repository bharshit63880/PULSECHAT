import type { NextFunction, Request, Response } from 'express';

import { ERROR_CODES } from '../constants/http';
import { AppError } from '../errors/AppError';
import { UserModel } from '../models/User';
import { verifyAccessToken } from '../services/token.service';

export const authMiddleware = async (request: Request, _response: Response, next: NextFunction) => {
  try {
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ') ? authorization.split(' ')[1] : undefined;

    if (!token) {
      next(new AppError('Authentication token is required', 401, ERROR_CODES.UNAUTHORIZED));
      return;
    }

    const payload = verifyAccessToken(token);
    const user = await UserModel.findById(payload.userId);

    if (!user) {
      next(new AppError('User not found for this token', 401, ERROR_CODES.UNAUTHORIZED));
      return;
    }

    request.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      sessionId: payload.sessionId,
      deviceId: payload.deviceId,
      isEmailVerified: Boolean(user.isEmailVerified)
    };

    next();
  } catch (error) {
    next(error);
  }
};
