import http from 'node:http';
import type { AddressInfo } from 'node:net';

import { io } from 'socket.io-client';
import { afterEach, describe, expect, it, vi } from 'vitest';

const assertMemberMock = vi.fn();

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
  messagesService: {}
}));

vi.mock('../src/modules/notifications/notifications.service', () => ({
  notificationsService: {}
}));

vi.mock('../src/modules/presence/presence.service', () => ({
  presenceService: {
    handleConnected: vi.fn(),
    handleDisconnected: vi.fn(),
    isUserOnline: vi.fn()
  }
}));

describe('Socket.IO chat authorization', () => {
  const servers: http.Server[] = [];

  afterEach(async () => {
    assertMemberMock.mockReset();
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
});
