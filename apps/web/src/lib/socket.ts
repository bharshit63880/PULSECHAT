import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

const SOCKET_CONNECT_TIMEOUT_MS = 6_000;

/**
 * Wait for a usable authenticated Socket.IO transport before emitting a durable
 * message event. A message queued while reconnecting must not be treated as
 * sent just because its attachment upload completed.
 */
export const ensureSocketConnected = (target: Socket, timeoutMs = SOCKET_CONNECT_TIMEOUT_MS) => {
  if (target.connected) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      globalThis.clearTimeout(timeout);
      target.off('connect', onConnect);
      target.off('connect_error', onConnectError);
    };

    const finish = (callback: () => void) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      callback();
    };

    const onConnect = () => finish(resolve);
    const onConnectError = () =>
      finish(() => reject(new Error('Secure connection could not be established')));
    const timeout = globalThis.setTimeout(
      () => finish(() => reject(new Error('Secure connection timed out'))),
      timeoutMs,
    );

    target.once('connect', onConnect);
    target.once('connect_error', onConnectError);

    if (!target.active) {
      target.connect();
    }
  });
};

export const getSocket = (token: string) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket'],
      auth: { token },
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
