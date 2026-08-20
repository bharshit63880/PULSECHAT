import { Schema, model } from 'mongoose';

export interface IUser {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  googleId?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  isEmailVerified: boolean;
  emailVerificationTokenHash?: string | null;
  emailVerificationExpiresAt?: Date | null;
  emailVerificationLastSentAt?: Date | null;
  passwordResetTokenHash?: string | null;
  passwordResetExpiresAt?: Date | null;
  isOnline: boolean;
  lastSeen?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    googleId: { type: String, unique: true, sparse: true, default: null },
    avatarUrl: { type: String, default: null },
    bio: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, default: null },
    emailVerificationExpiresAt: { type: Date, default: null },
    emailVerificationLastSentAt: { type: Date, default: null },
    passwordResetTokenHash: { type: String, default: null },
    passwordResetExpiresAt: { type: Date, default: null },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);
export const UserModel = model<IUser>('User', userSchema);
