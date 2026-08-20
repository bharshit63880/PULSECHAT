import type { AuthUser, ChatDto } from '@chat-app/shared';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MessageCircle, Search, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { chatsApi } from '@/features/chats/api';
import { usersApi } from '@/features/users/api';
import { useAuthStore } from '@/store/auth-store';
import { useUiStore } from '@/store/ui-store';

const PersonRow = ({
  user,
  onMessage,
  isOpening,
}: {
  user: AuthUser;
  onMessage: () => void;
  isOpening: boolean;
}) => (
  <article className="flex items-center gap-3 border-b border-line/60 px-1 py-4 last:border-none">
    <Avatar src={user.avatarUrl} alt={user.name} online={user.isOnline} />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
      <p className="mt-0.5 truncate text-xs text-muted">
        @{user.username}
        {user.bio ? ` · ${user.bio}` : ''}
      </p>
    </div>
    <Button
      variant="secondary"
      className="min-h-9 rounded-xl px-3"
      onClick={onMessage}
      disabled={isOpening}
    >
      <MessageCircle className="h-4 w-4" />
      Message
    </Button>
  </article>
);

export const PeoplePage = () => {
  const user = useAuthStore((state) => state.user);
  const setActiveChatId = useUiStore((state) => state.setActiveChatId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const peopleQuery = useQuery({
    queryKey: ['people', search.trim()],
    queryFn: () => usersApi.list(search.trim()),
    enabled: Boolean(user),
  });

  const createDirectMutation = useMutation({
    mutationFn: chatsApi.createDirect,
    onSuccess: (chat) => {
      queryClient.setQueryData<ChatDto[]>(['chats'], (current) => [
        chat,
        ...(current ?? []).filter((item) => item.id !== chat.id),
      ]);
      setActiveChatId(chat.id);
      navigate('/app');
    },
    onError: () => toast.error('Unable to open a conversation right now'),
  });

  const people = (peopleQuery.data ?? []).filter((person) => person.id !== user?.id);

  return (
    <div className="safe-px safe-pt safe-pb min-h-screen">
      <main className="mx-auto max-w-5xl overflow-hidden rounded-[32px] glass-panel">
        <header className="flex flex-col gap-5 border-b border-line/80 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button
                variant="ghost"
                className="h-11 w-11 rounded-2xl p-0"
                aria-label="Back to chats"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Community
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em]">People</h1>
              <p className="mt-1 text-sm text-muted">
                Find someone and start a private conversation.
              </p>
            </div>
          </div>
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find people by name or username"
              className="rounded-2xl bg-card-muted/60 pl-11 dark:bg-white/[0.045]"
            />
          </div>
        </header>

        <div className="grid min-h-[440px] gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="p-5 sm:p-7">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <UsersRound className="h-4 w-4 text-accent" />
              Suggested for you
            </div>
            {peopleQuery.isLoading ? (
              <p className="py-10 text-sm text-muted">Finding people…</p>
            ) : null}
            {peopleQuery.isError ? (
              <p className="py-10 text-sm text-rose-400">People could not be loaded right now.</p>
            ) : null}
            {!peopleQuery.isLoading && !peopleQuery.isError && people.length === 0 ? (
              <p className="py-10 text-sm text-muted">
                No people found. Try another name or username.
              </p>
            ) : null}
            <div>
              {people.map((person) => (
                <PersonRow
                  key={person.id}
                  user={person}
                  isOpening={createDirectMutation.isPending}
                  onMessage={() => createDirectMutation.mutate(person.id)}
                />
              ))}
            </div>
          </section>

          <aside className="border-t border-line/80 bg-gradient-to-b from-violet-500/10 to-transparent p-6 lg:border-l lg:border-t-0">
            <div className="rounded-[26px] border border-violet-300/20 bg-card/70 p-5 dark:bg-white/[0.035]">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent">
                <UsersRound className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">Start with a hello</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Open a direct chat from this directory. The app will establish the secure
                conversation before you send a message.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
