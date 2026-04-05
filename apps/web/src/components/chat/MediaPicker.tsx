import { useDeferredValue, useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { ImageIcon, Search, Sparkles, Sticker, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { EMOJI_PACK } from '@/features/messages/emoji-pack';
import { giphyService, hasGiphyKey } from '@/features/messages/giphy';
import { createStickerFile, STICKER_PACK } from '@/features/messages/sticker-pack';

type MediaTab = 'emoji' | 'gif' | 'sticker';

type MediaPickerProps = {
  activeTab: MediaTab;
  onTabChange: (tab: MediaTab) => void;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  onSelectGif: (file: File) => void;
  onSelectSticker: (file: File) => void;
};

const tabs: Array<{ id: MediaTab; label: string; icon: typeof Sparkles }> = [
  { id: 'emoji', label: 'Emoji', icon: Sparkles },
  { id: 'gif', label: 'GIF', icon: ImageIcon },
  { id: 'sticker', label: 'Sticker', icon: Sticker }
];

export const MediaPicker = ({
  activeTab,
  onTabChange,
  onClose,
  onSelectEmoji,
  onSelectGif,
  onSelectSticker
}: MediaPickerProps) => {
  const [gifSearch, setGifSearch] = useState('');
  const deferredSearch = useDeferredValue(gifSearch.trim());

  const gifQuery = useQuery({
    queryKey: ['gif-search', deferredSearch],
    queryFn: () => (deferredSearch ? giphyService.search(deferredSearch) : giphyService.trending()),
    enabled: activeTab === 'gif' && hasGiphyKey
  });

  const emojiGroups = useMemo(() => {
    const midpoint = Math.ceil(EMOJI_PACK.length / 2);
    return [EMOJI_PACK.slice(0, midpoint), EMOJI_PACK.slice(midpoint)];
  }, []);

  return (
    <div className="mb-3 overflow-hidden rounded-[30px] border border-line bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.92))] p-3 shadow-soft backdrop-blur dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.92))]">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-line/70 pb-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <Button
                key={tab.id}
                type="button"
                variant={activeTab === tab.id ? 'primary' : 'secondary'}
                className="h-10 rounded-full px-4"
                onClick={() => onTabChange(tab.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-line bg-white/70 p-2 text-muted transition hover:border-accent/25 hover:text-accent dark:bg-slate-950/70"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {activeTab === 'emoji' ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">Tap an emoji to insert it into your secure message.</p>
          {emojiGroups.map((group, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 sm:grid-cols-10 xl:grid-cols-12">
              {group.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onSelectEmoji(emoji)}
                  className="rounded-[22px] border border-line/80 bg-white/75 px-3 py-3 text-2xl transition hover:-translate-y-0.5 hover:border-accent hover:bg-accent-soft hover:shadow-soft dark:bg-slate-900/55"
                >
                  {emoji}
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'gif' ? (
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={gifSearch}
              onChange={(event) => setGifSearch(event.target.value)}
              placeholder="Search reaction GIFs"
              className="pl-11"
            />
          </div>

          {!hasGiphyKey ? (
            <div className="rounded-[24px] border border-dashed border-line bg-slate-50/70 p-5 text-sm leading-6 text-muted dark:bg-slate-900/50">
              Add `VITE_GIPHY_API_KEY` to enable GIF search. Selected GIFs are fetched in the browser and then sent as encrypted attachments.
            </div>
          ) : gifQuery.isLoading ? (
            <div className="rounded-[24px] border border-line bg-slate-50/70 p-5 text-sm text-muted dark:bg-slate-900/50">
              Searching GIFs...
            </div>
          ) : gifQuery.isError ? (
            <div className="rounded-[24px] border border-line bg-slate-50/70 p-5 text-sm text-muted dark:bg-slate-900/50">
              GIF search is temporarily unavailable.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(gifQuery.data ?? []).map((gif) => (
                  <button
                    key={gif.id}
                    type="button"
                    onClick={async () => {
                      try {
                        const file = await giphyService.downloadAsFile(gif);
                        onSelectGif(file);
                      } catch {
                        toast.error('Unable to import that GIF right now');
                      }
                    }}
                    className="group overflow-hidden rounded-[24px] border border-line bg-white/75 text-left transition hover:-translate-y-0.5 hover:border-accent hover:shadow-soft dark:bg-slate-900/50"
                  >
                    <img
                      src={gif.previewUrl}
                      alt={gif.title}
                      className="aspect-square w-full object-cover"
                      loading="lazy"
                    />
                    <div className="px-3 py-2">
                      <p className="truncate text-xs font-medium text-muted group-hover:text-ink">{gif.title || 'GIF'}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted">
                Powered by <a href="https://developers.giphy.com/" target="_blank" rel="noreferrer" className="underline">GIPHY</a>
              </p>
            </>
          )}
        </div>
      ) : null}

      {activeTab === 'sticker' ? (
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted">
            Built-in sticker pack with browser-safe vector artwork. Stickers are encrypted and sent like image attachments.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {STICKER_PACK.map((sticker) => (
              <button
                key={sticker.id}
                type="button"
                onClick={() => onSelectSticker(createStickerFile(sticker))}
                className="group overflow-hidden rounded-[26px] border border-line/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,245,249,0.94))] p-2 text-left transition hover:-translate-y-0.5 hover:border-accent hover:shadow-soft dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.8))]"
              >
                <div className="rounded-[22px] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.1),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.88),rgba(236,253,245,0.72))] p-2 dark:bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.16),transparent_55%),linear-gradient(180deg,rgba(15,23,42,0.8),rgba(15,23,42,0.58))]">
                  <img
                    src={sticker.previewUrl}
                    alt={sticker.name}
                    className="h-24 w-full object-contain drop-shadow-[0_12px_20px_rgba(15,23,42,0.18)] sm:h-28"
                  />
                </div>
                <div className="px-1 pb-1 pt-2">
                  <span className="block truncate text-xs font-semibold text-ink/80 group-hover:text-ink dark:text-slate-100 dark:group-hover:text-white">
                    {sticker.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
