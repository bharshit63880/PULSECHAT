import { cn } from '@/utils/cn';

type AvatarProps = {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
};

const sizeMap = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-16 w-16'
};

const dotMap = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-4.5 w-4.5'
};

export const Avatar = ({ src, alt, size = 'md', online }: AvatarProps) => (
  <div
    className={cn(
      'relative shrink-0 overflow-hidden rounded-full border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(234,241,238,0.82))] shadow-[0_10px_28px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.95),rgba(15,23,42,0.78))]',
      sizeMap[size]
    )}
  >
    <img src={src ?? '/placeholder-avatar.svg'} alt={alt} className="h-full w-full object-cover" />
    {online !== undefined ? (
      <span
        className={cn(
          'absolute bottom-0 right-0 rounded-full border-2 border-white shadow-[0_0_0_3px_rgba(255,255,255,0.35)] dark:border-slate-950 dark:shadow-none',
          dotMap[size],
          online ? 'bg-accent' : 'bg-slate-400 dark:bg-slate-500'
        )}
      />
    ) : null}
  </div>
);
