import type { DeviceRegistrationDto, PublishedKeyBundleDto } from '@chat-app/shared';

import { ERROR_CODES } from '../../constants/http';
import { AppError } from '../../errors/AppError';
import { DeviceSessionModel } from '../../models/DeviceSession';
import { RefreshTokenModel } from '../../models/RefreshToken';
import { UserModel } from '../../models/User';
import { mapDeviceSessionDto } from '../../services/mapper.service';

type RegisterDeviceInput = DeviceRegistrationDto & {
  userId: string;
};

const sanitizeNullable = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export const devicesService = {
  async registerOrRotateDevice(input: RegisterDeviceInput) {
    return DeviceSessionModel.findOneAndUpdate(
      { user: input.userId, deviceId: input.deviceId },
      {
        user: input.userId,
        deviceId: input.deviceId,
        label: input.label.trim(),
        platform: sanitizeNullable(input.platform),
        userAgent: sanitizeNullable(input.userAgent),
        appVersion: sanitizeNullable(input.appVersion),
        publicIdentityKey: input.publicIdentityKey,
        publicAgreementKey: input.publicAgreementKey,
        fingerprint: input.fingerprint,
        lastActiveAt: new Date(),
        revokedAt: null
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
  },

  async touchDeviceSession(sessionId: string) {
    await DeviceSessionModel.findByIdAndUpdate(sessionId, { lastActiveAt: new Date() });
  },

  async listUserDevices(userId: string, currentSessionId: string) {
    const sessions = await DeviceSessionModel.find({ user: userId }).sort({ lastActiveAt: -1 });
    return sessions.map((session) => mapDeviceSessionDto(session, currentSessionId));
  },

  async revokeDevice(userId: string, deviceId: string, currentSessionId: string) {
    const session = await DeviceSessionModel.findOne({ user: userId, deviceId });

    if (!session) {
      throw new AppError('Device session not found', 404, ERROR_CODES.NOT_FOUND);
    }

    if (session.id === currentSessionId) {
      throw new AppError(
        'Use logout to revoke the current device session',
        400,
        ERROR_CODES.BAD_REQUEST
      );
    }

    session.revokedAt = new Date();
    await session.save();

    await RefreshTokenModel.updateMany(
      {
        deviceSession: session._id,
        revokedAt: null
      },
      {
        revokedAt: new Date()
      }
    );

    return mapDeviceSessionDto(session, currentSessionId);
  },

  async getPublishedKeyBundle(requestingUserId: string, otherUserId: string): Promise<PublishedKeyBundleDto> {
    if (requestingUserId === otherUserId) {
      throw new AppError(
        'Public key bundles are intended for peer devices',
        400,
        ERROR_CODES.BAD_REQUEST
      );
    }

    const user = await UserModel.findById(otherUserId);

    if (!user) {
      throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
    }

    const sessions = await DeviceSessionModel.find({
      user: otherUserId,
      revokedAt: null
    }).sort({ lastActiveAt: -1 });

    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl ?? null
      },
      devices: sessions.map((session) => ({
        deviceId: session.deviceId,
        label: session.label,
        publicIdentityKey: session.publicIdentityKey,
        publicAgreementKey: session.publicAgreementKey,
        fingerprint: session.fingerprint,
        createdAt: session.createdAt.toISOString(),
        lastActiveAt: session.lastActiveAt.toISOString()
      }))
    };
  }
};
