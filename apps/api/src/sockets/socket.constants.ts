import { SOCKET_EVENTS as SHARED_SOCKET_EVENTS } from '@chat-app/shared';

export const SOCKET_EVENTS = SHARED_SOCKET_EVENTS;

export const userRoom = (userId: string) => `user:${userId}`;
export const chatRoom = (chatId: string) => `chat:${chatId}`;
