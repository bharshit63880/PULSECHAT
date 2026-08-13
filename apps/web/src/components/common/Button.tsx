import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '@/utils/cn';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    fullWidth?: boolean;
  }
>;

export const Button = ({
  children,
  className,
  variant = 'primary',
  fullWidth,
  ...props
}: ButtonProps) => (
  <button
    className={cn(
      'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold tracking-tight transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-55',
      'focus-visible:scale-[0.99] active:scale-[0.985]',
      variant === 'primary' &&
        'bg-gradient-to-r from-accent to-violet-500 text-white shadow-[0_12px_28px_rgba(112,67,246,0.28)] hover:brightness-110 dark:text-white',
      variant === 'secondary' &&
        'border border-line bg-card text-ink shadow-sm hover:border-accent/50 hover:bg-accent-soft/45 dark:bg-white/[0.035] dark:hover:bg-white/[0.075]',
      variant === 'ghost' &&
        'border border-transparent bg-transparent text-muted hover:border-line/80 hover:bg-accent-soft/45 hover:text-ink dark:hover:bg-white/[0.06]',
      variant === 'danger' &&
        'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-soft hover:-translate-y-0.5 hover:brightness-110',
      fullWidth && 'w-full',
      className,
    )}
    {...props}
  >
    {children}
  </button>
);
