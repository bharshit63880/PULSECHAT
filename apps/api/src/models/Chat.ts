import { Schema, model } from 'mongoose';
import type { Types } from 'mongoose';

export interface IChat {
  isGroupChat: boolean;
  encryptionMode: 'e2ee-direct' | 'server-group';
  name?: string | null;
  participants: Types.ObjectId[];
  admins: Types.ObjectId[];
  latestMessage?: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  disappearingModeSeconds: number;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    isGroupChat: { type: Boolean, default: false },
    encryptionMode: { type: String, enum: ['e2ee-direct', 'server-group'], default: 'e2ee-direct' },
    name: { type: String, default: null, trim: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    admins: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    latestMessage: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    disappearingModeSeconds: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

chatSchema.index({ participants: 1 });
chatSchema.index({ participants: 1, lastActivityAt: -1 });
chatSchema.index({ updatedAt: -1 });

export const ChatModel = model<IChat>('Chat', chatSchema);
