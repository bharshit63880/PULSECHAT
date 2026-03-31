import type { ChatDto } from '@chat-app/shared';

import { api } from '@/lib/axios';

export const groupsApi = {
  async create(payload: { name: string; participantIds: string[] }) {
    const response = await api.post<{ data: ChatDto }>('/groups', payload);
    return response.data.data;
  },

  async rename(chatId: string, name: string) {
    const response = await api.patch<{ data: ChatDto }>(`/groups/${chatId}`, { name });
    return response.data.data;
  },

  async addMember(chatId: string, userId: string) {
    const response = await api.post<{ data: ChatDto }>(`/groups/${chatId}/members`, { userId });
    return response.data.data;
  },

  async removeMember(chatId: string, userId: string) {
    const response = await api.delete<{ data: ChatDto }>(`/groups/${chatId}/members/${userId}`);
    return response.data.data;
  }
};
