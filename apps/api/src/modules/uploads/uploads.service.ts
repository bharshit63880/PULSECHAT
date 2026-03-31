import type { UploadApiResponse } from 'cloudinary';
import path from 'node:path';

import { cloudinary } from '../../config/cloudinary';
import { hasCloudinaryConfig } from '../../config/env';
import { ERROR_CODES } from '../../constants/http';
import { AppError } from '../../errors/AppError';
import { logger } from '../../services/logger.service';

type UploadedFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

const sanitizeFileName = (value: string) =>
  path
    .basename(value)
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 255);

const uploadBuffer = (file: UploadedFile, folder: string): Promise<UploadApiResponse> =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });

const ensureUploadConfig = () => {
  if (!hasCloudinaryConfig) {
    throw new AppError(
      'Cloudinary credentials are not configured for uploads',
      500,
      ERROR_CODES.INTERNAL_SERVER_ERROR
    );
  }
};

export const uploadsService = {
  async uploadAvatar(file?: UploadedFile) {
    if (!file) {
      throw new AppError('Avatar file is required', 400, ERROR_CODES.BAD_REQUEST);
    }

    ensureUploadConfig();
    let uploaded: UploadApiResponse;

    try {
      uploaded = await uploadBuffer(file, 'chat-app/avatars');
    } catch (error) {
      logger.error({ error }, 'Avatar upload failed');
      throw new AppError(
        'Avatar storage is unavailable. Check your Cloudinary configuration and account permissions.',
        502,
        ERROR_CODES.INTERNAL_SERVER_ERROR
      );
    }

    return {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      fileName: sanitizeFileName(file.originalname),
      mimeType: file.mimetype,
      size: file.size
    };
  },

  async uploadAttachment(file?: UploadedFile) {
    if (!file) {
      throw new AppError('Attachment file is required', 400, ERROR_CODES.BAD_REQUEST);
    }

    ensureUploadConfig();
    const folder = file.mimetype.startsWith('image/') ? 'chat-app/images' : 'chat-app/files';
    let uploaded: UploadApiResponse;

    try {
      uploaded = await uploadBuffer(file, folder);
    } catch (error) {
      logger.error({ error, mimeType: file.mimetype, size: file.size }, 'Encrypted attachment upload failed');
      throw new AppError(
        'Encrypted attachment storage is unavailable. Check your Cloudinary credentials, cloud name, and account permissions.',
        502,
        ERROR_CODES.INTERNAL_SERVER_ERROR
      );
    }

    return {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      fileName: sanitizeFileName(file.originalname),
      mimeType: file.mimetype,
      size: file.size,
      type: file.mimetype.startsWith('image/') ? 'image' : 'file'
    };
  }
};
