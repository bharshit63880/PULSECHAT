import { z } from 'zod';

import { disappearingModeSchema, objectIdSchema } from './common';

export const createDirectChatSchema = z.object({
  userId: objectIdSchema,
});

export const createGroupChatSchema = z.object({
  name: z.string().trim().min(2).max(60),
  participantIds: z.array(objectIdSchema).min(2).max(50),
});

export const renameGroupSchema = z.object({
  name: z.string().trim().min(2).max(60),
});

export const manageGroupMembersSchema = z.object({
  userId: objectIdSchema,
});

export const updateDisappearingModeSchema = disappearingModeSchema;
