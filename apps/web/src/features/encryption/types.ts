import type { DeviceRegistrationDto } from '@chat-app/shared';

export type LocalDeviceRecord = DeviceRegistrationDto & {
  identityPrivateKey: CryptoKey;
  agreementPrivateKey: CryptoKey;
};

export type DecryptedMessageRecord = {
  messageId: string;
  userId: string;
  chatId: string;
  text: string;
  attachmentName?: string | null;
  createdAt: string;
};

export type LocalSearchHit = {
  messageId: string;
  chatId: string;
  text: string;
  createdAt: string;
};
