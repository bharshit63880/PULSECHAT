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

  return <div className="px-4 py-2 text-xs text-muted">{label}</div>;
};
