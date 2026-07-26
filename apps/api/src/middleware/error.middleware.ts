import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { errorResponse } from '@chat-app/shared';

import { ERROR_CODES } from '../constants/http';
import { AppError } from '../errors/AppError';
import { logger } from '../services/logger.service';

export const errorMiddleware = (
  error: unknown,
  _request: Request,
  response: Response,
  next: NextFunction
) => {
  void next;

  if (error instanceof ZodError) {
    response
      .status(400)
      .json(errorResponse(ERROR_CODES.VALIDATION_ERROR, 'Request validation failed', error.flatten()));
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json(errorResponse(error.code, error.message, error.details));
    return;
  }

  logger.error({ error }, 'Unhandled server error');

  response
    .status(500)
    .json(errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Something went wrong on the server'));
};
