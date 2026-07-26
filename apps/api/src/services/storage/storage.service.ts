import { env, hasCloudinaryConfig, hasS3Config } from '../../config/env';
import { ERROR_CODES } from '../../constants/http';
import { AppError } from '../../errors/AppError';
import type { StorageProvider } from './storage.types';
import { cloudinaryStorageProvider } from './cloudinary-storage.provider';
import { s3StorageProvider } from './s3-storage.provider';

const providers: Record<typeof env.UPLOAD_PROVIDER, StorageProvider | null> = {
  disabled: null,
  cloudinary: hasCloudinaryConfig ? cloudinaryStorageProvider : null,
  s3: hasS3Config ? s3StorageProvider : null
};

const resolveProvider = () => {
  const provider = providers[env.UPLOAD_PROVIDER];

  if (!provider) {
    throw new AppError(
      `${env.UPLOAD_PROVIDER.toUpperCase()} storage is not fully configured`,
      500,
      ERROR_CODES.INTERNAL_SERVER_ERROR
    );
  }

  return provider;
};

export const storageService = {
  uploadAvatar(file: Parameters<StorageProvider['uploadAvatar']>[0]) {
    return resolveProvider().uploadAvatar(file);
  },

  uploadAttachment(file: Parameters<StorageProvider['uploadAttachment']>[0]) {
    return resolveProvider().uploadAttachment(file);
  }
};
