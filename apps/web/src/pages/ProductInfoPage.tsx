import type { ReactNode } from 'react';

import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

type ProductInfoPageProps = {
  eyebrow: string;
  title: string;
  summary: string;
  icon: ReactNode;
  sections: Array<{ title: string; body: string }>;
};

const ProductInfoPage = ({ eyebrow, title, summary, icon, sections }: ProductInfoPageProps) => (
  <main className="min-h-screen overflow-hidden bg-[#070712] px-5 py-6 text-[#f4f1ff] sm:px-8 sm:py-9">
    <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_5%_20%,rgba(124,77,255,.22),transparent_28%),radial-gradient(circle_at_94%_76%,rgba(199,66,255,.16),transparent_32%)]" />
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
    <article className="mx-auto grid max-w-[1240px] gap-10 py-16 sm:py-24 lg:grid-cols-[0.55fr_1.45fr] lg:gap-20">
      <div className="lg:sticky lg:top-10 lg:self-start">
        <div className="grid h-14 w-14 place-items-center rounded-full border border-violet-200/20 bg-violet-400/10 text-violet-200">
          {icon}
        </div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.28em] text-violet-300">
          {eyebrow}
        </p>
      </div>
      <div>
        <h1 className="max-w-4xl text-balance text-5xl font-medium leading-[0.95] tracking-[-0.07em] sm:text-7xl">
          {title}
        </h1>
        <p className="mt-8 max-w-3xl text-lg leading-8 text-violet-100/65 sm:text-xl">{summary}</p>
        <div className="mt-16 divide-y divide-white/[0.1] border-y border-white/[0.1]">
          {sections.map((section, index) => (
            <section
              key={section.title}
              className="grid gap-4 py-8 sm:grid-cols-[52px_1fr] sm:py-10"
            >
              <span className="font-mono text-sm text-violet-300">0{index + 1}</span>
              <div>
                <h2 className="text-xl font-medium tracking-[-0.035em] text-violet-50">
                  {section.title}
                </h2>
                <p className="mt-3 max-w-3xl leading-7 text-violet-100/60">{section.body}</p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
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
