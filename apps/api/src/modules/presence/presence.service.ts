import type { Server } from 'socket.io';

import { ChatModel } from '../../models/Chat';
import { UserModel } from '../../models/User';
import { SOCKET_EVENTS, userRoom } from '../../sockets/socket.constants';

const userSockets = new Map<string, Set<string>>();

const getPresenceAudience = async (userId: string) => {
  const chats = await ChatModel.find({ participants: userId }).select('participants');
  const audience = new Set<string>();

  chats.forEach((chat) => {
    chat.participants.forEach((participant) => {
      const participantId = participant.toString();
      if (participantId !== userId) {
        audience.add(participantId);
      }
    });
  });

  return [...audience];
};

export const presenceService = {
  isUserOnline(userId: string) {
    return Boolean(userSockets.get(userId)?.size);
  },

  registerSocket(userId: string, socketId: string) {
    const sockets = userSockets.get(userId) ?? new Set<string>();
    sockets.add(socketId);
    userSockets.set(userId, sockets);
    return sockets.size;
  },

  async handleConnected(io: Server, userId: string, socketId: string) {
    const count = this.registerSocket(userId, socketId);

    if (count === 1) {
      await UserModel.findByIdAndUpdate(userId, { isOnline: true, lastSeen: null });
      const audience = await getPresenceAudience(userId);
      audience.forEach((participantId) => {
        io.to(userRoom(participantId)).emit(SOCKET_EVENTS.PRESENCE_ONLINE, { userId });
      });
    }
  },

  async handleDisconnected(io: Server, userId: string, socketId: string) {
    const sockets = userSockets.get(userId);

    if (!sockets) {
      return;
    }

    sockets.delete(socketId);

    if (sockets.size > 0) {
      return;
    }

    userSockets.delete(userId);

    const lastSeen = new Date();
    await UserModel.findByIdAndUpdate(userId, { isOnline: false, lastSeen });
    const audience = await getPresenceAudience(userId);

    audience.forEach((participantId) => {
      io.to(userRoom(participantId)).emit(SOCKET_EVENTS.PRESENCE_OFFLINE, {
        userId,
        lastSeen: lastSeen.toISOString()
      });
    });
  }
};
