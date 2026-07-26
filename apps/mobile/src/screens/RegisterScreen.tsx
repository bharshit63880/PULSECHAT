import { LinearGradient } from 'expo-linear-gradient';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Field } from '@/components/common/Field';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SurfaceCard } from '@/components/common/SurfaceCard';
import { authApi } from '@/features/auth/api';
import { authStorage } from '@/features/auth/storage';
import { ensureLocalDevice } from '@/features/encryption/crypto';
import { getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { palette } from '@/styles/theme';

import type { RootStackParamList } from '@/navigation/types';

type RegisterValues = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export const RegisterScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Register'>) => {
  const setSession = useAuthStore((state) => state.setSession);
  const { control, handleSubmit } = useForm<RegisterValues>({
    defaultValues: { name: '', username: '', email: '', password: '' }
  });

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterValues) => {
      const device = await ensureLocalDevice();
      return authApi.register({ ...values, device });
    },
    onSuccess: async (payload) => {
      setSession(payload);
      await authStorage.write(payload);
    },
    onError: (error) => {
      Alert.alert('Registration failed', getApiErrorMessage(error, 'Unable to create the account right now'));
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#eefcf5', '#f7fbff']} style={styles.gradient}>
        <SurfaceCard style={styles.card}>
          <Text style={styles.cardEyebrow}>SECURE SIGNUP</Text>
          <Text style={styles.cardHeading}>Create your mobile device session</Text>
          <View style={styles.form}>
            <Controller control={control} name="name" render={({ field: { onChange, value } }) => <Field label="Name" value={value} onChangeText={onChange} />} />
            <Controller control={control} name="username" render={({ field: { onChange, value } }) => <Field label="Username" value={value} onChangeText={onChange} autoCapitalize="none" />} />
            <Controller control={control} name="email" render={({ field: { onChange, value } }) => <Field label="Email" value={value} onChangeText={onChange} autoCapitalize="none" keyboardType="email-address" />} />
            <Controller control={control} name="password" render={({ field: { onChange, value } }) => <Field label="Password" value={value} onChangeText={onChange} secureTextEntry helperText="Device keys are generated locally before the first secure chat." />} />
            <PrimaryButton label="Create account" onPress={handleSubmit((values) => registerMutation.mutate(values))} loading={registerMutation.isPending} />
          </View>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.switchText}>
              Already have an account? <Text style={styles.switchAccent}>Sign in</Text>
            </Text>
          </Pressable>
        </SurfaceCard>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  gradient: { flex: 1, padding: 20, justifyContent: 'center' },
  card: { gap: 18 },
  cardEyebrow: { color: palette.muted, letterSpacing: 3, fontSize: 13, fontWeight: '700' },
  cardHeading: { color: palette.ink, fontSize: 32, lineHeight: 38, fontWeight: '800' },
  form: { gap: 14 },
  switchText: { textAlign: 'center', color: palette.muted, fontSize: 15, marginTop: 4 },
  switchAccent: { color: palette.accent, fontWeight: '700' }
});
