import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Field } from '@/components/common/Field';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SurfaceCard } from '@/components/common/SurfaceCard';
import { authApi } from '@/features/auth/api';
import { authStorage } from '@/features/auth/storage';
import { usersApi } from '@/features/users/api';
import { getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { palette } from '@/styles/theme';

type SettingsValues = {
  name: string;
  username: string;
  bio: string;
};

export const SettingsScreen = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const token = useAuthStore((state) => state.token);
  const session = useAuthStore((state) => state.session);
  const { control, handleSubmit } = useForm<SettingsValues>({
    defaultValues: {
      name: user?.name ?? '',
      username: user?.username ?? '',
      bio: user?.bio ?? ''
    }
  });

  const saveMutation = useMutation({
    mutationFn: (values: SettingsValues) => usersApi.updateProfile(values),
    onSuccess: async (nextUser) => {
      updateUser(nextUser);
      if (token && session) {
        await authStorage.write({ token, session, user: nextUser });
      }
      Alert.alert('Profile updated', 'Your mobile profile details are now saved.');
    },
    onError: (error) => {
      Alert.alert('Unable to update profile', getApiErrorMessage(error, 'Try again in a moment.'));
    }
  });

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Profile and security</Text>
        <Text style={styles.subtitle}>Update your visible identity while keeping the secure device session intact.</Text>

        <SurfaceCard style={styles.card}>
          <Controller control={control} name="name" render={({ field: { onChange, value } }) => <Field label="Name" value={value} onChangeText={onChange} />} />
          <Controller control={control} name="username" render={({ field: { onChange, value } }) => <Field label="Username" value={value} onChangeText={onChange} autoCapitalize="none" />} />
          <Controller control={control} name="bio" render={({ field: { onChange, value } }) => <Field label="Bio" value={value} onChangeText={onChange} multiline style={styles.bio} />} />
          <PrimaryButton label="Save changes" onPress={handleSubmit((values) => saveMutation.mutate(values))} loading={saveMutation.isPending} />
        </SurfaceCard>

        <SurfaceCard style={styles.infoCard}>
          <Text style={styles.infoTitle}>Security notes</Text>
          <Text style={styles.infoBody}>The mobile scaffold keeps private keys on-device and reuses the current backend contracts. Text chat is ready first; media, stickers, and offline outbox sync can layer on top next.</Text>
        </SurfaceCard>

        <PrimaryButton
          label="Sign out"
          variant="secondary"
          onPress={async () => {
            try {
              await authApi.logout();
            } catch {
              // keep local sign-out reliable even if the network call fails
            }
            clearSession();
            await authStorage.clear();
          }}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: 18, gap: 16 },
  title: { color: palette.ink, fontSize: 30, lineHeight: 36, fontWeight: '800' },
  subtitle: { color: palette.muted, fontSize: 14, lineHeight: 20 },
  card: { gap: 14 },
  bio: { minHeight: 110, textAlignVertical: 'top' },
  infoCard: { gap: 8 },
  infoTitle: { color: palette.ink, fontSize: 16, fontWeight: '700' },
  infoBody: { color: palette.muted, fontSize: 14, lineHeight: 20 }
});
