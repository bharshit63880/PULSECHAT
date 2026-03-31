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
import { registerFormSchema } from '@/features/auth/schema';
import { useAuthStore } from '@/store/auth-store';

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const RegisterForm = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
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
      className="w-full max-w-md space-y-5 rounded-[32px] border border-line bg-card p-8 shadow-soft"
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
        <p className="text-sm uppercase tracking-[0.24em] text-muted">Get started</p>
        <h2 className="text-3xl font-bold">Create your secure identity</h2>
        <p className="text-sm text-muted">We will generate device keys locally in your browser before your first session starts.</p>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Name</label>
          <Input placeholder="Aarav Mehta" {...form.register('name')} />
          <p className="mt-1 text-xs text-rose-500">{form.formState.errors.name?.message}</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Username</label>
          <Input placeholder="aarav" {...form.register('username')} />
          <p className="mt-1 text-xs text-rose-500">{form.formState.errors.username?.message}</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Email</label>
          <Input type="email" placeholder="you@company.com" {...form.register('email')} />
          <p className="mt-1 text-xs text-rose-500">{form.formState.errors.email?.message}</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Password</label>
          <Input type="password" placeholder="Create a strong password" {...form.register('password')} />
          <p className="mt-1 text-xs text-rose-500">{form.formState.errors.password?.message}</p>
        </div>
      </div>

      <Button type="submit" fullWidth disabled={registerMutation.isPending}>
        {registerMutation.isPending ? <Spinner /> : 'Create account'}
      </Button>

      <p className="text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-accent">
          Sign in
        </Link>
      </p>
    </form>
  );
};
