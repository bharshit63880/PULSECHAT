import type {
  ChatDto,
  ChatNotificationDto,
  DeviceSessionDto,
  MessageDto,
  MessageSearchResultDto,
  ReplyPreview,
  UserSummary
} from '@chat-app/shared';

const toIso = (value: Date | string | null | undefined) => (value ? new Date(value).toISOString() : null);

const toId = (value: { _id?: unknown; id?: unknown } | string | null | undefined) => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value.id === 'string') {
    return value.id;
  }

  return String(value._id ?? '');
};

export const mapUserSummary = (user: any): UserSummary => ({
  id: toId(user),
  name: user.name,
  username: user.username,
  email: user.email,
  avatarUrl: user.avatarUrl ?? null,
  bio: user.bio ?? null,
  isEmailVerified: Boolean(user.isEmailVerified),
  authProvider: 'local',
  isOnline: Boolean(user.isOnline),
  lastSeen: toIso(user.lastSeen),
  createdAt: new Date(user.createdAt).toISOString(),
  updatedAt: new Date(user.updatedAt).toISOString()
});

const mapReplyPreview = (message: any): ReplyPreview | null => {
  if (!message) {
    return null;
  }

  return {
    id: toId(message),
    type: message.type,
    sender: {
      id: toId(message.sender),
      name: message.sender.name,
      username: message.sender.username
    },
    createdAt: new Date(message.createdAt).toISOString()
  };
};

export const mapMessageDto = (message: any): MessageDto => ({
  id: toId(message),
  clientMessageId: message.clientMessageId ?? null,
  chatId: toId(message.chat),
  sender: mapUserSummary(message.sender),
  senderDeviceId: message.senderDeviceId,
  recipientDeviceId: message.recipientDeviceId,
  type: message.type,
  ciphertext: message.ciphertext,
  encryptionVersion: message.encryptionVersion,
  iv: message.iv,
  digest: message.digest,
  attachment: message.attachment?.url
    ? {
        url: message.attachment.url,
        publicId: message.attachment.publicId ?? null,
        fileName: message.attachment.fileName,
        mimeType: message.attachment.mimeType,
        size: message.attachment.size,
        isEncrypted: Boolean(message.attachment.isEncrypted),
        encryption: message.attachment.encryption
          ? {
              algorithm: 'AES-GCM',
              wrappedFileKey: message.attachment.encryption.wrappedFileKey,
              iv: message.attachment.encryption.iv,
              digest: message.attachment.encryption.digest
            }
          : null
      }
    : null,
  replyTo: mapReplyPreview(message.replyTo),
  reactions: (message.reactions ?? []).map((reaction: any) => ({
    emoji: reaction.emoji,
    userIds: (reaction.userIds ?? []).map((userId: any) => toId(userId))
  })),
  seenBy: (message.seenBy ?? []).map((receipt: any) => ({
    userId: toId(receipt.user),
    seenAt: new Date(receipt.seenAt).toISOString()
  })),
  status: message.status ?? 'sent',
  expiresAt: toIso(message.expiresAt),
  edited: Boolean(message.edited),
  createdAt: new Date(message.createdAt).toISOString(),
  updatedAt: new Date(message.updatedAt).toISOString()
});

export const mapMessageSearchResultDto = (message: any, previewText: string, matchSource: MessageSearchResultDto['matchSource']): MessageSearchResultDto => ({
  messageId: toId(message),
  chatId: toId(message.chat),
  type: message.type,
  previewText,
  matchSource,
  attachmentName: message.attachment?.fileName ?? null,
  sender: {
    id: toId(message.sender),
    name: message.sender.name,
    username: message.sender.username,
    avatarUrl: message.sender.avatarUrl ?? null
  },
  createdAt: new Date(message.createdAt).toISOString()
});

export const mapNotificationDto = (message: any, chat: any, actor: any): ChatNotificationDto => ({
  id: `${toId(chat)}:${toId(message)}`,
  chatId: toId(chat),
  title: chat.isGroupChat ? chat.name ?? actor.name : actor.name,
  body: message.attachment?.fileName
    ? `Shared ${message.attachment.fileName}`
    : message.type === 'text'
      ? 'Sent a new secure message'
      : `Sent a ${message.type}`,
  sender: {
    id: toId(actor),
    name: actor.name,
    username: actor.username,
    avatarUrl: actor.avatarUrl ?? null
  },
  messageId: toId(message),
  createdAt: new Date(message.createdAt).toISOString()
});

export const mapChatDto = (chat: any, unreadCount: number): ChatDto => ({
  id: toId(chat),
  isGroupChat: Boolean(chat.isGroupChat),
  encryptionMode: chat.encryptionMode ?? 'e2ee-direct',
  name: chat.name ?? null,
  participants: (chat.participants ?? []).map(mapUserSummary),
  admins: (chat.admins ?? []).map((admin: any) => toId(admin)),
  latestMessage: chat.latestMessage ? mapMessageDto(chat.latestMessage) : null,
  createdBy: toId(chat.createdBy),
  disappearingModeSeconds: chat.disappearingModeSeconds ?? 0,
  unreadCount,
  createdAt: new Date(chat.createdAt).toISOString(),
  updatedAt: new Date(chat.updatedAt).toISOString()
});

export const mapDeviceSessionDto = (session: any, currentSessionId?: string): DeviceSessionDto => ({
  id: toId(session),
  userId: toId(session.user),
  deviceId: session.deviceId,
  label: session.label,
  platform: session.platform ?? null,
  userAgent: session.userAgent ?? null,
  appVersion: session.appVersion ?? null,
  publicIdentityKey: session.publicIdentityKey,
  publicAgreementKey: session.publicAgreementKey,
  fingerprint: session.fingerprint,
  isCurrent: toId(session) === currentSessionId,
  createdAt: new Date(session.createdAt).toISOString(),
  lastActiveAt: new Date(session.lastActiveAt).toISOString(),
  revokedAt: toIso(session.revokedAt)
});
