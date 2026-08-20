import { ArrowLeft, ArrowRight, Download, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DownloadPage = () => (
  <main className="min-h-screen overflow-hidden bg-[#070712] px-5 py-6 text-[#f4f1ff] sm:px-8 sm:py-9">
    <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_88%_18%,rgba(124,77,255,.28),transparent_25%),radial-gradient(circle_at_8%_80%,rgba(199,66,255,.16),transparent_28%)]" />
    <nav className="mx-auto flex max-w-[1240px] items-center justify-between border-b border-white/[0.1] pb-5">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-violet-100/80 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> PulseChat
      </Link>
      <Link
        to="/app"
        className="inline-flex items-center gap-2 text-sm text-violet-200 transition hover:text-white"
      >
        Open web app <ArrowRight className="h-4 w-4" />
      </Link>
    </nav>
    <section className="mx-auto grid min-h-[calc(100vh-110px)] max-w-[1240px] items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-violet-300">
          <span className="h-px w-8 bg-violet-300" /> PulseChat for Android
        </p>
        <h1 className="mt-7 max-w-3xl text-balance text-5xl font-medium leading-[0.95] tracking-[-0.07em] sm:text-7xl">
          The mobile app is being prepared the right way.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-violet-100/65">
          There is no APK download yet because a real signed Android artifact has not been
          published. We will show a version, file size, checksum, and install link only when the
          build can be verified.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
          <Link
            to="/app"
            className="inline-flex items-center gap-3 text-base font-semibold transition hover:text-violet-200"
          >
            Use PulseChat on the web{' '}
            <span className="grid h-10 w-10 place-items-center rounded-full bg-violet-500">
              <ArrowRight className="h-5 w-5" />
            </span>
          </Link>
          <span className="inline-flex items-center gap-2 text-sm text-violet-100/45">
            <Download className="h-4 w-4" /> Download unlocks after signed release
          </span>
        </div>
      </div>
      <div className="relative mx-auto grid aspect-[4/5] w-full max-w-sm place-items-center overflow-hidden rounded-[3rem] border border-white/[0.12] bg-[linear-gradient(145deg,#171443,#09091d_68%)] shadow-[0_30px_100px_rgba(0,0,0,.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(160,124,255,.45),transparent_32%),radial-gradient(circle_at_72%_78%,rgba(255,139,186,.24),transparent_31%)]" />
        <div className="relative text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-[2rem] border border-white/15 bg-white/[0.07] text-violet-200 shadow-[0_18px_50px_rgba(124,77,255,.3)]">
            <Smartphone className="h-11 w-11" />
          </div>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-violet-200">
            Android preview
          </p>
          <p className="mt-3 text-2xl font-medium tracking-[-0.04em]">Release artifact pending</p>
        </div>
      </div>
    </section>
  </main>
);
