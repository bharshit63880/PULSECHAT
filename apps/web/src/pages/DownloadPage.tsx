import { ArrowLeft, Construction, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DownloadPage = () => (
  <main className="safe-px grid min-h-screen place-items-center bg-[#060611] py-8 text-[#f5f3ff]">
    <section className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#111129]/90 p-7 shadow-[0_28px_90px_rgba(0,0,0,0.35)] sm:p-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-violet-200 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to PulseChat
      </Link>
      <div className="mt-12 grid h-14 w-14 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
        <Smartphone className="h-7 w-7" />
      </div>
      <p className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-violet-300">
        PulseChat for Android
      </p>
      <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.055em]">
        Android build not available yet.
      </h1>
      <p className="mt-5 max-w-xl leading-7 text-[#b7b4c8]">
        The native Android release is currently being prepared. A download button, version, file
        size, checksum, and installation steps will appear here only after a real signed build is
        published.
      </p>
      <div className="mt-8 flex gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-[#b7b4c8]">
        <Construction className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" /> No APK metadata is
        shown until it can be verified against the release artifact.
      </div>
      <Link
        to="/app"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-violet-500 px-5 font-semibold text-white transition hover:bg-violet-400"
      >
        Use PulseChat on the web
      </Link>
    </section>
  </main>
);
