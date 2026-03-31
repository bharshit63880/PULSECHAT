import type { ChatDto } from '@chat-app/shared';

import { useEffect, useRef } from 'react';

import { MessageBubble } from '@/components/chat/MessageBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { EmptyState } from '@/components/common/EmptyState';
import type { SecureMessageView } from '@/features/messages/use-secure-messages';

type MessageListProps = {
  chat: ChatDto;
  messages: SecureMessageView[];
  currentUserId: string;
  typingNames: string[];
  localStatuses?: Record<string, 'sending' | 'failed'>;
  peerPublicAgreementKey?: string | null;
  onReact: (messageId: string, emoji: string) => void;
  onRetry: (clientMessageId: string) => void;
};

export const MessageList = ({
  chat,
  messages,
  currentUserId,
  typingNames,
  localStatuses,
  peerPublicAgreementKey,
  onReact,
  onRetry
}: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingSignature = typingNames.join('|');
  const directRecipient =
    !chat.isGroupChat
      ? chat.participants.find((participant) => participant.id !== currentUserId) ?? null
      : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typingSignature]);

  if (messages.length === 0) {
    return (
      <EmptyState
        title="No messages yet"
        description={chat.isGroupChat ? 'Start the conversation with your group.' : 'Send the first message to begin the chat.'}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-4">
      {messages.map((message) => {
        const own = message.sender.id === currentUserId;
        const showSenderName = chat.isGroupChat && !own;
        const seenByOthers = message.seenBy.some((receipt) => receipt.userId !== currentUserId);
        const localStatus = message.clientMessageId ? localStatuses?.[message.clientMessageId] : undefined;
        const status = localStatus ?? (!own
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
            key={message.id}
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
      })}
      <TypingIndicator names={typingNames} />
      <div ref={bottomRef} />
    </div>
  );
};
