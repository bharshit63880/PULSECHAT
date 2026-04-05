import type { InputHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className, ...props }: InputProps) => (
  <input
    className={cn(
      'w-full rounded-2xl border border-line/90 bg-white/76 px-4 py-3 text-sm text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition-all duration-200 placeholder:text-muted/90 hover:border-accent/25 focus:border-accent/55 focus:bg-white dark:bg-slate-950/62 dark:hover:bg-slate-950/72 dark:focus:bg-slate-950/84',
      className
    )}
    {...props}
  />
);
