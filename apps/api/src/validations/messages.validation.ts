import {
  objectIdSchema,
  paginationQuerySchema,
  searchQuerySchema,
  sendMessageSchema
} from '@chat-app/shared';
import { z } from 'zod';

export const messagesValidation = {
  sendMessage: sendMessageSchema,
  paginationQuery: paginationQuerySchema,
  searchQuery: searchQuerySchema,
  reactToMessageBody: z.object({
    emoji: z.string().trim().min(1).max(8)
  }),
  chatIdParam: z.object({
    chatId: objectIdSchema
  }),
  messageIdParam: z.object({
    messageId: objectIdSchema
  })
};
