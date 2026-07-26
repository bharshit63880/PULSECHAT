import type { ThemeMode } from '@/types';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UiState = {
  activeChatId: string | null;
  isInfoPanelOpen: boolean;
  theme: ThemeMode;
  search: string;
  setActiveChatId: (chatId: string | null) => void;
  setInfoPanelOpen: (value: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  setSearch: (value: string) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      activeChatId: null,
      isInfoPanelOpen: false,
      theme: 'light',
      search: '',
      setActiveChatId: (activeChatId) => set({ activeChatId }),
      setInfoPanelOpen: (isInfoPanelOpen) => set({ isInfoPanelOpen }),
      setTheme: (theme) => set({ theme }),
      setSearch: (search) => set({ search })
    }),
    {
      name: 'pulse-chat-ui'
    }
  )
);
