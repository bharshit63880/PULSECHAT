import type { Request, Response } from 'express';

import { successResponse } from '@chat-app/shared';

import { usersService } from './users.service';

export const usersController = {
  async list(request: Request, response: Response) {
    const search = typeof request.query.search === 'string' ? request.query.search : undefined;
    const users = await usersService.listUsers(search, request.user!.id);
    response.json(successResponse(users));
  },

  async updateMe(request: Request, response: Response) {
    const user = await usersService.updateProfile(request.user!.id, request.body);
    response.json(successResponse(user, 'Profile updated successfully'));
  }
};
