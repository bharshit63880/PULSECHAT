import type { Request, Response } from 'express';

import { successResponse } from '@chat-app/shared';

import { REFRESH_TOKEN_COOKIE_NAME, refreshTokenCookieOptions } from '../../config/cookies';
import { AppError } from '../../errors/AppError';
import { authService } from './auth.service';

export const authController = {
  async register(request: Request, response: Response) {
    const result = await authService.register({
      ...request.body,
      device: {
        ...request.body.device,
        userAgent: request.body.device?.userAgent ?? request.get('user-agent') ?? null
      }
    });
    response.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, refreshTokenCookieOptions);
    response.status(201).json(successResponse(result.auth, 'Account created successfully'));
  },

  async login(request: Request, response: Response) {
    const result = await authService.login({
      ...request.body,
      device: {
        ...request.body.device,
        userAgent: request.body.device?.userAgent ?? request.get('user-agent') ?? null
      }
    });
    response.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, refreshTokenCookieOptions);
    response.json(
      successResponse(
        result.auth,
        result.auth.user.isEmailVerified
          ? 'Logged in successfully'
          : 'Logged in successfully. Verify your email to unlock secure messaging.'
      )
    );
  },

  async verifyEmail(request: Request, response: Response) {
    const user = await authService.verifyEmail(request.body.token);
    response.json(successResponse({ verified: true, user }, 'Email verified successfully'));
  },

  async resendVerification(request: Request, response: Response) {
    const result = await authService.resendVerification(request.user!.id);
    response.json(successResponse(result, 'Verification email sent successfully'));
  },

  async refresh(request: Request, response: Response) {
    const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;

    if (!refreshToken) {
      throw new AppError('Refresh token cookie is required', 401, 'UNAUTHORIZED');
    }

    const result = await authService.refreshSession(refreshToken);
    response.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, refreshTokenCookieOptions);
    response.json(successResponse(result.auth, 'Session refreshed successfully'));
  },

  async logout(request: Request, response: Response) {
    const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;
    await authService.logout(refreshToken, request.user?.id);
    response.clearCookie(REFRESH_TOKEN_COOKIE_NAME, refreshTokenCookieOptions);
    response.json(successResponse({ loggedOut: true }, 'Logged out successfully'));
  },

  async me(request: Request, response: Response) {
    const user = await authService.getCurrentUser(request.user!.id);
    response.json(successResponse(user));
  }
};
