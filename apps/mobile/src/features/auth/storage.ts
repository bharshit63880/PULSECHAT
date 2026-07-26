import type { AuthResponseDto, AuthUser } from '@chat-app/shared';

import * as SecureStore from 'expo-secure-store';

const AUTH_STORAGE_KEY = 'pulse-mobile-auth';

export type StoredAuthSession = {
  token: string;
  user: AuthUser;
  session: AuthResponseDto['session'];
};

export const authStorage = {
  async read() {
    const raw = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as StoredAuthSession;
  },

  async write(payload: StoredAuthSession) {
    await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(payload));
  },

  async clear() {
    await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
  }
};
