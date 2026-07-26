import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth-store';

export const useAuthBootstrap = () => {
  const token = useAuthStore((state) => state.token);
  const updateUser = useAuthStore((state) => state.updateUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data.data;
    },
    enabled: Boolean(token),
    retry: false
  });

  useEffect(() => {
    if (query.isSuccess) {
      updateUser(query.data);
    }

    if (query.isError) {
      clearSession();
    }
  }, [clearSession, query.data, query.isError, query.isSuccess, updateUser]);

  return query;
};
