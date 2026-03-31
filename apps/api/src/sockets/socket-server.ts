import type { Server as HttpServer } from 'http';

import type { Socket } from 'socket.io';
import { Server } from 'socket.io';

import { corsOptions } from '../config/cors';
import { chatsService } from '../modules/chats/chats.service';
import { messagesService } from '../modules/messages/messages.service';
import { presenceService } from '../modules/presence/presence.service';
import { logger } from '../services/logger.service';
import { verifyAccessToken } from '../services/token.service';
import { chatRoom, SOCKET_EVENTS, userRoom } from './socket.constants';

type AuthenticatedSocket = Socket & {
  data: Socket['data'] & {
    userId: string;
  };
};

export const createSocketServer = (server: HttpServer) => {
  const io = new Server(server, {
    cors: corsOptions
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token as string | undefined;

      if (!token) {
        next(new Error('Socket authentication token is required'));
        return;
      }

      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      next();
    } catch (error) {
      next(error as Error);
    }
  });

  io.on(SOCKET_EVENTS.CONNECTION, async (socket) => {
    const authedSocket = socket as AuthenticatedSocket;
    const { userId } = authedSocket.data;

    authedSocket.join(userRoom(userId));
    await presenceService.handleConnected(io, userId, authedSocket.id);

    authedSocket.on(SOCKET_EVENTS.SETUP, () => {
      authedSocket.emit(SOCKET_EVENTS.SETUP, { connected: true, userId });
    });

    authedSocket.on(SOCKET_EVENTS.JOIN_CHAT, async ({ chatId }) => {
      await chatsService.assertMember(chatId, userId);
      authedSocket.join(chatRoom(chatId));
    });

    authedSocket.on(SOCKET_EVENTS.LEAVE_CHAT, ({ chatId }) => {
      authedSocket.leave(chatRoom(chatId));
    });

    authedSocket.on(SOCKET_EVENTS.TYPING_START, async ({ chatId }) => {
      await chatsService.assertMember(chatId, userId);
      authedSocket.to(chatRoom(chatId)).emit(SOCKET_EVENTS.TYPING_START, { chatId, userId });
    });

    authedSocket.on(SOCKET_EVENTS.TYPING_STOP, async ({ chatId }) => {
      await chatsService.assertMember(chatId, userId);
      authedSocket.to(chatRoom(chatId)).emit(SOCKET_EVENTS.TYPING_STOP, { chatId, userId });
    });

    authedSocket.on(SOCKET_EVENTS.SEND_MESSAGE, async (payload, callback) => {
      try {
        const message = await messagesService.sendMessage(userId, payload, io);
        callback?.({
          ok: true,
          message
        });
      } catch (error) {
        logger.error({ error }, 'Socket send-message failed');
        callback?.({
          ok: false,
          code: 'MESSAGE_SEND_FAILED',
          message: 'Unable to send message'
        });
        authedSocket.emit('socket-error', {
          code: 'MESSAGE_SEND_FAILED',
          message: 'Unable to send message'
        });
      }
    });

    authedSocket.on(SOCKET_EVENTS.MESSAGES_SEEN, async ({ chatId }) => {
      try {
        await messagesService.markMessagesSeen(userId, chatId, io);
      } catch (error) {
        logger.error({ error }, 'Socket messages-seen failed');
      }
    });

    authedSocket.on(SOCKET_EVENTS.SYNC_MISSED_EVENTS, async ({ chatId, after }, callback) => {
      try {
        const messages = await messagesService.syncMissedMessages(userId, chatId, after);
        callback?.({
          ok: true,
          messages
        });
      } catch (error) {
        logger.error({ error }, 'Socket sync-missed-events failed');
        callback?.({
          ok: false,
          code: 'SYNC_FAILED',
          message: 'Unable to sync missed events'
        });
      }
    });

    authedSocket.on('disconnect', async () => {
      await presenceService.handleDisconnected(io, userId, authedSocket.id);
    });
  });

  return io;
};
