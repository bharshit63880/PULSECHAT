import { Router } from 'express';

import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { verifiedEmailMiddleware } from '../middleware/verified-email.middleware';
import { e2eeController } from '../modules/e2ee/e2ee.controller';
import { asyncHandler } from '../utils/async-handler';
import { e2eeValidation } from '../validations/e2ee.validation';

export const keysRouter = Router();

keysRouter.use(authMiddleware);
keysRouter.use(verifiedEmailMiddleware);
keysRouter.get(
  '/:userId',
  validateRequest(e2eeValidation.keyBundleParam, 'params'),
  asyncHandler(e2eeController.getKeyBundle)
);
