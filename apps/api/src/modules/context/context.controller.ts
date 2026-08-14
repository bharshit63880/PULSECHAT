import type { Request, Response } from 'express';

import { successResponse } from '@chat-app/shared';

import { contextService } from './context.service';

export const contextController = {
  async list(request: Request, response: Response) {
    const { chatId } = request.params as { chatId: string };
    response.json(successResponse(await contextService.list(request.user!.id, chatId)));
  },
  async createTask(request: Request, response: Response) {
    const { chatId } = request.params as { chatId: string };
    response
      .status(201)
      .json(
        successResponse(await contextService.createTask(request.user!.id, chatId, request.body)),
      );
  },
  async updateTask(request: Request, response: Response) {
    const { chatId, taskId } = request.params as { chatId: string; taskId: string };
    response.json(
      successResponse(
        await contextService.updateTask(request.user!.id, chatId, taskId, request.body),
      ),
    );
  },
  async createDecision(request: Request, response: Response) {
    const { chatId } = request.params as { chatId: string };
    response
      .status(201)
      .json(
        successResponse(
          await contextService.createDecision(request.user!.id, chatId, request.body),
        ),
      );
  },
  async updateDecision(request: Request, response: Response) {
    const { chatId, decisionId } = request.params as { chatId: string; decisionId: string };
    response.json(
      successResponse(
        await contextService.updateDecision(
          request.user!.id,
          chatId,
          decisionId,
          request.body.status,
        ),
      ),
    );
  },
};
