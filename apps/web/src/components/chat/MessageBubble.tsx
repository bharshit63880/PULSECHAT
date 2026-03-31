import type { AttachmentDto, MessageDto } from '@chat-app/shared';

import { CheckCheck, CheckIcon, Clock3, Download, LoaderCircle, RefreshCcw } from 'lucide-react';
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

const QuickReaction = ({ emoji, onClick }: { emoji: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-full border border-white/15 px-2 py-1 text-xs transition hover:bg-white/10 dark:border-line"
  >
    {emoji}
  </button>
);

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
  }, [handleDecrypt, isDecrypting, isImageLike, peerPublicAgreementKey, previewUrl, attachment.encryption]);

  if (isImageLike && previewUrl) {
    const isSticker = attachment.fileName.endsWith('.svg');

    return (
      <img
        src={previewUrl}
        alt={attachment.fileName}
        className={cn(
          'mb-2 object-cover',
          isSticker ? 'h-44 w-44 bg-transparent object-contain drop-shadow-[0_14px_28px_rgba(15,23,42,0.18)]' : 'max-h-72 w-full rounded-2xl'
        )}
      />
    );
  }

  return (
    <div className="mb-2 rounded-2xl border border-white/15 bg-white/10 p-3 text-sm dark:border-line dark:bg-slate-900">
      <p className="truncate font-medium">{attachment.fileName}</p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => void handleDecrypt()}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs transition hover:bg-white/10 dark:border-line"
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
    <div className={cn('flex', own ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[78%] rounded-[24px] px-4 py-3 shadow-sm',
          isStickerMessage && 'bg-transparent px-0 py-0 shadow-none',
          !isStickerMessage && own ? 'rounded-br-md bg-accent text-white' : '',
          !isStickerMessage && !own ? 'rounded-bl-md bg-card' : ''
        )}
      >
        {showSenderName ? <p className="mb-2 text-xs font-semibold text-emerald-300">{message.sender.name}</p> : null}
        {message.replyTo ? (
          <div className={cn('mb-2 rounded-2xl border px-3 py-2 text-xs', own ? 'border-white/15 bg-white/10' : 'border-line bg-slate-50 dark:bg-slate-900')}>
            <p className="font-semibold">{message.replyTo.sender.name}</p>
            <p className="truncate opacity-80">Replying to encrypted {message.replyTo.type}</p>
          </div>
        ) : null}

        {message.attachment?.url ? <AttachmentPreview attachment={message.attachment} peerPublicAgreementKey={peerPublicAgreementKey} /> : null}

        {shouldRenderPlaintext ? <p className="whitespace-pre-wrap text-sm leading-6">{plaintext}</p> : null}

        {message.reactions.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.reactions.map((reaction) => (
              <span key={reaction.emoji} className="rounded-full border border-white/15 px-2 py-1 text-xs dark:border-line">
                {reaction.emoji} {reaction.userIds.length}
              </span>
            ))}
          </div>
        ) : null}

        <div className={cn('mt-3 flex flex-wrap gap-2', isStickerMessage && 'mt-2')}>
          {['👍', '❤️', '🔥'].map((emoji) => (
            <QuickReaction key={emoji} emoji={emoji} onClick={() => onReact?.(message.id, emoji)} />
          ))}
        </div>

        <div
          className={cn(
            'mt-2 flex items-center gap-1 text-[11px]',
            own ? 'justify-end text-white/75' : 'justify-end text-muted',
            isStickerMessage && (own ? 'pr-2 text-emerald-50/90' : 'pr-2 text-muted')
          )}
        >
          {message.expiresAt ? <Clock3 className="h-3.5 w-3.5" /> : null}
          <span>{formatChatTimestamp(message.createdAt)}</span>
          {own && status === 'sending' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
          {own && status === 'sent' ? <CheckIcon className="h-3.5 w-3.5" /> : null}
          {own && status === 'delivered' ? <CheckCheck className="h-3.5 w-3.5 text-white/80" /> : null}
          {own && status === 'seen' ? <CheckCheck className="h-3.5 w-3.5 text-amber-200" /> : null}
          {own && status === 'failed' ? (
            <button type="button" onClick={() => message.clientMessageId && onRetry?.(message.clientMessageId)} className="inline-flex items-center gap-1 text-rose-200">
              <RefreshCcw className="h-3.5 w-3.5" />
              Retry
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
