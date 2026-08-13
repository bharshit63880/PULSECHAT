import type { Socket } from 'socket.io-client';
import { describe, expect, it, vi } from 'vitest';

import { ensureSocketConnected } from './socket';

const createSocket = () => {
  const handlers = new Map<string, () => void>();
  const socket = {
    active: false,
    connected: false,
    connect: vi.fn(),
    off: vi.fn(),
    once: vi.fn((event: string, handler: () => void) => {
      handlers.set(event, handler);
    }),
  } as unknown as Socket;

  return { handlers, socket };
};

describe('ensureSocketConnected', () => {
  it('waits for the authenticated transport before a queued message is emitted', async () => {
    const { handlers, socket } = createSocket();
    const connection = ensureSocketConnected(socket);

    expect(socket.connect).toHaveBeenCalledOnce();
    handlers.get('connect')?.();

    await expect(connection).resolves.toBeUndefined();
    expect(socket.off).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('connect_error', expect.any(Function));
  });

  it('fails a queued message cleanly when the secure transport cannot connect', async () => {
    const { handlers, socket } = createSocket();
    const connection = ensureSocketConnected(socket);

    handlers.get('connect_error')?.();

    await expect(connection).rejects.toThrow('Secure connection could not be established');
  });
});
