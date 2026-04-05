import { TriangleAlert } from 'lucide-react';

import { Button } from './Button';

type ErrorStateProps = {
  title: string;
  description: string;
  onRetry?: () => void;
};

export const ErrorState = ({ title, description, onRetry }: ErrorStateProps) => (
  <div className="glass-card flex h-full flex-col items-center justify-center gap-3 rounded-[32px] border border-rose-200/60 px-8 py-10 text-center dark:border-rose-500/15">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 dark:bg-rose-950/40 dark:text-rose-300">
      <TriangleAlert className="h-5 w-5" />
    </div>
    <div className="text-2xl font-semibold tracking-tight text-balance">{title}</div>
    <p className="max-w-sm text-sm leading-6 text-muted">{description}</p>
    {onRetry ? <Button onClick={onRetry}>Retry</Button> : null}
  </div>
);
