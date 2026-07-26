import { createAdapter } from '@socket.io/redis-adapter';
import type { RedisClientType } from 'redis';
import { createClient } from 'redis';

import { env, hasRedisConfig } from '../config/env';
import { logger } from './logger.service';

type Primitive = string | number | boolean | null;
type JsonValue = Primitive | JsonValue[] | { [key: string]: JsonValue };

type MemoryEntry = {
  value: string;
  expiresAt: number | null;
};

const memoryStore = new Map<string, MemoryEntry>();
const memoryPresenceCounts = new Map<string, number>();

const chatListCacheKey = (userId: string) => `${env.REDIS_KEY_PREFIX}:chat-list:${userId}`;
const presenceCountKey = (userId: string) => `${env.REDIS_KEY_PREFIX}:presence:${userId}:count`;

let commandClient: RedisClientType | null = null;
let pubClient: RedisClientType | null = null;
let subClient: RedisClientType | null = null;
let ready = false;

const pruneExpiredMemoryEntry = (key: string) => {
  const current = memoryStore.get(key);

  if (current?.expiresAt && current.expiresAt <= Date.now()) {
    memoryStore.delete(key);
    return null;
  }

  return current ?? null;
};

const getMemoryJson = <T>(key: string) => {
  const current = pruneExpiredMemoryEntry(key);

  if (!current) {
    return null;
  }

  return JSON.parse(current.value) as T;
};

const setMemoryJson = (key: string, value: JsonValue, ttlSeconds?: number) => {
  memoryStore.set(key, {
    value: JSON.stringify(value),
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null
  });
};

const deleteMemoryKey = (key: string) => {
  memoryStore.delete(key);
};

const connectRedisClients = async () => {
  if (!hasRedisConfig || !env.REDIS_URL || ready) {
    return;
  }

  try {
    commandClient = createClient({ url: env.REDIS_URL });
    pubClient = commandClient.duplicate();
    subClient = commandClient.duplicate();

    commandClient.on('error', (error) => {
      logger.warn({ error: error.message }, 'Redis command client error');
    });
    pubClient.on('error', (error) => {
      logger.warn({ error: error.message }, 'Redis pub client error');
    });
    subClient.on('error', (error) => {
      logger.warn({ error: error.message }, 'Redis sub client error');
    });

    await Promise.all([commandClient.connect(), pubClient.connect(), subClient.connect()]);
    ready = true;

    logger.info({ redisUrl: env.REDIS_URL }, 'Redis cache connected');
  } catch (error) {
    ready = false;
    commandClient = null;
    pubClient = null;
    subClient = null;
    logger.warn({ error }, 'Redis unavailable, falling back to in-memory cache');
  }
};

export const cacheService = {
  async connect() {
    await connectRedisClients();
  },

  async disconnect() {
    const clients = [commandClient, pubClient, subClient].filter(Boolean) as RedisClientType[];
    await Promise.allSettled(clients.map((client) => client.quit()));
    commandClient = null;
    pubClient = null;
    subClient = null;
    ready = false;
  },

  isReady() {
    return ready && Boolean(commandClient && pubClient && subClient);
  },

  createSocketAdapter(): ReturnType<typeof createAdapter> | null {
    if (!this.isReady() || !pubClient || !subClient) {
      return null;
    }

    return createAdapter(pubClient, subClient);
  },

  async getJson<T>(key: string) {
    if (!this.isReady() || !commandClient) {
      return getMemoryJson<T>(key);
    }

    const raw = await commandClient.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  },

  async setJson(key: string, value: JsonValue, ttlSeconds?: number) {
    if (!this.isReady() || !commandClient) {
      setMemoryJson(key, value, ttlSeconds);
      return;
    }

    if (ttlSeconds) {
      await commandClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
      return;
    }

    await commandClient.set(key, JSON.stringify(value));
  },

  async deleteKey(key: string) {
    if (!this.isReady() || !commandClient) {
      deleteMemoryKey(key);
      return;
    }

    await commandClient.del(key);
  },

  async getCachedChatList<T>(userId: string) {
    return this.getJson<T>(chatListCacheKey(userId));
  },

  async setCachedChatList(userId: string, chats: JsonValue) {
    await this.setJson(chatListCacheKey(userId), chats, env.CHAT_LIST_CACHE_TTL_SEC);
  },

  async invalidateChatLists(userIds: string[]) {
    const uniqueIds = [...new Set(userIds)];

    if (uniqueIds.length === 0) {
      return;
    }

    if (!this.isReady() || !commandClient) {
      uniqueIds.forEach((userId) => deleteMemoryKey(chatListCacheKey(userId)));
      return;
    }

    await commandClient.del(uniqueIds.map((userId) => chatListCacheKey(userId)));
  },

  async incrementPresence(userId: string) {
    if (!this.isReady() || !commandClient) {
      const next = (memoryPresenceCounts.get(userId) ?? 0) + 1;
      memoryPresenceCounts.set(userId, next);
      return next;
    }

    const key = presenceCountKey(userId);
    const next = await commandClient.incr(key);
    await commandClient.expire(key, env.PRESENCE_CACHE_TTL_SEC);
    return next;
  },

  async decrementPresence(userId: string) {
    if (!this.isReady() || !commandClient) {
      const next = Math.max((memoryPresenceCounts.get(userId) ?? 1) - 1, 0);

      if (next === 0) {
        memoryPresenceCounts.delete(userId);
      } else {
        memoryPresenceCounts.set(userId, next);
      }

      return next;
    }

    const key = presenceCountKey(userId);
    const next = Math.max(await commandClient.decr(key), 0);

    if (next === 0) {
      await commandClient.del(key);
      return 0;
    }

    await commandClient.expire(key, env.PRESENCE_CACHE_TTL_SEC);
    return next;
  },

  async getPresenceCount(userId: string) {
    if (!this.isReady() || !commandClient) {
      return memoryPresenceCounts.get(userId) ?? 0;
    }

    const raw = await commandClient.get(presenceCountKey(userId));
    return raw ? Number.parseInt(raw, 10) || 0 : 0;
  }
};
