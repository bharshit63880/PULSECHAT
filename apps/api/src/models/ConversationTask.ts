import { Schema, model } from 'mongoose';
import type { Types } from 'mongoose';

export interface IConversationTask {
  chat: Types.ObjectId;
  createdBy: Types.ObjectId;
  assignee?: Types.ObjectId | null;
  status: 'open' | 'completed';
  dueAt?: Date | null;
  content?: string | null;
  encryptedContent?: { ciphertext: string; iv: string; digest: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

const conversationTaskSchema = new Schema<IConversationTask>(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['open', 'completed'], default: 'open' },
    dueAt: { type: Date, default: null },
    content: { type: String, default: null, trim: true },
    encryptedContent: {
      ciphertext: { type: String },
      iv: { type: String },
      digest: { type: String },
    },
  },
  { timestamps: true },
);

conversationTaskSchema.index({ chat: 1, status: 1, updatedAt: -1 });

export const ConversationTaskModel = model<IConversationTask>(
  'ConversationTask',
  conversationTaskSchema,
);
