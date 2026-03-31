import { z } from 'zod';

import { ENCRYPTION_VERSION, MESSAGE_TYPES } from '../constants';
import { deviceIdSchema, objectIdSchema } from './common';

export const attachmentSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional().nullable(),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  size: z.number().positive(),
  isEncrypted: z.boolean().default(true),
  encryption: z
    .object({
      algorithm: z.literal('AES-GCM'),
      wrappedFileKey: z.string().trim().min(16).max(4096),
      iv: z.string().trim().min(8).max(1024),
      digest: z.string().trim().min(16).max(256)
    })
    .nullable()
    .optional()
});

export const sendMessageSchema = z.object({
  chatId: objectIdSchema,
  senderDeviceId: deviceIdSchema,
  recipientDeviceId: deviceIdSchema,
  type: z.enum(MESSAGE_TYPES),
  ciphertext: z.string().trim().min(1).max(50000),
  encryptionVersion: z.string().trim().default(ENCRYPTION_VERSION),
  iv: z.string().trim().min(8).max(1024),
  digest: z.string().trim().min(16).max(256),
  attachment: attachmentSchema.optional().nullable(),
  replyToId: objectIdSchema.optional().nullable(),
  clientMessageId: z.string().trim().min(1).max(100).optional().nullable(),
}).superRefine((value, context) => {
  if (value.type === 'text' && !value.ciphertext?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['ciphertext'],
      message: 'Encrypted messages must include ciphertext'
    });
  }

  if ((value.type === 'image' || value.type === 'file' || value.type === 'gif' || value.type === 'sticker') && !value.attachment) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['attachment'],
      message: `${value.type} messages must include attachment metadata`
    });
  }
});

export const markMessagesSeenSchema = z.object({
  chatId: objectIdSchema,
});

export const reactToMessageSchema = z.object({
  messageId: objectIdSchema,
  emoji: z.string().trim().min(1).max(8)
});
