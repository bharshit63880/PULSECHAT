import type { PropsWithChildren } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/store/auth-store';

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user && !user.isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};
