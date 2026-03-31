import type { Request, Response } from 'express';

import { successResponse } from '@chat-app/shared';

import { devicesService } from './devices.service';

export const devicesController = {
  async list(request: Request, response: Response) {
    const devices = await devicesService.listUserDevices(request.user!.id, request.user!.sessionId);
    response.json(successResponse(devices));
  },

  async revoke(request: Request, response: Response) {
    const { deviceId } = request.params as { deviceId: string };
    const device = await devicesService.revokeDevice(request.user!.id, deviceId, request.user!.sessionId);
    response.json(successResponse(device, 'Device revoked successfully'));
  }
};
