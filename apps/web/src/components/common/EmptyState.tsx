type EmptyStateProps = {
  title: string;
  description: string;
};

export const EmptyState = ({ title, description }: EmptyStateProps) => (
  <div className="flex h-full flex-col items-center justify-center rounded-[28px] border border-dashed border-line px-6 text-center">
    <div className="mb-3 text-lg font-semibold">{title}</div>
    <p className="max-w-sm text-sm text-muted">{description}</p>
  </div>
);
