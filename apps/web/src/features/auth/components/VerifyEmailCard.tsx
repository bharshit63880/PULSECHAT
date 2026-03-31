import { useEffect, useMemo, useRef } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { CheckCircle2, MailCheck, RefreshCcw, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import type { ApiErrorResponse } from '@chat-app/shared';

import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { authApi } from '@/features/auth/api';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth-store';

const getApiErrorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError<ApiErrorResponse>(error)
    ? error.response?.data?.error?.message ?? fallback
    : fallback;

export const VerifyEmailCard = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = searchParams.get('token');
  const updateUser = useAuthStore((state) => state.updateUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const hasTriggeredVerification = useRef(false);

  const redirectToMessenger = () => {
    window.location.replace('/');
  };

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: async (result) => {
      const matchesCurrentSession = Boolean(user && result.user.id === user.id);

      if (matchesCurrentSession) {
        try {
          const response = await api.get('/auth/me');
          updateUser(response.data.data);
          await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        } catch {
          updateUser(result.user);
        }

        toast.success('Email verified successfully');
        redirectToMessenger();
        return;
      }

      toast.success('Email verified successfully. Sign in to continue.');
    },
    onError: async (error) => {
      if (user) {
        try {
          const response = await api.get('/auth/me');
          const refreshedUser = response.data.data;

          if (refreshedUser.isEmailVerified) {
            updateUser(refreshedUser);
            await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
            toast.success('Email verified successfully');
            redirectToMessenger();
            return;
          }
        } catch {
          // If session refresh fails we fall back to the original verification error.
        }
      }

      toast.error(getApiErrorMessage(error, 'This verification link is no longer valid'));
    }
  });

  const resendMutation = useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: (result) => {
      toast.success(`Verification email sent to ${result.email}`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to resend verification email'));
    }
  });

  useEffect(() => {
    if (
      token &&
      !hasTriggeredVerification.current &&
      !verifyMutation.isPending &&
      !verifyMutation.isSuccess &&
      !verifyMutation.isError
    ) {
      hasTriggeredVerification.current = true;
      verifyMutation.mutate(token);
    }
  }, [token, verifyMutation]);

  const verifiedUser = verifyMutation.data?.user ?? null;
  const currentUserMatchesVerifiedUser = useMemo(
    () => Boolean(user && verifiedUser && user.id === verifiedUser.id),
    [user, verifiedUser]
  );
  const isVerified = Boolean(user?.isEmailVerified || verifyMutation.data?.verified);
  const shouldOpenMessenger = Boolean((user?.isEmailVerified && !verifiedUser) || currentUserMatchesVerifiedUser);
  const shouldReturnToSignIn = Boolean(isVerified && !shouldOpenMessenger);
  const secondaryAction = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    if (user?.isEmailVerified && !token) {
      redirectToMessenger();
    }
  }, [token, user?.isEmailVerified]);

  return (
    <div className="w-full max-w-lg space-y-5 rounded-[32px] border border-line bg-card p-8 shadow-soft">
      <div className="space-y-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          {isVerified ? <CheckCircle2 className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
        </div>
        <p className="text-sm uppercase tracking-[0.24em] text-muted">Verify your inbox</p>
        <h2 className="text-3xl font-bold">
          {isVerified ? 'Your email is verified' : 'Secure your account before you chat'}
        </h2>
        <p className="text-sm text-muted">
          {isVerified
            ? shouldOpenMessenger
              ? 'Your secure messaging access is unlocked. You can continue into Pulse Chat now.'
              : 'This email is verified, but your current browser session belongs to a different account. Sign in again to continue.'
            : `We sent a verification link to ${user?.email ?? 'your email address'}. Open it on this device or paste the link here to finish setup.`}
        </p>
      </div>

      {!isVerified ? (
        <div className="rounded-3xl border border-line bg-slate-50/70 p-5 text-sm text-muted dark:bg-slate-900/50">
          <div className="flex items-start gap-3">
            <MailCheck className="mt-0.5 h-5 w-5 text-accent" />
            <div className="space-y-2">
              <p>Verification is required before encrypted chats, uploads, and contact discovery become available.</p>
              <p>Check spam or promotions if the email does not arrive within a minute.</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        {isVerified ? (
          <Button fullWidth onClick={() => (shouldOpenMessenger ? redirectToMessenger() : secondaryAction())}>
            {shouldOpenMessenger ? 'Open messenger' : 'Continue to sign in'}
          </Button>
        ) : (
          <Button fullWidth onClick={() => resendMutation.mutate()} disabled={!user || resendMutation.isPending}>
            {resendMutation.isPending ? <Spinner /> : 'Resend verification email'}
          </Button>
        )}
        {!isVerified ? (
          <Button fullWidth variant="secondary" onClick={secondaryAction}>
            Back to sign in
          </Button>
        ) : shouldReturnToSignIn ? (
          <Button fullWidth variant="secondary" onClick={secondaryAction}>
            Switch account
          </Button>
        ) : null}
      </div>

      {!user ? (
        <p className="text-sm text-muted">
          Already verified on another device?{' '}
          <Link to="/login" className="font-semibold text-accent">
            Sign in
          </Link>
        </p>
      ) : null}

      {token && verifyMutation.isPending ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <RefreshCcw className="h-4 w-4 animate-spin" />
          Verifying your email link...
        </div>
      ) : null}
    </div>
  );
};
