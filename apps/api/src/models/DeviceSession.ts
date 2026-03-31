import { Schema, model } from 'mongoose';

export interface IDeviceSession {
  user: Schema.Types.ObjectId;
  deviceId: string;
  label: string;
  platform?: string | null;
  userAgent?: string | null;
  appVersion?: string | null;
  publicIdentityKey: string;
  publicAgreementKey: string;
  fingerprint: string;
  lastActiveAt: Date;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const deviceSessionSchema = new Schema<IDeviceSession>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deviceId: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    platform: { type: String, default: null },
    userAgent: { type: String, default: null },
    appVersion: { type: String, default: null },
    publicIdentityKey: { type: String, required: true },
    publicAgreementKey: { type: String, required: true },
    fingerprint: { type: String, required: true },
    lastActiveAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null }
  },
  {
    timestamps: true
  }
);

deviceSessionSchema.index({ user: 1, deviceId: 1 }, { unique: true });
deviceSessionSchema.index({ user: 1, revokedAt: 1, lastActiveAt: -1 });

export const DeviceSessionModel = model<IDeviceSession>('DeviceSession', deviceSessionSchema);
