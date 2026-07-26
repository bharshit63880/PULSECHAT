import { useEffect, useState } from 'react';

import { authApi } from '@/features/auth/api';
import { authStorage } from '@/features/auth/storage';
import { useAuthStore } from '@/store/auth-store';

export const useAuthBootstrap = () => {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const updateUser = useAuthStore((state) => state.updateUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const stored = await authStorage.read();

      if (!stored) {
        hydrateSession(null);
        if (!cancelled) {
          setIsBootstrapping(false);
        }
        return;
      }

      hydrateSession(stored);

      try {
        const me = await authApi.me();
        updateUser(me);
        await authStorage.write({ ...stored, user: me });
      } catch {
        clearSession();
        await authStorage.clear();
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [clearSession, hydrateSession, updateUser]);

  return { isBootstrapping };
};
