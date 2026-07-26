import type { AttachmentDto, MessageDto } from '@chat-app/shared';

import { CheckCheck, CheckIcon, Clock3, Download, LoaderCircle, RefreshCcw, SmilePlus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { decryptAttachment, ensureLocalDevice } from '@/features/encryption/crypto';
import { cn } from '@/utils/cn';
import { formatChatTimestamp } from '@/utils/format';

type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';

type MessageBubbleProps = {
  message: MessageDto;
  own: boolean;
  showSenderName: boolean;
  plaintext: string;
  peerPublicAgreementKey?: string | null;
  onReact?: (messageId: string, emoji: string) => void;
  onRetry?: (clientMessageId: string) => void;
  status?: MessageStatus;
};

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '🙏'];

const AttachmentPreview = ({
  attachment,
  peerPublicAgreementKey
}: {
  attachment: AttachmentDto;
  peerPublicAgreementKey?: string | null;
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const isImageLike = attachment.mimeType.startsWith('image/');

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDecrypt = useCallback(async () => {
    if (!peerPublicAgreementKey || !attachment.encryption) {
      return;
    }

    setIsDecrypting(true);

    try {
      const localDevice = await ensureLocalDevice();
      const blob = await decryptAttachment(attachment, localDevice, peerPublicAgreementKey);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } finally {
      setIsDecrypting(false);
    }
  }, [attachment, peerPublicAgreementKey]);

  useEffect(() => {
    if (!isImageLike || previewUrl || isDecrypting || !peerPublicAgreementKey || !attachment.encryption) {
      return;
    }

    void handleDecrypt();
  }, [attachment.encryption, handleDecrypt, isDecrypting, isImageLike, peerPublicAgreementKey, previewUrl]);

  if (isImageLike && previewUrl) {
    const isSticker = attachment.fileName.endsWith('.svg');

    return (
      <img
        src={previewUrl}
        alt={attachment.fileName}
        className={cn(
          'mb-2 object-cover',
          isSticker
            ? 'h-44 w-44 object-contain drop-shadow-[0_18px_30px_rgba(15,23,42,0.14)]'
            : 'max-h-80 w-full rounded-[24px]'
        )}
      />
    );
  }

  return (
    <div className="mb-2 rounded-[24px] border border-white/15 bg-white/10 p-3 text-sm dark:border-line dark:bg-slate-900/55">
      <p className="truncate font-medium">{attachment.fileName}</p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => void handleDecrypt()}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs transition hover:bg-white/10 dark:border-line"
          disabled={isDecrypting}
        >
          {isDecrypting ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          {attachment.mimeType.startsWith('image/') ? 'Decrypt preview' : 'Decrypt download'}
        </button>
        {previewUrl && !attachment.mimeType.startsWith('image/') ? (
          <a href={previewUrl} download={attachment.fileName} className="text-xs underline">
            Save file
          </a>
        ) : null}
      </div>
    </div>
  );
};

export const MessageBubble = ({
  message,
  own,
  showSenderName,
  plaintext,
  peerPublicAgreementKey,
  onReact,
  onRetry,
  status = 'sent'
}: MessageBubbleProps) => {
  const [isReactionTrayOpen, setIsReactionTrayOpen] = useState(false);
  const isStickerMessage = message.type === 'sticker' && Boolean(message.attachment?.url);
  const shouldRenderPlaintext = (() => {
    const value = plaintext.trim();

    if (!value) {
      return false;
    }

    if (message.type === 'sticker' && /^Sent a sticker$/i.test(value)) {
      return false;
    }

    if (message.type === 'gif' && /^Sent a GIF:/i.test(value)) {
      return false;
    }

    if (message.type === 'image' && /^Sent an image:/i.test(value)) {
      return false;
    }

    return true;
  })();

  return (
    <div className={cn('flex px-1 py-1.5', own ? 'justify-end' : 'justify-start')}>
      <div className={cn('group relative max-w-[min(82%,38rem)]', own ? 'items-end' : 'items-start')}>
        {onReact ? (
          <div
            className={cn(
              'absolute -top-10 z-10 flex h-9 items-center gap-0.5 rounded-full border border-line bg-card px-1.5 shadow-float transition-all duration-150',
              own ? 'right-0' : 'left-0',
              isReactionTrayOpen
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-1 opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100'
            )}
          >
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                aria-label={`React with ${emoji}`}
                onClick={() => {
                  onReact(message.id, emoji);
                  setIsReactionTrayOpen(false);
                }}
                className="grid h-7 w-7 place-items-center rounded-full text-base transition hover:scale-110 hover:bg-card-muted"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : null}
        <div
          className={cn(
            'relative rounded-2xl px-3.5 py-2.5 shadow-[0_6px_18px_rgba(15,23,42,0.08)] transition-all duration-150',
            isStickerMessage && 'bg-transparent px-0 py-0 shadow-none',
            !isStickerMessage && own && 'rounded-br-md bg-accent text-white',
            !isStickerMessage && !own && 'rounded-bl-md border border-line bg-card text-ink dark:bg-slate-950/74'
          )}
        >
          {showSenderName ? (
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              {message.sender.name}
            </p>
          ) : null}
          {message.replyTo ? (
            <div
              className={cn(
                'mb-3 rounded-[22px] border px-3 py-2.5 text-xs',
                own ? 'border-white/15 bg-white/10' : 'border-line/80 bg-card-muted/80 dark:bg-slate-900/75'
              )}
            >
              <p className="font-semibold">{message.replyTo.sender.name}</p>
              <p className="truncate opacity-80">Replying to encrypted {message.replyTo.type}</p>
            </div>
          ) : null}

          {message.attachment?.url ? <AttachmentPreview attachment={message.attachment} peerPublicAgreementKey={peerPublicAgreementKey} /> : null}

          {shouldRenderPlaintext ? <p className="whitespace-pre-wrap text-sm leading-6">{plaintext}</p> : null}

          {message.reactions.length > 0 ? (
            <div className={cn('absolute -bottom-4 flex flex-wrap gap-1', own ? 'right-2' : 'left-2')}>
              {message.reactions.map((reaction) => (
                <span
                  key={reaction.emoji}
                  className={cn(
                    'inline-flex items-center rounded-full border border-line bg-card px-2 py-0.5 text-xs text-ink shadow-sm'
                  )}
                >
                  {reaction.emoji} {reaction.userIds.length}
                </span>
              ))}
            </div>
          ) : null}

          <div className="hidden">
            {['👍', '❤️', '🔥'].map((emoji) => (
              <span key={emoji} />
            ))}
          </div>

          <div
            className={cn(
              'mt-2 flex items-center gap-1.5 text-[11px] font-medium',
              own ? 'justify-end text-white/78' : 'justify-end text-muted',
              isStickerMessage && (own ? 'pr-2 text-emerald-50/90' : 'pr-2 text-muted')
            )}
          >
            {message.expiresAt ? <Clock3 className="h-3.5 w-3.5" /> : null}
            <span>{formatChatTimestamp(message.createdAt)}</span>
            {own && status === 'sending' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
            {own && status === 'sent' ? <CheckIcon className="h-3.5 w-3.5" /> : null}
            {own && status === 'delivered' ? <CheckCheck className="h-3.5 w-3.5 text-white/80" /> : null}
            {own && status === 'seen' ? <CheckCheck className="h-3.5 w-3.5 text-warm" /> : null}
            {own && status === 'failed' ? (
              <button
                type="button"
                onClick={() => message.clientMessageId && onRetry?.(message.clientMessageId)}
                className="inline-flex items-center gap-1 text-rose-200"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Retry
              </button>
            ) : null}
          </div>
        </div>
        {onReact ? (
          <button
            type="button"
            aria-label="Open message reactions"
            onClick={() => setIsReactionTrayOpen((current) => !current)}
            className={cn(
              'absolute -bottom-2 grid h-7 w-7 place-items-center rounded-full border border-line bg-card text-muted shadow-sm transition hover:text-accent',
              own ? '-left-9' : '-right-9'
            )}
          >
            <SmilePlus className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
};
