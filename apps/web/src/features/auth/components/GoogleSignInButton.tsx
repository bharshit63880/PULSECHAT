import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import type { ApiErrorResponse } from '@chat-app/shared';

import { authApi } from '@/features/auth/api';
import { ensureLocalDevice } from '@/features/encryption/crypto';
import { useAuthStore } from '@/store/auth-store';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string | number>) => void;
        };
      };
    };
  }
}

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export const GoogleSignInButton = () => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const mutation = useMutation({
    mutationFn: authApi.loginWithGoogle,
    onSuccess: (result) => {
      setSession(result);
      toast.success('Signed in with Google');
      navigate('/app');
    },
    onError: (error) => {
      const message = axios.isAxiosError<ApiErrorResponse>(error)
        ? (error.response?.data?.error?.message ?? 'Google sign-in could not be completed')
        : 'Google sign-in could not be completed';
      toast.error(message);
    },
  });

  useEffect(() => {
    if (!clientId || !buttonRef.current) return;

    const initialize = () => {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          const device = await ensureLocalDevice();
          mutation.mutate({ credential, device });
        },
      });
      buttonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'continue_with',
        shape: 'pill',
        width: 360,
      });
    };

    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]');
    if (existing) {
      existing.addEventListener('load', initialize, { once: true });
      initialize();
      return () => existing.removeEventListener('load', initialize);
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.addEventListener('load', initialize, { once: true });
    document.head.appendChild(script);
    return () => script.removeEventListener('load', initialize);
  }, [mutation]);

  if (!clientId) {
    return (
      <p className="text-center text-xs text-muted">
        Google sign-in will appear once the Google Client ID is configured.
      </p>
    );
  }

  return (
    <div
      className="relative flex min-h-11 justify-center overflow-hidden rounded-full"
      aria-live="polite"
    >
      <div ref={buttonRef} className="min-h-11" />
      {mutation.isPending ? (
        <div className="absolute inset-0 grid place-items-center rounded-full bg-card/90">
          <LoaderCircle className="h-4 w-4 animate-spin text-accent" />
        </div>
      ) : null}
    </div>
  );
};
