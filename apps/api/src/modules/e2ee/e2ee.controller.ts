import type { Request, Response } from 'express';

import { successResponse } from '@chat-app/shared';

import { devicesService } from '../devices/devices.service';

export const e2eeController = {
  async getKeyBundle(request: Request, response: Response) {
    const { userId } = request.params as { userId: string };
    const bundle = await devicesService.getPublishedKeyBundle(request.user!.id, userId);
    response.json(successResponse(bundle));
  }
};
