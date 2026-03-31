import type { AuthUser } from './user';
import type { DeviceSessionDto } from './device';

export type AuthResponseDto = {
  user: AuthUser;
  token: string;
  session: Pick<DeviceSessionDto, 'deviceId' | 'label' | 'isCurrent' | 'publicIdentityKey' | 'publicAgreementKey' | 'fingerprint'>;
};

export type EmailVerificationResultDto = {
  verified: boolean;
  user: AuthUser;
};

export type ResendVerificationResultDto = {
  sent: boolean;
  email: string;
};
