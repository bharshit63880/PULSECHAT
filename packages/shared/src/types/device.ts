import type { AuthUser } from './user';

export type DeviceRegistrationDto = {
  deviceId: string;
  label: string;
  platform?: string | null;
  userAgent?: string | null;
  appVersion?: string | null;
  publicIdentityKey: string;
  publicAgreementKey: string;
  fingerprint: string;
};

export type DeviceSessionDto = {
  id: string;
  userId: string;
  deviceId: string;
  label: string;
  platform?: string | null;
  userAgent?: string | null;
  appVersion?: string | null;
  publicIdentityKey: string;
  publicAgreementKey: string;
  fingerprint: string;
  isCurrent: boolean;
  createdAt: string;
  lastActiveAt: string;
  revokedAt?: string | null;
};

export type PublishedKeyBundleDto = {
  user: Pick<AuthUser, 'id' | 'name' | 'username' | 'avatarUrl'>;
  devices: Array<{
    deviceId: string;
    label: string;
    publicIdentityKey: string;
    publicAgreementKey: string;
    fingerprint: string;
    createdAt: string;
    lastActiveAt: string;
  }>;
};

export type SafetyNumberDto = {
  chatId: string;
  peerUserId: string;
  peerDeviceId: string;
  localDeviceId: string;
  localFingerprint: string;
  peerFingerprint: string;
  combinedFingerprint: string;
  status: 'unverified' | 'verified' | 'changed';
  verifiedAt?: string | null;
};
