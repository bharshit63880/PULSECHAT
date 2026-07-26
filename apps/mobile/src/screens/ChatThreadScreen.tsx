import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ThreadBubble } from '@/components/chat/ThreadBubble';
import { ThreadComposer } from '@/components/chat/ThreadComposer';
import { EmptyState } from '@/components/common/EmptyState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SurfaceCard } from '@/components/common/SurfaceCard';
import { chatsApi } from '@/features/chats/api';
import { encryptionApi } from '@/features/encryption/api';
import { decryptPlaintext, encryptPlaintext, ensureLocalDevice, getFirstUsablePeerDevice } from '@/features/encryption/crypto';
import { messagesApi } from '@/features/messages/api';
import { getApiErrorMessage } from '@/lib/api';
import { SOCKET_EVENTS, getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth-store';
import { palette } from '@/styles/theme';

import type { RootStackParamList } from '@/navigation/types';

export const ChatThreadScreen = ({ route }: NativeStackScreenProps<RootStackParamList, 'ChatThread'>) => {
  const { chatId } = route.params;
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [plaintextMap, setPlaintextMap] = useState<Record<string, string>>({});

  const chatsQuery = useQuery({
    queryKey: ['chats'],
    queryFn: chatsApi.list
  });

  const chat = useMemo(
    () => chatsQuery.data?.find((entry) => entry.id === chatId) ?? null,
    [chatId, chatsQuery.data]
  );
  const counterpart = chat?.participants.find((participant) => participant.id !== user?.id) ?? null;

  const keyBundleQuery = useQuery({
    queryKey: ['key-bundle', counterpart?.id],
    queryFn: () => encryptionApi.getKeyBundle(counterpart!.id),
    enabled: Boolean(counterpart?.id)
  });

  const messagesQuery = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => messagesApi.list(chatId, 1, 40)
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = getSocket(token);
    socket.emit(SOCKET_EVENTS.JOIN_CHAT, { chatId });

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_CHAT, { chatId });
    };
  }, [chatId, token]);

  useEffect(() => {
    if (!messagesQuery.data?.data.length || !keyBundleQuery.data) {
      return;
    }

    let cancelled = false;

    const decryptMessages = async () => {
      try {
        const localDevice = await ensureLocalDevice();
        const peerDevice = getFirstUsablePeerDevice(keyBundleQuery.data);

        if (!peerDevice) {
          return;
        }

        const nextEntries = await Promise.all(
          messagesQuery.data!.data.map(async (message) => {
            try {
              const plaintext = await decryptPlaintext(
                { ciphertext: message.ciphertext, iv: message.iv },
                localDevice,
                peerDevice.publicAgreementKey
              );
              return [message.id, plaintext] as const;
            } catch {
              return [message.id, 'Encrypted message'] as const;
            }
          })
        );

        if (!cancelled) {
          setPlaintextMap(Object.fromEntries(nextEntries));
        }
      } catch {
        if (!cancelled) {
          setPlaintextMap({});
        }
      }
    };

    void decryptMessages();

    return () => {
      cancelled = true;
    };
  }, [keyBundleQuery.data, messagesQuery.data]);

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!counterpart || !session) {
        throw new Error('Direct chat session is not ready yet');
      }

      const bundle = await encryptionApi.getKeyBundle(counterpart.id);
      const peerDevice = getFirstUsablePeerDevice(bundle);

      if (!peerDevice) {
        throw new Error('This contact does not have an active secure mobile-compatible device yet.');
      }

      const localDevice = await ensureLocalDevice();
      const encrypted = await encryptPlaintext(text, localDevice, peerDevice.publicAgreementKey);

      return messagesApi.send({
        chatId,
        clientMessageId:
          typeof globalThis.crypto?.randomUUID === 'function'
            ? globalThis.crypto.randomUUID()
            : `mobile-msg-${Date.now()}`,
        senderDeviceId: session.deviceId,
        recipientDeviceId: peerDevice.deviceId,
        type: 'text',
        ...encrypted
      });
    },
    onSuccess: async () => {
      setDraft('');
      await queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      await queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (error) => {
      Alert.alert('Unable to send', getApiErrorMessage(error, 'Secure mobile send failed right now.'));
    }
  });

  useEffect(() => {
    if (!messagesQuery.data?.data.length) {
      return;
    }

    void messagesApi.markSeen(chatId);
  }, [chatId, messagesQuery.data?.data.length]);

  return (
    <ScreenContainer>
      <View style={styles.wrapper}>
        <SurfaceCard style={styles.banner}>
          <Text style={styles.bannerTitle}>
            {counterpart?.isOnline
              ? 'Online now'
              : counterpart?.lastSeen
                ? `Last seen ${new Date(counterpart.lastSeen).toLocaleString()}`
                : 'Secure direct chat'}
          </Text>
          <Text style={styles.bannerText}>
            Mobile keeps the same secure direct-message boundary. This first pass focuses on encrypted text flow, device sessions, and readable mobile threads.
          </Text>
        </SurfaceCard>

        {messagesQuery.isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={palette.accent} />
          </View>
        ) : messagesQuery.data?.data.length ? (
          <FlatList
            data={messagesQuery.data.data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messages}
            renderItem={({ item }) => (
              <ThreadBubble message={item} own={item.sender.id === user?.id} plaintext={plaintextMap[item.id] ?? 'Decrypting...'} />
            )}
          />
        ) : (
          <View style={styles.emptyWrap}>
            <EmptyState title="No messages yet" description="Send the first secure mobile message to open the thread." />
          </View>
        )}

        <ThreadComposer value={draft} onChange={setDraft} onSend={() => sendMutation.mutate(draft.trim())} disabled={sendMutation.isPending || !counterpart} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: 18, gap: 14 },
  banner: { gap: 8, paddingVertical: 14 },
  bannerTitle: { color: palette.ink, fontSize: 16, fontWeight: '700' },
  bannerText: { color: palette.muted, fontSize: 13, lineHeight: 18 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  messages: { paddingBottom: 16 }
});
