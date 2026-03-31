import type { ChatDto } from '@chat-app/shared';

import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/utils/cn';
import { formatChatTimestamp } from '@/utils/format';

type ChatListItemProps = {
  chat: ChatDto;
  currentUserId: string;
  active: boolean;
  onClick: () => void;
};

export const ChatListItem = ({ chat, currentUserId, active, onClick }: ChatListItemProps) => {
  const counterpart = chat.isGroupChat
    ? null
    : chat.participants.find((participant) => participant.id !== currentUserId) ?? chat.participants[0];

  const title = chat.isGroupChat ? chat.name ?? 'Untitled group' : counterpart?.name ?? 'Direct chat';
  const subtitle = chat.latestMessage
    ? chat.latestMessage.type === 'sticker'
      ? 'Sticker'
      : chat.latestMessage.type === 'gif'
        ? 'GIF'
        : chat.latestMessage.type === 'image'
          ? chat.isGroupChat
            ? 'Group image'
            : 'Encrypted image'
          : chat.latestMessage.type === 'file'
            ? chat.isGroupChat
              ? 'Group attachment'
              : 'Encrypted attachment'
            : chat.isGroupChat
              ? 'Group message'
              : 'Encrypted message'
    : 'No messages yet';
  const avatarSrc = chat.isGroupChat ? null : counterpart?.avatarUrl;
  const online = chat.isGroupChat ? undefined : counterpart?.isOnline;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-3xl border px-3 py-3 text-left transition',
        active
          ? 'border-accent/30 bg-emerald-50 dark:bg-emerald-950/20'
          : 'border-transparent hover:border-line hover:bg-card'
      )}
    >
      <Avatar src={avatarSrc} alt={title} online={online} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold">{title}</p>
          {chat.latestMessage ? (
            <span className="shrink-0 text-xs text-muted">
              {formatChatTimestamp(chat.latestMessage.createdAt)}
            </span>
          ) : null}
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="truncate text-xs text-muted">{subtitle}</p>
          {chat.unreadCount > 0 ? (
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-accent px-2 py-1 text-[10px] font-bold text-white">
              {chat.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
};
