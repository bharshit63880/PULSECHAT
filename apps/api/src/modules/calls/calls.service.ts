import { AppError } from '../../errors/AppError';
import { CallModel, type CallEndReason, type CallStatus } from '../../models/Call';
import { ChatModel } from '../../models/Chat';
import { cacheService } from '../../services/cache.service';

const ACTIVE_TTL_SECONDS = 75;
const activeKey = (userId: string) => `call:active:${userId}`;
const terminal = new Set<CallStatus>(['rejected', 'cancelled', 'busy', 'missed', 'ended', 'failed']);

export const callsService = {
  async initiate(callerId: string, chatId: string, type: 'audio' | 'video') {
    const chat = await ChatModel.findOne({ _id: chatId, participants: callerId, isGroupChat: false });
    if (!chat || chat.participants.length !== 2) throw new AppError('Calls are only available in direct chats', 403, 'CALL_ACCESS_DENIED');
    const recipientId = chat.participants.map(String).find((id) => id !== callerId);
    if (!recipientId) throw new AppError('You cannot call yourself', 400, 'CALL_SELF_NOT_ALLOWED');
    if (await cacheService.getJson<string>(activeKey(callerId)) || await cacheService.getJson<string>(activeKey(recipientId))) {
      throw new AppError('One participant is already in a call', 409, 'CALL_BUSY');
    }
    const call = await CallModel.create({ chat: chat.id, caller: callerId, recipient: recipientId, type, status: 'ringing' });
    await Promise.all([cacheService.setJson(activeKey(callerId), call.id, ACTIVE_TTL_SECONDS), cacheService.setJson(activeKey(recipientId), call.id, ACTIVE_TTL_SECONDS)]);
    return call;
  },
  async getForParticipant(callId: string, userId: string) {
    const call = await CallModel.findOne({ _id: callId, $or: [{ caller: userId }, { recipient: userId }] });
    if (!call) throw new AppError('Call not found', 404, 'CALL_NOT_FOUND');
    return call;
  },
  async getSignalTarget(callId: string, userId: string, action: 'offer' | 'answer' | 'ice') {
    const call = await this.getForParticipant(callId, userId);
    if (terminal.has(call.status) || !['ringing', 'accepting', 'connecting', 'connected'].includes(call.status)) {
      throw new AppError('This call is not available for signaling', 409, 'CALL_SIGNALING_DENIED');
    }
    if (action === 'offer' && String(call.caller) !== userId) throw new AppError('Only the caller can send an offer', 403, 'CALL_SIGNALING_DENIED');
    if (action === 'answer' && String(call.recipient) !== userId) throw new AppError('Only the recipient can send an answer', 403, 'CALL_SIGNALING_DENIED');
    return { call, targetUserId: String(call.caller) === userId ? String(call.recipient) : String(call.caller) };
  },
  async transition(callId: string, userId: string, status: CallStatus, reason?: CallEndReason) {
    const call = await this.getForParticipant(callId, userId);
    if (terminal.has(call.status)) throw new AppError('This call has already ended', 409, 'CALL_INVALID_STATE');
    if ((status === 'accepting' || status === 'connected') && String(call.recipient) !== userId) throw new AppError('Only the recipient can accept', 403, 'CALL_ACCESS_DENIED');
    const now = new Date();
    call.status = status;
    if (status === 'accepting') call.answeredAt = now;
    if (terminal.has(status)) { call.endedAt = now; call.endedBy = userId as never; call.endReason = reason ?? 'completed'; call.durationSeconds = call.answeredAt ? Math.max(0, Math.floor((now.getTime() - call.answeredAt.getTime()) / 1000)) : 0; await Promise.all([cacheService.deleteKey(activeKey(String(call.caller))), cacheService.deleteKey(activeKey(String(call.recipient)))]); }
    else await Promise.all([cacheService.setJson(activeKey(String(call.caller)), call.id, ACTIVE_TTL_SECONDS), cacheService.setJson(activeKey(String(call.recipient)), call.id, ACTIVE_TTL_SECONDS)]);
    return call.save();
  }
};
