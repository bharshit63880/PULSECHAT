export const CALL_TYPES = ['audio', 'video'] as const;
export type CallType = (typeof CALL_TYPES)[number];

export const CALL_STATUSES = [
  'initiating',
  'ringing',
  'accepting',
  'connecting',
  'connected',
  'rejected',
  'cancelled',
  'busy',
  'missed',
  'ended',
  'failed',
] as const;
export type CallStatus = (typeof CALL_STATUSES)[number];

export const CALL_END_REASONS = [
  'completed',
  'rejected',
  'cancelled',
  'missed',
  'busy',
  'connection_failed',
  'permission_denied',
  'disconnected',
  'timeout',
] as const;
export type CallEndReason = (typeof CALL_END_REASONS)[number];

export type CallParticipant = { id: string; name: string; avatarUrl?: string | null };

export type CallDto = {
  id: string;
  chatId: string;
  caller: CallParticipant;
  recipient: CallParticipant;
  type: CallType;
  status: CallStatus;
  initiatedAt: string;
  answeredAt: string | null;
  endedAt: string | null;
  durationSeconds: number;
  endedBy: string | null;
  endReason: CallEndReason | null;
};

export type CallAck<T = Record<string, never>> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };
export type CallInitiatePayload = { chatId: string; type: CallType };
/**
 * WebRTC values cross the Socket.IO boundary as JSON.  Keeping these wire
 * shapes browser-neutral prevents the shared package from depending on DOM
 * globals at lint/runtime while remaining compatible with WebRTC APIs.
 */
export type CallSessionDescription = {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp?: string;
};

export type CallIceCandidate = {
  candidate: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
};

export type CallSignalPayload = {
  callId: string;
  description?: CallSessionDescription;
  candidate?: CallIceCandidate;
};
