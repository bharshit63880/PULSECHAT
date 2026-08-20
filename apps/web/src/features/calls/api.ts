import type { CallDto } from '@chat-app/shared';

import { api } from '@/lib/axios';

export const callsApi = {
  async list() {
    const response = await api.get<{ data: CallDto[] }>('/calls');
    return response.data.data;
  },
};
