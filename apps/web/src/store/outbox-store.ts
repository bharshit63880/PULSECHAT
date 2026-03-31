import type { AttachmentDto } from '@chat-app/shared';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OutboxItem = {
  clientMessageId: string;
  chatId: string;
  senderDeviceId: string;
  recipientDeviceId: string;
  type: 'text' | 'image' | 'file' | 'gif' | 'sticker';
  ciphertext: string;
  encryptionVersion: string;
  iv: string;
  digest: string;
  attachment?: AttachmentDto | null;
  previewText: string;
  createdAt: string;
  status: 'pending' | 'failed';
};

type OutboxState = {
  queue: OutboxItem[];
  enqueue: (item: OutboxItem) => void;
  markStatus: (clientMessageId: string, status: OutboxItem['status']) => void;
  remove: (clientMessageId: string) => void;
};

export const useOutboxStore = create<OutboxState>()(
  persist(
    (set) => ({
      queue: [],
      enqueue: (item) =>
        set((state) => ({
          queue: [...state.queue.filter((entry) => entry.clientMessageId !== item.clientMessageId), item]
        })),
      markStatus: (clientMessageId, status) =>
        set((state) => ({
          queue: state.queue.map((item) =>
            item.clientMessageId === clientMessageId ? { ...item, status } : item
          )
        })),
      remove: (clientMessageId) =>
        set((state) => ({
          queue: state.queue.filter((item) => item.clientMessageId !== clientMessageId)
        }))
    }),
    {
      name: 'pulse-chat-outbox'
    }
  )
);
