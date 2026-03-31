import type { ChatDto } from '@chat-app/shared';

import { api } from '@/lib/axios';

export const chatsApi = {
  async list() {
    const response = await api.get<{ data: ChatDto[] }>('/chats');
    return response.data.data;
  },

  async createDirect(userId: string) {
    const response = await api.post<{ data: ChatDto }>('/chats/direct', { userId });
    return response.data.data;
  },

  async updateDisappearingMode(chatId: string, seconds: number) {
    const response = await api.patch<{ data: ChatDto }>(`/chats/${chatId}/disappearing-mode`, {
      seconds
    });
    return response.data.data;
  }
};
