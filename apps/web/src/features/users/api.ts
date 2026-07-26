import type { AuthUser } from '@chat-app/shared';

import { api } from '@/lib/axios';

export const usersApi = {
  async list(search?: string) {
    const response = await api.get<{ data: AuthUser[] }>('/users', {
      params: search ? { search } : undefined
    });

    return response.data.data;
  },

  async updateProfile(payload: Partial<AuthUser>) {
    const response = await api.patch<{ data: AuthUser }>('/users/me', payload);
    return response.data.data;
  }
};
