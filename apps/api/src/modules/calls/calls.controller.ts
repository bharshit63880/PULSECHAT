import type { Request, Response } from 'express';

import { successResponse } from '@chat-app/shared';

import { callsService } from './calls.service';

export const callsController = {
  async list(request: Request, response: Response) {
    response.json(successResponse(await callsService.listForUser(request.user!.id)));
  },
};
