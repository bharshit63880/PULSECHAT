import { Router } from 'express';

import { authMiddleware } from '../middleware/auth.middleware';
import { verifiedEmailMiddleware } from '../middleware/verified-email.middleware';
import { callsController } from '../modules/calls/calls.controller';
import { asyncHandler } from '../utils/async-handler';

export const callsRouter = Router();
callsRouter.use(authMiddleware);
callsRouter.use(verifiedEmailMiddleware);
callsRouter.get('/', asyncHandler(callsController.list));
