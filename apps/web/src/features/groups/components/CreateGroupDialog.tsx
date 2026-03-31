import type { AuthUser } from '@chat-app/shared';

import { Check, Search, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

type CreateGroupDialogProps = {
  open: boolean;
  users: AuthUser[];
  currentUserId: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onCreate: (payload: { name: string; participantIds: string[] }) => void;
};

export const CreateGroupDialog = ({
  open,
  users,
  currentUserId,
  isSubmitting,
  onClose,
  onCreate
}: CreateGroupDialogProps) => {
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const candidates = useMemo(
    () =>
      users.filter((user) => {
        if (user.id === currentUserId) {
          return false;
        }

        if (!search.trim()) {
          return true;
        }

        const haystack = `${user.name} ${user.username} ${user.email}`.toLowerCase();
        return haystack.includes(search.trim().toLowerCase());
      }),
    [currentUserId, search, users]
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/40 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Group Chat MVP</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Create a shared conversation</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Group chats currently use a clearly labeled server-group mode for text messages. Direct chats remain end-to-end encrypted.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line p-2 text-muted transition hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Group name</label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Project squad, design review, launch room..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Add members</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search teammates by name, username, or email"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-line bg-card/60 p-3">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              <Users className="h-4 w-4" />
              Selected {selectedIds.length + 1} members including you
            </div>
            <div className="grid max-h-80 gap-2 overflow-y-auto overscroll-contain sm:grid-cols-2">
              {candidates.map((user) => {
                const selected = selectedIds.includes(user.id);

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() =>
                      setSelectedIds((current) =>
                        current.includes(user.id)
                          ? current.filter((entry) => entry !== user.id)
                          : [...current, user.id]
                      )
                    }
                    className={`flex items-center justify-between gap-3 rounded-3xl border px-3 py-3 text-left transition ${
                      selected
                        ? 'border-accent/30 bg-emerald-50 dark:bg-emerald-950/20'
                        : 'border-transparent bg-white/70 hover:border-line dark:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar src={user.avatarUrl} alt={user.name} online={user.isOnline} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                        <p className="truncate text-xs text-muted">@{user.username}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                        selected ? 'border-accent bg-accent text-white' : 'border-line text-muted'
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted">
              You need at least 3 unique members including yourself to start a group.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => onCreate({ name, participantIds: selectedIds })}
                disabled={name.trim().length < 2 || selectedIds.length < 2 || isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create group'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
