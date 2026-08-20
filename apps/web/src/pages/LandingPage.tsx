import {
  ArrowRight,
  CheckCircle2,
  Download,
  KeyRound,
  MessageCircleMore,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Webhook,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { ThemeToggle } from '@/components/common/ThemeToggle';

const highlights = [
  {
    icon: ShieldCheck,
    title: 'Private direct chats',
    description: 'Direct conversations use the app’s device-aware encrypted-message flow.',
  },
  {
    icon: KeyRound,
    title: 'Encrypted files',
    description:
      'Attachments are encrypted in the client before their encrypted binary is uploaded.',
  },
  {
    icon: MessageCircleMore,
    title: 'Conversations that stay useful',
    description:
      'Reactions, replies, search, media, and shared context remain close to the message.',
  },
];

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Security', href: '#security' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
  { label: 'Download', href: '/download' },
];

export const LandingPage = () => (
  <main className="min-h-screen overflow-hidden bg-[#060611] text-[#f5f3ff]">
    <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute left-[-12rem] top-[-11rem] h-[34rem] w-[34rem] rounded-full bg-violet-600/25 blur-[120px]" />
      <div className="absolute right-[-12rem] top-[18rem] h-[32rem] w-[32rem] rounded-full bg-fuchsia-600/15 blur-[140px]" />
      <div className="absolute bottom-[-20rem] left-1/3 h-[38rem] w-[38rem] rounded-full bg-indigo-600/20 blur-[150px]" />
    </div>

    <header className="safe-px sticky top-0 z-20 pt-4">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-[#0d0c20]/80 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl sm:px-5">
        <Link to="/" className="flex items-center gap-3" aria-label="PulseChat home">
          <img src="/pulsechat-metal-mark.svg" alt="" className="h-9 w-9 rounded-xl" />
          <span className="font-semibold tracking-tight">PulseChat</span>
        </Link>
        <div className="hidden items-center gap-5 text-sm text-violet-100/70 lg:flex">
          {navItems.map((item) =>
            item.href.startsWith('/') ? (
              <Link key={item.label} to={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className="transition hover:text-white">
                {item.label}
              </a>
            ),
          )}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/app"
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-violet-500 px-4 text-sm font-semibold text-white transition hover:bg-violet-400"
          >
            Open web app
          </Link>
        </div>
      </nav>
    </header>

    <section className="safe-px relative z-10 mx-auto grid max-w-7xl items-center gap-14 pb-20 pt-20 lg:grid-cols-[0.92fr_1.08fr] lg:pt-28">
      <div>
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-violet-300">
          PulseChat
        </p>
        <h1 className="max-w-xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.065em] sm:text-6xl xl:text-7xl">
          Private conversations,
          <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
            built differently.
          </span>
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-[#b7b4c8]">
          A private real-time conversation workspace for messages, files, calls, memories, and
          collaboration across web and Android.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/app"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 font-semibold text-white shadow-[0_16px_42px_rgba(124,77,255,0.35)] transition hover:bg-violet-400"
          >
            Open PulseChat Web <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/download"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.045] px-5 font-semibold text-violet-50 transition hover:bg-white/[0.09]"
          >
            <Download className="h-4 w-4" /> Android build status
          </Link>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#b7b4c8]">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" /> No install required on desktop
          </span>
          <span className="inline-flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-violet-300" /> Android build in progress
          </span>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-2xl" aria-label="PulseChat workspace preview">
        <div className="absolute -inset-8 rounded-[3rem] bg-[radial-gradient(circle_at_55%_35%,rgba(157,103,255,0.28),transparent_48%)] blur-2xl" />
        <div className="relative overflow-hidden rounded-[28px] border border-violet-200/15 bg-[linear-gradient(145deg,rgba(21,21,50,0.98),rgba(8,8,27,0.98))] p-3 shadow-[0_38px_120px_rgba(0,0,0,0.44)] sm:p-4">
          <div className="flex items-center justify-between border-b border-white/10 px-2 pb-3 text-xs text-[#b7b4c8]">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> End-to-end encrypted direct
              chat
            </span>
            <span className="rounded-full bg-white/5 px-2 py-1">Live workspace</span>
          </div>
          <div className="grid min-h-[390px] grid-cols-[104px_1fr] gap-3 py-3 sm:grid-cols-[150px_1fr]">
            <aside className="rounded-2xl border border-white/8 bg-black/15 p-2 sm:p-3">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-violet-100">
                <MessageCircleMore className="h-4 w-4 text-violet-300" /> Chats
              </div>
              {['Mira Kapoor', 'Design notes', 'Weekend plan'].map((chat, index) => (
                <div
                  key={chat}
                  className={`mb-2 rounded-xl px-2 py-2 text-[10px] sm:text-xs ${index === 0 ? 'bg-violet-500/20 text-white ring-1 ring-violet-300/25' : 'text-[#b7b4c8]'}`}
                >
                  <p className="truncate font-semibold">{chat}</p>
                  <p className="mt-1 truncate opacity-70">
                    {index === 0 ? 'You: On it ✦' : 'Encrypted message'}
                  </p>
                </div>
              ))}
            </aside>
            <div className="flex min-w-0 flex-col rounded-2xl border border-white/8 bg-[radial-gradient(circle_at_70%_5%,rgba(124,77,255,0.18),transparent_40%),#0c0c23] p-3 sm:p-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-violet-300/20 text-xs font-bold text-violet-100">
                  M
                </div>
                <div>
                  <p className="text-sm font-semibold">Mira Kapoor</p>
                  <p className="text-[11px] text-emerald-300">Online now</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-center gap-3 py-5 text-sm">
                <div className="max-w-[78%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-3 py-2 text-violet-50">
                  The design file is ready for a final look.
                </div>
                <div className="ml-auto max-w-[78%] rounded-2xl rounded-br-md bg-gradient-to-br from-violet-500 to-fuchsia-500 px-3 py-2 text-white">
                  I saved it with the context from today.
                </div>
                <div className="max-w-[78%] rounded-2xl rounded-bl-md border border-violet-300/15 bg-violet-400/10 p-3 text-xs text-violet-100">
                  <span className="font-semibold">Encrypted file</span>
                  <br />
                  <span className="text-violet-200/70">launch-notes.pdf · ready to decrypt</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2 text-xs text-[#77748b]">
                <Sparkles className="h-4 w-4 text-violet-300" /> Write a secure message{' '}
                <span className="ml-auto grid h-7 w-7 place-items-center rounded-lg bg-violet-500 text-white">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="features" className="safe-px relative z-10 mx-auto max-w-7xl py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-300">
          Built for real conversations
        </p>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
          The details stay close. The interface stays quiet.
        </h2>
      </div>
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {highlights.map(({ icon: Icon, title, description }) => (
          <article key={title} className="rounded-2xl border border-white/10 bg-[#111129]/70 p-6">
            <Icon className="h-6 w-6 text-violet-300" />
            <h3 className="mt-5 text-lg font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#b7b4c8]">{description}</p>
          </article>
        ))}
      </div>
    </section>

    <section id="security" className="safe-px relative z-10 mx-auto max-w-7xl py-16">
      <div className="rounded-[28px] border border-violet-200/10 bg-[linear-gradient(120deg,rgba(124,77,255,0.18),rgba(17,17,41,0.9)_45%,rgba(199,66,255,0.12))] p-7 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1fr]">
          <div>
            <ShieldCheck className="h-8 w-8 text-violet-200" />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-violet-300">
              Security, explained clearly
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">
              Privacy should be understandable.
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-7 text-[#b7b4c8]">
            <p>
              PulseChat protects direct conversations with its existing client-side encryption flow,
              device-aware sessions, encrypted attachments, and session controls.
            </p>
            <p>
              Group conversations are labelled according to their current security model. Product
              claims never substitute for a security boundary.
            </p>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 font-semibold text-violet-200 hover:text-white"
            >
              Explore your secure workspace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>

    <section id="about" className="safe-px relative z-10 mx-auto max-w-7xl py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-300">
          About PulseChat
        </p>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
          Messages should feel fast. Privacy should be clear. Conversations should remain useful
          after they are sent.
        </h2>
      </div>
    </section>
    <section id="contact" className="safe-px relative z-10 mx-auto max-w-7xl pb-20">
      <div className="flex flex-col justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row">
        <div>
          <p className="font-semibold">PulseChat</p>
          <p className="mt-2 text-sm text-[#77748b]">Private conversations, built differently.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#b7b4c8]">
          <Webhook className="h-4 w-4 text-violet-300" /> Contact support is coming with a verified
          contact channel.
        </div>
      </div>
    </section>
  </main>
);
