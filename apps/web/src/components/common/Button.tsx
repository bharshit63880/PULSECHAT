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
        'bg-accent text-white shadow-sm hover:bg-accent/90 dark:text-slate-950',
      variant === 'secondary' &&
        'border border-line bg-card text-ink shadow-sm hover:border-accent/35 hover:bg-card-muted dark:bg-slate-900/78 dark:hover:bg-slate-900',
      variant === 'ghost' &&
        'border border-transparent bg-transparent text-muted hover:border-line/80 hover:bg-white/65 hover:text-ink dark:hover:bg-white/5',
      variant === 'danger' &&
        'bg-rose-500 text-white shadow-soft hover:-translate-y-0.5 hover:bg-rose-600',
      fullWidth && 'w-full',
      className
    )}
    {...props}
  >
    {children}
  </button>
);
