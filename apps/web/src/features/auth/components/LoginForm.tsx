import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { LockKeyhole, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { z } from 'zod';

import type { ApiErrorResponse } from '@chat-app/shared';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/common/Spinner';
import { authApi } from '@/features/auth/api';
import { ensureLocalDevice } from '@/features/encryption/crypto';
import { loginFormSchema } from '@/features/auth/schema';
import { useAuthStore } from '@/store/auth-store';

type LoginFormValues = z.infer<typeof loginFormSchema>;

export const LoginForm = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const readErrorMessage = (error: unknown) =>
    axios.isAxiosError<ApiErrorResponse>(error)
      ? error.response?.data?.error?.message ?? 'Unable to sign in with those credentials'
      : 'Unable to sign in with those credentials';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (result) => {
      setSession(result);
      toast.success(result.user.isEmailVerified ? 'Welcome back' : 'Check your inbox to verify your email');
      navigate(result.user.isEmailVerified ? '/' : '/verify-email');
    },
    onError: (error) => {
      toast.error(readErrorMessage(error));
    }
  });

  return (
    <form
      className="glass-card w-full rounded-[32px] p-7 sm:p-8"
      onSubmit={form.handleSubmit(async (values) => {
        const device = await ensureLocalDevice();
        loginMutation.mutate({
          ...values,
          device: {
            deviceId: device.deviceId,
            label: device.label,
            platform: device.platform,
            userAgent: device.userAgent,
            appVersion: device.appVersion,
            publicIdentityKey: device.publicIdentityKey,
            publicAgreementKey: device.publicAgreementKey,
            fingerprint: device.fingerprint
          }
        });
      })}
    >
      <div className="space-y-3">
        <div className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent dark:text-emerald-200">
          Welcome back
        </div>
        <div>
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-[2rem]">
            Sign in to your private workspace
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Use your email and password to reopen this device session and continue your secure conversations.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input type="email" placeholder="you@company.com" className="pl-11" {...form.register('email')} />
          </div>
          <p className="mt-1.5 text-xs text-rose-500">{form.formState.errors.email?.message}</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              type="password"
              placeholder="Minimum 8 characters"
              className="pl-11"
              {...form.register('password')}
            />
          </div>
          <p className="mt-1.5 text-xs text-rose-500">{form.formState.errors.password?.message}</p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <Button type="submit" fullWidth disabled={loginMutation.isPending} className="min-h-12 rounded-2xl">
          {loginMutation.isPending ? <Spinner /> : 'Sign in'}
        </Button>

        <div className="rounded-[24px] surface-muted px-4 py-3 text-xs leading-6 text-muted">
          This device keeps your direct-chat keys local and restores your session with rotating refresh credentials.
        </div>

        <p className="text-sm text-muted">
          New here?{' '}
          <Link to="/register" className="font-semibold text-accent transition hover:text-accent/80">
            Create an account
          </Link>
        </p>
      </div>
    </form>
  );
};
