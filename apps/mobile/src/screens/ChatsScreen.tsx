import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChatRow } from '@/components/chat/ChatRow';
import { EmptyState } from '@/components/common/EmptyState';
import { Field } from '@/components/common/Field';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SurfaceCard } from '@/components/common/SurfaceCard';
import { authStorage } from '@/features/auth/storage';
import { chatsApi } from '@/features/chats/api';
import { usersApi } from '@/features/users/api';
import { useAuthStore } from '@/store/auth-store';
import { palette, radii } from '@/styles/theme';

import type { MainTabParamList, RootStackParamList } from '@/navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Chats'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ChatsScreen = ({ navigation }: Props) => {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const chatsQuery = useQuery({
    queryKey: ['chats'],
    queryFn: chatsApi.list
  });

  const peopleQuery = useQuery({
    queryKey: ['users', search],
    queryFn: () => usersApi.list(search),
    enabled: search.trim().length > 1
  });

  const createDirectMutation = useMutation({
    mutationFn: chatsApi.createDirect,
    onSuccess: async (chat) => {
      await queryClient.invalidateQueries({ queryKey: ['chats'] });
      const counterpart = chat.participants.find((participant) => participant.id !== user?.id) ?? chat.participants[0];
      navigation.navigate('ChatThread', { chatId: chat.id, title: counterpart?.name ?? 'Direct chat' });
    }
  });

  const resultUsers = useMemo(
    () => (peopleQuery.data ?? []).filter((candidate) => candidate.id !== user?.id),
    [peopleQuery.data, user?.id]
  );

  return (
    <ScreenContainer>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Secure chats</Text>
            <Text style={styles.subtitle}>Online presence, verified inbox, and encrypted direct messages.</Text>
          </View>
          <PrimaryButton
            label="Sign out"
            variant="secondary"
            onPress={async () => {
              clearSession();
              await authStorage.clear();
            }}
          />
        </View>

        <SurfaceCard style={styles.searchCard}>
          <Field
            label="Search people"
            value={search}
            onChangeText={setSearch}
            placeholder="Search users or start a direct chat"
          />
          {search.trim().length > 1 ? (
            <View style={styles.searchResults}>
              {peopleQuery.isLoading ? (
                <ActivityIndicator color={palette.accent} />
              ) : resultUsers.length === 0 ? (
                <Text style={styles.helper}>No matching users found yet.</Text>
              ) : (
                resultUsers.map((person) => (
                  <Pressable
                    key={person.id}
                    onPress={() => createDirectMutation.mutate(person.id)}
                    style={styles.personRow}
                  >
                    <View>
                      <Text style={styles.personName}>{person.name}</Text>
                      <Text style={styles.personMeta}>@{person.username}</Text>
                    </View>
                    <Text style={styles.personAction}>Open</Text>
                  </Pressable>
                ))
              )}
            </View>
          ) : null}
        </SurfaceCard>

        {chatsQuery.isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={palette.accent} />
          </View>
        ) : chatsQuery.data?.length ? (
          <FlatList
            data={chatsQuery.data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <ChatRow
                chat={item}
                currentUserId={user?.id ?? ''}
                onPress={() => {
                  const counterpart =
                    item.participants.find((participant) => participant.id !== user?.id) ?? item.participants[0];
                  navigation.navigate('ChatThread', {
                    chatId: item.id,
                    title: item.isGroupChat ? item.name ?? 'Conversation' : counterpart?.name ?? 'Conversation'
                  });
                }}
              />
            )}
          />
        ) : (
          <View style={styles.emptyWrap}>
            <EmptyState
              title="No direct chats yet"
              description="Search for a verified teammate above and open a secure conversation."
            />
          </View>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: 18, gap: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12
  },
  title: { color: palette.ink, fontSize: 30, lineHeight: 36, fontWeight: '800' },
  subtitle: { color: palette.muted, fontSize: 14, lineHeight: 20, marginTop: 6, maxWidth: 260 },
  searchCard: { gap: 12 },
  searchResults: {
    borderRadius: radii.lg,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 10,
    gap: 10
  },
  helper: { color: palette.muted, fontSize: 14 },
  personRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  personName: { color: palette.ink, fontSize: 15, fontWeight: '700' },
  personMeta: { color: palette.muted, fontSize: 13, marginTop: 2 },
  personAction: { color: palette.accent, fontWeight: '700' },
  list: { gap: 12, paddingBottom: 24 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { flex: 1, justifyContent: 'center' }
});
