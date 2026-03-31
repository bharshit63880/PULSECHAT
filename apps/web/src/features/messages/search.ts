import { secureStore } from '@/features/encryption/secure-store';

export const searchLocalMessages = async (userId: string, query: string) => {
  return secureStore.searchMessages(userId, query);
};
