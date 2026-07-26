import {
  createGroupChatSchema,
  manageGroupMembersSchema,
  objectIdSchema,
  renameGroupSchema
} from '@chat-app/shared';
import { z } from 'zod';

export const groupsValidation = {
  createGroup: createGroupChatSchema,
  renameGroup: renameGroupSchema,
  manageMembers: manageGroupMembersSchema,
  chatIdParam: z.object({
    chatId: objectIdSchema
  }),
  chatAndUserParam: z.object({
    chatId: objectIdSchema,
    userId: objectIdSchema
  })
};
