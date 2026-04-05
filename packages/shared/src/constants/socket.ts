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
  SYNC_MISSED_EVENTS: 'sync-missed-events'
} as const;
