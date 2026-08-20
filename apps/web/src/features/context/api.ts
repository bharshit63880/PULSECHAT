import type {
  ConversationDecisionDto,
  ConversationTaskDto,
  EncryptedContextPayload,
} from '@chat-app/shared';

import { api } from '@/lib/axios';

type ContextResponse = { tasks: ConversationTaskDto[]; decisions: ConversationDecisionDto[] };

export const contextApi = {
  async list(chatId: string) {
    const response = await api.get<{ data: ContextResponse }>(`/chats/${chatId}/context`);
    return response.data.data;
  },
  async createTask(
    chatId: string,
    payload: { content: string; assigneeId?: string; dueAt?: string },
  ) {
    const response = await api.post<{ data: ConversationTaskDto }>(
      `/chats/${chatId}/context`,
      payload,
    );
    return response.data.data;
  },
  async updateTask(
    chatId: string,
    taskId: string,
    payload: { status?: 'open' | 'completed'; assigneeId?: string | null; dueAt?: string | null },
  ) {
    const response = await api.patch<{ data: ConversationTaskDto }>(
      `/chats/${chatId}/context/tasks/${taskId}`,
      payload,
    );
    return response.data.data;
  },
  async createEncryptedTask(chatId: string, encryptedContent: EncryptedContextPayload) {
    const response = await api.post<{ data: ConversationTaskDto }>(`/chats/${chatId}/context`, {
      encryptedContent,
    });
    return response.data.data;
  },
  async createDecision(
    chatId: string,
    payload: { content: string; status?: 'proposed' | 'final' },
  ) {
    const response = await api.post<{ data: ConversationDecisionDto }>(
      `/chats/${chatId}/context/decisions`,
      payload,
    );
    return response.data.data;
  },
  async updateDecision(chatId: string, decisionId: string, status: 'proposed' | 'final') {
    const response = await api.patch<{ data: ConversationDecisionDto }>(
      `/chats/${chatId}/context/decisions/${decisionId}`,
      { status },
    );
    return response.data.data;
  },
};
