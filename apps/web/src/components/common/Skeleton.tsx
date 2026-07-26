import { cn } from '@/utils/cn';

export const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'animate-pulse-soft rounded-3xl border border-white/35 bg-[linear-gradient(90deg,rgba(255,255,255,0.5),rgba(226,232,240,0.92),rgba(255,255,255,0.5))] dark:border-white/5 dark:bg-[linear-gradient(90deg,rgba(30,41,59,0.6),rgba(51,65,85,0.96),rgba(30,41,59,0.6))]',
      className
    )}
  />
);
