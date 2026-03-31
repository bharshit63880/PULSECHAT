import type { AuthResponseDto } from '@chat-app/shared';
import type { DeviceRegistrationDto } from '@chat-app/shared';

import { DeviceSessionModel } from '../models/DeviceSession';
import { RefreshTokenModel, hashRefreshToken } from '../models/RefreshToken';
import { UserModel } from '../models/User';
import { mapUserSummary } from './mapper.service';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './token.service';
import { AppError } from '../errors/AppError';
import { ERROR_CODES } from '../constants/http';
import { devicesService } from '../modules/devices/devices.service';

const buildAuthEnvelope = async (userId: string, session: any): Promise<AuthResponseDto> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError('Authenticated user could not be loaded', 404, ERROR_CODES.NOT_FOUND);
  }

  return {
    user: mapUserSummary(user),
    token: signAccessToken({ userId: user.id, sessionId: session.id, deviceId: session.deviceId }),
    session: {
      deviceId: session.deviceId,
      label: session.label,
      isCurrent: true,
      publicIdentityKey: session.publicIdentityKey,
      publicAgreementKey: session.publicAgreementKey,
      fingerprint: session.fingerprint
    }
  };
};

export const authSessionService = {
  async createSession(userId: string, device: DeviceRegistrationDto) {
    const session = await devicesService.registerOrRotateDevice({ ...device, userId });
    const refreshToken = signRefreshToken({ userId, sessionId: session.id, deviceId: session.deviceId });
    const payload = verifyRefreshToken(refreshToken);

    await RefreshTokenModel.create({
      user: userId,
      deviceSession: session.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: new Date(payload.exp * 1000)
    });

    return {
      auth: await buildAuthEnvelope(userId, session),
      refreshToken
    };
  },

  async rotateSession(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashRefreshToken(refreshToken);

    const storedToken = await RefreshTokenModel.findOne({
      tokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    }).populate('deviceSession');

    if (!storedToken) {
      throw new AppError('Refresh session is invalid or expired', 401, ERROR_CODES.UNAUTHORIZED);
    }

    const deviceSession = storedToken.deviceSession as any;

    if (!deviceSession || deviceSession.revokedAt) {
      throw new AppError('Device session is no longer valid', 401, ERROR_CODES.UNAUTHORIZED);
    }

    storedToken.revokedAt = new Date();
    await storedToken.save();
    await devicesService.touchDeviceSession(deviceSession.id);

    const nextRefreshToken = signRefreshToken({
      userId: payload.userId,
      sessionId: payload.sessionId,
      deviceId: payload.deviceId
    });
    const nextPayload = verifyRefreshToken(nextRefreshToken);

    await RefreshTokenModel.create({
      user: payload.userId,
      deviceSession: deviceSession.id,
      tokenHash: hashRefreshToken(nextRefreshToken),
      expiresAt: new Date(nextPayload.exp * 1000)
    });

    return {
      auth: await buildAuthEnvelope(payload.userId, deviceSession),
      refreshToken: nextRefreshToken
    };
  },

  async revokeSession(refreshToken?: string | null) {
    if (!refreshToken) {
      return;
    }

    const tokenHash = hashRefreshToken(refreshToken);

    await RefreshTokenModel.findOneAndUpdate(
      {
        tokenHash,
        revokedAt: null
      },
      {
        revokedAt: new Date()
      },
      {
        new: true
      }
    );
  },

  async revokeAllUserSessions(userId: string) {
    await DeviceSessionModel.updateMany(
      {
        user: userId,
        revokedAt: null
      },
      {
        revokedAt: new Date()
      }
    );

    await RefreshTokenModel.updateMany(
      {
        user: userId,
        revokedAt: null
      },
      {
        revokedAt: new Date()
      }
    );
  },

  async revokeDeviceSession(userId: string, deviceId: string) {
    const session = await DeviceSessionModel.findOneAndUpdate(
      {
        user: userId,
        deviceId,
        revokedAt: null
      },
      {
        revokedAt: new Date()
      },
      { new: true }
    );

    if (!session) {
      return null;
    }

    await RefreshTokenModel.updateMany(
      {
        deviceSession: session._id,
        revokedAt: null
      },
      {
        revokedAt: new Date()
      }
    );

    return session;
  }
};
