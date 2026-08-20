import type { PropsWithChildren } from 'react';

import { Heart, MessageCircleMore } from 'lucide-react';

import { ThemeToggle } from '@/components/common/ThemeToggle';

export const AuthLayout = ({ children }: PropsWithChildren) => (
  <div className="safe-px safe-pt safe-pb min-h-screen">
    <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1440px] overflow-hidden rounded-[36px] glass-panel lg:grid-cols-[1.08fr_minmax(440px,0.92fr)]">
      <section className="relative hidden overflow-hidden border-r border-white/10 px-12 py-11 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(131,66,255,0.34),transparent_28%),radial-gradient(circle_at_9%_92%,rgba(255,75,139,0.28),transparent_27%),linear-gradient(145deg,#090c2b,#101443_56%,#06081f)]" />
        <div className="absolute left-[7%] top-[27%] h-[560px] w-[440px] rotate-[-24deg] rounded-[48%] border-[30px] border-violet-500/35 blur-[1px]" />
        <div className="absolute bottom-[-5%] left-[1%] h-[290px] w-[590px] rotate-[16deg] rounded-[50%] border-[16px] border-pink-400/30 blur-[2px]" />
        <div className="absolute right-[13%] top-[20%] h-20 w-20 rounded-full bg-pink-400/20 blur-2xl" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/pulsechat-metal-mark.svg"
                  alt="PulseChat"
                  className="h-11 w-11 rounded-2xl shadow-[0_12px_30px_rgba(93,63,255,0.34)]"
                />
                <p className="text-xl font-bold tracking-tight">PulseChat</p>
              </div>
              <ThemeToggle />
            </div>

            <div className="relative mt-28">
              <div className="absolute -left-1 top-[-74px] flex h-12 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-float">
                <Heart className="h-6 w-6 fill-pink-300 text-pink-300" />
              </div>
              <div className="absolute right-4 top-[-30px] flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/30 backdrop-blur-xl">
                <MessageCircleMore className="h-6 w-6 text-violet-200" />
              </div>
              <h1 className="max-w-xl text-balance text-6xl font-semibold leading-[0.98] tracking-[-0.068em]">
                Talk freely.
                <br />
                <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Stay close.
                </span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-slate-200/78">
                The private space for the people and moments you never want to lose.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-10 flex items-center gap-3 text-sm text-slate-200/72">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/10 text-pink-300">
              <Heart className="h-4 w-4 fill-current" />
            </span>
            <div>
              <p className="font-medium text-white">Secure by design</p>
              <p className="text-xs">Built for conversations that matter.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative flex min-h-[calc(100vh-2rem)] items-center justify-center bg-[radial-gradient(circle_at_70%_20%,rgba(133,75,255,0.16),transparent_31%),linear-gradient(145deg,rgba(7,9,28,0.92),rgba(17,17,48,0.86))] px-5 py-8 sm:px-8 lg:px-10">
        <div className="absolute left-6 top-6 lg:hidden">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md rounded-[34px] border border-white/10 bg-slate-950/30 p-6 shadow-[0_32px_90px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:p-8">
          {children}
        </div>
      </section>
    </div>
  </div>
);
