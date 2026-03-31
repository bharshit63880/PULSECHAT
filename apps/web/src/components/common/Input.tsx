import type { InputHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className, ...props }: InputProps) => (
  <input
    className={cn(
      'w-full rounded-2xl border border-line bg-card px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-accent',
      className
    )}
    {...props}
  />
);
