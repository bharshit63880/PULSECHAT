import { ERROR_CODES } from '../../constants/http';
import { AppError } from '../../errors/AppError';
import { storageService } from '../../services/storage/storage.service';

type UploadedFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

export const uploadsService = {
  async uploadAvatar(file?: UploadedFile) {
    if (!file) {
      throw new AppError('Avatar file is required', 400, ERROR_CODES.BAD_REQUEST);
    }

    return storageService.uploadAvatar(file);
  },

  async uploadAttachment(file?: UploadedFile) {
    if (!file) {
      throw new AppError('Attachment file is required', 400, ERROR_CODES.BAD_REQUEST);
    }

    return storageService.uploadAttachment(file);
  }
};
