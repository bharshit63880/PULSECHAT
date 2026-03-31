import type { DecryptedMessageRecord, LocalDeviceRecord, LocalSearchHit } from './types';

const DB_NAME = 'pulse-chat-secure-store';
const DB_VERSION = 1;
const DEVICE_STORE = 'device-keys';
const MESSAGE_STORE = 'decrypted-messages';

const openDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(DEVICE_STORE)) {
        database.createObjectStore(DEVICE_STORE, { keyPath: 'deviceId' });
      }

      if (!database.objectStoreNames.contains(MESSAGE_STORE)) {
        const store = database.createObjectStore(MESSAGE_STORE, { keyPath: 'messageId' });
        store.createIndex('by-user', 'userId', { unique: false });
        store.createIndex('by-chat', 'chatId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withStore = async <T>(
  storeName: string,
  mode: 'readonly' | 'readwrite',
  executor: (store: IDBObjectStore) => Promise<T>
) => {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const result = await executor(store);

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });

    return result;
  } finally {
    database.close();
  }
};

const requestToPromise = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

export const secureStore = {
  async getDevice(deviceId: string) {
    return withStore<LocalDeviceRecord | null>(DEVICE_STORE, 'readonly', async (store) => {
      const result = await requestToPromise<LocalDeviceRecord | undefined>(store.get(deviceId));
      return result ?? null;
    });
  },

  async saveDevice(record: LocalDeviceRecord) {
    return withStore<void>(DEVICE_STORE, 'readwrite', async (store) => {
      await requestToPromise(store.put(record));
    });
  },

  async saveDecryptedMessage(record: DecryptedMessageRecord) {
    return withStore<void>(MESSAGE_STORE, 'readwrite', async (store) => {
      await requestToPromise(store.put(record));
    });
  },

  async getDecryptedMessage(messageId: string) {
    return withStore<DecryptedMessageRecord | null>(MESSAGE_STORE, 'readonly', async (store) => {
      const result = await requestToPromise<DecryptedMessageRecord | undefined>(store.get(messageId));
      return result ?? null;
    });
  },

  async searchMessages(userId: string, query: string) {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return [] as LocalSearchHit[];
    }

    return withStore<LocalSearchHit[]>(MESSAGE_STORE, 'readonly', async (store) => {
      const index = store.index('by-user');
      const results = await requestToPromise<DecryptedMessageRecord[]>(index.getAll(userId));

      return results
        .filter((item) => item.text.toLowerCase().includes(normalized))
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .map((item) => ({
          messageId: item.messageId,
          chatId: item.chatId,
          text: item.text,
          createdAt: item.createdAt
        }));
    });
  }
};
