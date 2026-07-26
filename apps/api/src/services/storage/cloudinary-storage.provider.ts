import type { UploadApiResponse } from 'cloudinary';

import { cloudinary } from '../../config/cloudinary';
import { ERROR_CODES } from '../../constants/http';
import { AppError } from '../../errors/AppError';
import { logger } from '../logger.service';
import type { StorageProvider, StoredAsset, UploadedFile } from './storage.types';
import { resolveAssetType, sanitizeFileName } from './storage.utils';

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

const toStoredAsset = (file: UploadedFile, uploaded: UploadApiResponse): StoredAsset => ({
  url: uploaded.secure_url,
  publicId: uploaded.public_id,
  fileName: sanitizeFileName(file.originalname),
  mimeType: file.mimetype,
  size: file.size,
  type: resolveAssetType(file.mimetype)
});

export const cloudinaryStorageProvider: StorageProvider = {
  async uploadAvatar(file) {
    try {
      const uploaded = await uploadBuffer(file, 'chat-app/avatars');
      return toStoredAsset(file, uploaded);
    } catch (error) {
      logger.error({ error }, 'Avatar upload failed');
      throw new AppError(
        'Avatar storage is unavailable. Check your Cloudinary configuration and account permissions.',
        502,
        ERROR_CODES.INTERNAL_SERVER_ERROR
      );
    }
  },

  async uploadAttachment(file) {
    const folder = file.mimetype.startsWith('image/') ? 'chat-app/images' : 'chat-app/files';

    try {
      const uploaded = await uploadBuffer(file, folder);
      return toStoredAsset(file, uploaded);
    } catch (error) {
      logger.error({ error, mimeType: file.mimetype, size: file.size }, 'Encrypted attachment upload failed');
      throw new AppError(
        'Encrypted attachment storage is unavailable. Check your Cloudinary credentials, cloud name, and account permissions.',
        502,
        ERROR_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }
};
