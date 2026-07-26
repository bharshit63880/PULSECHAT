import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { AtSign, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
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
import { registerFormSchema } from '@/features/auth/schema';
import { ensureLocalDevice } from '@/features/encryption/crypto';
import { useAuthStore } from '@/store/auth-store';

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const RegisterForm = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const readErrorMessage = (error: unknown) =>
    axios.isAxiosError<ApiErrorResponse>(error)
      ? error.response?.data?.error?.message ?? 'Unable to create your account'
      : 'Unable to create your account';

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: ''
    }
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (result) => {
      setSession(result);
      toast.success('Account created. Check your email to verify it.');
      navigate('/verify-email');
    },
    onError: (error) => {
      toast.error(readErrorMessage(error));
    }
  });

  return (
    <form
      className="w-full rounded-3xl border border-line bg-card p-6 shadow-float sm:p-8"
      onSubmit={form.handleSubmit(async (values) => {
        const device = await ensureLocalDevice();
        registerMutation.mutate({
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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Get started</p>
        <div>
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.045em] sm:text-[2.1rem]">Create your account</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Set up your profile and start chatting in a minute.</p>
        </div>
      </div>

      <div className="mt-7 grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Name</label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input placeholder="Aarav Mehta" className="pl-11" {...form.register('name')} />
          </div>
          <p className="mt-1.5 text-xs text-rose-500">{form.formState.errors.name?.message}</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Username</label>
          <div className="relative">
            <AtSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input placeholder="aarav" className="pl-11" {...form.register('username')} />
          </div>
          <p className="mt-1.5 text-xs text-rose-500">{form.formState.errors.username?.message}</p>
        </div>
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
              type={isPasswordVisible ? 'text' : 'password'}
              placeholder="Create a strong password"
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
        <Button type="submit" fullWidth disabled={registerMutation.isPending} className="min-h-12 rounded-xl">
          {registerMutation.isPending ? <Spinner /> : 'Create account'}
        </Button>

        <p className="text-center text-xs leading-5 text-muted">We will email you a quick verification link after signup.</p>

        <p className="text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent transition hover:text-accent/80">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
};
