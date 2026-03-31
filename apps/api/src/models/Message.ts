import { Schema, model } from 'mongoose';
import type { Types } from 'mongoose';

export interface IMessageSeen {
  user: Types.ObjectId;
  seenAt: Date;
}

export interface IMessageReaction {
  emoji: string;
  userIds: Types.ObjectId[];
}

export interface IMessageAttachment {
  url: string;
  publicId?: string | null;
  fileName: string;
  mimeType: string;
  size: number;
  isEncrypted: boolean;
  encryption?: {
    algorithm: 'AES-GCM';
    wrappedFileKey: string;
    iv: string;
    digest: string;
  } | null;
}

export interface IMessage {
  chat: Types.ObjectId;
  sender: Types.ObjectId;
  senderDeviceId: string;
  recipientDeviceId: string;
  clientMessageId?: string | null;
  type: 'text' | 'image' | 'file' | 'gif' | 'sticker';
  ciphertext: string;
  encryptionVersion: string;
  iv: string;
  digest: string;
  attachment?: IMessageAttachment | null;
  replyTo?: Types.ObjectId | null;
  reactions: IMessageReaction[];
  status: 'sent' | 'delivered' | 'seen';
  seenBy: IMessageSeen[];
  deletedFor: Types.ObjectId[];
  expiresAt?: Date | null;
  edited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderDeviceId: { type: String, required: true },
    recipientDeviceId: { type: String, required: true },
    clientMessageId: { type: String, default: null },
    type: { type: String, enum: ['text', 'image', 'file', 'gif', 'sticker'], required: true },
    ciphertext: { type: String, required: true },
    encryptionVersion: { type: String, required: true, default: 'dm-e2ee-v1' },
    iv: { type: String, required: true },
    digest: { type: String, required: true },
    attachment: {
      url: { type: String },
      publicId: { type: String, default: null },
      fileName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      isEncrypted: { type: Boolean, default: true },
      encryption: {
        algorithm: { type: String, default: 'AES-GCM' },
        wrappedFileKey: { type: String },
        iv: { type: String },
        digest: { type: String }
      }
    },
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
    reactions: [
      {
        emoji: { type: String, required: true },
        userIds: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }]
      }
    ],
    status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' },
    seenBy: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        seenAt: { type: Date, required: true }
      }
    ],
    deletedFor: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    expiresAt: { type: Date, default: null },
    edited: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ clientMessageId: 1 }, { unique: true, sparse: true });
messageSchema.index({ expiresAt: 1 });

export const MessageModel = model<IMessage>('Message', messageSchema);
