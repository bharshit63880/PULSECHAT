import type { MessageDto } from '@chat-app/shared';
import type { Socket } from 'socket.io-client';

import type { OutboxItem } from '@/store/outbox-store';

import { ensureSocketConnected } from './socket';
import { SOCKET_EVENTS } from './socket-events';

export const OUTBOX_ACK_TIMEOUT_MS = 6_000;

type DeliveryDependencies = {
  ensureConnected?: (socket: Socket) => Promise<void>;
  acknowledgementTimeoutMs?: number;
};

/**
 * Sends already-encrypted outbox metadata. Uploading is deliberately outside
 * this function, so reconnects and retries cannot upload an attachment again.
 */
export const deliverOutboxItem = async (
  queueItem: OutboxItem,
  socket: Socket,
  dependencies: DeliveryDependencies = {},
): Promise<MessageDto> => {
  await (dependencies.ensureConnected ?? ensureSocketConnected)(socket);

  const acknowledgementTimeoutMs = dependencies.acknowledgementTimeoutMs ?? OUTBOX_ACK_TIMEOUT_MS;

  return new Promise<MessageDto>((resolve, reject) => {
    const timeout = globalThis.setTimeout(
      () => reject(new Error('Secure message acknowledgement timed out')),
      acknowledgementTimeoutMs,
    );

    socket.emit(
      SOCKET_EVENTS.SEND_MESSAGE,
      {
        chatId: queueItem.chatId,
        clientMessageId: queueItem.clientMessageId,
        senderDeviceId: queueItem.senderDeviceId,
        recipientDeviceId: queueItem.recipientDeviceId,
        type: queueItem.type,
        ciphertext: queueItem.ciphertext,
        encryptionVersion: queueItem.encryptionVersion,
        iv: queueItem.iv,
        digest: queueItem.digest,
        attachment: queueItem.attachment,
      },
      (payload: { ok: boolean; message?: MessageDto }) => {
        globalThis.clearTimeout(timeout);

        if (!payload.ok || !payload.message) {
          reject(new Error('Secure message could not be acknowledged'));
          return;
        }

        resolve(payload.message);
      },
    );
  });
};
