import type {
  ConversationDecisionDto,
  ConversationTaskDto,
  EncryptedContextPayload,
} from '@chat-app/shared';

import { ERROR_CODES } from '../../constants/http';
import { AppError } from '../../errors/AppError';
import { ConversationDecisionModel } from '../../models/ConversationDecision';
import { ConversationTaskModel } from '../../models/ConversationTask';
import { chatsService } from '../chats/chats.service';

type ProtectedContentInput = {
  content?: string;
  encryptedContent?: EncryptedContextPayload;
};

const mapTask = (task: any): ConversationTaskDto => ({
  id: task.id,
  chatId: task.chat.toString(),
  createdBy: task.createdBy.toString(),
  assigneeId: task.assignee?.toString() ?? null,
  status: task.status,
  dueAt: task.dueAt?.toISOString() ?? null,
  content: task.content ?? null,
  encryptedContent: task.encryptedContent ?? null,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
});

const mapDecision = (decision: any): ConversationDecisionDto => ({
  id: decision.id,
  chatId: decision.chat.toString(),
  createdBy: decision.createdBy.toString(),
  status: decision.status,
  content: decision.content ?? null,
  encryptedContent: decision.encryptedContent ?? null,
  createdAt: decision.createdAt.toISOString(),
  updatedAt: decision.updatedAt.toISOString(),
});

const resolveProtectedContent = (isGroupChat: boolean, input: ProtectedContentInput) => {
  if (isGroupChat && !input.content) {
    throw new AppError(
      'Server-assisted group context requires content',
      400,
      ERROR_CODES.BAD_REQUEST,
    );
  }

  if (!isGroupChat && !input.encryptedContent) {
    throw new AppError(
      'Direct-chat context requires encrypted content',
      400,
      ERROR_CODES.BAD_REQUEST,
    );
  }

  return isGroupChat
    ? { content: input.content, encryptedContent: null }
    : { content: null, encryptedContent: input.encryptedContent };
};

export const contextService = {
  async list(userId: string, chatId: string) {
    await chatsService.assertMember(chatId, userId);
    const [tasks, decisions] = await Promise.all([
      ConversationTaskModel.find({ chat: chatId }).sort({ status: 1, dueAt: 1, updatedAt: -1 }),
      ConversationDecisionModel.find({ chat: chatId }).sort({ status: 1, updatedAt: -1 }),
    ]);

    return { tasks: tasks.map(mapTask), decisions: decisions.map(mapDecision) };
  },

  async createTask(
    userId: string,
    chatId: string,
    input: ProtectedContentInput & { assigneeId?: string; dueAt?: string },
  ) {
    const chat = await chatsService.assertMember(chatId, userId);
    if (
      input.assigneeId &&
      !chat.participants.some((participant) => participant.toString() === input.assigneeId)
    ) {
      throw new AppError('Assignee must belong to this chat', 400, ERROR_CODES.BAD_REQUEST);
    }

    const protectedContent = resolveProtectedContent(chat.isGroupChat, input);
    const task = await ConversationTaskModel.create({
      chat: chatId,
      createdBy: userId,
      assignee: input.assigneeId ?? null,
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
      status: 'open',
      ...protectedContent,
    });
    return mapTask(task);
  },

  async updateTask(
    userId: string,
    chatId: string,
    taskId: string,
    input: { status?: 'open' | 'completed'; assigneeId?: string | null; dueAt?: string | null },
  ) {
    const chat = await chatsService.assertMember(chatId, userId);
    if (
      input.assigneeId &&
      !chat.participants.some((participant) => participant.toString() === input.assigneeId)
    ) {
      throw new AppError('Assignee must belong to this chat', 400, ERROR_CODES.BAD_REQUEST);
    }

    const task = await ConversationTaskModel.findOneAndUpdate(
      { _id: taskId, chat: chatId },
      {
        ...(input.status ? { status: input.status } : {}),
        ...(input.assigneeId !== undefined ? { assignee: input.assigneeId } : {}),
        ...(input.dueAt !== undefined ? { dueAt: input.dueAt ? new Date(input.dueAt) : null } : {}),
      },
      { new: true },
    );
    if (!task) throw new AppError('Task not found', 404, ERROR_CODES.NOT_FOUND);
    return mapTask(task);
  },

  async createDecision(
    userId: string,
    chatId: string,
    input: ProtectedContentInput & { status: 'proposed' | 'final' },
  ) {
    const chat = await chatsService.assertMember(chatId, userId);
    const protectedContent = resolveProtectedContent(chat.isGroupChat, input);
    const decision = await ConversationDecisionModel.create({
      chat: chatId,
      createdBy: userId,
      status: input.status,
      ...protectedContent,
    });
    return mapDecision(decision);
  },

  async updateDecision(
    userId: string,
    chatId: string,
    decisionId: string,
    status: 'proposed' | 'final',
  ) {
    await chatsService.assertMember(chatId, userId);
    const decision = await ConversationDecisionModel.findOneAndUpdate(
      { _id: decisionId, chat: chatId },
      { status },
      { new: true },
    );
    if (!decision) throw new AppError('Decision not found', 404, ERROR_CODES.NOT_FOUND);
    return mapDecision(decision);
  },
};
