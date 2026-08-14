import { Schema, model } from 'mongoose';
import type { Types } from 'mongoose';

export interface IConversationDecision {
  chat: Types.ObjectId;
  createdBy: Types.ObjectId;
  status: 'proposed' | 'final';
  content?: string | null;
  encryptedContent?: { ciphertext: string; iv: string; digest: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

const conversationDecisionSchema = new Schema<IConversationDecision>(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['proposed', 'final'], default: 'proposed' },
    content: { type: String, default: null, trim: true },
    encryptedContent: {
      ciphertext: { type: String },
      iv: { type: String },
      digest: { type: String },
    },
  },
  { timestamps: true },
);

conversationDecisionSchema.index({ chat: 1, status: 1, updatedAt: -1 });

export const ConversationDecisionModel = model<IConversationDecision>(
  'ConversationDecision',
  conversationDecisionSchema,
);
