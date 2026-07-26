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

type LoginValues = {
  email: string;
  password: string;
};

export const LoginScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Login'>) => {
  const setSession = useAuthStore((state) => state.setSession);
  const { control, handleSubmit } = useForm<LoginValues>({
    defaultValues: { email: '', password: '' }
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginValues) => {
      const device = await ensureLocalDevice();
      return authApi.login({ ...values, device });
    },
    onSuccess: async (payload) => {
      setSession(payload);
      await authStorage.write(payload);
    },
    onError: (error) => {
      Alert.alert('Sign in failed', getApiErrorMessage(error, 'Unable to sign in right now'));
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#eafcf1', '#f7fbff']} style={styles.gradient}>
        <View style={styles.hero}>
          <Text style={styles.brand}>PULSE CHAT</Text>
          <Text style={styles.heading}>Private conversations built for mobile teams.</Text>
          <Text style={styles.subheading}>
            Secure sessions, verified inboxes, realtime presence, and device-aware encrypted chat.
          </Text>
        </View>
        <SurfaceCard style={styles.card}>
          <Text style={styles.cardEyebrow}>WELCOME BACK</Text>
          <Text style={styles.cardHeading}>Sign in to Pulse Private Messenger</Text>
          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <Field label="Email" value={value} onChangeText={onChange} autoCapitalize="none" keyboardType="email-address" />
              )}
            />
            <Controller
              control={control}
              name="password"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <Field label="Password" value={value} onChangeText={onChange} secureTextEntry />
              )}
            />
            <PrimaryButton label="Sign in" onPress={handleSubmit((values) => loginMutation.mutate(values))} loading={loginMutation.isPending} />
          </View>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.switchText}>
              New here? <Text style={styles.switchAccent}>Create an account</Text>
            </Text>
          </Pressable>
        </SurfaceCard>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  gradient: { flex: 1, padding: 20, justifyContent: 'center', gap: 20 },
  hero: { gap: 12 },
  brand: { color: '#0f766e', letterSpacing: 4, fontWeight: '700' },
  heading: { color: palette.ink, fontSize: 38, lineHeight: 44, fontWeight: '800' },
  subheading: { color: palette.muted, fontSize: 16, lineHeight: 24 },
  card: { gap: 18 },
  cardEyebrow: { color: palette.muted, letterSpacing: 3, fontSize: 13, fontWeight: '700' },
  cardHeading: { color: palette.ink, fontSize: 30, lineHeight: 36, fontWeight: '800' },
  form: { gap: 14 },
  switchText: { textAlign: 'center', color: palette.muted, fontSize: 15, marginTop: 4 },
  switchAccent: { color: palette.accent, fontWeight: '700' }
});
