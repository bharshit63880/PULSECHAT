import fs from 'node:fs';
import path from 'node:path';

import dotenv from 'dotenv';
import { z } from 'zod';

const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../../../../.env'),
  path.resolve(__dirname, '../../../.env')
];

const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));

if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const requiredTrimmedStringFromEnv = (minimum = 1, message?: string) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }, z.string().min(minimum, message));

const optionalTrimmedStringFromEnv = () =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }, z.string().min(1).optional());

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true;
    }

    if (['false', '0', 'no', 'off', ''].includes(normalized)) {
      return false;
    }
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: requiredTrimmedStringFromEnv(),
  REDIS_URL: optionalTrimmedStringFromEnv(),
  REDIS_KEY_PREFIX: requiredTrimmedStringFromEnv().default('pulse'),
  CHAT_LIST_CACHE_TTL_SEC: z.coerce.number().int().positive().default(45),
  PRESENCE_CACHE_TTL_SEC: z.coerce.number().int().positive().default(120),
  JWT_SECRET: requiredTrimmedStringFromEnv(32, 'JWT_SECRET should be at least 32 characters long'),
  JWT_EXPIRES_IN: requiredTrimmedStringFromEnv().default('7d'),
  REFRESH_TOKEN_SECRET: requiredTrimmedStringFromEnv(
    32,
    'REFRESH_TOKEN_SECRET should be at least 32 characters long'
  ),
  REFRESH_TOKEN_EXPIRES_IN: requiredTrimmedStringFromEnv().default('30d'),
  COOKIE_SECURE: booleanFromEnv.default(false),
  COOKIE_DOMAIN: optionalTrimmedStringFromEnv(),
  APP_URL: z.string().url().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  UPLOAD_PROVIDER: z.enum(['disabled', 'cloudinary', 's3']).default('disabled'),
  SMTP_HOST: optionalTrimmedStringFromEnv(),
  SMTP_SERVICE: optionalTrimmedStringFromEnv(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: booleanFromEnv.default(false),
  SMTP_USER: optionalTrimmedStringFromEnv(),
  SMTP_PASS: optionalTrimmedStringFromEnv(),
  MAIL_FROM: optionalTrimmedStringFromEnv(),
  CLOUDINARY_CLOUD_NAME: optionalTrimmedStringFromEnv(),
  CLOUDINARY_API_KEY: optionalTrimmedStringFromEnv(),
  CLOUDINARY_API_SECRET: optionalTrimmedStringFromEnv(),
  S3_BUCKET: optionalTrimmedStringFromEnv(),
  S3_REGION: optionalTrimmedStringFromEnv(),
  S3_ENDPOINT: optionalTrimmedStringFromEnv(),
  S3_ACCESS_KEY_ID: optionalTrimmedStringFromEnv(),
  S3_SECRET_ACCESS_KEY: optionalTrimmedStringFromEnv(),
  S3_FORCE_PATH_STYLE: booleanFromEnv.default(false),
  MAX_FILE_SIZE_MB: z.coerce.number().positive().default(10)
}).superRefine((data, context) => {
  const hasMailEndpoint = Boolean(data.SMTP_SERVICE || data.SMTP_HOST);
  const hasMailCredentials = Boolean(data.SMTP_USER) && Boolean(data.SMTP_PASS) && Boolean(data.MAIL_FROM);

  if (hasMailEndpoint !== hasMailCredentials) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['SMTP_HOST'],
      message:
        'SMTP configuration must include SMTP_HOST or SMTP_SERVICE, SMTP_USER, SMTP_PASS, and MAIL_FROM together'
    });
  }

  if (data.SMTP_HOST && !data.SMTP_PORT && !data.SMTP_SERVICE) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['SMTP_PORT'],
      message: 'SMTP_PORT is required when SMTP_HOST is configured without SMTP_SERVICE'
    });
  }

  if (data.UPLOAD_PROVIDER === 'cloudinary') {
    const hasCloudinaryTuple =
      Boolean(data.CLOUDINARY_CLOUD_NAME) &&
      Boolean(data.CLOUDINARY_API_KEY) &&
      Boolean(data.CLOUDINARY_API_SECRET);

    if (!hasCloudinaryTuple) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CLOUDINARY_CLOUD_NAME'],
        message: 'Cloudinary uploads require CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET'
      });
    }
  }

  if (data.UPLOAD_PROVIDER === 's3') {
    const hasS3Tuple =
      Boolean(data.S3_BUCKET) &&
      Boolean(data.S3_REGION) &&
      Boolean(data.S3_ACCESS_KEY_ID) &&
      Boolean(data.S3_SECRET_ACCESS_KEY);

    if (!hasS3Tuple) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['S3_BUCKET'],
        message:
          'S3 uploads require S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY'
      });
    }
  }
});

export const env = envSchema.parse(process.env);

export const smtpConfig = env.SMTP_SERVICE || env.SMTP_HOST
  ? {
      host: env.SMTP_HOST ?? null,
      service:
        env.SMTP_SERVICE ??
        (env.SMTP_HOST?.toLowerCase() === 'smtp.gmail.com' ? 'gmail' : null),
      port: env.SMTP_PORT ?? null,
      secure: env.SMTP_SECURE,
      user: env.SMTP_USER ?? null,
      pass: env.SMTP_PASS ?? null,
      from: env.MAIL_FROM ?? null
    }
  : null;

export const hasCloudinaryConfig =
  Boolean(env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(env.CLOUDINARY_API_KEY) &&
  Boolean(env.CLOUDINARY_API_SECRET);

export const hasS3Config =
  Boolean(env.S3_BUCKET) &&
  Boolean(env.S3_REGION) &&
  Boolean(env.S3_ACCESS_KEY_ID) &&
  Boolean(env.S3_SECRET_ACCESS_KEY);

export const hasSmtpConfig = Boolean(smtpConfig?.from && smtpConfig.user && smtpConfig.pass);
export const hasRedisConfig = Boolean(env.REDIS_URL);
