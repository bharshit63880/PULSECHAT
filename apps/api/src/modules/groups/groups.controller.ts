import type { Request, Response } from 'express';

import { successResponse } from '@chat-app/shared';

import { groupsService } from './groups.service';

export const groupsController = {
  async create(request: Request, response: Response) {
    const { name, participantIds } = request.body as { name: string; participantIds: string[] };
    const group = await groupsService.createGroup(
      request.user!.id,
      name,
      participantIds
    );

    response.status(201).json(successResponse(group, 'Group created successfully'));
  },

  async rename(request: Request, response: Response) {
    const { chatId } = request.params as { chatId: string };
    const { name } = request.body as { name: string };
    const group = await groupsService.renameGroup(request.user!.id, chatId, name);

    response.json(successResponse(group, 'Group updated successfully'));
  },

  async addMember(request: Request, response: Response) {
    const { chatId } = request.params as { chatId: string };
    const { userId } = request.body as { userId: string };
    const group = await groupsService.addMember(request.user!.id, chatId, userId);

    response.json(successResponse(group, 'Member added successfully'));
  },

  async removeMember(request: Request, response: Response) {
    const { chatId, userId } = request.params as { chatId: string; userId: string };
    const group = await groupsService.removeMember(request.user!.id, chatId, userId);

    response.json(successResponse(group, 'Member removed successfully'));
  }
};
