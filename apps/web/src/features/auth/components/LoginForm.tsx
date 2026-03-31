import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
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
      className="w-full max-w-md space-y-5 rounded-[32px] border border-line bg-card p-8 shadow-soft"
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
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.24em] text-muted">Welcome back</p>
        <h2 className="text-3xl font-bold">Sign in to Pulse Private Messenger</h2>
        <p className="text-sm text-muted">Use your email and password to reopen your encrypted device session.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Email</label>
          <Input type="email" placeholder="you@company.com" {...form.register('email')} />
          <p className="mt-1 text-xs text-rose-500">{form.formState.errors.email?.message}</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Password</label>
          <Input type="password" placeholder="Minimum 8 characters" {...form.register('password')} />
          <p className="mt-1 text-xs text-rose-500">{form.formState.errors.password?.message}</p>
        </div>
      </div>

      <Button type="submit" fullWidth disabled={loginMutation.isPending}>
        {loginMutation.isPending ? <Spinner /> : 'Sign in'}
      </Button>

      <p className="text-sm text-muted">
        New here?{' '}
        <Link to="/register" className="font-semibold text-accent">
          Create an account
        </Link>
      </p>
    </form>
  );
};
