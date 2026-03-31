import type { ApiErrorResponse } from '@chat-app/shared';

import axios from 'axios';

import { authStorage } from '@/features/auth/storage';
import { mobileEnv } from '@/lib/env';
import { useAuthStore } from '@/store/auth-store';

export const api = axios.create({
  baseURL: mobileEnv.apiUrl,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
      await authStorage.clear();
    }

    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: ApiErrorResponse } })?.response?.data?.error?.message;
  return typeof message === 'string' ? message : fallback;
};
