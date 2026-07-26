type TypingIndicatorProps = {
  names: string[];
};

export const TypingIndicator = ({ names }: TypingIndicatorProps) => {
  if (names.length === 0) {
    return null;
  }

  const [firstName] = names;
  const label =
    names.length === 1 && firstName
      ? `${firstName} is typing...`
      : `${names.slice(0, 2).join(', ')} are typing...`;

  return (
    <div className="px-4 py-1.5">
      <div className="inline-flex items-center gap-2 rounded-full border border-line/80 bg-white/76 px-3 py-2 text-xs text-muted dark:bg-slate-950/72">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft" />
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft [animation-delay:120ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft [animation-delay:240ms]" />
        </span>
        {label}
      </div>
    </div>
  );
};
