import { Router } from 'express';

import { authMiddleware } from '../middleware/auth.middleware';
import { validateMultiRequest, validateRequest } from '../middleware/validate.middleware';
import { verifiedEmailMiddleware } from '../middleware/verified-email.middleware';
import { groupsController } from '../modules/groups/groups.controller';
import { asyncHandler } from '../utils/async-handler';
import { groupsValidation } from '../validations/groups.validation';

export const groupsRouter = Router();

groupsRouter.use(authMiddleware);
groupsRouter.use(verifiedEmailMiddleware);
groupsRouter.post('/', validateRequest(groupsValidation.createGroup), asyncHandler(groupsController.create));
groupsRouter.patch(
  '/:chatId',
  validateMultiRequest({
    params: groupsValidation.chatIdParam,
    body: groupsValidation.renameGroup
  }),
  asyncHandler(groupsController.rename)
);
groupsRouter.post(
  '/:chatId/members',
  validateMultiRequest({
    params: groupsValidation.chatIdParam,
    body: groupsValidation.manageMembers
  }),
  asyncHandler(groupsController.addMember)
);
groupsRouter.delete(
  '/:chatId/members/:userId',
  validateRequest(groupsValidation.chatAndUserParam, 'params'),
  asyncHandler(groupsController.removeMember)
);
