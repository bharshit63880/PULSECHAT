import type { Request, Response } from 'express';

import { successResponse } from '@chat-app/shared';

import { uploadsService } from './uploads.service';

export const uploadsController = {
  async uploadAvatar(request: Request, response: Response) {
    const result = await uploadsService.uploadAvatar(request.file);
    response.status(201).json(successResponse(result, 'Avatar uploaded successfully'));
  },

  async uploadAttachment(request: Request, response: Response) {
    const result = await uploadsService.uploadAttachment(request.file);
    response.status(201).json(successResponse(result, 'Attachment uploaded successfully'));
  }
};
