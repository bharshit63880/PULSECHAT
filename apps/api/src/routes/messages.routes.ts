import { Router } from 'express';

import { authMiddleware } from '../middleware/auth.middleware';
import { validateMultiRequest, validateRequest } from '../middleware/validate.middleware';
import { verifiedEmailMiddleware } from '../middleware/verified-email.middleware';
import { messagesController } from '../modules/messages/messages.controller';
import { asyncHandler } from '../utils/async-handler';
import { messagesValidation } from '../validations/messages.validation';

export const messagesRouter = Router();

messagesRouter.use(authMiddleware);
messagesRouter.use(verifiedEmailMiddleware);
messagesRouter.get(
  '/:chatId/search',
  validateMultiRequest({
    params: messagesValidation.chatIdParam,
    query: messagesValidation.searchQuery
  }),
  asyncHandler(messagesController.search)
);
messagesRouter.get(
  '/:chatId',
  validateMultiRequest({
    params: messagesValidation.chatIdParam,
    query: messagesValidation.paginationQuery
  }),
  asyncHandler(messagesController.list)
);
messagesRouter.post('/', validateRequest(messagesValidation.sendMessage), asyncHandler(messagesController.send));
messagesRouter.post(
  '/:chatId/seen',
  validateRequest(messagesValidation.chatIdParam, 'params'),
  asyncHandler(messagesController.markSeen)
);
messagesRouter.post(
  '/:messageId/reactions',
  validateMultiRequest({
    params: messagesValidation.messageIdParam,
    body: messagesValidation.reactToMessageBody
  }),
  asyncHandler(messagesController.react)
);
