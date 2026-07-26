export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  SETUP: 'setup',
  JOIN_CHAT: 'join-chat',
  LEAVE_CHAT: 'leave-chat',
  SEND_MESSAGE: 'send-message',
  RECEIVE_MESSAGE: 'receive-message',
  MESSAGE_ACK: 'message-ack',
  NOTIFICATION_CREATED: 'notification-created',
  TYPING_START: 'typing-start',
  TYPING_STOP: 'typing-stop',
  MESSAGES_SEEN: 'messages-seen',
  PRESENCE_ONLINE: 'presence-online',
  PRESENCE_OFFLINE: 'presence-offline',
  SYNC_MISSED_EVENTS: 'sync-missed-events',
  CALL_INITIATE: 'call:initiate', CALL_ACCEPT: 'call:accept', CALL_REJECT: 'call:reject', CALL_CANCEL: 'call:cancel', CALL_OFFER: 'call:offer', CALL_ANSWER: 'call:answer', CALL_ICE_CANDIDATE: 'call:ice-candidate', CALL_END: 'call:end', CALL_INCOMING: 'call:incoming', CALL_ACCEPTED: 'call:accepted', CALL_ENDED: 'call:ended'
} as const;
