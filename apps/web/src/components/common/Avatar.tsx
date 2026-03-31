import { cn } from '@/utils/cn';

type AvatarProps = {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
};

const sizeMap = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-14 w-14'
};

export const Avatar = ({ src, alt, size = 'md', online }: AvatarProps) => (
  <div className={cn('relative shrink-0 rounded-full bg-slate-200', sizeMap[size])}>
    <img
      src={src ?? '/placeholder-avatar.svg'}
      alt={alt}
      className="h-full w-full rounded-full object-cover"
    />
    {online !== undefined ? (
      <span
        className={cn(
          'absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card',
          online ? 'bg-emerald-500' : 'bg-slate-400'
        )}
      />
    ) : null}
  </div>
);
