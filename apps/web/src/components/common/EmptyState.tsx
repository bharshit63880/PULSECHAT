type EmptyStateProps = {
  title: string;
  description: string;
};

export const EmptyState = ({ title, description }: EmptyStateProps) => (
  <div className="glass-card flex h-full flex-col items-center justify-center rounded-[32px] border border-dashed px-8 py-10 text-center">
    <div className="mb-2 rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent dark:text-emerald-200">
      Quiet space
    </div>
    <div className="text-2xl font-semibold tracking-tight text-balance">{title}</div>
    <p className="mt-3 max-w-sm text-sm leading-6 text-muted">{description}</p>
  </div>
);
