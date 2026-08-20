import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { z } from 'zod';

import type { ApiErrorResponse } from '@chat-app/shared';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/common/Spinner';
import { authApi } from '@/features/auth/api';
import { forgotPasswordFormSchema } from '@/features/auth/schema';

type Values = z.infer<typeof forgotPasswordFormSchema>;

export const ForgotPasswordForm = () => {
  const form = useForm<Values>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: '' },
  });
  const mutation = useMutation({
    mutationFn: ({ email }: Values) => authApi.requestPasswordReset(email),
    onSuccess: () => toast.success('If an account exists, a reset link has been sent.'),
    onError: (error) =>
      toast.error(
        axios.isAxiosError<ApiErrorResponse>(error)
          ? (error.response?.data?.error?.message ?? 'Unable to request a reset link')
          : 'Unable to request a reset link',
      ),
  });

  return (
    <form
      className="w-full p-1 sm:p-2"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Password help
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.055em] sm:text-[2.2rem]">
          Reset your password
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Enter your email and we’ll send a private link to create a new password.
        </p>
      </div>
      <div className="mt-8">
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
      <div className="mt-8">
        <Button
          type="submit"
          fullWidth
          className="min-h-12 rounded-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? <Spinner /> : 'Email reset link'}
        </Button>
      </div>
    </form>
  );
};
