import type { ApiSuccessResponse, PublishedKeyBundleDto } from '@chat-app/shared';

import { api } from '@/lib/api';

export const encryptionApi = {
  async getKeyBundle(userId: string) {
    const response = await api.get<ApiSuccessResponse<PublishedKeyBundleDto>>(`/keys/${userId}`);
    return response.data.data;
  }
};
