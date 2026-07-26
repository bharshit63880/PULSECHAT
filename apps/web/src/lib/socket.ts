import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (token: string) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket'],
      auth: { token }
    });
  } else {
    socket.auth = { token };
  }

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
