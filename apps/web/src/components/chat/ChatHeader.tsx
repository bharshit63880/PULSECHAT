import type { ChatDto } from '@chat-app/shared';

import { LazyMotion, domAnimation, m } from 'framer-motion';
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
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="border-b border-line/80 mobile-nav-blur px-4 py-3 sm:px-5"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" className="h-11 w-11 rounded-2xl p-0 lg:hidden" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar src={counterpart?.avatarUrl} alt={title} online={counterpart?.isOnline} />
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-base font-semibold tracking-tight sm:text-lg">{title}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-emerald-200">
                  <ShieldCheck className="h-3 w-3" />
                  {chat.isGroupChat ? 'Group' : 'E2EE'}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                <span className="truncate">{subtitle}</span>
                <span className="inline-flex rounded-full border border-line/80 bg-white/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] dark:bg-slate-950/55">
                  {formatDisappearingMode(chat.disappearingModeSeconds)}
                </span>
              </div>
            </div>
          </div>
          <Button variant="secondary" className="h-11 w-11 rounded-2xl p-0" onClick={onToggleInfo}>
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </m.div>
    </LazyMotion>
  );
};
