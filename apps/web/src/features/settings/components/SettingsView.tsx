import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-3xl rounded-[36px] border border-white/50 bg-white/70 p-6 shadow-soft backdrop-blur dark:border-white/5 dark:bg-slate-950/70">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Profile settings</h1>
              <p className="text-sm text-muted">Update your identity, bio, and avatar.</p>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-col items-start gap-4 rounded-[32px] border border-line p-5 sm:flex-row sm:items-center">
          <Avatar src={form.watch('avatarUrl')} alt={user.name} size="lg" />
          <div className="space-y-2">
            <p className="font-semibold">{user.name}</p>
            <Button
              variant="secondary"
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
              Upload avatar
            </Button>
          </div>
        </div>

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

          <Button type="submit" disabled={updateMutation.isPending}>
            Save changes
          </Button>
        </form>
      </div>
    </div>
  );
};
