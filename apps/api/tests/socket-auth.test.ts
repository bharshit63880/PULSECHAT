import http from 'node:http';
import type { AddressInfo } from 'node:net';

import { io } from 'socket.io-client';
import { afterEach, describe, expect, it, vi } from 'vitest';

const assertMemberMock = vi.fn();
const getSignalTargetMock = vi.fn();
const handleConnectedMock = vi.fn();
const handleDisconnectedMock = vi.fn();
const sendMessageMock = vi.fn();

vi.mock('../src/services/cache.service', () => ({
  cacheService: {
    createSocketAdapter: vi.fn(() => null)
  }
}));

vi.mock('../src/modules/chats/chats.service', () => ({
  chatsService: {
    assertMember: assertMemberMock
  }
}));

vi.mock('../src/modules/messages/messages.service', () => ({
  messagesService: {
    sendMessage: sendMessageMock
  }
}));

vi.mock('../src/modules/calls/calls.service', () => ({
  callsService: {
    getSignalTarget: getSignalTargetMock
  }
}));

vi.mock('../src/modules/notifications/notifications.service', () => ({
  notificationsService: {}
}));

vi.mock('../src/modules/presence/presence.service', () => ({
  presenceService: {
    handleConnected: handleConnectedMock,
    handleDisconnected: handleDisconnectedMock,
    isUserOnline: vi.fn()
  }
}));

