import type { ChatDto } from '@chat-app/shared';

import { ArrowLeft, Info, ShieldCheck } from 'lucide-react';

import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { formatLastSeen } from '@/utils/format';

type ChatHeaderProps = {
  chat: ChatDto;
  currentUserId: string;
  onBack: () => void;
  onToggleInfo: () => void;
};

const formatDisappearingMode = (seconds: number) => {
  if (seconds === 0) {
    return 'Retention off';
  }

  if (seconds === 300) {
    return '5 min timer';
  }

  if (seconds === 3600) {
    return '1 hour timer';
  }

  if (seconds === 86400) {
    return '24 hour timer';
  }

  return `${Math.round(seconds / 86400)} day timer`;
};

export const ChatHeader = ({ chat, currentUserId, onBack, onToggleInfo }: ChatHeaderProps) => {
  const counterpart =
    !chat.isGroupChat
      ? chat.participants.find((participant) => participant.id !== currentUserId) ?? chat.participants[0]
      : null;

  const title = chat.isGroupChat ? chat.name ?? 'Untitled group' : counterpart?.name ?? 'Secure conversation';
  const subtitle = chat.isGroupChat
    ? `${chat.participants.length} members · Server-group text chat`
    : counterpart?.isOnline
      ? 'Online now'
      : formatLastSeen(counterpart?.lastSeen);

  return (
    <div className="flex items-center justify-between border-b border-line px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" className="lg:hidden" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar src={counterpart?.avatarUrl} alt={title} online={counterpart?.isOnline} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="truncate">{subtitle}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
              <ShieldCheck className="h-3 w-3" />
              {formatDisappearingMode(chat.disappearingModeSeconds)}
            </span>
          </div>
        </div>
      </div>
      <Button variant="ghost" onClick={onToggleInfo}>
        <Info className="h-4 w-4" />
      </Button>
    </div>
  );
};
