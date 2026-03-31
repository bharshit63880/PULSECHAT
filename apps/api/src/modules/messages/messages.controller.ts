import type { Request, Response } from 'express';

import { successResponse } from '@chat-app/shared';

import { messagesService } from './messages.service';

export const messagesController = {
  async list(request: Request, response: Response) {
    const { chatId } = request.params as { chatId: string };
    const page = Number(request.query.page ?? 1);
    const limit = Number(request.query.limit ?? 20);
    const result = await messagesService.listMessages(request.user!.id, chatId, page, limit);
    response.json(successResponse(result.messages, undefined, result.meta));
  },

  async send(request: Request, response: Response) {
    const message = await messagesService.sendMessage(request.user!.id, request.body, request.io);
    response.status(201).json(successResponse(message, 'Message sent successfully'));
  },

  async markSeen(request: Request, response: Response) {
    const { chatId } = request.params as { chatId: string };
    const messageIds = await messagesService.markMessagesSeen(
      request.user!.id,
      chatId,
      request.io
    );

    response.json(successResponse({ chatId, messageIds }));
  },

  async react(request: Request, response: Response) {
    const { messageId } = request.params as { messageId: string };
    const { emoji } = request.body as { emoji: string };
    const message = await messagesService.reactToMessage(request.user!.id, messageId, emoji, request.io);
    response.json(successResponse(message, 'Reaction updated'));
  }
};
