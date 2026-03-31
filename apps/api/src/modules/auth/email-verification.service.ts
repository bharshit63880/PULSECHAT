import crypto from 'node:crypto';

import { env } from '../../config/env';
import { ERROR_CODES } from '../../constants/http';
import { AppError } from '../../errors/AppError';
import { UserModel, type IUser } from '../../models/User';
import { mailService } from '../../services/mail.service';

const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;
const RESEND_COOLDOWN_MS = 1000 * 60;

const buildVerificationUrl = (token: string) =>
  `${env.APP_URL.replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(token)}`;

type VerificationUser = Pick<
  IUser,
  | 'name'
  | 'email'
  | 'isEmailVerified'
  | 'emailVerificationTokenHash'
  | 'emailVerificationExpiresAt'
  | 'emailVerificationLastSentAt'
> & {
  save: () => Promise<unknown>;
};

export const hashVerificationToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

const createVerificationToken = () => crypto.randomBytes(32).toString('hex');

export const emailVerificationService = {
  async issueVerification(user: VerificationUser, options?: { bypassCooldown?: boolean }) {
    if (user.isEmailVerified) {
      return { sent: false, email: user.email };
    }

    if (
      !options?.bypassCooldown &&
      user.emailVerificationLastSentAt &&
      Date.now() - user.emailVerificationLastSentAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      throw new AppError(
        'Please wait a minute before requesting another verification email',
        400,
        ERROR_CODES.BAD_REQUEST
      );
    }

    const token = createVerificationToken();
    const verificationUrl = buildVerificationUrl(token);
    const previousTokenHash = user.emailVerificationTokenHash ?? null;
    const previousExpiresAt = user.emailVerificationExpiresAt ?? null;
    const previousLastSentAt = user.emailVerificationLastSentAt ?? null;

    user.emailVerificationTokenHash = hashVerificationToken(token);
    user.emailVerificationExpiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
    user.emailVerificationLastSentAt = new Date();
    await user.save();

    try {
      await mailService.send({
        to: user.email,
        subject: 'Verify your Pulse Chat email',
        text: `Hi ${user.name}, verify your email to unlock secure messaging: ${verificationUrl}`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
            <h2 style="margin-bottom:12px">Verify your Pulse Chat email</h2>
            <p>Hi ${user.name},</p>
            <p>Finish setting up your secure messenger account by verifying your email address.</p>
            <p>
              <a href="${verificationUrl}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:600">
                Verify email
              </a>
            </p>
            <p>If the button does not open, use this link:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This link expires in 24 hours.</p>
          </div>
        `
      });
    } catch (error) {
      user.emailVerificationTokenHash = previousTokenHash;
      user.emailVerificationExpiresAt = previousExpiresAt;
      user.emailVerificationLastSentAt = previousLastSentAt;
      await user.save();
      throw error;
    }

    return { sent: true, email: user.email };
  },

  async verifyToken(token: string) {
    const tokenHash = hashVerificationToken(token);

    const user = await UserModel.findOneAndUpdate(
      {
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpiresAt: { $gt: new Date() }
      },
      {
        $set: {
          isEmailVerified: true,
          emailVerificationLastSentAt: new Date()
        },
        $unset: {
          emailVerificationTokenHash: 1,
          emailVerificationExpiresAt: 1
        }
      },
      {
        new: true
      }
    );

    if (!user) {
      throw new AppError('This verification link is invalid or has expired', 400, ERROR_CODES.BAD_REQUEST);
    }

    return user;
  }
};
