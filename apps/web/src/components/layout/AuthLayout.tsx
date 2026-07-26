import type { PropsWithChildren } from 'react';

import { ShieldCheck, Sparkles, Waves } from 'lucide-react';

import { ThemeToggle } from '@/components/common/ThemeToggle';

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: 'Private conversations',
    description: 'A focused place for the conversations that matter most.'
  },
  {
    icon: Waves,
    title: 'Fast, without the clutter',
    description: 'Messages, reactions, media, and presence stay close at hand.'
  },
  {
    icon: Sparkles,
    title: 'Made to feel human',
    description: 'Simple details help every chat feel easy to pick up and use.'
  }
];

export const AuthLayout = ({ children }: PropsWithChildren) => (
  <div className="safe-px safe-pt safe-pb min-h-screen">
    <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[36px] glass-panel lg:grid-cols-[1.08fr_minmax(440px,0.92fr)]">
      <section className="relative hidden overflow-hidden border-r border-white/10 px-10 py-10 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.24),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.18),transparent_22%),linear-gradient(145deg,rgba(15,23,42,0.98),rgba(16,24,39,0.82))]" />
        <div className="absolute inset-y-8 right-8 w-px bg-white/10" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.38em] text-emerald-200/80">Pulse Chat</p>
                <h1 className="mt-6 max-w-xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.05em]">
                  Your people, your conversations, all in one calm place.
                </h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-slate-200/78">
                  Stay close to friends, family, and teams with a chat experience designed to get out of the way.
                </p>
              </div>
              <ThemeToggle />
            </div>

            <div className="mt-16 grid gap-4">
              {HIGHLIGHTS.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[28px] border border-white/12 bg-white/6 p-5 backdrop-blur-xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                        <Icon className="h-5 w-5 text-emerald-200" />
                      </div>
                      <div>
                        <p className="text-base font-semibold">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-200/72">{item.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 mt-10 flex items-center justify-between rounded-[28px] border border-white/10 bg-white/6 px-5 py-4 backdrop-blur-xl">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-200/80">PULSECHAT</p>
              <p className="mt-1 text-sm text-slate-200/72">A better space for everyday conversations.</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold tracking-tight">∞</p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-300/70">Stay close</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative flex min-h-[calc(100vh-2rem)] items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
        <div className="absolute left-6 top-6 lg:hidden">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </section>
    </div>
  </div>
);
