import { format, formatDistanceToNowStrict, isToday, isYesterday } from 'date-fns';

export const formatChatTimestamp = (value: string) => {
  const date = new Date(value);

  if (isToday(date)) {
    return format(date, 'HH:mm');
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }

  return format(date, 'dd MMM');
};

export const formatLastSeen = (value?: string | null) => {
  if (!value) {
    return 'Last seen unavailable';
  }

  return `Last seen ${formatDistanceToNowStrict(new Date(value), { addSuffix: true })}`;
};
