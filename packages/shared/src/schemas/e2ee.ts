import { z } from 'zod';

import { deviceIdSchema, objectIdSchema } from './common';

export const keyBundleQuerySchema = z.object({
  userId: objectIdSchema
});

export const verifySafetyNumberSchema = z.object({
  chatId: objectIdSchema,
  peerDeviceId: deviceIdSchema,
  combinedFingerprint: z.string().trim().min(16).max(256)
});
