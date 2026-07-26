import { io, type Socket } from 'socket.io-client';

import { SOCKET_EVENTS } from '@chat-app/shared';

import { mobileEnv } from '@/lib/env';

let socket: Socket | null = null;

export const getSocket = (token: string) => {
  if (!socket) {
    socket = io(mobileEnv.socketUrl, {
      auth: { token },
      transports: ['websocket']
    });
  } else {
    socket.auth = { token };
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export { SOCKET_EVENTS };
