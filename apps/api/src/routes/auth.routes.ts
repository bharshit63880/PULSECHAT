import { Router } from 'express';

import { authMiddleware } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rate-limit.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { authController } from '../modules/auth/auth.controller';
import { asyncHandler } from '../utils/async-handler';
import { authValidation } from '../validations/auth.validation';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, validateRequest(authValidation.register), asyncHandler(authController.register));
authRouter.post('/login', authRateLimiter, validateRequest(authValidation.login), asyncHandler(authController.login));
authRouter.post('/verify-email', authRateLimiter, validateRequest(authValidation.verifyEmail), asyncHandler(authController.verifyEmail));
authRouter.post('/refresh', authRateLimiter, asyncHandler(authController.refresh));
authRouter.post('/logout', asyncHandler(authController.logout));
authRouter.get('/me', authMiddleware, asyncHandler(authController.me));
authRouter.post(
  '/resend-verification',
  authMiddleware,
  authRateLimiter,
  validateRequest(authValidation.resendVerification),
  asyncHandler(authController.resendVerification)
);
