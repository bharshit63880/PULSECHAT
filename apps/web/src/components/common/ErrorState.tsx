import { Button } from './Button';

type ErrorStateProps = {
  title: string;
  description: string;
  onRetry?: () => void;
};

export const ErrorState = ({ title, description, onRetry }: ErrorStateProps) => (
  <div className="flex h-full flex-col items-center justify-center gap-3 rounded-[28px] border border-rose-200 bg-rose-50/60 px-6 text-center dark:border-rose-950 dark:bg-rose-950/20">
    <div className="text-lg font-semibold">{title}</div>
    <p className="max-w-sm text-sm text-muted">{description}</p>
    {onRetry ? <Button onClick={onRetry}>Retry</Button> : null}
  </div>
);
