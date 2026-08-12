import { useEffect } from 'react';

import { authApi } from '@/features/auth/api';
import { clearLegacyPersistedAuth, useAuthStore } from '@/store/auth-store';

let refreshInFlight: ReturnType<typeof authApi.refresh> | null = null;

const restoreSession = () => {
  refreshInFlight ??= authApi.refresh().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
};

export const useAuthBootstrap = () => {
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    if (isBootstrapped) {
      return;
    }

    clearLegacyPersistedAuth();
    let active = true;

    void restoreSession()
      .then((session) => {
        if (active) {
          setSession(session);
        }
      })
      .catch(() => {
        if (active) {
          clearSession();
        }
      });

    return () => {
      active = false;
    };
  }, [clearSession, isBootstrapped, setSession]);

  return { isLoading: !isBootstrapped };
};
