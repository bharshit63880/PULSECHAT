import type { Request, Response } from 'express';

import { successResponse } from '@chat-app/shared';

import { chatsService } from './chats.service';

export const chatsController = {
  async list(request: Request, response: Response) {
    const chats = await chatsService.listChats(request.user!.id);
    response.json(successResponse(chats));
  },

  async createOrAccessDirect(request: Request, response: Response) {
    const chat = await chatsService.getOrCreateDirectChat(request.user!.id, request.body.userId);
    response.status(201).json(successResponse(chat));
  },

  async updateDisappearingMode(request: Request, response: Response) {
    const { chatId } = request.params as { chatId: string };
    const { seconds } = request.body as { seconds: number };
    const chat = await chatsService.updateDisappearingMode(chatId, request.user!.id, seconds);
    response.json(successResponse(chat, 'Disappearing mode updated'));
  }
};
