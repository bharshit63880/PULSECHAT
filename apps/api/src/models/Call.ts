import { Schema, model } from 'mongoose';
import type { Types } from 'mongoose';

export type CallStatus = 'initiating' | 'ringing' | 'accepting' | 'connecting' | 'connected' | 'rejected' | 'cancelled' | 'busy' | 'missed' | 'ended' | 'failed';
export type CallEndReason = 'completed' | 'rejected' | 'cancelled' | 'missed' | 'busy' | 'connection_failed' | 'permission_denied' | 'disconnected' | 'timeout';

export interface ICall {
  chat: Types.ObjectId; caller: Types.ObjectId; recipient: Types.ObjectId; type: 'audio' | 'video'; status: CallStatus;
  initiatedAt: Date; answeredAt?: Date | null; endedAt?: Date | null; durationSeconds: number;
  endedBy?: Types.ObjectId | null; endReason?: CallEndReason | null;
}

const callSchema = new Schema<ICall>({
  chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
  caller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['audio', 'video'], required: true },
  status: { type: String, enum: ['initiating', 'ringing', 'accepting', 'connecting', 'connected', 'rejected', 'cancelled', 'busy', 'missed', 'ended', 'failed'], required: true },
  initiatedAt: { type: Date, default: Date.now }, answeredAt: { type: Date, default: null }, endedAt: { type: Date, default: null },
  durationSeconds: { type: Number, default: 0 }, endedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  endReason: { type: String, enum: ['completed', 'rejected', 'cancelled', 'missed', 'busy', 'connection_failed', 'permission_denied', 'disconnected', 'timeout'], default: null }
}, { timestamps: true });
callSchema.index({ chat: 1, initiatedAt: -1 });
callSchema.index({ caller: 1, recipient: 1, status: 1 });
export const CallModel = model<ICall>('Call', callSchema);
