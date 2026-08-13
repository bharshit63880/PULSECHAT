import type { MessageDto } from '@chat-app/shared';
import type { Socket } from 'socket.io-client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { OutboxItem } from '@/store/outbox-store';

import { deliverOutboxItem } from './outbox-delivery';
import { SOCKET_EVENTS } from './socket-events';

const outboxItem: OutboxItem = {
  clientMessageId: 'attachment-client-message-id',
  chatId: 'chat-id',
  senderDeviceId: 'sender-device-id',
  recipientDeviceId: 'recipient-device-id',
  type: 'image',
  ciphertext: 'encrypted-message-envelope',
  encryptionVersion: 'v1',
  iv: 'message-iv',
  digest: 'message-digest',
  attachment: {
    url: 'https://storage.example.test/encrypted-asset',
    publicId: 'encrypted-asset',
    fileName: 'photo.png',
    mimeType: 'image/png',
    size: 48,
    isEncrypted: true,
    encryption: {
      algorithm: 'AES-GCM',
      wrappedFileKey: 'wrapped-file-key',
      iv: 'file-iv',
      digest: 'file-digest',
    },
  },
  previewText: 'photo.png',
  createdAt: '2026-08-13T00:00:00.000Z',
  status: 'pending',
};

const canonicalMessage: MessageDto = {
  id: 'canonical-message-id',
  clientMessageId: outboxItem.clientMessageId,
  chatId: outboxItem.chatId,
  sender: {
    id: 'sender-id',
    name: 'Sender',
    username: 'sender',
    email: 'sender@example.test',
    avatarUrl: null,
    bio: null,
    isEmailVerified: true,
    authProvider: 'local',
    isOnline: true,
    lastSeen: null,
    createdAt: outboxItem.createdAt,
    updatedAt: outboxItem.createdAt,
  },
  senderDeviceId: outboxItem.senderDeviceId,
  recipientDeviceId: outboxItem.recipientDeviceId,
  type: outboxItem.type,
  ciphertext: outboxItem.ciphertext,
  encryptionVersion: outboxItem.encryptionVersion,
  iv: outboxItem.iv,
  digest: outboxItem.digest,
  attachment: outboxItem.attachment,
  replyTo: null,
  reactions: [],
  status: 'sent',
  seenBy: [],
  expiresAt: null,
  edited: false,
  createdAt: outboxItem.createdAt,
  updatedAt: outboxItem.createdAt,
};

afterEach(() => vi.useRealTimers());

describe('deliverOutboxItem', () => {
  it('waits for reconnect, emits once, and reconciles with the canonical acknowledgement', async () => {
    let acknowledgement: ((payload: { ok: boolean; message?: MessageDto }) => void) | undefined;
    const socket = {
      emit: vi.fn((_event, _payload, callback) => {
        acknowledgement = callback;
      }),
    } as unknown as Socket;
    const ensureConnected = vi.fn(async () => undefined);

    const delivery = deliverOutboxItem(outboxItem, socket, { ensureConnected });
    expect(socket.emit).not.toHaveBeenCalled();

    await Promise.resolve();
    expect(ensureConnected).toHaveBeenCalledWith(socket);
    expect(socket.emit).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith(
      SOCKET_EVENTS.SEND_MESSAGE,
      expect.objectContaining({
        clientMessageId: outboxItem.clientMessageId,
        attachment: outboxItem.attachment,
      }),
      expect.any(Function),
    );

    acknowledgement?.({ ok: true, message: canonicalMessage });
    await expect(delivery).resolves.toEqual(canonicalMessage);
    expect(socket.emit).toHaveBeenCalledTimes(1);
  });

  it('keeps the same encrypted attachment metadata ready for one retry after acknowledgement failure', async () => {
    const emittedPayloads: Array<Record<string, unknown>> = [];
    const socket = {
      emit: vi.fn((_event, payload, callback) => {
        emittedPayloads.push(payload);
        callback({ ok: false });
      }),
    } as unknown as Socket;
    const ensureConnected = vi.fn(async () => undefined);

    await expect(deliverOutboxItem(outboxItem, socket, { ensureConnected })).rejects.toThrow(
      'Secure message could not be acknowledged',
    );
    await expect(
      deliverOutboxItem({ ...outboxItem, status: 'pending' }, socket, { ensureConnected }),
    ).rejects.toThrow('Secure message could not be acknowledged');

    expect(socket.emit).toHaveBeenCalledTimes(2);
    expect(emittedPayloads).toEqual([
      expect.objectContaining({
        clientMessageId: outboxItem.clientMessageId,
        attachment: outboxItem.attachment,
      }),
      expect.objectContaining({
        clientMessageId: outboxItem.clientMessageId,
        attachment: outboxItem.attachment,
      }),
    ]);
  });

  it('fails a message that never receives an acknowledgement', async () => {
    vi.useFakeTimers();
    const socket = { emit: vi.fn() } as unknown as Socket;
    const delivery = deliverOutboxItem(outboxItem, socket, {
      ensureConnected: async () => undefined,
      acknowledgementTimeoutMs: 10,
    });

    const rejection = expect(delivery).rejects.toThrow('Secure message acknowledgement timed out');
    await vi.advanceTimersByTimeAsync(10);
    await rejection;
  });
});
