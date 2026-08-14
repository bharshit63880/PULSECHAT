import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const readErrorMessage = (error: unknown) =>
    axios.isAxiosError<ApiErrorResponse>(error)
      ? (error.response?.data?.error?.message ?? 'Unable to sign in with those credentials')
      : 'Unable to sign in with those credentials';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (result) => {
      setSession(result);
      toast.success(
        result.user.isEmailVerified ? 'Welcome back' : 'Check your inbox to verify your email',
      );
      navigate(result.user.isEmailVerified ? '/app' : '/verify-email');
    },
    onError: (error) => {
      toast.error(readErrorMessage(error));
    },
  });

  return (
    <form
      className="w-full rounded-3xl border border-line bg-card p-6 shadow-float sm:p-8"
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
            fingerprint: device.fingerprint,
          },
        });
      })}
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Welcome back</p>
        <div>
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.045em] sm:text-[2.1rem]">
            Sign in to Pulse Chat
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Pick up right where your conversations left off.
          </p>
        </div>
      </div>

      <div className="mt-7 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              type="email"
              placeholder="Your email"
              className="pl-11"
              {...form.register('email')}
            />
          </div>
          <p className="mt-1.5 text-xs text-rose-500">{form.formState.errors.email?.message}</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              type={isPasswordVisible ? 'text' : 'password'}
              placeholder="Minimum 8 characters"
              className="pl-11 pr-11"
              {...form.register('password')}
            />
            <button
              type="button"
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              onClick={() => setIsPasswordVisible((visible) => !visible)}
              className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted transition hover:bg-card-muted hover:text-ink"
            >
              {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-rose-500">{form.formState.errors.password?.message}</p>
        </div>
      </div>

      <div className="mt-7 space-y-4">
        <Button
          type="submit"
          fullWidth
          disabled={loginMutation.isPending}
          className="min-h-12 rounded-xl"
        >
          {loginMutation.isPending ? <Spinner /> : 'Sign in'}
        </Button>

        <p className="text-center text-xs leading-5 text-muted">
          Your chats are ready on this device.
        </p>

        <p className="text-sm text-muted">
          New here?{' '}
          <Link
            to="/register"
            className="font-semibold text-accent transition hover:text-accent/80"
          >
            Create an account
          </Link>
        </p>
      </div>
    </form>
  );
};
