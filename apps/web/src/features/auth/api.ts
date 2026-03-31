import type {
  ApiSuccessResponse,
  AuthResponseDto,
  DeviceRegistrationDto,
  EmailVerificationResultDto,
  ResendVerificationResultDto
} from '@chat-app/shared';

import { api } from '@/lib/axios';

type AuthPayload = {
  email: string;
  password: string;
  device: DeviceRegistrationDto;
};

type RegisterPayload = AuthPayload & {
  name: string;
  username: string;
};

export const authApi = {
  async login(payload: AuthPayload) {
    const response = await api.post<ApiSuccessResponse<AuthResponseDto>>('/auth/login', payload);
    return response.data.data;
  },

  async register(payload: RegisterPayload) {
    const response = await api.post<ApiSuccessResponse<AuthResponseDto>>('/auth/register', payload);
    return response.data.data;
  },

  async verifyEmail(token: string) {
    const response = await api.post<ApiSuccessResponse<EmailVerificationResultDto>>('/auth/verify-email', { token });
    return response.data.data;
  },

  async resendVerification() {
    const response = await api.post<ApiSuccessResponse<ResendVerificationResultDto>>('/auth/resend-verification', {});
    return response.data.data;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async refresh() {
    const response = await api.post<ApiSuccessResponse<AuthResponseDto>>('/auth/refresh');
    return response.data.data;
  }
};
