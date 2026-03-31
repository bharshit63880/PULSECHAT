import type { ApiSuccessResponse, ChatDto } from '@chat-app/shared';

import { api } from '@/lib/api';

export const chatsApi = {
  async list() {
    const response = await api.get<ApiSuccessResponse<ChatDto[]>>('/chats');
    return response.data.data;
  },

  async createDirect(userId: string) {
    const response = await api.post<ApiSuccessResponse<ChatDto>>('/chats/direct', { userId });
    return response.data.data;
  }
};
