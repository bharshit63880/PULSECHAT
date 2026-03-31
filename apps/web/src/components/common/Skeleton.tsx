import { cn } from '@/utils/cn';

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70', className)} />
);
