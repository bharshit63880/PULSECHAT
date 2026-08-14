import { z } from 'zod';

import { objectIdSchema } from './common';

export const encryptedContextPayloadSchema = z.object({
  ciphertext: z.string().trim().min(1).max(32_000),
  iv: z.string().trim().min(1).max(1_024),
  digest: z.string().trim().min(1).max(1_024),
});

export const createTaskSchema = z
  .object({
    content: z.string().trim().min(1).max(500).optional(),
    encryptedContent: encryptedContextPayloadSchema.optional(),
    assigneeId: objectIdSchema.optional(),
    dueAt: z.string().datetime().optional(),
  })
  .refine((value) => Boolean(value.content) !== Boolean(value.encryptedContent), {
    message: 'Provide either plaintext group content or encrypted direct-chat content',
  });

export const updateTaskSchema = z
  .object({
    status: z.enum(['open', 'completed']).optional(),
    assigneeId: objectIdSchema.nullable().optional(),
    dueAt: z.string().datetime().nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one task update',
  });

export const createDecisionSchema = z
  .object({
    content: z.string().trim().min(1).max(1_000).optional(),
    encryptedContent: encryptedContextPayloadSchema.optional(),
    status: z.enum(['proposed', 'final']).default('proposed'),
  })
  .refine((value) => Boolean(value.content) !== Boolean(value.encryptedContent), {
    message: 'Provide either plaintext group content or encrypted direct-chat content',
  });

export const updateDecisionSchema = z.object({
  status: z.enum(['proposed', 'final']),
});