describe('Socket.IO chat authorization', () => {
  const servers: http.Server[] = [];

  afterEach(async () => {
    assertMemberMock.mockReset();
    getSignalTargetMock.mockReset();
    handleConnectedMock.mockReset();
    handleDisconnectedMock.mockReset();
    sendMessageMock.mockReset();
    await Promise.all(
      servers.splice(0).map(
        (server) => new Promise<void>((resolve) => server.close(() => resolve()))
      )
    );
  });

  it('returns a controlled acknowledgement when a socket cannot join a chat', async () => {
    const [{ createSocketServer }, { signAccessToken }, { SOCKET_EVENTS }] = await Promise.all([
      import('../src/sockets/socket-server'),
      import('../src/services/token.service'),
      import('@chat-app/shared')
    ]);
    const server = http.createServer();
    servers.push(server);
    const ioServer = createSocketServer(server);

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address() as AddressInfo;
    const client = io(`http://127.0.0.1:${address.port}`, {
      auth: {
        token: signAccessToken({
          userId: 'test-user-id',
          sessionId: 'test-session-id',
          deviceId: 'test-device-id'
        })
      },
      transports: ['websocket']
    });

    try {
      await new Promise<void>((resolve, reject) => {
        client.once('connect', resolve);
        client.once('connect_error', reject);
      });
      assertMemberMock.mockRejectedValueOnce(new Error('forbidden'));

      const acknowledgement = await new Promise<unknown>((resolve) => {
        client.emit(SOCKET_EVENTS.JOIN_CHAT, { chatId: 'forbidden-chat-id' }, resolve);
      });

      expect(acknowledgement).toEqual({
        ok: false,
        error: {
          code: 'CHAT_ACCESS_DENIED',
          message: 'You do not have access to this chat.'
        }
      });
      expect(assertMemberMock).toHaveBeenCalledWith('forbidden-chat-id', 'test-user-id');
    } finally {
      client.disconnect();
      ioServer.close();
    }
  });

  it('rejects connections without a valid access token', async () => {
    const { createSocketServer } = await import('../src/sockets/socket-server');
    const server = http.createServer();
    servers.push(server);
    const ioServer = createSocketServer(server);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address() as AddressInfo;
    const client = io(`http://127.0.0.1:${address.port}`, {
      auth: { token: 'expired-or-invalid' },
      transports: ['websocket']
    });

    try {
      await expect(new Promise((resolve, reject) => {
        client.once('connect', () => reject(new Error('unexpected connection')));
        client.once('connect_error', resolve);
      })).resolves.toMatchObject({ message: 'Invalid or expired token' });
      expect(handleConnectedMock).not.toHaveBeenCalled();
    } finally {
      client.disconnect();
      ioServer.close();
    }
  });

  it('cleans up presence exactly once when an authenticated socket disconnects', async () => {
    const [{ createSocketServer }, { signAccessToken }] = await Promise.all([
      import('../src/sockets/socket-server'),
      import('../src/services/token.service')
    ]);
    const server = http.createServer();
    servers.push(server);
    const ioServer = createSocketServer(server);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address() as AddressInfo;
    const client = io(`http://127.0.0.1:${address.port}`, {
      auth: { token: signAccessToken({ userId: 'presence-user', sessionId: 'session', deviceId: 'device' }) },
      transports: ['websocket']
    });

    try {
      await new Promise<void>((resolve, reject) => {
        client.once('connect', resolve);
        client.once('connect_error', reject);
      });
      client.disconnect();
      await vi.waitFor(() => expect(handleDisconnectedMock).toHaveBeenCalledTimes(1));
      expect(handleConnectedMock).toHaveBeenCalledTimes(1);
      expect(handleDisconnectedMock.mock.calls[0]?.[1]).toBe('presence-user');
    } finally {
      ioServer.close();
    }
  });

  it('acknowledges a message sent by an authenticated socket', async () => {
    const [{ createSocketServer }, { signAccessToken }, { SOCKET_EVENTS }] = await Promise.all([
      import('../src/sockets/socket-server'),
      import('../src/services/token.service'),
      import('@chat-app/shared')
    ]);
    const server = http.createServer();
    servers.push(server);
    const ioServer = createSocketServer(server);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address() as AddressInfo;
    const client = io(`http://127.0.0.1:${address.port}`, {
      auth: { token: signAccessToken({ userId: 'message-user', sessionId: 'session', deviceId: 'device' }) },
      transports: ['websocket']
    });

    try {
      await new Promise<void>((resolve, reject) => {
        client.once('connect', resolve);
        client.once('connect_error', reject);
      });
      const message = { id: 'message-id', chatId: 'chat-id' };
      sendMessageMock.mockResolvedValueOnce(message);
      const acknowledgement = await new Promise<unknown>((resolve) => {
        client.emit(SOCKET_EVENTS.SEND_MESSAGE, { chatId: 'chat-id', clientMessageId: 'client-id' }, resolve);
      });

      expect(acknowledgement).toEqual({ ok: true, message });
      expect(sendMessageMock).toHaveBeenCalledWith(
        'message-user',
        { chatId: 'chat-id', clientMessageId: 'client-id' },
        ioServer
      );
    } finally {
      client.disconnect();
      ioServer.close();
    }
  });

  it('does not retain duplicate server listeners across a reconnect', async () => {
    const [{ createSocketServer }, { signAccessToken }, { SOCKET_EVENTS }] = await Promise.all([
      import('../src/sockets/socket-server'),
      import('../src/services/token.service'),
      import('@chat-app/shared')
    ]);
    const server = http.createServer();
    servers.push(server);
    const ioServer = createSocketServer(server);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address() as AddressInfo;
    const client = io(`http://127.0.0.1:${address.port}`, {
      auth: { token: signAccessToken({ userId: 'reconnect-user', sessionId: 'session', deviceId: 'device' }) },
      autoConnect: false,
      transports: ['websocket']
    });
    let setupAcknowledgements = 0;
    client.on(SOCKET_EVENTS.SETUP, () => {
      setupAcknowledgements += 1;
    });

    const connect = async () => {
      client.connect();
      await new Promise<void>((resolve, reject) => {
        client.once('connect', resolve);
        client.once('connect_error', reject);
      });
    };

    try {
      await connect();
      client.emit(SOCKET_EVENTS.SETUP, { chatIds: [] });
      await vi.waitFor(() => expect(setupAcknowledgements).toBe(1));

      client.disconnect();
      await vi.waitFor(() => expect(handleDisconnectedMock).toHaveBeenCalledTimes(1));

      await connect();
      client.emit(SOCKET_EVENTS.SETUP, { chatIds: [] });
      await vi.waitFor(() => expect(setupAcknowledgements).toBe(2));
      expect(handleConnectedMock).toHaveBeenCalledTimes(2);
    } finally {
      client.disconnect();
      ioServer.close();
    }
  });

  it('denies WebRTC signaling when the caller is not authorized for the call', async () => {
    const [{ createSocketServer }, { signAccessToken }, { SOCKET_EVENTS }] = await Promise.all([
      import('../src/sockets/socket-server'),
      import('../src/services/token.service'),
      import('@chat-app/shared')
    ]);
    const server = http.createServer();
    servers.push(server);
    const ioServer = createSocketServer(server);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address() as AddressInfo;
    const client = io(`http://127.0.0.1:${address.port}`, {
      auth: { token: signAccessToken({ userId: 'untrusted-user', sessionId: 'session', deviceId: 'device' }) },
      transports: ['websocket']
    });

    try {
      await new Promise<void>((resolve, reject) => {
        client.once('connect', resolve);
        client.once('connect_error', reject);
      });
      getSignalTargetMock.mockRejectedValueOnce(new Error('forbidden'));
      const acknowledgement = await new Promise<unknown>((resolve) => {
        client.emit(SOCKET_EVENTS.CALL_OFFER, { callId: 'call-id', description: { type: 'offer' } }, resolve);
      });
      expect(acknowledgement).toEqual({
        ok: false,
        error: { code: 'CALL_SIGNALING_DENIED', message: 'This signaling action is not allowed.' }
      });
      expect(getSignalTargetMock).toHaveBeenCalledWith('call-id', 'untrusted-user', 'offer');
    } finally {
      client.disconnect();
      ioServer.close();
    }
  });
});
