import type { PublishedKeyBundleDto } from '@chat-app/shared';

import { api } from '@/lib/axios';

export const encryptionApi = {
  async getKeyBundle(userId: string) {
    const response = await api.get<{ data: PublishedKeyBundleDto }>(`/keys/${userId}`);
    return response.data.data;
  }
};
