import type { PropsWithChildren } from 'react';

import { Heart, MessageCircleMore, ShieldCheck, Sparkles, Waves } from 'lucide-react';

import { ThemeToggle } from '@/components/common/ThemeToggle';

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: 'Private conversations',
    description: 'A focused place for the conversations that matter most.',
  },
  {
    icon: Waves,
    title: 'Fast, without the clutter',
    description: 'Messages, reactions, media, and presence stay close at hand.',
  },
  {
    icon: Sparkles,
    title: 'Made to feel human',
    description: 'Simple details help every chat feel easy to pick up and use.',
  },
];

export const AuthLayout = ({ children }: PropsWithChildren) => (
  <div className="safe-px safe-pt safe-pb min-h-screen">
    <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1440px] overflow-hidden rounded-[36px] glass-panel lg:grid-cols-[1.08fr_minmax(440px,0.92fr)]">
      <section className="relative hidden overflow-hidden border-r border-white/10 px-10 py-10 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(131,66,255,0.34),transparent_28%),radial-gradient(circle_at_9%_92%,rgba(255,75,139,0.28),transparent_27%),linear-gradient(145deg,#090c2b,#101443_56%,#06081f)]" />
        <div className="absolute left-[12%] top-[31%] h-[520px] w-[420px] rotate-[-24deg] rounded-[48%] border-[28px] border-violet-500/35 blur-[1px]" />
        <div className="absolute bottom-[4%] left-[5%] h-[290px] w-[520px] rotate-[16deg] rounded-[50%] border-[16px] border-pink-400/30 blur-[2px]" />
        <div className="absolute right-[13%] top-[20%] h-20 w-20 rounded-full bg-pink-400/20 blur-2xl" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/pulsechat-mark.svg"
                  alt="PulseChat"
                  className="h-11 w-11 rounded-2xl shadow-[0_12px_30px_rgba(93,63,255,0.34)]"
                />
                <p className="text-xl font-bold tracking-tight">PulseChat</p>
              </div>
              <ThemeToggle />
            </div>

            <div className="relative mt-24">
              <div className="absolute -left-1 top-[-74px] flex h-12 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-float">
                <Heart className="h-6 w-6 fill-pink-300 text-pink-300" />
              </div>
              <div className="absolute right-4 top-[-30px] flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/30 backdrop-blur-xl">
                <MessageCircleMore className="h-6 w-6 text-violet-200" />
              </div>
              <h1 className="max-w-xl text-balance text-6xl font-semibold leading-[0.98] tracking-[-0.065em]">
                Talk freely.
                <br />
                <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Stay close.
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate-200/78">
                Meaningful conversations, expressive moments, and secure connections in one place.
              </p>
            </div>

            <div className="relative mt-14 grid max-w-xl gap-3">
              {HIGHLIGHTS.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[24px] border border-white/12 bg-white/[0.055] p-4 backdrop-blur-xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                        <Icon className="h-5 w-5 text-violet-200" />
                      </div>
                      <div>
                        <p className="text-base font-semibold">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-200/72">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 mt-10 flex items-center justify-between rounded-[28px] border border-white/10 bg-white/[0.055] px-5 py-4 backdrop-blur-xl">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-violet-200/80">
                PULSECHAT
              </p>
              <p className="mt-1 text-sm text-slate-200/72">
                A better space for everyday conversations.
              </p>
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
