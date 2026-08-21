import {
  ArrowDownRight,
  ArrowRight,
  Check,
  Download,
  LockKeyhole,
  MessageCircleMore,
  ShieldCheck,
  Waves,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const navItems = [
  { label: 'What it is', href: '#story' },
  { label: 'How it protects', href: '/security' },
  { label: 'About', href: '/about' },
  { label: 'Android', href: '/download' },
];

const principles = [
  {
    number: '01',
    title: 'Say the important thing.',
    body: 'Live messages, reactions, calls, files, and the context that makes a conversation useful.',
    icon: MessageCircleMore,
  },
  {
    number: '02',
    title: 'Keep the boundary clear.',
    body: 'Direct-message content and attachments are encrypted by the participating client before transport.',
    icon: LockKeyhole,
  },
  {
    number: '03',
    title: 'Let the interface breathe.',
    body: 'Quiet controls, responsive layouts, and only the details you need in the moment.',
    icon: Waves,
  },
];

export const LandingPage = () => (
  <main className="min-h-screen overflow-hidden bg-[#070712] text-[#f4f1ff]">
    <header className="relative z-20 border-b border-white/[0.08]">
      <nav className="safe-px mx-auto flex h-[76px] max-w-[1440px] items-center justify-between">
        <Link to="/" className="flex items-center gap-3" aria-label="PulseChat home">
          <img src="/pulsechat-metal-mark.svg" alt="" className="h-9 w-9" />
          <span className="text-lg font-semibold tracking-[-0.04em]">PulseChat</span>
        </Link>
        <div className="hidden items-center gap-7 text-sm text-violet-100/65 md:flex">
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
        <div className="flex items-center gap-3">
          <Link
            to="/app"
            className="hidden items-center gap-2 text-sm font-semibold text-white transition hover:text-violet-200 sm:inline-flex"
          >
            Open web app <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </header>

    <section className="safe-px relative isolate mx-auto min-h-[min(820px,calc(100vh-76px))] max-w-[1440px] py-16 sm:py-24">
      <img
        src="/visuals/pulsechat-orbits-hero.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-40"
      />
      <img
        src="/visuals/pulsechat-mobile-showcase.png"
        alt="PulseChat mobile conversations, media, and calling preview"
        className="pointer-events-none absolute right-[-20rem] top-[12%] -z-10 w-[680px] max-w-none opacity-45 sm:right-[-13rem] sm:w-[760px] lg:right-8 lg:top-[9%] lg:w-[820px] lg:opacity-100 xl:right-12"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,#070712_0%,rgba(7,7,18,.94)_38%,rgba(7,7,18,.3)_72%,rgba(7,7,18,.08)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[#070712] to-transparent" />
      <div className="max-w-3xl">
        <p className="mb-7 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-violet-300">
          <span className="h-px w-8 bg-violet-300" /> Private by design
        </p>
        <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-[0.94] tracking-[-0.07em] sm:text-7xl lg:text-[clamp(5rem,8vw,8.5rem)]">
          Talk freely.
          <span className="block bg-gradient-to-r from-[#aa8bff] via-[#e7dfff] to-[#ff9fbb] bg-clip-text text-transparent">
            Stay close.
          </span>
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-8 text-violet-100/70 sm:text-xl">
          PulseChat is a real-time space for the people and work you want to keep close—without
          turning every conversation into noise.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-5">
          <Link
            to="/app"
            className="group inline-flex items-center gap-3 text-base font-semibold text-white transition hover:text-violet-200"
          >
            Start on the web{' '}
            <span className="grid h-10 w-10 place-items-center rounded-full bg-violet-500 transition group-hover:scale-110 group-hover:bg-fuchsia-500">
              <ArrowDownRight className="h-5 w-5" />
            </span>
          </Link>
          <a
            href="https://github.com/bharshit63880/PULSECHAT/releases/download/android-preview-4/PulseChat-Android-preview-4.apk"
            download="PulseChat-Android-preview-4.apk"
            className="inline-flex items-center gap-2 rounded-full border border-violet-300/30 bg-violet-400/[0.08] px-4 py-2.5 text-sm font-semibold text-violet-100 transition hover:border-violet-200/60 hover:bg-violet-400/[0.16] hover:text-white"
          >
            <Download className="h-4 w-4 text-violet-200" /> Download Android APK
          </a>
        </div>
        <p className="mt-12 flex items-center gap-2 text-sm text-violet-100/45">
          <Check className="h-4 w-4 text-emerald-300" /> Use it in your browser. No desktop install.
        </p>
      </div>
    </section>

    <section id="story" className="safe-px mx-auto max-w-[1440px] py-24 sm:py-32">
      <div className="grid gap-8 border-t border-white/[0.1] pt-8 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-violet-300">
          A calmer place to talk
        </p>
        <h2 className="max-w-4xl text-balance text-3xl font-medium leading-[1.05] tracking-[-0.055em] text-violet-50 sm:text-5xl">
          The best messaging products feel less like software and more like a good conversation.
        </h2>
      </div>
      <div className="mt-20 divide-y divide-white/[0.1] border-y border-white/[0.1]">
        {principles.map(({ number, title, body, icon: Icon }) => (
          <article
            key={number}
            className="grid gap-5 py-8 sm:grid-cols-[70px_1fr_auto] sm:items-start sm:py-11"
          >
            <span className="font-mono text-sm text-violet-300">{number}</span>
            <div>
              <h3 className="text-2xl font-medium tracking-[-0.04em] sm:text-3xl">{title}</h3>
              <p className="mt-3 max-w-2xl text-base leading-7 text-violet-100/60">{body}</p>
            </div>
            <Icon className="h-6 w-6 text-violet-300 sm:mt-1" />
          </article>
        ))}
      </div>
    </section>

    <section className="safe-px mx-auto max-w-[1440px] pb-24 sm:pb-32">
      <div className="grid gap-10 border-t border-white/[0.1] pt-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-violet-300">
            Security, without theatre
          </p>
          <h2 className="mt-5 max-w-3xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.06em] sm:text-6xl">
            Privacy should be easy to understand.
          </h2>
        </div>
        <div className="lg:pb-2">
          <ShieldCheck className="mb-5 h-7 w-7 text-violet-300" />
          <p className="max-w-md text-base leading-7 text-violet-100/65">
            Direct-chat encryption, authenticated real-time transport, verified accounts, and
            encrypted attachment storage are product boundaries—not slogans.
          </p>
          <Link
            to="/security"
            className="mt-7 inline-flex items-center gap-2 font-semibold text-violet-200 transition hover:text-white"
          >
            Read the security model <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>

    <footer className="safe-px border-t border-white/[0.08] py-8">
      <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-5 text-sm text-violet-100/55 sm:flex-row sm:items-center">
        <p>© {new Date().getFullYear()} PulseChat. Private conversations, built differently.</p>
        <div className="flex flex-wrap gap-x-5 gap-y-3">
          <Link to="/privacy" className="transition hover:text-white">
            Privacy
          </Link>
          <Link to="/security" className="transition hover:text-white">
            Security
          </Link>
          <Link to="/about" className="transition hover:text-white">
            About
          </Link>
          <Link
            to="/download"
            className="inline-flex items-center gap-1 transition hover:text-white"
          >
            <Download className="h-3.5 w-3.5" /> Android
          </Link>
        </div>
      </div>
    </footer>
  </main>
);
