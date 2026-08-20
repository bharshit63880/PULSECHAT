import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, PhoneCall, PhoneMissed, Video } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { callsApi } from '@/features/calls/api';
import { useAuthStore } from '@/store/auth-store';
import { useUiStore } from '@/store/ui-store';

export const CallsPage = () => {
  const user = useAuthStore((state) => state.user);
  const setActiveChatId = useUiStore((state) => state.setActiveChatId);
  const navigate = useNavigate();
  const callsQuery = useQuery({
    queryKey: ['calls'],
    queryFn: callsApi.list,
    enabled: Boolean(user),
  });

  return (
    <div className="safe-px safe-pt safe-pb min-h-screen">
      <main className="mx-auto max-w-3xl overflow-hidden rounded-[32px] glass-panel">
        <header className="flex items-center gap-3 border-b border-line/80 px-5 py-5 sm:px-7">
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Calls</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em]">Recent calls</h1>
            <p className="mt-1 text-sm text-muted">
              Your private call activity across direct conversations.
            </p>
          </div>
        </header>
        <section className="p-5 sm:p-7">
          {callsQuery.isLoading ? (
            <p className="py-12 text-sm text-muted">Loading call activity...</p>
          ) : null}
          {callsQuery.isError ? (
            <p className="py-12 text-sm text-rose-400">
              Call activity could not be loaded right now.
            </p>
          ) : null}
          {!callsQuery.isLoading && !callsQuery.isError && callsQuery.data?.length === 0 ? (
            <div className="py-16 text-center">
              <PhoneCall className="mx-auto h-8 w-8 text-accent" />
              <h2 className="mt-4 text-lg font-semibold">No calls yet</h2>
              <p className="mt-2 text-sm text-muted">
                Start an audio call from a direct conversation when you are ready.
              </p>
            </div>
          ) : null}
          <div className="divide-y divide-line/70">
            {callsQuery.data?.map((call) => {
              const other = call.caller.id === user?.id ? call.recipient : call.caller;
              const missed = ['missed', 'rejected', 'busy', 'failed'].includes(call.status);
              return (
                <button
                  key={call.id}
                  type="button"
                  onClick={() => {
                    setActiveChatId(call.chatId);
                    navigate('/');
                  }}
                  className="flex w-full items-center gap-3 px-1 py-4 text-left transition hover:bg-accent-soft/50"
                >
                  <Avatar src={other.avatarUrl} alt={other.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{other.name}</p>
                    <p className={`mt-0.5 text-xs ${missed ? 'text-rose-400' : 'text-muted'}`}>
                      {missed
                        ? 'Missed or declined'
                        : call.type === 'video'
                          ? 'Video call'
                          : 'Audio call'}{' '}
                      · {new Date(call.initiatedAt).toLocaleString()}
                    </p>
                  </div>
                  {call.type === 'video' ? (
                    <Video className="h-4 w-4 text-muted" />
                  ) : missed ? (
                    <PhoneMissed className="h-4 w-4 text-rose-400" />
                  ) : (
                    <PhoneCall className="h-4 w-4 text-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
