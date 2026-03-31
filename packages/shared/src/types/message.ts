import type { UserSummary } from './user';

export type MessageType = 'text' | 'image' | 'file' | 'gif' | 'sticker';
export type MessageDeliveryState = 'sent' | 'delivered' | 'seen';

export type AttachmentDto = {
  url: string;
  publicId?: string | null;
  fileName: string;
  mimeType: string;
  size: number;
  isEncrypted?: boolean;
  encryption?: {
    algorithm: 'AES-GCM';
    wrappedFileKey: string;
    iv: string;
    digest: string;
  } | null;
};

export type ReplyPreview = {
  id: string;
  type: MessageType;
  sender: Pick<UserSummary, 'id' | 'name' | 'username'>;
  createdAt?: string;
};

export type SeenReceipt = {
  userId: string;
  seenAt: string;
};

export type MessageReaction = {
  emoji: string;
  userIds: string[];
};

export type MessageDto = {
  id: string;
  clientMessageId?: string | null;
  chatId: string;
  sender: UserSummary;
  senderDeviceId: string;
  recipientDeviceId: string;
  type: MessageType;
  ciphertext: string;
  encryptionVersion: string;
  iv: string;
  digest: string;
  attachment?: AttachmentDto | null;
  replyTo?: ReplyPreview | null;
  reactions: MessageReaction[];
  status: MessageDeliveryState;
  seenBy: SeenReceipt[];
  expiresAt?: string | null;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
};
