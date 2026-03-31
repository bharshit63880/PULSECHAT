import { ERROR_CODES } from '../../constants/http';
import { AppError } from '../../errors/AppError';
import { UserModel } from '../../models/User';
import { mapUserSummary } from '../../services/mapper.service';
import { emailVerificationService } from '../auth/email-verification.service';

type UpdateProfileInput = {
  name?: string;
  username?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
};

export const usersService = {
  async listUsers(search: string | undefined, currentUserId: string) {
    const query = search
      ? {
          _id: { $ne: currentUserId },
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : { _id: { $ne: currentUserId } };

    const users = await UserModel.find(query).sort({ isOnline: -1, updatedAt: -1 }).limit(25);
    return users.map(mapUserSummary);
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
    }

    const nextEmail = input.email?.toLowerCase();
    const nextUsername = input.username?.toLowerCase();

    if (input.email || input.username) {
      const conflict = await UserModel.findOne({
        _id: { $ne: userId },
        $or: [
          ...(nextEmail ? [{ email: nextEmail }] : []),
          ...(nextUsername ? [{ username: nextUsername }] : [])
        ]
      });

      if (conflict) {
        throw new AppError('Email or username is already taken', 409, ERROR_CODES.CONFLICT);
      }
    }

    const emailChanged = Boolean(nextEmail && nextEmail !== user.email);

    if (input.name) {
      user.name = input.name;
    }

    if (nextUsername) {
      user.username = nextUsername;
    }

    if (nextEmail) {
      user.email = nextEmail;
    }

    if (input.bio !== undefined) {
      user.bio = input.bio;
    }

    if (input.avatarUrl !== undefined) {
      user.avatarUrl = input.avatarUrl;
    }

    if (emailChanged) {
      user.isEmailVerified = false;
      user.emailVerificationTokenHash = null;
      user.emailVerificationExpiresAt = null;
      user.emailVerificationLastSentAt = null;
    }

    await user.save();

    if (emailChanged) {
      await emailVerificationService.issueVerification(user, { bypassCooldown: true });
    }

    return mapUserSummary(user);
  }
};
