import type { ChatDto } from '@chat-app/shared';

import { LazyMotion, domAnimation, m } from 'framer-motion';
import { ArrowLeft, Info, Phone, ShieldCheck } from 'lucide-react';

import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { formatLastSeen } from '@/utils/format';

type ChatHeaderProps = {
  chat: ChatDto;
  currentUserId: string;
  onBack: () => void;
  onToggleInfo: () => void;
  onVoiceCall?: () => void;
  isCalling?: boolean;
};

const formatDisappearingMode = (seconds: number) => {
  if (seconds === 0) {
    return 'Kept forever';
  }

  if (seconds === 300) {
    return 'Disappears in 5 min';
  }

  if (seconds === 3600) {
    return 'Disappears in 1 hour';
  }

  if (seconds === 86400) {
    return 'Disappears in 1 day';
  }

  return `Disappears in ${Math.round(seconds / 86400)} days`;
};

export const ChatHeader = ({ chat, currentUserId, onBack, onToggleInfo, onVoiceCall, isCalling }: ChatHeaderProps) => {
  const counterpart =
    !chat.isGroupChat
      ? chat.participants.find((participant) => participant.id !== currentUserId) ?? chat.participants[0]
      : null;

  const title = chat.isGroupChat ? chat.name ?? 'Untitled group' : counterpart?.name ?? 'Secure conversation';
  const subtitle = chat.isGroupChat
    ? `${chat.participants.length} members`
    : counterpart?.isOnline
      ? 'Online now'
      : formatLastSeen(counterpart?.lastSeen);

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="border-b border-line mobile-nav-blur px-4 py-3 sm:px-5"
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
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-1 text-[10px] font-semibold text-accent">
                  <ShieldCheck className="h-3 w-3" />
                  {chat.isGroupChat ? 'Group' : 'Private'}
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
          <div className="flex items-center gap-2">{!chat.isGroupChat && onVoiceCall ? <Button aria-label="Start voice call" title="Start voice call" variant="secondary" className="h-11 w-11 rounded-2xl p-0" onClick={onVoiceCall} disabled={isCalling}><Phone className="h-4 w-4" /></Button> : null}<Button variant="secondary" className="h-11 w-11 rounded-2xl p-0" onClick={onToggleInfo}>
            <Info className="h-4 w-4" />
          </Button></div>
        </div>
      </m.div>
    </LazyMotion>
  );
};
