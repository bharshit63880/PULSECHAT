import type { NextFunction, Request, Response } from 'express';

import { ERROR_CODES } from '../constants/http';
import { AppError } from '../errors/AppError';

export const verifiedEmailMiddleware = (
  request: Request,
  _response: Response,
  next: NextFunction
) => {
  if (!request.user?.isEmailVerified) {
    next(
      new AppError(
        'Verify your email before accessing secure messaging features',
        403,
        ERROR_CODES.FORBIDDEN,
        { reason: 'EMAIL_NOT_VERIFIED' }
      )
    );
    return;
  }

  next();
};
