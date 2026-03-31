import { Router } from 'express';

import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { devicesController } from '../modules/devices/devices.controller';
import { asyncHandler } from '../utils/async-handler';
import { devicesValidation } from '../validations/devices.validation';

export const devicesRouter = Router();

devicesRouter.use(authMiddleware);
devicesRouter.get('/', asyncHandler(devicesController.list));
devicesRouter.delete(
  '/:deviceId',
  validateRequest(devicesValidation.revokeDeviceParam, 'params'),
  asyncHandler(devicesController.revoke)
);
