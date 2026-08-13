import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import {
  ArrowLeft,
  AtSign,
  Camera,
  ChevronRight,
  Mail,
  ShieldCheck,
  Smartphone,
  UserRound,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { z } from 'zod';

import type { ApiErrorResponse } from '@chat-app/shared';
import { updateProfileSchema } from '@chat-app/shared';

import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { FormField } from '@/components/forms/FormField';
import { settingsApi } from '@/features/settings/api';
import { uploadService } from '@/services/upload.service';
import { useAuthStore } from '@/store/auth-store';

type SettingsFormValues = z.infer<typeof updateProfileSchema>;

export const SettingsView = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
      username: user?.username ?? '',
      email: user?.email ?? '',
      bio: user?.bio ?? undefined,
      avatarUrl: user?.avatarUrl ?? undefined,
    },
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    form.reset({
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
    });
  }, [form, user]);

  const updateMutation = useMutation({
    mutationFn: settingsApi.updateProfile,
    onSuccess: (result) => {
      updateUser(result);
      toast.success('Profile updated');
    },
    onError: (error) => {
      toast.error(
        axios.isAxiosError<ApiErrorResponse>(error)
          ? (error.response?.data?.error?.message ?? 'Unable to save profile')
          : 'Unable to save profile',
      );
    },
  });

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const uploaded = await uploadService.uploadAvatar(file);
      return settingsApi.updateProfile({ avatarUrl: uploaded.url });
    },
    onSuccess: (result) => {
      updateUser(result);
      form.setValue('avatarUrl', result.avatarUrl ?? undefined, { shouldDirty: false });
      toast.success('Profile photo updated');
    },
    onError: (error) => {
      toast.error(
        axios.isAxiosError<ApiErrorResponse>(error)
          ? (error.response?.data?.error?.message ?? 'Unable to upload profile photo')
          : 'Unable to upload profile photo',
      );
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="safe-px safe-pt safe-pb min-h-screen">
      <div className="mx-auto max-w-5xl rounded-3xl glass-panel p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-5 border-b border-line/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" className="h-11 w-11 rounded-2xl p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <p className="text-xs font-semibold text-accent">SETTINGS</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">My profile</h1>
              <p className="mt-2 text-sm leading-6 text-muted">
                Update the details people see in chats.
              </p>
            </div>
          </div>
          <div className="rounded-[26px] surface-muted px-4 py-3 text-sm text-muted">
            {user.isEmailVerified ? 'Email verified' : 'Email verification pending'}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <section className="glass-card rounded-[32px] p-5 sm:p-6">
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-4">
                <Avatar src={form.watch('avatarUrl')} alt={user.name} size="lg" />
                <div>
                  <p className="text-xl font-semibold tracking-tight">{user.name}</p>
                  <p className="text-sm text-muted">@{user.username}</p>
                </div>
              </div>

              <input
                ref={avatarInputRef}
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = '';

                  if (!file) {
                    return;
                  }

                  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                    toast.error('Choose a JPG, PNG, or WebP image');
                    return;
                  }

                  avatarMutation.mutate(file);
                }}
              />
              <Button
                type="button"
                variant="secondary"
                className="min-h-11 rounded-2xl"
                disabled={avatarMutation.isPending}
                onClick={() => avatarInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
                {avatarMutation.isPending ? 'Uploading photo...' : 'Upload profile photo'}
              </Button>
              <p className="-mt-2 text-xs leading-5 text-muted">
                JPG, PNG, or WebP. Your photo is saved as soon as the upload completes.
              </p>

              <div className="w-full space-y-3 rounded-[28px] surface-muted p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent dark:text-emerald-200">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Private by default</p>
                    <p className="mt-1 text-xs leading-6 text-muted">
                      Your name, photo, and bio are updated everywhere you chat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card rounded-[32px] p-5 sm:p-6">
            <form
              className="grid gap-5"
              onSubmit={form.handleSubmit((values) => {
                updateMutation.mutate(values);
              })}
            >
              <FormField label="Full name" error={form.formState.errors.name?.message}>
                <Input {...form.register('name')} />
              </FormField>
              <FormField label="Username" error={form.formState.errors.username?.message}>
                <Input {...form.register('username')} />
              </FormField>
              <FormField label="Email" error={form.formState.errors.email?.message}>
                <Input type="email" {...form.register('email')} />
              </FormField>
              <FormField label="Bio" error={form.formState.errors.bio?.message}>
                <Input {...form.register('bio')} />
              </FormField>
              <p className="-mt-3 text-xs text-muted">
                Add a short line people will see when they open your profile.
              </p>
              <div className="flex flex-col gap-3 border-t border-line/80 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <UserRound className="h-4 w-4" />
                  Profile updates apply instantly to this session.
                </div>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="min-h-12 rounded-2xl sm:min-w-[180px]"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </form>
          </section>
        </div>

        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Account centre</h2>
              <p className="mt-1 text-sm text-muted">
                Useful profile and security details in one place.
              </p>
            </div>
            <span className="text-xs text-muted">
              Profile {form.watch('bio') ? 'complete' : 'almost complete'}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-line bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <AtSign className="h-4 w-4" />
              </div>
              <p className="mt-4 text-sm font-semibold">Your identity</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                @{form.watch('username')} · {form.watch('bio') || 'Add an about line'}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Mail className="h-4 w-4" />
              </div>
              <p className="mt-4 text-sm font-semibold">Email status</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                {user.isEmailVerified ? 'Verified email address' : 'Verification is pending'}
              </p>
            </div>
            <Link
              to="/devices"
              className="group rounded-2xl border border-line bg-card p-4 transition hover:border-accent/40 hover:shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Smartphone className="h-4 w-4" />
                </div>
                <ChevronRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>
              <p className="mt-4 text-sm font-semibold">Devices & security</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Review active sessions and remove devices you do not recognise.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
