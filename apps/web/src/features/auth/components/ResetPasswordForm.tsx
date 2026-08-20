import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { z } from 'zod';

import type { ApiErrorResponse } from '@chat-app/shared';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/common/Spinner';
import { authApi } from '@/features/auth/api';
import { resetPasswordFormSchema } from '@/features/auth/schema';

type Values = z.infer<typeof resetPasswordFormSchema>;

export const ResetPasswordForm = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const mutation = useMutation({
    mutationFn: ({ password }: Values) => authApi.resetPassword(token ?? '', password),
    onSuccess: () => {
      toast.success('Password updated. You can now sign in.');
      navigate('/login');
    },
    onError: (error) =>
      toast.error(
        axios.isAxiosError<ApiErrorResponse>(error)
          ? (error.response?.data?.error?.message ?? 'Unable to reset password')
          : 'Unable to reset password',
      ),
  });

  if (!token)
    return (
      <div className="w-full p-2 text-center">
        <h2 className="text-3xl font-semibold">This reset link is incomplete.</h2>
        <Link className="mt-5 inline-block text-accent" to="/forgot-password">
          Request a new link
        </Link>
      </div>
    );
  return (
    <form
      className="w-full p-1 sm:p-2"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        Choose a new password
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.055em] sm:text-[2.2rem]">
        Secure your account
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        Use at least 8 characters and don’t reuse an old password.
      </p>
      <div className="mt-8 space-y-4">
        {(['password', 'confirmPassword'] as const).map((field) => (
          <div key={field}>
            <label className="mb-2 block text-sm font-semibold text-ink">
              {field === 'password' ? 'New password' : 'Confirm password'}
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                type={show ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                className="pl-11 pr-11"
                {...form.register(field)}
              />
              {field === 'password' ? (
                <button
                  type="button"
                  onClick={() => setShow((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              ) : null}
            </div>
            <p className="mt-1.5 text-xs text-rose-500">{form.formState.errors[field]?.message}</p>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Button
          type="submit"
          fullWidth
          className="min-h-12 rounded-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? <Spinner /> : 'Save new password'}
        </Button>
      </div>
    </form>
  );
};
