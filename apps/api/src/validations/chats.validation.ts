import { createDirectChatSchema, objectIdSchema, updateDisappearingModeSchema } from '@chat-app/shared';
import { z } from 'zod';

export const chatsValidation = {
  createDirect: createDirectChatSchema,
  chatIdParam: z.object({
    chatId: objectIdSchema
  }),
  updateDisappearingMode: updateDisappearingModeSchema
};
