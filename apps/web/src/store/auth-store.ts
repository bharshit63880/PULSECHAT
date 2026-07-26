import type { AuthResponseDto, AuthUser } from '@chat-app/shared';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  session: AuthResponseDto['session'] | null;
  setSession: (payload: AuthResponseDto) => void;
  setToken: (token: string | null) => void;
  updateUser: (user: AuthUser) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      session: null,
      setSession: ({ token, user, session }) => set({ token, user, session }),
      setToken: (token) => set({ token }),
      updateUser: (user) => set({ user }),
      clearSession: () => set({ token: null, user: null, session: null })
    }),
    {
      name: 'pulse-chat-auth'
    }
  )
);
