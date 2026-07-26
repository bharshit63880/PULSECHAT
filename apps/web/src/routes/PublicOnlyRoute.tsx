import type { PropsWithChildren } from 'react';

import { Navigate } from 'react-router-dom';

import { useAuthStore } from '@/store/auth-store';

export const PublicOnlyRoute = ({ children }: PropsWithChildren) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  if (token) {
    return <Navigate to={user && !user.isEmailVerified ? '/verify-email' : '/'} replace />;
  }

  return <>{children}</>;
};
