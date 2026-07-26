import type { Server as HttpServer } from 'http';

import type { Socket } from 'socket.io';
import { Server } from 'socket.io';

import { corsOptions } from '../config/cors';
import { chatsService } from '../modules/chats/chats.service';
import { callsService } from '../modules/calls/calls.service';
import { messagesService } from '../modules/messages/messages.service';
import { presenceService } from '../modules/presence/presence.service';
import { cacheService } from '../services/cache.service';
import { logger } from '../services/logger.service';
import { verifyAccessToken } from '../services/token.service';
import { chatRoom, SOCKET_EVENTS, userRoom } from './socket.constants';

type AuthenticatedSocket = Socket & {
  data: Socket['data'] & {
    userId: string;
  };
};

type ChatEventPayload = {
  chatId: string;
};

type SocketFailure = {
  ok: false;
  error: {
    code: 'CHAT_ACCESS_DENIED';
    message: string;
  };
};

type SocketSuccess = {
  ok: true;
};

type SocketAcknowledgement = (response: SocketSuccess | SocketFailure) => void;

const chatAccessFailure = (): SocketFailure => ({
  ok: false,
  error: {
    code: 'CHAT_ACCESS_DENIED',
    message: 'You do not have access to this chat.'
  }
});

export const createSocketServer = (server: HttpServer) => {
  const io = new Server(server, {
    cors: corsOptions
  });
  const socketAdapter = cacheService.createSocketAdapter();

  if (socketAdapter) {
    io.adapter(socketAdapter);
    logger.info('Socket.io Redis adapter enabled');
  }

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

    authedSocket.on(SOCKET_EVENTS.CALL_INITIATE, async (payload: { chatId: string; type: 'audio' | 'video' }, callback) => {
      try {
        if (!['audio', 'video'].includes(payload.type)) throw new Error('Invalid call type');
        const call = await callsService.initiate(userId, payload.chatId, payload.type);
        const recipientId = String(call.recipient);
        const event = { callId: call.id, chatId: String(call.chat), callerId: userId, type: call.type, initiatedAt: call.initiatedAt };
        io.to(userRoom(recipientId)).emit(SOCKET_EVENTS.CALL_INCOMING, event);
        callback?.({ ok: true, data: { callId: call.id } });
      } catch { callback?.({ ok: false, error: { code: 'CALL_INITIATE_FAILED', message: 'Unable to start this call.' } }); }
    });

    authedSocket.on(SOCKET_EVENTS.CALL_ACCEPT, async ({ callId }: { callId: string }, callback) => {
      try { const call = await callsService.transition(callId, userId, 'accepting'); io.to(userRoom(String(call.caller))).emit(SOCKET_EVENTS.CALL_ACCEPTED, { callId }); callback?.({ ok: true, data: {} }); }
      catch { callback?.({ ok: false, error: { code: 'CALL_ACCEPT_FAILED', message: 'Unable to accept this call.' } }); }
    });

    const forwardSignal = (eventName: string, action: 'offer' | 'answer' | 'ice') => {
      authedSocket.on(eventName, async (payload: { callId: string; description?: unknown; candidate?: unknown }, callback) => {
        try {
          if (!payload.callId || (action !== 'ice' && !payload.description) || (action === 'ice' && !payload.candidate)) throw new Error('Invalid signal');
          const { targetUserId } = await callsService.getSignalTarget(payload.callId, userId, action);
          io.to(userRoom(targetUserId)).emit(eventName, { callId: payload.callId, ...(action === 'ice' ? { candidate: payload.candidate } : { description: payload.description }) });
          callback?.({ ok: true, data: {} });
        } catch { callback?.({ ok: false, error: { code: 'CALL_SIGNALING_DENIED', message: 'This signaling action is not allowed.' } }); }
      });
    };
    forwardSignal(SOCKET_EVENTS.CALL_OFFER, 'offer');
    forwardSignal(SOCKET_EVENTS.CALL_ANSWER, 'answer');
    forwardSignal(SOCKET_EVENTS.CALL_ICE_CANDIDATE, 'ice');

    for (const [eventName, status, reason] of [[SOCKET_EVENTS.CALL_REJECT, 'rejected', 'rejected'], [SOCKET_EVENTS.CALL_CANCEL, 'cancelled', 'cancelled'], [SOCKET_EVENTS.CALL_END, 'ended', 'completed']] as const) {
      authedSocket.on(eventName, async ({ callId }: { callId: string }, callback) => { try { const call = await callsService.transition(callId, userId, status, reason); io.to(userRoom(String(call.caller))).to(userRoom(String(call.recipient))).emit(SOCKET_EVENTS.CALL_ENDED, { callId, status, reason }); callback?.({ ok: true, data: {} }); } catch { callback?.({ ok: false, error: { code: 'CALL_STATE_FAILED', message: 'Unable to update this call.' } }); } });
    }

    authedSocket.on(SOCKET_EVENTS.JOIN_CHAT, async ({ chatId }: ChatEventPayload, callback?: SocketAcknowledgement) => {
      try {
        await chatsService.assertMember(chatId, userId);
        authedSocket.join(chatRoom(chatId));
        callback?.({ ok: true });
      } catch (error) {
        logger.warn({ error, chatId, userId }, 'Socket join-chat access denied');
        const failure = chatAccessFailure();
        callback?.(failure);
        authedSocket.emit('socket-error', failure.error);
      }
    });

    authedSocket.on(SOCKET_EVENTS.LEAVE_CHAT, ({ chatId }) => {
      authedSocket.leave(chatRoom(chatId));
    });

    authedSocket.on(SOCKET_EVENTS.TYPING_START, async ({ chatId }: ChatEventPayload, callback?: SocketAcknowledgement) => {
      try {
        await chatsService.assertMember(chatId, userId);
        authedSocket.to(chatRoom(chatId)).emit(SOCKET_EVENTS.TYPING_START, { chatId, userId });
        callback?.({ ok: true });
      } catch (error) {
        logger.warn({ error, chatId, userId }, 'Socket typing-start access denied');
        const failure = chatAccessFailure();
        callback?.(failure);
        authedSocket.emit('socket-error', failure.error);
      }
    });

    authedSocket.on(SOCKET_EVENTS.TYPING_STOP, async ({ chatId }: ChatEventPayload, callback?: SocketAcknowledgement) => {
      try {
        await chatsService.assertMember(chatId, userId);
        authedSocket.to(chatRoom(chatId)).emit(SOCKET_EVENTS.TYPING_STOP, { chatId, userId });
        callback?.({ ok: true });
      } catch (error) {
        logger.warn({ error, chatId, userId }, 'Socket typing-stop access denied');
        const failure = chatAccessFailure();
        callback?.(failure);
        authedSocket.emit('socket-error', failure.error);
      }
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
