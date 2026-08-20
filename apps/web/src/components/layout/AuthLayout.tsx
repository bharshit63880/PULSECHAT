import type { PropsWithChildren } from 'react';

import { Link, useLocation } from 'react-router-dom';

import { ThemeToggle } from '@/components/common/ThemeToggle';
import { cn } from '@/utils/cn';

export const AuthLayout = ({ children }: PropsWithChildren) => {
  const { pathname } = useLocation();
  const isRegister = pathname === '/register';

  return (
    <main className="relative isolate flex h-[100dvh] min-h-0 items-center justify-center overflow-hidden bg-[#07071b] px-0 py-0 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_11%,rgba(113,71,255,0.35),transparent_27%),radial-gradient(circle_at_8%_72%,rgba(255,58,158,0.17),transparent_26%),radial-gradient(circle_at_94%_70%,rgba(68,85,255,0.16),transparent_24%)]" />
      <div className="pointer-events-none absolute -bottom-36 left-1/2 h-[240px] w-[940px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(126,75,255,0.25),transparent_62%)] blur-xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-44 w-full opacity-45 [background-image:radial-gradient(rgba(154,105,255,0.72)_1px,transparent_1px)] [background-size:13px_13px] [mask-image:linear-gradient(to_top,black,transparent)]" />

      <section className="relative w-full max-w-[462px] origin-center scale-[0.74] rounded-[36px] border border-violet-200/35 bg-[linear-gradient(145deg,rgba(52,45,112,0.9),rgba(13,14,47,0.96)_52%,rgba(34,23,80,0.91))] px-5 py-6 shadow-[0_30px_100px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-2xl transition-transform duration-500 sm:scale-[0.84] lg:rotate-[-4deg] lg:scale-[0.78]">
        <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-100 to-transparent" />
        <div className="absolute right-7 top-7 grid grid-cols-2 gap-2 opacity-75">
          <i className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          <i className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          <i className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          <i className="h-1.5 w-1.5 rounded-full bg-violet-400" />
        </div>
        <div className="absolute left-5 top-5 sm:left-7 sm:top-7">
          <ThemeToggle />
        </div>

        <header className="pt-5 text-center text-white">
          <img
            src="/pulsechat-metal-mark.svg"
            alt="PulseChat"
            className="mx-auto h-16 w-16 rounded-[22px] shadow-[0_14px_34px_rgba(135,76,255,0.58)]"
          />
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.055em]">PulseChat</h1>
          <p className="mt-1 text-sm text-violet-100/75">
            Talk freely. <span className="text-pink-300">Stay close.</span>
          </p>
        </header>

        <nav className="mt-7 grid grid-cols-2 border-b border-white/12 text-center text-sm font-semibold">
          <Link
            to="/login"
            className={cn(
              'pb-3 transition',
              !isRegister
                ? 'border-b-2 border-fuchsia-400 text-white'
                : 'text-violet-200/65 hover:text-white',
            )}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className={cn(
              'pb-3 transition',
              isRegister
                ? 'border-b-2 border-fuchsia-400 text-white'
                : 'text-violet-200/65 hover:text-white',
            )}
          >
            Sign up
          </Link>
        </nav>

        <div className="mt-2">{children}</div>
      </section>
    </main>
  );
};
