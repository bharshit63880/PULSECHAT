import { z } from 'zod';
import { DISAPPEARING_MESSAGE_OPTIONS } from '../constants';

export const objectIdSchema = z.string().min(24).max(24);
export const deviceIdSchema = z.string().trim().min(8).max(100);
export const publicKeySchema = z
  .string()
  .trim()
  .min(40)
  .max(5000)
  .regex(/^[A-Za-z0-9+/=]+$/, 'Public keys must be base64-encoded');
export const fingerprintSchema = z.string().trim().min(16).max(128);

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const searchQuerySchema = z.object({
  query: z.string().trim().min(1).max(120),
  limit: z.coerce.number().int().min(1).max(20).default(12)
});

export const disappearingModeSchema = z.object({
  seconds: z.union(DISAPPEARING_MESSAGE_OPTIONS.map((option) => z.literal(option)) as [
    z.ZodLiteral<0>,
    z.ZodLiteral<300>,
    z.ZodLiteral<3600>,
    z.ZodLiteral<86400>,
    z.ZodLiteral<604800>
  ])
});
