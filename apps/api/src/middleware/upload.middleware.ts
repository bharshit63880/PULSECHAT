import multer from 'multer';

import { env } from '../config/env';
import { FILE_MIME_TYPES, IMAGE_MIME_TYPES } from '../constants/upload';
import { AppError } from '../errors/AppError';

const createUpload = (allowedMimeTypes: string[]) =>
  multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024
    },
    fileFilter: (_request, file, callback) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        callback(new AppError(`Unsupported file type: ${file.mimetype}`, 400, 'INVALID_FILE_TYPE'));
        return;
      }

      callback(null, true);
    }
  });

export const avatarUpload = createUpload(IMAGE_MIME_TYPES);
export const attachmentUpload = createUpload(FILE_MIME_TYPES);
