import type { ChatDto, MessageDto, PublishedKeyBundleDto } from '@chat-app/shared';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import {
  decryptPlaintext,
  ensureLocalDevice,
  getFirstUsablePeerDevice,
  isUsablePublicKey
} from '@/features/encryption/crypto';
import { encryptionApi } from '@/features/encryption/api';
import { secureStore } from '@/features/encryption/secure-store';

export type SecureMessageView = MessageDto & {
  plaintext: string;
};

export const useSecureMessages = (
  chat: ChatDto | null,
  messages: MessageDto[],
  currentUserId: string | undefined
) => {
  const peerUser = useMemo(() => {
    if (!chat || chat.isGroupChat || !currentUserId) {
      return null;
    }

    return chat.participants.find((participant) => participant.id !== currentUserId) ?? null;
  }, [chat, currentUserId]);
  const bundleQuery = useQuery({
    queryKey: ['keys', peerUser?.id],
    queryFn: () => encryptionApi.getKeyBundle(peerUser!.id),
    enabled: Boolean(peerUser)
  });
  const [plaintextMap, setPlaintextMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!chat || !currentUserId) {
        return;
      }

      if (chat.isGroupChat) {
        const nextPlaintext: Record<string, string> = {};

        await Promise.all(
          messages.map(async (message) => {
            nextPlaintext[message.id] = message.ciphertext;
            await secureStore.saveDecryptedMessage({
              messageId: message.id,
              userId: currentUserId,
              chatId: message.chatId,
              text: message.ciphertext,
              attachmentName: message.attachment?.fileName ?? null,
              createdAt: message.createdAt
            });
          })
        );

        if (!cancelled) {
          setPlaintextMap(nextPlaintext);
        }
        return;
      }

      const bundle = bundleQuery.data;

      if (!bundle) {
        return;
      }

      const localDevice = await ensureLocalDevice();
      const nextPlaintext: Record<string, string> = {};

      await Promise.all(
        messages.map(async (message) => {
          const cached = await secureStore.getDecryptedMessage(message.id);

          if (cached?.text) {
            nextPlaintext[message.id] = cached.text;
            return;
          }

          const peerDeviceId =
            message.sender.id === currentUserId ? message.recipientDeviceId : message.senderDeviceId;
          const peerDevice = bundle.devices.find(
            (device) => device.deviceId === peerDeviceId && isUsablePublicKey(device.publicAgreementKey)
          );

          if (!peerDevice) {
            nextPlaintext[message.id] = '[Unable to establish a secure session for this message]';
            return;
          }

          try {
            const plaintext = await decryptPlaintext(
              {
                ciphertext: message.ciphertext,
                iv: message.iv
              },
              localDevice,
              peerDevice.publicAgreementKey
            );

            nextPlaintext[message.id] = plaintext;
            await secureStore.saveDecryptedMessage({
              messageId: message.id,
              userId: currentUserId,
              chatId: message.chatId,
              text: plaintext,
              attachmentName: message.attachment?.fileName ?? null,
              createdAt: message.createdAt
            });
          } catch {
            nextPlaintext[message.id] = '[Encrypted message could not be decrypted on this device]';
          }
        })
      );

      if (!cancelled) {
        setPlaintextMap(nextPlaintext);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [bundleQuery.data, chat, currentUserId, messages]);

  return {
    peerBundle: bundleQuery.data as PublishedKeyBundleDto | undefined,
    primaryPeerDevice: getFirstUsablePeerDevice(bundleQuery.data),
    secureMessages: messages.map((message) => ({
      ...message,
      plaintext: plaintextMap[message.id] ?? '[Decrypting...]'
    })),
    isDecrypting: bundleQuery.isLoading
  };
};
