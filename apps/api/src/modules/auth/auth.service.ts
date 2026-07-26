import bcrypt from 'bcryptjs';

import { ERROR_CODES } from '../../constants/http';
import { AppError } from '../../errors/AppError';
import { UserModel } from '../../models/User';
import { mapUserSummary } from '../../services/mapper.service';
import { authSessionService } from '../../services/auth-session.service';
import { emailVerificationService } from './email-verification.service';

type RegisterInput = {
  name: string;
  username: string;
  email: string;
  password: string;
  device: {
    deviceId: string;
    label: string;
    platform?: string | null;
    userAgent?: string | null;
    appVersion?: string | null;
    publicIdentityKey: string;
    publicAgreementKey: string;
    fingerprint: string;
  };
};

type LoginInput = {
  email: string;
  password: string;
  device: RegisterInput['device'];
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();
const normalizeUsername = (value: string) => value.trim().toLowerCase();

export const authService = {
  async register(input: RegisterInput) {
    const existing = await UserModel.findOne({
      $or: [{ email: normalizeEmail(input.email) }, { username: normalizeUsername(input.username) }]
    });

    if (existing) {
      throw new AppError(
        'A user already exists with that email or username',
        409,
        ERROR_CODES.CONFLICT
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await UserModel.create({
      name: input.name,
      username: normalizeUsername(input.username),
      email: normalizeEmail(input.email),
      passwordHash,
      isEmailVerified: false,
      isOnline: false
    });

    await emailVerificationService.issueVerification(user, { bypassCooldown: true });

    return authSessionService.createSession(user.id, input.device);
  },

  async login(input: LoginInput) {
    const user = await UserModel.findOne({ email: normalizeEmail(input.email) });

    if (!user) {
      throw new AppError('Invalid email or password', 401, ERROR_CODES.UNAUTHORIZED);
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError('Invalid email or password', 401, ERROR_CODES.UNAUTHORIZED);
    }

    return authSessionService.createSession(user.id, input.device);
  },

  async verifyEmail(token: string) {
    const user = await emailVerificationService.verifyToken(token);
    return mapUserSummary(user);
  },

  async resendVerification(userId: string) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
    }

    return emailVerificationService.issueVerification(user);
  },

  async getCurrentUser(userId: string) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
    }

    return mapUserSummary(user);
  },

  async refreshSession(refreshToken: string) {
    return authSessionService.rotateSession(refreshToken);
  },

  async logout(refreshToken?: string | null, userId?: string) {
    await authSessionService.revokeSession(refreshToken);

    if (userId) {
      await UserModel.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date()
      });
    }
  }
};
