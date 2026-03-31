import crypto from 'node:crypto';

import { Schema, model } from 'mongoose';

export interface IRefreshToken {
  user: Schema.Types.ObjectId;
  deviceSession: Schema.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deviceSession: { type: Schema.Types.ObjectId, ref: 'DeviceSession', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null }
  },
  {
    timestamps: true
  }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user: 1, revokedAt: 1 });
refreshTokenSchema.index({ deviceSession: 1, revokedAt: 1 });

export const hashRefreshToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const RefreshTokenModel = model<IRefreshToken>('RefreshToken', refreshTokenSchema);
