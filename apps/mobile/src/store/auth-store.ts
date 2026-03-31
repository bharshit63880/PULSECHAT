import type { AuthResponseDto, AuthUser } from '@chat-app/shared';

import { create } from 'zustand';

type AuthStatus = 'booting' | 'signed-out' | 'signed-in';

type AuthState = {
  status: AuthStatus;
  token: string | null;
  user: AuthUser | null;
  session: AuthResponseDto['session'] | null;
  setSession: (payload: AuthResponseDto) => void;
  hydrateSession: (payload: { token: string; user: AuthUser; session: AuthResponseDto['session'] } | null) => void;
  updateUser: (user: AuthUser) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: 'booting',
  token: null,
  user: null,
  session: null,
  setSession: ({ token, user, session }) => set({ token, user, session, status: 'signed-in' }),
  hydrateSession: (payload) =>
    set(
      payload
        ? {
            token: payload.token,
            user: payload.user,
            session: payload.session,
            status: 'signed-in'
          }
        : { token: null, user: null, session: null, status: 'signed-out' }
    ),
  updateUser: (user) => set({ user }),
  clearSession: () => set({ token: null, user: null, session: null, status: 'signed-out' })
}));
