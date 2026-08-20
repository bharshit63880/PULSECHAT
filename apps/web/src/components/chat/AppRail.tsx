import type { AuthUser } from '@chat-app/shared';
import type { ReactNode } from 'react';

import {
  LaptopMinimalCheck,
  MessageCircle,
  PhoneCall,
  Settings,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/utils/cn';

const RailLink = ({
  to,
  label,
  active,
  children,
}: {
  to: string;
  label: string;
  active: boolean;
  children: ReactNode;
}) => (
  <Link
    to={to}
    aria-label={label}
    title={label}
    className={cn(
      'group flex h-12 w-12 items-center justify-center rounded-2xl border transition',
      active
        ? 'border-violet-300/30 bg-gradient-to-br from-violet-500/35 to-fuchsia-500/20 text-violet-100 shadow-[0_10px_24px_rgba(112,67,246,0.22)]'
        : 'border-transparent text-muted hover:border-line hover:bg-white/[0.055] hover:text-ink',
    )}
  >
    {children}
  </Link>
);

export const AppRail = ({ currentUser }: { currentUser: AuthUser }) => {
  const location = useLocation();

  return (
    <nav className="hidden h-full min-w-[76px] flex-col items-center overflow-hidden border-r border-line/75 bg-bg-elevated/65 px-3 py-5 lg:flex">
      <Link to="/app" aria-label="PulseChat conversations" className="mb-9">
        <img
          src="/pulsechat-metal-mark.svg"
          alt="PulseChat"
          className="h-10 w-10 rounded-xl shadow-[0_10px_25px_rgba(112,67,246,0.3)]"
        />
      </Link>

      <div className="flex flex-col gap-3">
        <RailLink to="/app" label="Chats" active={location.pathname === '/app'}>
          <MessageCircle className="h-5 w-5" />
        </RailLink>
        <RailLink to="/people" label="People" active={location.pathname === '/people'}>
          <UsersRound className="h-5 w-5" />
        </RailLink>
        <RailLink to="/calls" label="Calls" active={location.pathname === '/calls'}>
          <PhoneCall className="h-5 w-5" />
        </RailLink>
        <RailLink
          to="/devices"
          label="Devices and security"
          active={location.pathname === '/devices'}
        >
          <LaptopMinimalCheck className="h-5 w-5" />
        </RailLink>
        <RailLink
          to="/settings"
          label="Profile settings"
          active={location.pathname === '/settings'}
        >
          <Settings className="h-5 w-5" />
        </RailLink>
      </div>

      <div className="mt-auto flex flex-col items-center gap-4">
        <span
          title="Private messaging"
          className="grid h-9 w-9 place-items-center rounded-xl bg-accent-soft text-accent"
        >
          <ShieldCheck className="h-4 w-4" />
        </span>
        <Link to="/settings" aria-label="Open profile settings">
          <Avatar
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            size="sm"
            online={currentUser.isOnline}
          />
        </Link>
      </div>
    </nav>
  );
};
