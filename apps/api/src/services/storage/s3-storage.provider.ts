import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

import { env } from '../../config/env';
import { ERROR_CODES } from '../../constants/http';
import { AppError } from '../../errors/AppError';
import { logger } from '../logger.service';
import type { StorageProvider, StoredAsset, UploadedFile } from './storage.types';
import { resolveAssetType, sanitizeFileName } from './storage.utils';

const s3Client = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT ?? undefined,
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
  credentials: env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY
    ? {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY
      }
    : undefined
});

const buildKey = (folder: string, fileName: string) => `${folder}/${Date.now()}-${sanitizeFileName(fileName)}`;

const resolvePublicUrl = (bucket: string, key: string) => {
  if (env.S3_ENDPOINT) {
    const endpoint = env.S3_ENDPOINT.replace(/\/+$/, '');
    return env.S3_FORCE_PATH_STYLE ? `${endpoint}/${bucket}/${key}` : `${endpoint}/${key}`;
  }

  return `https://${bucket}.s3.${env.S3_REGION}.amazonaws.com/${key}`;
};

const uploadToS3 = async (file: UploadedFile, folder: string): Promise<StoredAsset> => {
  const bucket = env.S3_BUCKET!;
  const key = buildKey(folder, file.originalname);

  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      }
    });

    await upload.done();

    return {
      url: resolvePublicUrl(bucket, key),
      publicId: key,
      fileName: sanitizeFileName(file.originalname),
      mimeType: file.mimetype,
      size: file.size,
      type: resolveAssetType(file.mimetype)
    };
  } catch (error) {
    logger.error({ error, bucket, key }, 'S3 upload failed');
    throw new AppError(
      'Object storage is unavailable. Check your S3 bucket, credentials, and endpoint configuration.',
      502,
      ERROR_CODES.INTERNAL_SERVER_ERROR
    );
  }
};

export const s3StorageProvider: StorageProvider = {
  uploadAvatar(file) {
    return uploadToS3(file, 'chat-app/avatars');
  },
  uploadAttachment(file) {
    const folder = file.mimetype.startsWith('image/') ? 'chat-app/images' : 'chat-app/files';
    return uploadToS3(file, folder);
  }
};
