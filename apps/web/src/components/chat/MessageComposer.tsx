import { Paperclip, SendHorizonal, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { MediaPicker } from '@/components/chat/MediaPicker';
import { Button } from '@/components/common/Button';

type MessageComposerProps = {
  onSend: (payload: {
    text?: string | null;
    file?: File | null;
    type: 'text' | 'image' | 'file' | 'gif' | 'sticker';
  }) => Promise<void>;
  onTypingStart: () => void;
  onTypingStop: () => void;
  disabled?: boolean;
};

export const MessageComposer = ({
  onSend,
  onTypingStart,
  onTypingStop,
  disabled
}: MessageComposerProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentType, setAttachmentType] = useState<'image' | 'file' | 'gif' | 'sticker' | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaTab, setMediaTab] = useState<'emoji' | 'gif' | 'sticker'>('emoji');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!attachment || !attachmentType || !['image', 'gif', 'sticker'].includes(attachmentType)) {
      setAttachmentPreviewUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(attachment);
    setAttachmentPreviewUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [attachment, attachmentType]);

  const scheduleTypingStop = () => {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      onTypingStop();
    }, 1200);
  };

  const handleSubmit = async () => {
    if ((!text.trim() && !attachment) || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSend({
        text: text.trim() || null,
        file: attachment,
        type: attachment
          ? attachmentType ?? (attachment.type.startsWith('image/') ? 'image' : 'file')
          : 'text'
      });

      setText('');
      setAttachment(null);
      setAttachmentType(null);
      setIsMediaPickerOpen(false);
      onTypingStop();
    } catch (error) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ===
          'string'
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response!.data!.error!.message!
          : 'Unable to send this message right now';

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStandardAttachmentChange = (file: File | null) => {
    setAttachment(file);
    setAttachmentType(file ? (file.type === 'image/gif' ? 'gif' : file.type.startsWith('image/') ? 'image' : 'file') : null);
    setIsMediaPickerOpen(false);
  };

  const attachmentLabel =
    attachmentType === 'sticker'
      ? `Sticker ready: ${attachment?.name ?? 'sticker'}`
      : attachmentType === 'gif'
        ? `GIF ready: ${attachment?.name ?? 'animated media'}`
        : attachment?.name ?? null;

  const placeholder =
    attachmentType === 'sticker'
      ? 'Add an optional note with your sticker'
      : attachmentType === 'gif'
        ? 'Add an optional caption with your GIF'
        : attachment
          ? 'Add a secure note or send your encrypted file'
          : 'Write a secure message';

  return (
    <div className="border-t border-line bg-card px-3 pb-[calc(0.75rem+var(--safe-bottom))] pt-2 sm:px-4 lg:px-5">
      {isMediaPickerOpen ? (
        <MediaPicker
          activeTab={mediaTab}
          onTabChange={setMediaTab}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelectEmoji={(emoji) => {
            setText((current) => `${current}${emoji}`);
          }}
          onSelectGif={(file) => {
            setAttachment(file);
            setAttachmentType('gif');
            setIsMediaPickerOpen(false);
          }}
          onSelectSticker={(file) => {
            setAttachment(file);
            setAttachmentType('sticker');
            setIsMediaPickerOpen(false);
          }}
        />
      ) : null}

      {attachment ? (
        <div className="mb-2 flex items-center justify-between gap-3 rounded-2xl border border-line bg-card-muted px-3 py-2">
          <div className="flex min-w-0 items-center gap-3">
            {attachmentPreviewUrl ? (
              <img
                src={attachmentPreviewUrl}
                alt={attachment.name}
                className="h-12 w-12 rounded-2xl bg-card-muted p-1 object-contain"
              />
            ) : null}
            <span className="truncate text-sm text-ink">{attachmentLabel}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setAttachment(null);
              setAttachmentType(null);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-line/80 text-muted transition hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="flex items-end gap-2 rounded-2xl border border-line bg-card-muted px-2 py-2 shadow-sm">
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt,.csv"
            onChange={(event) => handleStandardAttachmentChange(event.target.files?.[0] ?? null)}
          />

          <Button
            variant="secondary"
            type="button"
            className="h-10 w-10 rounded-xl p-0"
            aria-label="Attach a file"
            title="Attach a file"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isSubmitting}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            type="button"
            className="h-10 w-10 rounded-xl p-0"
            aria-label="Open emoji, GIF, and sticker picker"
            title="Media"
            onClick={() => {
              setMediaTab('emoji');
              setIsMediaPickerOpen((current) => !current);
            }}
            disabled={disabled || isSubmitting}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>

          <textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              onTypingStart();
              scheduleTypingStop();
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleSubmit();
              }
            }}
            rows={1}
            placeholder={placeholder}
            className="min-h-[44px] max-h-32 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-ink outline-none placeholder:text-muted"
            disabled={disabled || isSubmitting}
          />
          <Button
            type="button"
            className="h-10 w-10 rounded-xl p-0"
            aria-label="Send message"
            title="Send message"
            onClick={() => void handleSubmit()}
            disabled={disabled || isSubmitting}
          >
            <SendHorizonal className="h-4.5 w-4.5" />
          </Button>
      </div>
    </div>
  );
};
