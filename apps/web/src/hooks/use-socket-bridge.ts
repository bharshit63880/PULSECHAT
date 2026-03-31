import type { ChatDto, MessageDto, PaginationMeta } from '@chat-app/shared';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { messagesApi } from '@/features/messages/api';
import { disconnectSocket, getSocket } from '@/lib/socket';
import { SOCKET_EVENTS } from '@/lib/socket-events';
import { useAuthStore } from '@/store/auth-store';

type MessageCache = {
  data: MessageDto[];
  meta: PaginationMeta;
};

const updateChats = (
  chats: ChatDto[] | undefined,
  chatId: string,
  updater: (chat: ChatDto | undefined) => ChatDto
) => {
  const current = chats ?? [];
  const existing = current.find((chat) => chat.id === chatId);
  const next = updater(existing);
  const remaining = current.filter((chat) => chat.id !== chatId);
  return [next, ...remaining];
};

const appendMessage = (cache: MessageCache | undefined, incoming: MessageDto): MessageCache => {
  const current = cache?.data ?? [];
  const matchedExisting = current.find(
    (message) =>
      message.id === incoming.id ||
      (Boolean(incoming.clientMessageId) &&
        (message.id === incoming.clientMessageId || message.clientMessageId === incoming.clientMessageId))
  );

  if (matchedExisting) {
    return {
      data: current.map((message) => (message.id === matchedExisting.id ? { ...incoming } : message)),
      meta: cache?.meta ?? { page: 1, limit: 40, total: current.length, totalPages: 1 }
    };
  }

  const nextData = [...current, incoming];

  return {
    data: nextData,
    meta: cache?.meta ?? { page: 1, limit: 40, total: nextData.length, totalPages: 1 }
  };
};

