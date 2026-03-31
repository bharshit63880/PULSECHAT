import type { ApiSuccessResponse, AuthUser } from '@chat-app/shared';

import { api } from '@/lib/api';

export const usersApi = {
  async list(search?: string) {
    const response = await api.get<ApiSuccessResponse<AuthUser[]>>('/users', {
      params: search ? { search } : undefined
    });
    return response.data.data;
  },

  async updateProfile(payload: Partial<AuthUser>) {
    const response = await api.patch<ApiSuccessResponse<AuthUser>>('/users/me', payload);
    return response.data.data;
  }
};
