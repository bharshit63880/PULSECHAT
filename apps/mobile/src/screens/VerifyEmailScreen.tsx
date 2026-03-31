import { useMutation } from '@tanstack/react-query';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/common/PrimaryButton';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SurfaceCard } from '@/components/common/SurfaceCard';
import { authApi } from '@/features/auth/api';
import { authStorage } from '@/features/auth/storage';
import { getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { palette } from '@/styles/theme';

export const VerifyEmailScreen = () => {
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const clearSession = useAuthStore((state) => state.clearSession);

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendVerification(),
    onSuccess: () => {
      Alert.alert('Verification email sent', 'Check your inbox on this device and tap the latest link.');
    },
    onError: (error) => {
      Alert.alert('Unable to resend', getApiErrorMessage(error, 'Please try again in a moment'));
    }
  });

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <SurfaceCard style={styles.card}>
          <Text style={styles.eyebrow}>VERIFY YOUR INBOX</Text>
          <Text style={styles.heading}>Secure your account before mobile chat opens</Text>
          <Text style={styles.body}>
            We sent a verification link to {user?.email}. Once it is confirmed in the browser, sign in again on mobile to unlock encrypted conversations.
          </Text>
          <View style={styles.stack}>
            <PrimaryButton label="Resend verification email" onPress={() => resendMutation.mutate()} loading={resendMutation.isPending} />
            <PrimaryButton
              label="Back to sign in"
              variant="secondary"
              onPress={async () => {
                clearSession();
                await authStorage.clear();
              }}
            />
          </View>
          <Text style={styles.note}>
            Mobile email-link interception can be added later with deep links. This scaffold keeps verification explicit and secure for now.
          </Text>
          {session ? <Text style={styles.meta}>Current device: {session.label}</Text> : null}
        </SurfaceCard>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: 20, justifyContent: 'center' },
  card: { gap: 16 },
  eyebrow: { color: palette.muted, letterSpacing: 3, fontSize: 13, fontWeight: '700' },
  heading: { color: palette.ink, fontSize: 30, lineHeight: 36, fontWeight: '800' },
  body: { color: palette.muted, fontSize: 16, lineHeight: 24 },
  stack: { gap: 12 },
  note: { color: palette.muted, fontSize: 13, lineHeight: 19 },
  meta: { color: palette.ink, fontWeight: '600', fontSize: 14 }
});
