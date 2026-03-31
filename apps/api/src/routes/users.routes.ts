import { Router } from 'express';

import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { verifiedEmailMiddleware } from '../middleware/verified-email.middleware';
import { usersController } from '../modules/users/users.controller';
import { asyncHandler } from '../utils/async-handler';
import { usersValidation } from '../validations/users.validation';

export const usersRouter = Router();

usersRouter.use(authMiddleware);
usersRouter.patch('/me', validateRequest(usersValidation.updateProfile), asyncHandler(usersController.updateMe));
usersRouter.use(verifiedEmailMiddleware);
usersRouter.get('/', asyncHandler(usersController.list));
