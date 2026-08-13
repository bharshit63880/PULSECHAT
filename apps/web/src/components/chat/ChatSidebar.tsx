import type { AuthUser, ChatDto, ChatNotificationDto } from '@chat-app/shared';

import { LazyMotion, domAnimation, m } from 'framer-motion';
import {
  LaptopMinimalCheck,
  LogOut,
  MessageCircle,
  Search,
  Settings,
  UsersRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ChatListItem } from '@/components/chat/ChatListItem';
import { NotificationCenter } from '@/components/chat/NotificationCenter';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { CreateGroupDialog } from '@/features/groups/components/CreateGroupDialog';

type ChatSidebarProps = {
  currentUser: AuthUser;
  chats: ChatDto[];
  activeChatId: string | null;
  search: string;
  searchResults: AuthUser[];
  isSearching: boolean;
  directoryUsers: AuthUser[];
  notifications: ChatNotificationDto[];
  unreadNotificationCount: number;
  isCreatingGroup?: boolean;
  isGroupDialogOpen: boolean;
  onSearchChange: (value: string) => void;
  onSelectChat: (chatId: string) => void;
  onOpenDirect: (userId: string) => void;
  onOpenNotificationChat: (chatId: string) => void;
  onMarkNotificationsRead: () => void;
  onDismissNotification: (notificationId: string) => void;
  onOpenGroupDialog: () => void;
  onCloseGroupDialog: () => void;
  onCreateGroup: (payload: { name: string; participantIds: string[] }) => void;
  onLogout: () => void;
};

export const ChatSidebar = ({
  currentUser,
  chats,
  activeChatId,
  search,
  searchResults,
  isSearching,
  directoryUsers,
  notifications,
  unreadNotificationCount,
  isCreatingGroup,
  isGroupDialogOpen,
  onSearchChange,
  onSelectChat,
  onOpenDirect,
  onOpenNotificationChat,
  onMarkNotificationsRead,
  onDismissNotification,
  onOpenGroupDialog,
  onCloseGroupDialog,
  onCreateGroup,
  onLogout,
}: ChatSidebarProps) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'groups'>('all');
  const visibleChats = useMemo(
    () =>
      chats.filter((chat) => {
        if (filter === 'unread') return chat.unreadCount > 0;
        if (filter === 'groups') return chat.isGroupChat;
        return true;
      }),
    [chats, filter],
  );

  return (
    <LazyMotion features={domAnimation}>
      <CreateGroupDialog
        open={isGroupDialogOpen}
        users={directoryUsers}
        currentUserId={currentUser.id}
        isSubmitting={isCreatingGroup}
        onClose={onCloseGroupDialog}
        onCreate={onCreateGroup}
      />
      <m.aside
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="mobile-nav-blur flex h-full min-h-0 flex-col overflow-hidden border-r border-line"
      >
        <div className="border-b border-line px-4 pb-3 pt-4 sm:px-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src="/pulsechat-metal-mark.svg"
                alt="PulseChat"
                className="h-11 w-11 shrink-0 rounded-2xl shadow-[0_12px_30px_rgba(112,67,246,0.25)]"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold tracking-[0.12em] text-accent">PULSECHAT</p>
                <p className="truncate text-lg font-semibold tracking-tight">{currentUser.name}</p>
                <p className="truncate text-xs text-muted">@{currentUser.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationCenter
                notifications={notifications}
                unreadCount={unreadNotificationCount}
                onOpenChat={onOpenNotificationChat}
                onMarkAllRead={onMarkNotificationsRead}
                onDismiss={onDismissNotification}
              />
              <ThemeToggle />
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                className="rounded-2xl border-line bg-card-muted/70 pl-11 dark:bg-white/[0.045]"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search chats and people"
              />
            </div>
            <Button
              variant="secondary"
              className="h-11 w-11 rounded-2xl p-0"
              onClick={onOpenGroupDialog}
              title="Create group"
              aria-label="Create group"
            >
              <UsersRound className="h-4 w-4" />
            </Button>
            <Link to="/devices">
              <Button
                variant="secondary"
                className="h-11 w-11 rounded-2xl p-0"
                aria-label="Manage devices"
              >
                <LaptopMinimalCheck className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4">
          {search ? (
            <div className="space-y-2">
              <p className="px-2 text-xs font-semibold text-muted">People</p>
              {isSearching ? (
                <p className="px-2 text-sm text-muted">Searching...</p>
              ) : (
                searchResults.map((user, index) => (
                  <m.button
                    key={user.id}
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02, duration: 0.18 }}
                    onClick={() => onOpenDirect(user.id)}
                    className="flex w-full items-center gap-3 rounded-[26px] border border-transparent px-3 py-3 text-left transition hover:-translate-y-0.5 hover:border-line/80 hover:bg-white/65 dark:hover:bg-slate-950/55"
                  >
                    <Avatar src={user.avatarUrl} alt={user.name} online={user.isOnline} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted">@{user.username}</p>
                    </div>
                  </m.button>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-accent" />
                    <p className="text-sm font-semibold text-ink">Chats</p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">Recent conversations</p>
                </div>
                <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent dark:text-emerald-200">
                  {chats.length}
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto px-2 pb-1">
                {(
                  [
                    ['all', 'All'],
                    ['unread', 'Unread'],
                    ['groups', 'Groups'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      filter === key
                        ? 'bg-gradient-to-r from-accent to-violet-500 text-white shadow-sm'
                        : 'border border-line bg-card text-muted hover:text-ink dark:bg-white/[0.035]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {visibleChats.length === 0 ? (
                <p className="px-2 py-8 text-center text-sm text-muted">
                  No {filter === 'all' ? '' : filter} chats yet.
                </p>
              ) : (
                visibleChats.map((chat) => (
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    currentUserId={currentUser.id}
                    active={chat.id === activeChatId}
                    onClick={() => onSelectChat(chat.id)}
                  />
                ))
              )}
            </div>
          )}
        </div>

        <div className="border-t border-line/75 px-3 pb-[calc(0.9rem+var(--safe-bottom))] pt-3 sm:px-4">
          <div className="mobile-nav-blur flex items-center justify-between rounded-[24px] border border-line/70 px-2 py-2">
            <Link to="/settings">
              <Button
                variant="ghost"
                className="h-11 rounded-2xl px-3"
                aria-label="Profile settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="h-11 rounded-2xl px-3 text-rose-600 dark:text-rose-300"
              onClick={onLogout}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </m.aside>
    </LazyMotion>
  );
};
