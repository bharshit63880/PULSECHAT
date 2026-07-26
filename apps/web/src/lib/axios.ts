import axios from 'axios';

import { useAuthStore } from '@/store/auth-store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const status = error.response?.status as number | undefined;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !String(originalRequest.url ?? '').includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const response = await refreshClient.post('/auth/refresh');
        const authPayload = response.data.data as {
          token: string;
          session: {
            deviceId: string;
            label: string;
            isCurrent: boolean;
            publicIdentityKey: string;
            publicAgreementKey: string;
            fingerprint: string;
          };
        };
        const nextToken = authPayload.token as string;
        const currentUser = useAuthStore.getState().user;

        useAuthStore.getState().setToken(nextToken);

        if (currentUser) {
          useAuthStore.getState().setSession({ token: nextToken, user: currentUser, session: authPayload.session });
        }

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${nextToken}`;

        return api(originalRequest);
      } catch {
        useAuthStore.getState().clearSession();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
