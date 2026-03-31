import type { Request, Response } from 'express';

import { errorResponse } from '@chat-app/shared';

import { ERROR_CODES } from '../constants/http';

export const notFoundMiddleware = (request: Request, response: Response) => {
  response
    .status(404)
    .json(
      errorResponse(
        ERROR_CODES.NOT_FOUND,
        `Route ${request.method} ${request.originalUrl} was not found`
      )
    );
};
