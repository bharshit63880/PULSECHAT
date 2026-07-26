import type { ChatNotificationDto } from '@chat-app/shared';

import { Bell, CheckCheck, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/common/Button';

type NotificationCenterProps = {
  notifications: ChatNotificationDto[];
  unreadCount: number;
  onOpenChat: (chatId: string) => void;
  onMarkAllRead: () => void;
  onDismiss: (notificationId: string) => void;
};

export const NotificationCenter = ({
  notifications,
  unreadCount,
  onOpenChat,
  onMarkAllRead,
  onDismiss
}: NotificationCenterProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="secondary"
        className="relative h-11 w-11 rounded-2xl p-0"
        onClick={() => {
          setOpen((current) => !current);
          if (unreadCount > 0) {
            onMarkAllRead();
          }
        }}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white dark:text-slate-950">
            {Math.min(unreadCount, 9)}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div className="glass-panel absolute right-0 z-30 mt-3 w-[340px] rounded-[30px] p-3">
          <div className="mb-2 flex items-start justify-between gap-3 px-2 py-1">
            <div>
              <p className="text-sm font-semibold tracking-tight">Notifications</p>
              <p className="text-xs text-muted">Unread delivery and activity across your chats</p>
            </div>
            <Button variant="ghost" className="rounded-xl px-2.5 py-1 text-xs" onClick={onMarkAllRead}>
              <CheckCheck className="h-3.5 w-3.5" />
              Read all
            </Button>
          </div>
          <div className="max-h-[380px] space-y-2 overflow-y-auto overscroll-contain">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    onOpenChat(notification.chatId);
                    setOpen(false);
                  }}
                  className="group w-full rounded-[24px] border border-line/80 bg-white/68 px-3.5 py-3 text-left transition hover:-translate-y-0.5 hover:border-accent/25 hover:bg-white/82 dark:bg-slate-950/56"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{notification.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{notification.body}</p>
                      <p className="mt-2 text-[11px] font-medium text-muted">
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDismiss(notification.id);
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-line/80 text-muted transition group-hover:border-accent/20 hover:text-ink"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-line/80 px-4 py-8 text-center text-sm text-muted">
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
