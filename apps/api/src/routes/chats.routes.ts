import { Router } from 'express';

import { authMiddleware } from '../middleware/auth.middleware';
import { validateMultiRequest, validateRequest } from '../middleware/validate.middleware';
import { verifiedEmailMiddleware } from '../middleware/verified-email.middleware';
import { chatsController } from '../modules/chats/chats.controller';
import { asyncHandler } from '../utils/async-handler';
import { chatsValidation } from '../validations/chats.validation';

export const chatsRouter = Router();

chatsRouter.use(authMiddleware);
chatsRouter.use(verifiedEmailMiddleware);
chatsRouter.get('/', asyncHandler(chatsController.list));
chatsRouter.post('/direct', validateRequest(chatsValidation.createDirect), asyncHandler(chatsController.createOrAccessDirect));
chatsRouter.patch(
  '/:chatId/disappearing-mode',
  validateMultiRequest({
    params: chatsValidation.chatIdParam,
    body: chatsValidation.updateDisappearingMode
  }),
  asyncHandler(chatsController.updateDisappearingMode)
);
