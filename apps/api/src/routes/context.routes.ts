import { Router } from 'express';

import { authMiddleware } from '../middleware/auth.middleware';
import { validateMultiRequest } from '../middleware/validate.middleware';
import { verifiedEmailMiddleware } from '../middleware/verified-email.middleware';
import { contextController } from '../modules/context/context.controller';
import { asyncHandler } from '../utils/async-handler';
import { contextValidation } from '../validations/context.validation';

export const contextRouter = Router({ mergeParams: true });

contextRouter.use(authMiddleware);
contextRouter.use(verifiedEmailMiddleware);
contextRouter.get(
  '/',
  validateMultiRequest({ params: contextValidation.chatIdParam }),
  asyncHandler(contextController.list),
);
contextRouter.post(
  '/',
  validateMultiRequest({
    params: contextValidation.chatIdParam,
    body: contextValidation.createTask,
  }),
  asyncHandler(contextController.createTask),
);
contextRouter.patch(
  '/tasks/:taskId',
  validateMultiRequest({
    params: contextValidation.chatIdParam.merge(contextValidation.taskIdParam),
    body: contextValidation.updateTask,
  }),
  asyncHandler(contextController.updateTask),
);
contextRouter.post(
  '/decisions',
  validateMultiRequest({
    params: contextValidation.chatIdParam,
    body: contextValidation.createDecision,
  }),
  asyncHandler(contextController.createDecision),
);
contextRouter.patch(
  '/decisions/:decisionId',
  validateMultiRequest({
    params: contextValidation.chatIdParam.merge(contextValidation.decisionIdParam),
    body: contextValidation.updateDecision,
  }),
  asyncHandler(contextController.updateDecision),
);
