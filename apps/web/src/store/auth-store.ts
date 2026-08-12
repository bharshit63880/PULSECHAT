import type { AuthResponseDto, AuthUser } from '@chat-app/shared';

import { create } from 'zustand';

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  session: AuthResponseDto['session'] | null;
  isBootstrapped: boolean;
  setSession: (payload: AuthResponseDto) => void;
  setToken: (token: string | null) => void;
  updateUser: (user: AuthUser) => void;
  clearSession: () => void;
};

/**
 * Access tokens intentionally remain memory-only.  A page reload restores a
 * session through the rotating HTTP-only refresh cookie, never localStorage.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  user: null,
  session: null,
  isBootstrapped: false,
  setSession: ({ token, user, session }) => set({ token, user, session, isBootstrapped: true }),
  setToken: (token) => set({ token }),
  updateUser: (user) => set({ user }),
  clearSession: () => set({ token: null, user: null, session: null, isBootstrapped: true }),
}));

export const clearLegacyPersistedAuth = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('pulse-chat-auth');
  }
};
