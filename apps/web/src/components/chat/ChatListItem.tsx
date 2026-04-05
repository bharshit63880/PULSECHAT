import type { ChatDto } from '@chat-app/shared';

import { Hash, LockKeyhole, UsersRound } from 'lucide-react';

import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/utils/cn';
import { formatChatTimestamp } from '@/utils/format';

type ChatListItemProps = {
  chat: ChatDto;
  currentUserId: string;
  active: boolean;
  onClick: () => void;
};

const getSubtitle = (chat: ChatDto) => {
  if (!chat.latestMessage) {
    return 'No messages yet';
  }

  if (chat.latestMessage.type === 'sticker') {
    return 'Sticker';
  }

  if (chat.latestMessage.type === 'gif') {
    return 'GIF';
  }

  if (chat.latestMessage.type === 'image') {
    return chat.isGroupChat ? 'Group image' : 'Encrypted image';
  }

  if (chat.latestMessage.type === 'file') {
    return chat.isGroupChat ? 'Group attachment' : 'Encrypted attachment';
  }

  return chat.isGroupChat ? 'Group message' : 'Encrypted message';
};

export const ChatListItem = ({ chat, currentUserId, active, onClick }: ChatListItemProps) => {
  const counterpart = chat.isGroupChat
    ? null
    : chat.participants.find((participant) => participant.id !== currentUserId) ?? chat.participants[0];

  const title = chat.isGroupChat ? chat.name ?? 'Untitled group' : counterpart?.name ?? 'Direct chat';
  const subtitle = getSubtitle(chat);
  const avatarSrc = chat.isGroupChat ? null : counterpart?.avatarUrl;
  const online = chat.isGroupChat ? undefined : counterpart?.isOnline;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-[28px] border px-3.5 py-3.5 text-left transition-all duration-200',
        active
          ? 'border-accent/30 bg-accent-soft/85 shadow-soft'
          : 'border-transparent hover:-translate-y-0.5 hover:border-line/90 hover:bg-white/70 dark:hover:bg-slate-950/55'
      )}
    >
      {active ? <span className="absolute inset-y-4 left-1.5 w-1 rounded-full bg-accent" /> : null}
      <Avatar src={avatarSrc} alt={title} online={online} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-semibold tracking-tight">{title}</p>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/75 text-muted shadow-sm dark:bg-slate-950/70">
              {chat.isGroupChat ? <UsersRound className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}
            </span>
          </div>
          {chat.latestMessage ? (
            <span className="shrink-0 text-[11px] font-medium text-muted">
              {formatChatTimestamp(chat.latestMessage.createdAt)}
            </span>
          ) : null}
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted">
            {chat.isGroupChat ? <Hash className="h-3.5 w-3.5 shrink-0" /> : null}
            <p className="truncate leading-5">{subtitle}</p>
          </div>
          {chat.unreadCount > 0 ? (
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-accent px-2 py-1 text-[10px] font-bold text-white dark:text-slate-950">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
};
