import { z } from 'zod';
import { deviceIdSchema, fingerprintSchema, publicKeySchema } from './common';

export const deviceRegistrationSchema = z.object({
  deviceId: deviceIdSchema,
  label: z.string().trim().min(2).max(60),
  platform: z.string().trim().min(2).max(40).optional().nullable(),
  userAgent: z.string().trim().min(2).max(255).optional().nullable(),
  appVersion: z.string().trim().min(1).max(20).optional().nullable(),
  publicIdentityKey: publicKeySchema,
  publicAgreementKey: publicKeySchema,
  fingerprint: fingerprintSchema
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(50),
  username: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  device: deviceRegistrationSchema
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  device: deviceRegistrationSchema
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(24).max(512)
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().email().optional()
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  email: z.string().trim().email().optional(),
  bio: z.string().trim().max(160).optional(),
  avatarUrl: z.string().url().optional(),
});
