import type { PropsWithChildren } from 'react';

import { MessageCircleMore } from 'lucide-react';

import { ThemeToggle } from '@/components/common/ThemeToggle';

export const AuthLayout = ({ children }: PropsWithChildren) => (
  <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#08081d] px-4 py-8 sm:px-6">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_11%,rgba(112,68,255,0.36),transparent_26%),radial-gradient(circle_at_7%_75%,rgba(255,61,151,0.2),transparent_24%),radial-gradient(circle_at_94%_76%,rgba(71,93,255,0.18),transparent_24%)]" />
    <div className="pointer-events-none absolute -bottom-48 left-1/2 h-[530px] w-[900px] -translate-x-1/2 rounded-[50%] border-[22px] border-violet-500/20 blur-[1px]" />
    <div className="pointer-events-none absolute -bottom-64 left-1/2 h-[480px] w-[860px] -translate-x-1/2 rounded-[50%] border-[18px] border-pink-500/15" />

    <section className="relative w-full max-w-[570px] rounded-[42px] border border-white/20 bg-[linear-gradient(145deg,rgba(43,37,98,0.86),rgba(11,12,39,0.92)_56%,rgba(29,19,67,0.87))] px-5 py-7 shadow-[0_35px_110px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.17)] backdrop-blur-2xl sm:px-10 sm:py-10">
      <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-200/80 to-transparent" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <img
            src="/pulsechat-metal-mark.svg"
            alt="PulseChat"
            className="h-11 w-11 rounded-2xl shadow-[0_10px_24px_rgba(136,90,255,0.48)]"
          />
          <div>
            <p className="text-lg font-bold tracking-tight">PulseChat</p>
            <p className="text-xs text-violet-200/70">Talk freely. Stay close.</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
      <div className="mt-8 flex justify-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-violet-300/20 bg-violet-500/15 text-violet-200">
          <MessageCircleMore className="h-6 w-6" />
        </span>
      </div>
      <div className="mt-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">
          Private conversations
        </p>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  </main>
);
