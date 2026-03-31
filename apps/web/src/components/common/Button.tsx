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
      'inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
      variant === 'primary' && 'bg-accent text-white shadow-soft hover:opacity-95',
      variant === 'secondary' && 'border border-line bg-card text-ink hover:bg-slate-50 dark:hover:bg-slate-800',
      variant === 'ghost' && 'text-muted hover:bg-black/5 dark:hover:bg-white/5',
      variant === 'danger' && 'bg-rose-500 text-white hover:bg-rose-600',
      fullWidth && 'w-full',
      className
    )}
    {...props}
  >
    {children}
  </button>
);
