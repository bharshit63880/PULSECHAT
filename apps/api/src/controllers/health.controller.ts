import type { Request, Response } from 'express';

import { successResponse } from '@chat-app/shared';

export const healthController = (_request: Request, response: Response) => {
  response.json(
    successResponse({
      status: 'ok',
      timestamp: new Date().toISOString()
    })
  );
};
