import { Router } from 'express';

import { authMiddleware } from '../middleware/auth.middleware';
import { attachmentUpload, avatarUpload } from '../middleware/upload.middleware';
import { verifiedEmailMiddleware } from '../middleware/verified-email.middleware';
import { uploadsController } from '../modules/uploads/uploads.controller';
import { asyncHandler } from '../utils/async-handler';

export const uploadsRouter = Router();

uploadsRouter.use(authMiddleware);
uploadsRouter.post('/avatar', avatarUpload.single('file'), asyncHandler(uploadsController.uploadAvatar));
uploadsRouter.use(verifiedEmailMiddleware);
uploadsRouter.post('/attachment', attachmentUpload.single('file'), asyncHandler(uploadsController.uploadAttachment));
