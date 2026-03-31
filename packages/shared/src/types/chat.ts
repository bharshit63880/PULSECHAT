import type { MessageDto } from './message';
import type { UserSummary } from './user';

export type ChatDto = {
  id: string;
  isGroupChat: boolean;
  encryptionMode: 'e2ee-direct' | 'server-group';
  name?: string | null;
  participants: UserSummary[];
  admins: string[];
  latestMessage?: MessageDto | null;
  createdBy: string;
  disappearingModeSeconds: number;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
};
