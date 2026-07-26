import type { ChatNotificationDto } from '@chat-app/shared';

import { create } from 'zustand';

type NotificationState = {
  items: ChatNotificationDto[];
  unreadCount: number;
  add: (notification: ChatNotificationDto) => void;
  markAllRead: () => void;
  dismiss: (notificationId: string) => void;
};

export const useNotificationsStore = create<NotificationState>((set) => ({
  items: [],
  unreadCount: 0,
  add: (notification) =>
    set((state) => ({
      items: [notification, ...state.items.filter((item) => item.id !== notification.id)].slice(0, 25),
      unreadCount: state.unreadCount + 1
    })),
  markAllRead: () => set({ unreadCount: 0 }),
  dismiss: (notificationId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== notificationId)
    }))
}));
