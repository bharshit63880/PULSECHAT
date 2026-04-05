import type { AttachmentDto, MessageDto, MessageSearchResultDto, PaginationMeta } from '@chat-app/shared';

import { api } from '@/lib/axios';

type MessageListResponse = {
  data: MessageDto[];
  meta: PaginationMeta;
};

export const messagesApi = {
  async list(chatId: string, page = 1, limit = 30) {
    const response = await api.get<{ data: MessageDto[]; meta: PaginationMeta }>(`/messages/${chatId}`, {
      params: { page, limit }
    });

    return {
      data: response.data.data,
      meta: response.data.meta
    } satisfies MessageListResponse;
  },

  async search(chatId: string, query: string, limit = 12) {
    const response = await api.get<{ data: MessageSearchResultDto[] }>(`/messages/${chatId}/search`, {
      params: { query, limit }
    });

    return response.data.data;
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
    const response = await api.post<{ data: MessageDto }>('/messages', payload);
    return response.data.data;
  },

  async markSeen(chatId: string) {
    await api.post(`/messages/${chatId}/seen`);
  },

  async react(messageId: string, emoji: string) {
    const response = await api.post<{ data: MessageDto }>(`/messages/${messageId}/reactions`, {
      emoji
    });
    return response.data.data;
  }
};
