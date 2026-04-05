import type { ChatDto } from '@chat-app/shared';

import { memo, useEffect, useLayoutEffect, useRef } from 'react';

import { MessageBubble } from '@/components/chat/MessageBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { EmptyState } from '@/components/common/EmptyState';
import type { SecureMessageView } from '@/features/messages/use-secure-messages';

type MessageListProps = {
  chat: ChatDto;
  messages: SecureMessageView[];
  currentUserId: string;
  typingNames: string[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  localStatuses?: Record<string, 'sending' | 'failed'>;
  peerPublicAgreementKey?: string | null;
  onReact: (messageId: string, emoji: string) => void;
  onRetry: (clientMessageId: string) => void;
};

type MessageRowProps = {
  chat: ChatDto;
  message: SecureMessageView;
  currentUserId: string;
  localStatuses?: Record<string, 'sending' | 'failed'>;
  peerPublicAgreementKey?: string | null;
  onReact: (messageId: string, emoji: string) => void;
  onRetry: (clientMessageId: string) => void;
};

const MessageRow = memo(
  ({
    chat,
    message,
    currentUserId,
    localStatuses,
    peerPublicAgreementKey,
    onReact,
    onRetry
  }: MessageRowProps) => {
    const own = message.sender.id === currentUserId;
    const showSenderName = chat.isGroupChat && !own;
    const seenByOthers = message.seenBy.some((receipt) => receipt.userId !== currentUserId);
    const localStatus = message.clientMessageId ? localStatuses?.[message.clientMessageId] : undefined;
    const directRecipient =
      !chat.isGroupChat
        ? chat.participants.find((participant) => participant.id !== currentUserId) ?? null
        : null;
    const status =
      localStatus ??
      (!own
        ? undefined
        : seenByOthers
          ? 'seen'
          : message.status === 'seen'
            ? 'seen'
            : directRecipient?.isOnline || message.status === 'delivered'
              ? 'delivered'
              : 'sent');

    return (
      <MessageBubble
        message={message}
        own={own}
        showSenderName={showSenderName}
        plaintext={message.plaintext}
        peerPublicAgreementKey={peerPublicAgreementKey}
        onReact={onReact}
        onRetry={onRetry}
        status={status}
      />
    );
  }
);

MessageRow.displayName = 'MessageRow';

export const MessageList = ({
  chat,
  messages,
  currentUserId,
  typingNames,
  hasMore,
  isLoadingMore,
  onLoadMore,
  localStatuses,
  peerPublicAgreementKey,
  onReact,
  onRetry
}: MessageListProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const previousScrollHeightRef = useRef<number | null>(null);
  const isFetchingOlderRef = useRef(false);
  const lastMessageId = messages.at(-1)?.id ?? null;
  const typingSignature = typingNames.join('|');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lastMessageId, typingSignature]);

  useEffect(() => {
    const container = containerRef.current;
    const sentinel = topRef.current;

    if (!container || !sentinel || !hasMore || !onLoadMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || isFetchingOlderRef.current) {
          return;
        }

        previousScrollHeightRef.current = container.scrollHeight;
        isFetchingOlderRef.current = true;
        onLoadMore();
      },
      {
        root: container,
        threshold: 0.2
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, onLoadMore]);

  useLayoutEffect(() => {
    if (!isLoadingMore && isFetchingOlderRef.current && containerRef.current) {
      const previousHeight = previousScrollHeightRef.current ?? containerRef.current.scrollHeight;
      const delta = containerRef.current.scrollHeight - previousHeight;
      containerRef.current.scrollTop += delta;
      isFetchingOlderRef.current = false;
      previousScrollHeightRef.current = null;
    }
  }, [isLoadingMore, messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-8">
        <EmptyState
          title="No messages yet"
          description={chat.isGroupChat ? 'Start the conversation with your group.' : 'Send the first message to begin the chat.'}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4 lg:px-5"
      style={{ contentVisibility: 'auto' }}
    >
      <div ref={topRef} />
      {isLoadingMore ? (
        <p className="px-2 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
          Loading older messages...
        </p>
      ) : null}
      {messages.map((message) => (
        <MessageRow
          key={message.id}
          chat={chat}
          message={message}
          currentUserId={currentUserId}
          localStatuses={localStatuses}
          peerPublicAgreementKey={peerPublicAgreementKey}
          onReact={onReact}
          onRetry={onRetry}
        />
      ))}
      <TypingIndicator names={typingNames} />
      <div ref={bottomRef} />
    </div>
  );
};