export const useSocketBridge = (activeChat: ChatDto | null) => {
  const token = useAuthStore((state) => state.token);
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const previousChatIdRef = useRef<string | null>(null);
  const [typingUserIds, setTypingUserIds] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!token) {
      disconnectSocket();
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const socket = getSocket(token);

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(SOCKET_EVENTS.SETUP);

    const onReceiveMessage = async ({ chatId, message }: { chatId: string; message: MessageDto }) => {
      queryClient.setQueryData<MessageCache>(['messages', chatId], (current) => appendMessage(current, message));
      queryClient.setQueryData<ChatDto[]>(['chats'], (current) =>
        updateChats(current, chatId, (chat) => ({
          ...(chat ?? {
            id: chatId,
            isGroupChat: false,
            encryptionMode: 'e2ee-direct',
            name: null,
            participants: [message.sender],
            admins: [],
            latestMessage: message,
            createdBy: message.sender.id,
            disappearingModeSeconds: 0,
            unreadCount: 0,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt
          }),
          latestMessage: message,
          updatedAt: message.updatedAt,
          unreadCount:
            chatId === activeChat?.id || message.sender.id === currentUser?.id
              ? 0
              : (chat?.unreadCount ?? 0) + 1
        }))
      );

      if (chatId === activeChat?.id && message.sender.id !== currentUser?.id) {
        await messagesApi.markSeen(chatId);
        socket.emit(SOCKET_EVENTS.MESSAGES_SEEN, { chatId });
      }
    };

    const onMessageAck = ({ chatId, message }: { chatId: string; message: MessageDto }) => {
      queryClient.setQueryData<MessageCache>(['messages', chatId], (current) => appendMessage(current, message));
    };

    const onPresenceOnline = ({ userId }: { userId: string }) => {
      queryClient.setQueryData<ChatDto[]>(['chats'], (current) =>
        (current ?? []).map((chat) => ({
          ...chat,
          participants: chat.participants.map((participant) =>
            participant.id === userId ? { ...participant, isOnline: true, lastSeen: null } : participant
          )
        }))
      );
    };

    const onPresenceOffline = ({ userId, lastSeen }: { userId: string; lastSeen: string }) => {
      queryClient.setQueryData<ChatDto[]>(['chats'], (current) =>
        (current ?? []).map((chat) => ({
          ...chat,
          participants: chat.participants.map((participant) =>
            participant.id === userId ? { ...participant, isOnline: false, lastSeen } : participant
          )
        }))
      );
    };

    const onTypingStart = ({ chatId, userId }: { chatId: string; userId: string }) => {
      setTypingUserIds((current) => ({
        ...current,
        [chatId]: [...new Set([...(current[chatId] ?? []), userId])]
      }));
    };

    const onTypingStop = ({ chatId, userId }: { chatId: string; userId: string }) => {
      setTypingUserIds((current) => ({
        ...current,
        [chatId]: (current[chatId] ?? []).filter((id) => id !== userId)
      }));
    };

    const onMessagesSeen = ({
      chatId,
      userId,
      messageIds
    }: {
      chatId: string;
      userId: string;
      messageIds: string[];
    }) => {
      queryClient.setQueryData<MessageCache>(['messages', chatId], (current) => ({
        data: (current?.data ?? []).map((message) =>
          messageIds.includes(message.id) && !message.seenBy.some((receipt) => receipt.userId === userId)
            ? {
                ...message,
                status: 'seen',
                seenBy: [...message.seenBy, { userId, seenAt: new Date().toISOString() }]
              }
            : message
        ),
        meta: current?.meta ?? { page: 1, limit: 40, total: 0, totalPages: 1 }
      }));
    };

    const onConnect = () => {
      if (!activeChat) {
        return;
      }

      const cached = queryClient.getQueryData<MessageCache>(['messages', activeChat.id]);
      const after = cached?.data.at(-1)?.createdAt;

      if (!after) {
        return;
      }

      socket.emit(
        SOCKET_EVENTS.SYNC_MISSED_EVENTS,
        { chatId: activeChat.id, after },
        (payload: { ok: boolean; messages?: MessageDto[] }) => {
          if (!payload.ok || !payload.messages) {
            return;
          }

          payload.messages.forEach((message) => {
            queryClient.setQueryData<MessageCache>(['messages', activeChat.id], (current) =>
              appendMessage(current, message)
            );
          });
        }
      );
    };

    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, onReceiveMessage);
    socket.on(SOCKET_EVENTS.MESSAGE_ACK, onMessageAck);
    socket.on(SOCKET_EVENTS.PRESENCE_ONLINE, onPresenceOnline);
    socket.on(SOCKET_EVENTS.PRESENCE_OFFLINE, onPresenceOffline);
    socket.on(SOCKET_EVENTS.TYPING_START, onTypingStart);
    socket.on(SOCKET_EVENTS.TYPING_STOP, onTypingStop);
    socket.on(SOCKET_EVENTS.MESSAGES_SEEN, onMessagesSeen);
    socket.on('connect', onConnect);

    return () => {
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, onReceiveMessage);
      socket.off(SOCKET_EVENTS.MESSAGE_ACK, onMessageAck);
      socket.off(SOCKET_EVENTS.PRESENCE_ONLINE, onPresenceOnline);
      socket.off(SOCKET_EVENTS.PRESENCE_OFFLINE, onPresenceOffline);
      socket.off(SOCKET_EVENTS.TYPING_START, onTypingStart);
      socket.off(SOCKET_EVENTS.TYPING_STOP, onTypingStop);
      socket.off(SOCKET_EVENTS.MESSAGES_SEEN, onMessagesSeen);
      socket.off('connect', onConnect);
    };
  }, [activeChat, currentUser?.id, queryClient, token]);

  useEffect(() => {
    if (!token || !activeChat) {
      return;
    }

    const socket = getSocket(token);

    if (previousChatIdRef.current && previousChatIdRef.current !== activeChat.id) {
      socket.emit(SOCKET_EVENTS.LEAVE_CHAT, { chatId: previousChatIdRef.current });
    }

    previousChatIdRef.current = activeChat.id;
    socket.emit(SOCKET_EVENTS.JOIN_CHAT, { chatId: activeChat.id });
  }, [activeChat, token]);

  return {
    typingUserIds: activeChat ? typingUserIds[activeChat.id] ?? [] : []
  };
};
