import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/common/PrimaryButton';
import { EmptyState } from '@/components/common/EmptyState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SurfaceCard } from '@/components/common/SurfaceCard';
import { devicesApi } from '@/features/devices/api';
import { getApiErrorMessage } from '@/lib/api';
import { palette } from '@/styles/theme';

export const DevicesScreen = () => {
  const queryClient = useQueryClient();

  const devicesQuery = useQuery({
    queryKey: ['devices'],
    queryFn: devicesApi.list
  });

  const revokeMutation = useMutation({
    mutationFn: devicesApi.revoke,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: (error) => {
      Alert.alert('Unable to revoke', getApiErrorMessage(error, 'Please try again shortly.'));
    }
  });

  return (
    <ScreenContainer>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Device sessions</Text>
        <Text style={styles.subtitle}>Review secure sessions, current device labels, and revoke stale devices.</Text>

        {devicesQuery.data?.length ? (
          <FlatList
            data={devicesQuery.data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <SurfaceCard style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardMeta}>
                    <Text style={styles.deviceLabel}>{item.label}</Text>
                    <Text style={styles.deviceInfo}>{item.platform ?? 'mobile'} · {new Date(item.lastActiveAt).toLocaleString()}</Text>
                    <Text numberOfLines={1} style={styles.deviceInfo}>{item.fingerprint}</Text>
                  </View>
                  {!item.isCurrent ? <PrimaryButton label="Revoke" variant="secondary" onPress={() => revokeMutation.mutate(item.deviceId)} /> : null}
                </View>
                {item.isCurrent ? <Text style={styles.currentBadge}>Current device</Text> : null}
              </SurfaceCard>
            )}
          />
        ) : (
          <View style={styles.emptyWrap}>
            <EmptyState title="No device sessions yet" description="Login and registration will register secure device sessions here." />
          </View>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: 18, gap: 14 },
  title: { color: palette.ink, fontSize: 30, lineHeight: 36, fontWeight: '800' },
  subtitle: { color: palette.muted, fontSize: 14, lineHeight: 20 },
  list: { gap: 12, paddingBottom: 24 },
  card: { gap: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  cardMeta: { flex: 1, gap: 4 },
  deviceLabel: { color: palette.ink, fontSize: 16, fontWeight: '700' },
  deviceInfo: { color: palette.muted, fontSize: 13, lineHeight: 18 },
  currentBadge: { color: palette.accent, fontWeight: '700', fontSize: 13 },
  emptyWrap: { flex: 1, justifyContent: 'center' }
});
