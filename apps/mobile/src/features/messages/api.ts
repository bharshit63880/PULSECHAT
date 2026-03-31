import type { ApiSuccessResponse, AttachmentDto, MessageDto, PaginationMeta } from '@chat-app/shared';

import { api } from '@/lib/api';

export const messagesApi = {
  async list(chatId: string, page = 1, limit = 30) {
    const response = await api.get<ApiSuccessResponse<MessageDto[]>>(`/messages/${chatId}`, {
      params: { page, limit }
    });

    return {
      data: response.data.data,
      meta: response.data.meta as PaginationMeta
    };
  },

  async send(payload: {
    chatId: string;
    clientMessageId?: string | null;
    senderDeviceId: string;
    recipientDeviceId: string;
    type: 'text' | 'image' | 'file' | 'gif' | 'sticker';
    ciphertext: string;
    encryptionVersion: string;
    iv: string;
    digest: string;
    attachment?: AttachmentDto | null;
    replyToId?: string | null;
  }) {
    const response = await api.post<ApiSuccessResponse<MessageDto>>('/messages', payload);
    return response.data.data;
  },

  async markSeen(chatId: string) {
    await api.post(`/messages/${chatId}/seen`);
  }
};
