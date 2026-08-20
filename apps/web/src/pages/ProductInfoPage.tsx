import type { ReactNode } from 'react';

import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

type ProductInfoPageProps = {
  eyebrow: string;
  title: string;
  summary: string;
  icon: ReactNode;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

const ProductInfoPage = ({ eyebrow, title, summary, icon, sections }: ProductInfoPageProps) => (
  <main className="min-h-screen overflow-hidden bg-[#060611] px-4 py-5 text-[#f5f3ff] sm:px-6 sm:py-8">
    <div className="pointer-events-none fixed inset-0 -z-0" aria-hidden="true">
      <div className="absolute left-[-13rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-violet-600/20 blur-[130px]" />
      <div className="absolute bottom-[-16rem] right-[-12rem] h-[36rem] w-[36rem] rounded-full bg-fuchsia-600/15 blur-[150px]" />
    </div>
    <section className="relative mx-auto max-w-4xl">
      <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0d0c20]/80 px-4 py-3 backdrop-blur-xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-violet-100 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> PulseChat
        </Link>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-200 transition hover:text-white"
        >
          Open web app <ArrowRight className="h-4 w-4" />
        </Link>
      </nav>

      <article className="mt-8 rounded-[30px] border border-white/10 bg-[#111129]/85 p-6 shadow-[0_28px_100px_rgba(0,0,0,0.35)] sm:p-10">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-400/15 text-violet-200">
          {icon}
        </div>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.24em] text-violet-300">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#b7b4c8]">{summary}</p>

        <div className="mt-10 space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="border-t border-white/10 pt-6">
              <h2 className="text-lg font-semibold text-violet-50">{section.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[#b7b4c8]">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </section>
  </main>
);

export const AboutPage = () => (
  <ProductInfoPage
    eyebrow="About PulseChat"
    title="Private conversations, built differently."
    summary="PulseChat is a real-time conversation workspace built around useful context, clear privacy boundaries, and calm interfaces."
    icon={<UserRoundCheck className="h-7 w-7" />}
    sections={[
      {
        title: 'Why it exists',
        body: 'Messages should feel immediate, privacy should be understandable, and important conversations should remain useful after they are sent.',
      },
      {
        title: 'How it is being built',
        body: 'PulseChat is a TypeScript product spanning web, API, and Android foundations. It reuses shared contracts so a conversation can stay consistent across devices without creating a separate backend for each client.',
      },
      {
        title: 'Product philosophy',
        body: 'The product avoids exaggerated security claims and does not label group messages as end-to-end encrypted when that is not their current model. Features are shown only when their supporting system exists.',
      },
    ]}
  />
);

export const PrivacyPage = () => (
  <ProductInfoPage
    eyebrow="Privacy"
    title="Clear boundaries for private conversations."
    summary="PulseChat is designed to keep direct-message plaintext and private device keys out of the API. This page describes the implementation boundary, not an absolute security guarantee."
    icon={<LockKeyhole className="h-7 w-7" />}
    sections={[
      {
        title: 'Direct conversations',
        body: 'Direct-message content is encrypted in the client using the existing device-aware encryption flow before it is sent to the API. The server stores message ciphertext and delivery metadata, not direct-message plaintext.',
      },
      {
        title: 'Files and media',
        body: 'Direct-chat attachments are encrypted in the client before upload. Encrypted binary is stored as a raw asset and is decrypted by an authenticated participating client when opened.',
      },
      {
        title: 'Groups and limits',
        body: 'Group chats use their currently configured server-group model and are not presented as end-to-end encrypted direct chats. Do not share sensitive information in a group unless its security model is suitable for your use case.',
      },
      {
        title: 'Sessions',
        body: 'Sessions are device-aware and can be managed from the product. Signing out or revoking a device removes access for that session, subject to normal network and service propagation delays.',
      },
    ]}
  />
);

export const SecurityPage = () => (
  <ProductInfoPage
    eyebrow="Security"
    title="Security features should be visible, not mysterious."
    summary="PulseChat combines browser-side encryption for direct chats with authenticated API and Socket.IO transport, device sessions, upload validation, and rate limiting."
    icon={<ShieldCheck className="h-7 w-7" />}
    sections={[
      {
        title: 'Encrypted direct chat flow',
        body: 'The web client keeps device key material in browser-controlled storage and encrypts direct-message content locally. The API does not include decryption helpers for direct message content.',
      },
      {
        title: 'Account and transport protection',
        body: 'Authentication uses rotated refresh-session handling, secure production cookie configuration, verified-email gating, input validation, rate limits, and Socket.IO authentication before room access is granted.',
      },
      {
        title: 'Attachment storage',
        body: 'Encrypted attachments are uploaded as raw binary to avoid media processing of ciphertext. Credentials remain server-side. A storage provider failure should result in an explicit upload error rather than silent plaintext fallback.',
      },
      {
        title: 'Responsible use',
        body: 'No online service can guarantee absolute safety. Keep your device locked, use a unique password, review active sessions, and verify a direct-chat safety number when that level of trust matters.',
      },
    ]}
  />
);
