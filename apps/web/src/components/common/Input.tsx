import type { InputHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className, ...props }: InputProps) => (
  <input
    className={cn(
      'w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm text-ink transition-colors placeholder:text-muted/90 hover:border-accent/25 focus:border-accent/55 focus:bg-card dark:bg-slate-950/62 dark:hover:bg-slate-950/72 dark:focus:bg-slate-950/84',
      className
    )}
    {...props}
  />
);
