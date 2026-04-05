import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Camera, ShieldCheck, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { z } from 'zod';

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
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
      username: user?.username ?? '',
      email: user?.email ?? '',
      bio: user?.bio ?? undefined,
      avatarUrl: user?.avatarUrl ?? undefined
    }
  });

  const updateMutation = useMutation({
    mutationFn: settingsApi.updateProfile,
    onSuccess: (result) => {
      updateUser(result);
      toast.success('Profile updated');
    },
    onError: () => toast.error('Unable to save profile')
  });

  if (!user) {
    return null;
  }

  return (
    <div className="safe-px safe-pt safe-pb min-h-screen">
      <div className="mx-auto max-w-5xl rounded-[36px] glass-panel p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-5 border-b border-line/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" className="h-11 w-11 rounded-2xl p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Profile settings</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">Identity and account details</h1>
              <p className="mt-2 text-sm leading-6 text-muted">Refine how your name, avatar, and public profile appear across the workspace.</p>
            </div>
          </div>
          <div className="rounded-[26px] surface-muted px-4 py-3 text-sm text-muted">
            Your email verification and device trust state stay attached to this profile.
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

              <Button
                variant="secondary"
                className="min-h-11 rounded-2xl"
                onClick={async () => {
                  const picker = document.createElement('input');
                  picker.type = 'file';
                  picker.accept = 'image/*';
                  picker.onchange = async () => {
                    const file = picker.files?.[0];
                    if (!file) {
                      return;
                    }

                    const uploaded = await uploadService.uploadAvatar(file);
                    form.setValue('avatarUrl', uploaded.url);
                    toast.success('Avatar uploaded');
                  };
                  picker.click();
                }}
              >
                <Camera className="h-4 w-4" />
                Upload avatar
              </Button>

              <div className="w-full space-y-3 rounded-[28px] surface-muted p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent dark:text-emerald-200">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Trust-aware profile</p>
                    <p className="mt-1 text-xs leading-6 text-muted">
                      Changes here keep your profile consistent across chats, devices, notifications, and member lists.
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
              <FormField label="Avatar URL" error={form.formState.errors.avatarUrl?.message}>
                <Input {...form.register('avatarUrl')} />
              </FormField>

              <div className="flex flex-col gap-3 border-t border-line/80 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <UserRound className="h-4 w-4" />
                  Profile updates apply instantly to this session.
                </div>
                <Button type="submit" disabled={updateMutation.isPending} className="min-h-12 rounded-2xl sm:min-w-[180px]">
                  {updateMutation.isPending ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};
