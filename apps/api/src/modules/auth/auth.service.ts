import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

import { OAuth2Client } from 'google-auth-library';

import { env, hasGoogleOAuthConfig } from '../../config/env';
import { ERROR_CODES } from '../../constants/http';
import { AppError } from '../../errors/AppError';
import { UserModel } from '../../models/User';
import { mapUserSummary } from '../../services/mapper.service';
import { authSessionService } from '../../services/auth-session.service';
import { emailVerificationService } from './email-verification.service';
import { mailService } from '../../services/mail.service';

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

type GoogleLoginInput = {
  credential: string;
  device: RegisterInput['device'];
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();
const normalizeUsername = (value: string) => value.trim().toLowerCase();
const googleClient = hasGoogleOAuthConfig ? new OAuth2Client(env.GOOGLE_OAUTH_CLIENT_ID) : null;
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 20;

const createPasswordResetToken = () => crypto.randomBytes(32).toString('hex');
const hashPasswordResetToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

const buildPasswordResetUrl = (token: string) =>
  `${env.APP_URL.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

const usernameFromGoogleProfile = (name: string, email: string) => {
  const fromName = name
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '')
    .slice(0, 18);
  const fromEmail = email
    .split('@')[0]
    ?.toLowerCase()
    .replace(/[^a-z0-9_]+/g, '')
    .slice(0, 18);
  return (fromName || fromEmail || 'pulseuser').slice(0, 18);
};

const createAvailableUsername = async (name: string, email: string) => {
  const base = usernameFromGoogleProfile(name, email).padEnd(3, 'x');

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const suffix = attempt === 0 ? '' : crypto.randomInt(100, 10_000).toString();
    const username = `${base.slice(0, 24 - suffix.length)}${suffix}`;
    const existing = await UserModel.exists({ username });

    if (!existing) {
      return username;
    }
  }

  throw new AppError(
    'Unable to reserve a username for this Google account',
    503,
    ERROR_CODES.BAD_REQUEST,
  );
};

export const authService = {
  async register(input: RegisterInput) {
    const existing = await UserModel.findOne({
      $or: [
        { email: normalizeEmail(input.email) },
        { username: normalizeUsername(input.username) },
      ],
    });

    if (existing) {
      throw new AppError(
        'A user already exists with that email or username',
        409,
        ERROR_CODES.CONFLICT,
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await UserModel.create({
      name: input.name,
      username: normalizeUsername(input.username),
      email: normalizeEmail(input.email),
      passwordHash,
      isEmailVerified: false,
      isOnline: false,
    });

    try {
      await emailVerificationService.issueVerification(user, { bypassCooldown: true });
    } catch (error) {
      // Do not leave an unreachable, unverified account behind when the
      // initial verification message cannot be delivered. The user can retry
      // registration after correcting their email-delivery setup.
      await UserModel.findByIdAndDelete(user.id);
      throw error;
    }

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

  async loginWithGoogle(input: GoogleLoginInput) {
    if (!googleClient || !env.GOOGLE_OAUTH_CLIENT_ID) {
      throw new AppError(
        'Google sign-in is not configured on this server',
        503,
        ERROR_CODES.BAD_REQUEST,
      );
    }

    let payload: {
      sub?: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
      picture?: string;
    };

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: input.credential,
        audience: env.GOOGLE_OAUTH_CLIENT_ID,
      });
      payload = ticket.getPayload() ?? {};
    } catch {
      throw new AppError(
        'Google could not verify this sign-in request',
        401,
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    const email = payload.email ? normalizeEmail(payload.email) : null;

    if (!payload.sub || !email || payload.email_verified !== true) {
      throw new AppError(
        'A verified Google email address is required',
        401,
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    let user = await UserModel.findOne({ $or: [{ googleId: payload.sub }, { email }] });

    if (user && user.googleId && user.googleId !== payload.sub) {
      throw new AppError(
        'This email is already linked to a different Google account',
        409,
        ERROR_CODES.CONFLICT,
      );
    }

    if (!user) {
      const name = payload.name?.trim().slice(0, 50) || email.split('@')[0] || 'PulseChat user';
      const username = await createAvailableUsername(name, email);
      user = await UserModel.create({
        name,
        username,
        email,
        googleId: payload.sub,
        // Password login remains disabled until the member explicitly resets/sets a password.
        passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12),
        avatarUrl: payload.picture ?? null,
        isEmailVerified: true,
        isOnline: false,
      });
    } else if (user.googleId !== payload.sub || !user.isEmailVerified) {
      user.googleId = payload.sub;
      user.isEmailVerified = true;
      if (!user.avatarUrl && payload.picture) {
        user.avatarUrl = payload.picture;
      }
      await user.save();
    }

    return authSessionService.createSession(user.id, input.device);
  },

  async requestPasswordReset(rawEmail: string) {
    const user = await UserModel.findOne({ email: normalizeEmail(rawEmail) });

    // Keep the response identical whether an account exists or not.
    if (!user) {
      return;
    }

    const token = createPasswordResetToken();
    user.passwordResetTokenHash = hashPasswordResetToken(token);
    user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
    await user.save();

    try {
      const resetUrl = buildPasswordResetUrl(token);
      await mailService.send({
        to: user.email,
        subject: 'Reset your PulseChat password',
        text: `Hi ${user.name}, reset your PulseChat password: ${resetUrl}`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827"><h2>Reset your PulseChat password</h2><p>Hi ${user.name},</p><p>Use the secure link below to choose a new password. It expires in 20 minutes.</p><p><a href="${resetUrl}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#7c3aed;color:#fff;text-decoration:none;font-weight:600">Reset password</a></p><p>If you did not request this, you can ignore this email.</p></div>`,
      });
    } catch (error) {
      user.passwordResetTokenHash = null;
      user.passwordResetExpiresAt = null;
      await user.save();
      throw error;
    }
  },

  async resetPassword(token: string, password: string) {
    const user = await UserModel.findOne({
      passwordResetTokenHash: hashPasswordResetToken(token),
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError(
        'This password reset link is invalid or has expired',
        400,
        ERROR_CODES.BAD_REQUEST,
      );
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();
    await authSessionService.revokeAllUserSessions(user.id);
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
        lastSeen: new Date(),
      });
    }
  },
};
