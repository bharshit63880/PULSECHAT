import type { PropsWithChildren } from 'react';

import { ThemeToggle } from '@/components/common/ThemeToggle';

export const AuthLayout = ({ children }: PropsWithChildren) => (
  <div className="min-h-screen px-4 py-6 sm:px-6">
    <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[36px] border border-white/50 bg-white/70 shadow-soft backdrop-blur dark:border-white/5 dark:bg-slate-950/70">
      <div className="hidden flex-1 flex-col justify-between bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.20),_transparent_36%),linear-gradient(135deg,_rgba(15,23,42,0.92),_rgba(15,23,42,0.76))] p-10 text-white lg:flex">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">Pulse Chat</p>
            <h1 className="mt-3 max-w-sm text-4xl font-bold leading-tight">
              Real-time conversations built for modern teams.
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            Presence, typing indicators, attachments, seen receipts, and chat-first collaboration.
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            Recruiter-friendly structure with shared contracts, strict TypeScript, and modular domains.
          </div>
        </div>
      </div>
      <div className="flex w-full flex-1 items-center justify-center p-6 sm:p-10">{children}</div>
    </div>
  </div>
);
