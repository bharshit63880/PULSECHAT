import type { AuthUser, ChatDto, MessageDto, PaginationMeta } from '@chat-app/shared';

import type { InfiniteData } from '@tanstack/react-query';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDeferredValue, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInfoPanel } from '@/components/chat/ChatInfoPanel';
import { AppRail } from '@/components/chat/AppRail';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { MessageComposer } from '@/components/chat/MessageComposer';
import { MessageList } from '@/components/chat/MessageList';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/Skeleton';
import { authApi } from '@/features/auth/api';
import {
  computeSafetyNumber,
  encryptAttachmentFile,
  encryptPlaintext,
  ensureLocalDevice,
} from '@/features/encryption/crypto';
import { secureStore } from '@/features/encryption/secure-store';
import { chatsApi } from '@/features/chats/api';
import { messagesApi } from '@/features/messages/api';
import { useSecureMessages } from '@/features/messages/use-secure-messages';
import { groupsApi } from '@/features/groups/api';
import { usersApi } from '@/features/users/api';
import { useAuthBootstrap } from '@/hooks/use-auth-bootstrap';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useDeviceBootstrap } from '@/hooks/use-device-bootstrap';
import { useSocketBridge } from '@/hooks/use-socket-bridge';
import { useCalls } from '@/features/calls/use-calls';
import { deliverOutboxItem } from '@/lib/outbox-delivery';
import { disconnectSocket, getSocket } from '@/lib/socket';
import { uploadService } from '@/services/upload.service';
import { useAuthStore } from '@/store/auth-store';
import { useCryptoStore } from '@/store/crypto-store';
import { useOutboxStore } from '@/store/outbox-store';
import { useNotificationsStore } from '@/store/notifications-store';
import { useUiStore } from '@/store/ui-store';

type MessagesQueryData = {
  data: MessageDto[];
  meta: PaginationMeta;
};

const createOptimisticMessage = (
  user: AuthUser,
  chatId: string,
  payload: {
    clientMessageId: string;
    senderDeviceId: string;
    recipientDeviceId: string;
    ciphertext: string;
    encryptionVersion: string;
    iv: string;
    digest: string;
    attachment?: MessageDto['attachment'];
    type: 'text' | 'image' | 'file' | 'gif' | 'sticker';
  },
): MessageDto => ({
  id: payload.clientMessageId,
  clientMessageId: payload.clientMessageId,
  chatId,
  sender: user,
  senderDeviceId: payload.senderDeviceId,
  recipientDeviceId: payload.recipientDeviceId,
  type: payload.type,
  ciphertext: payload.ciphertext,
  encryptionVersion: payload.encryptionVersion,
  iv: payload.iv,
  digest: payload.digest,
  attachment: payload.attachment ?? null,
  replyTo: null,
  reactions: [],
  status: 'sent',
  seenBy: [{ userId: user.id, seenAt: new Date().toISOString() }],
  expiresAt: null,
  edited: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const updateMessageCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  chatId: string,
  updater: (current: MessagesQueryData | undefined) => MessagesQueryData,
) => {
  queryClient.setQueryData<InfiniteData<MessagesQueryData>>(['messages', chatId], (current) => {
    if (!current) {
      return {
        pages: [updater(undefined)],
        pageParams: [1],
      };
    }

    const [firstPage, ...remainingPages] = current.pages;

    return {
      ...current,
      pages: [updater(firstPage), ...remainingPages],
    };
  });
};

export const ChatWorkspace = () => {
  const queryClient = useQueryClient();
  const bootstrapQuery = useAuthBootstrap();
  const { device: currentDevice, isReady: isDeviceReady } = useDeviceBootstrap();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const clearSession = useAuthStore((state) => state.clearSession);
  const activeChatId = useUiStore((state) => state.activeChatId);
  const setActiveChatId = useUiStore((state) => state.setActiveChatId);
  const isInfoPanelOpen = useUiStore((state) => state.isInfoPanelOpen);
  const setInfoPanelOpen = useUiStore((state) => state.setInfoPanelOpen);
  const search = useUiStore((state) => state.search);
  const setSearch = useUiStore((state) => state.setSearch);
  const verificationByChat = useCryptoStore((state) => state.verificationByChat);
  const upsertVerification = useCryptoStore((state) => state.upsertVerification);
  const outbox = useOutboxStore((state) => state.queue);
  const enqueue = useOutboxStore((state) => state.enqueue);
  const markOutboxStatus = useOutboxStore((state) => state.markStatus);
  const removeOutboxItem = useOutboxStore((state) => state.remove);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const calls = useCalls();
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const sendingRef = useRef<Set<string>>(new Set());
  const notifications = useNotificationsStore((state) => state.items);
  const unreadNotificationCount = useNotificationsStore((state) => state.unreadCount);
  const markNotificationsRead = useNotificationsStore((state) => state.markAllRead);
  const dismissNotification = useNotificationsStore((state) => state.dismiss);
  const deferredSearch = useDeferredValue(search);
  const debouncedSearch = useDebouncedValue(deferredSearch.trim());

  const chatsQuery = useQuery({
    queryKey: ['chats'],
    queryFn: chatsApi.list,
    enabled: Boolean(user),
  });

  const usersQuery = useQuery({
    queryKey: ['users', debouncedSearch],
    queryFn: () => usersApi.list(debouncedSearch),
    enabled: Boolean(user) && debouncedSearch.length > 0,
  });

  const directoryUsersQuery = useQuery({
    queryKey: ['users', 'directory'],
    queryFn: () => usersApi.list(),
    enabled: Boolean(user),
  });

  const activeChat = useMemo(
    () => chatsQuery.data?.find((chat) => chat.id === activeChatId) ?? null,
    [activeChatId, chatsQuery.data],
  );

  const messagesQuery = useInfiniteQuery({
    queryKey: ['messages', activeChatId],
    queryFn: ({ pageParam = 1 }) => messagesApi.list(activeChatId!, pageParam, 40),
    enabled: Boolean(activeChatId),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
  });

  const { typingUserIds } = useSocketBridge(activeChat);
  const pagedMessages = useMemo(
    () => [...(messagesQuery.data?.pages ?? [])].reverse().flatMap((page) => page.data),
    [messagesQuery.data?.pages],
  );
  const { secureMessages, peerBundle, primaryPeerDevice } = useSecureMessages(
    activeChat,
    pagedMessages,
    user?.id,
  );

  useEffect(() => {
    if (!activeChatId && chatsQuery.data && chatsQuery.data.length > 0) {
      setActiveChatId(chatsQuery.data[0]!.id);
    }
  }, [activeChatId, chatsQuery.data, setActiveChatId]);

  useEffect(() => {
    if (!activeChat || pagedMessages.length === 0 || activeChat.unreadCount === 0) {
      return;
    }

    void messagesApi.markSeen(activeChat.id);
    queryClient.setQueryData<ChatDto[]>(['chats'], (current) =>
      (current ?? []).map((chat) =>
        chat.id === activeChat.id ? { ...chat, unreadCount: 0 } : chat,
      ),
    );
  }, [activeChat, pagedMessages.length, queryClient]);

  const directChatMutation = useMutation({
    mutationFn: chatsApi.createDirect,
    onSuccess: (chat) => {
      queryClient.setQueryData<ChatDto[]>(['chats'], (current) => {
        const remaining = (current ?? []).filter((item) => item.id !== chat.id);
        return [chat, ...remaining];
      });
      setActiveChatId(chat.id);
      setShowMobileChat(true);
      setSearch('');
    },
    onError: () => toast.error('Unable to open secure direct chat'),
  });

  const createGroupMutation = useMutation({
    mutationFn: groupsApi.create,
    onSuccess: (chat) => {
      queryClient.setQueryData<ChatDto[]>(['chats'], (current) => {
        const remaining = (current ?? []).filter((item) => item.id !== chat.id);
        return [chat, ...remaining];
      });
      setActiveChatId(chat.id);
      setShowMobileChat(true);
      setIsGroupDialogOpen(false);
      setSearch('');
      toast.success('Group chat created');
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Unable to create group chat right now';
      toast.error(message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      disconnectSocket();
      clearSession();
    },
  });

  const disappearingMutation = useMutation({
    mutationFn: ({ chatId, seconds }: { chatId: string; seconds: number }) =>
      chatsApi.updateDisappearingMode(chatId, seconds),
    onSuccess: (chat) => {
      queryClient.setQueryData<ChatDto[]>(['chats'], (current) =>
        (current ?? []).map((item) => (item.id === chat.id ? chat : item)),
      );
      toast.success('Disappearing timer updated');
    },
    onError: () => toast.error('Unable to update disappearing timer'),
  });

  const renameGroupMutation = useMutation({
    mutationFn: ({ chatId, name }: { chatId: string; name: string }) =>
      groupsApi.rename(chatId, name),
    onSuccess: (chat) => {
      queryClient.setQueryData<ChatDto[]>(['chats'], (current) =>
        (current ?? []).map((item) => (item.id === chat.id ? chat : item)),
      );
      toast.success('Group updated');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unable to rename group right now';
      toast.error(message);
    },
  });

  const addGroupMemberMutation = useMutation({
    mutationFn: ({ chatId, userId }: { chatId: string; userId: string }) =>
      groupsApi.addMember(chatId, userId),
    onSuccess: (chat) => {
      queryClient.setQueryData<ChatDto[]>(['chats'], (current) =>
        (current ?? []).map((item) => (item.id === chat.id ? chat : item)),
      );
      toast.success('Member added');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unable to add member right now';
      toast.error(message);
    },
  });

  const removeGroupMemberMutation = useMutation({
    mutationFn: ({ chatId, userId }: { chatId: string; userId: string }) =>
      groupsApi.removeMember(chatId, userId),
    onSuccess: (chat) => {
      queryClient.setQueryData<ChatDto[]>(['chats'], (current) =>
        (current ?? []).map((item) => (item.id === chat.id ? chat : item)),
      );
      toast.success('Member removed');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unable to remove member right now';
      toast.error(message);
    },
  });

  const reactMutation = useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      messagesApi.react(messageId, emoji),
    onSuccess: (message) => {
      updateMessageCache(queryClient, message.chatId, (current) => ({
        data: (current?.data ?? []).map((item) => (item.id === message.id ? message : item)),
        meta: current?.meta ?? { page: 1, limit: 40, total: 0, totalPages: 1 },
      }));
    },
  });

  const sendQueuedMessage = useEffectEvent(async (queueItem: (typeof outbox)[number]) => {
    if (!token || sendingRef.current.has(queueItem.clientMessageId)) {
      return;
    }

    const socket = getSocket(token);

    sendingRef.current.add(queueItem.clientMessageId);

    try {
      const acknowledgedMessage = await deliverOutboxItem(queueItem, socket);

      await secureStore.saveDecryptedMessage({
        messageId: acknowledgedMessage.id,
        userId: user!.id,
        chatId: acknowledgedMessage.chatId,
        text: queueItem.previewText,
        attachmentName: acknowledgedMessage.attachment?.fileName ?? null,
        createdAt: acknowledgedMessage.createdAt,
      });

      updateMessageCache(queryClient, acknowledgedMessage.chatId, (current) => ({
        data: current?.data.map((message) =>
          message.id === queueItem.clientMessageId ||
          message.clientMessageId === queueItem.clientMessageId
            ? acknowledgedMessage
            : message,
        ) ?? [acknowledgedMessage],
        meta: current?.meta ?? { page: 1, limit: 40, total: 1, totalPages: 1 },
      }));

      queryClient.setQueryData<ChatDto[]>(['chats'], (current) =>
        (current ?? []).map((chat) =>
          chat.id === acknowledgedMessage.chatId
            ? {
                ...chat,
                latestMessage: acknowledgedMessage,
                updatedAt: acknowledgedMessage.createdAt,
              }
            : chat,
        ),
      );
      removeOutboxItem(queueItem.clientMessageId);
    } catch (error) {
      markOutboxStatus(queueItem.clientMessageId, 'failed');
      toast.error(
        error instanceof Error ? error.message : 'Unable to send the encrypted attachment',
      );
    } finally {
      sendingRef.current.delete(queueItem.clientMessageId);
    }
  });

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    const pending = outbox.filter((item) => item.status === 'pending');
    pending.forEach((item) => {
      void sendQueuedMessage(item);
    });
  }, [outbox, sendQueuedMessage, token, user]);

  const typingNames = (activeChat?.participants ?? [])
    .filter((participant) => typingUserIds.includes(participant.id))
    .map((participant) => participant.name);

  const localStatusMap = useMemo(
    () =>
      Object.fromEntries(
        outbox
          .filter((item) => item.chatId === activeChat?.id)
          .map((item) => [item.clientMessageId, item.status === 'pending' ? 'sending' : 'failed']),
      ) as Record<string, 'sending' | 'failed'>,
    [activeChat?.id, outbox],
  );

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (bootstrapQuery.isLoading || chatsQuery.isLoading || !isDeviceReady) {
    return (
      <div className="safe-px safe-pt safe-pb grid min-h-screen gap-4 lg:grid-cols-[360px_1fr]">
        <Skeleton className="h-[calc(100vh-2rem)] rounded-[36px]" />
        <Skeleton className="h-[calc(100vh-2rem)] rounded-[36px]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (chatsQuery.isError) {
    return (
      <div className="safe-px safe-pt safe-pb min-h-screen">
        <ErrorState
          title="Unable to load chats"
          description="The secure workspace could not load your conversations right now."
          onRetry={() => void chatsQuery.refetch()}
        />
      </div>
    );
  }

  const handleTypingStart = () => {
    if (activeChat && token) {
      getSocket(token).emit('typing-start', { chatId: activeChat.id });
    }
  };

  const handleTypingStop = () => {
    if (activeChat && token) {
      getSocket(token).emit('typing-stop', { chatId: activeChat.id });
    }
  };

  const handleSend = async (payload: {
    text?: string | null;
    file?: File | null;
    type: 'text' | 'image' | 'file' | 'gif' | 'sticker';
  }) => {
    if (!activeChat || !currentDevice || !user) {
      toast.error('Conversation is still loading');
      return;
    }

    if (activeChat.isGroupChat && payload.type !== 'text') {
      toast.error('Group media and stickers are coming next. Text chat is ready now.');
      return;
    }

    if (!activeChat.isGroupChat && !primaryPeerDevice) {
      toast.error('Secure session is still establishing for this conversation');
      return;
    }

    const localDevice = activeChat.isGroupChat ? null : await ensureLocalDevice();
    const clientMessageId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `client-${Date.now()}`;
    const previewText =
      payload.text?.trim() ||
      (payload.type === 'sticker'
        ? 'Sent a sticker'
        : payload.type === 'gif'
          ? `Sent a GIF: ${payload.file?.name ?? 'animated media'}`
          : payload.type === 'image'
            ? `Sent an image: ${payload.file?.name ?? 'photo'}`
            : payload.file
              ? `Encrypted file attachment: ${payload.file.name}`
              : 'Encrypted message');
    const groupIv =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `group-iv-${Date.now()}`;
    const groupDigest = `group-digest-${clientMessageId}`;
    const encryptedText = activeChat.isGroupChat
      ? {
          ciphertext: previewText,
          encryptionVersion: 'server-group-v1',
          iv: groupIv,
          digest: groupDigest,
        }
      : await encryptPlaintext(previewText, localDevice!, primaryPeerDevice!.publicAgreementKey);

    let attachment: MessageDto['attachment'] = null;

    if (payload.file && primaryPeerDevice && localDevice) {
      const { encryptedBlob, metadata } = await encryptAttachmentFile(
        payload.file,
        localDevice,
        primaryPeerDevice.publicAgreementKey,
      );
      const uploaded = await uploadService.uploadAttachment(
        new File([encryptedBlob], `${payload.file.name}.enc`, { type: 'application/octet-stream' }),
      );

      attachment = {
        url: uploaded.url,
        publicId: uploaded.publicId ?? null,
        fileName: payload.file.name,
        mimeType: payload.file.type || 'application/octet-stream',
        size: payload.file.size,
        isEncrypted: true,
        encryption: metadata.encryption,
      };
    }

    const optimistic = createOptimisticMessage(user, activeChat.id, {
      clientMessageId,
      senderDeviceId: currentDevice.deviceId,
      recipientDeviceId: activeChat.isGroupChat
        ? currentDevice.deviceId
        : primaryPeerDevice!.deviceId,
      ciphertext: encryptedText.ciphertext,
      encryptionVersion: encryptedText.encryptionVersion,
      iv: encryptedText.iv,
      digest: encryptedText.digest,
      attachment,
      type: payload.type,
    });

    await secureStore.saveDecryptedMessage({
      messageId: clientMessageId,
      userId: user.id,
      chatId: activeChat.id,
      text: previewText,
      attachmentName: attachment?.fileName ?? null,
      createdAt: optimistic.createdAt,
    });

    updateMessageCache(queryClient, activeChat.id, (current) => ({
      data: [...(current?.data ?? []), optimistic],
      meta: current?.meta ?? { page: 1, limit: 40, total: 1, totalPages: 1 },
    }));

    queryClient.setQueryData<ChatDto[]>(['chats'], (current) =>
      (current ?? []).map((chat) =>
        chat.id === activeChat.id
          ? { ...chat, latestMessage: optimistic, updatedAt: optimistic.createdAt }
          : chat,
      ),
    );

    enqueue({
      clientMessageId,
      chatId: activeChat.id,
      senderDeviceId: currentDevice.deviceId,
      recipientDeviceId: activeChat.isGroupChat
        ? currentDevice.deviceId
        : primaryPeerDevice!.deviceId,
      type: payload.type,
      ciphertext: encryptedText.ciphertext,
      encryptionVersion: encryptedText.encryptionVersion,
      iv: encryptedText.iv,
      digest: encryptedText.digest,
      attachment,
      previewText,
      createdAt: optimistic.createdAt,
      status: 'pending',
    });
  };

  const handleRetry = (clientMessageId: string) => {
    markOutboxStatus(clientMessageId, 'pending');
  };

  const handleVerifySafetyNumber = async () => {
    if (!activeChat || !currentDevice || !primaryPeerDevice) {
      return;
    }

    const combinedFingerprint = await computeSafetyNumber(
      currentDevice.fingerprint,
      primaryPeerDevice.fingerprint,
    );
    upsertVerification(activeChat.id, {
      peerDeviceId: primaryPeerDevice.deviceId,
      peerFingerprint: primaryPeerDevice.fingerprint,
      combinedFingerprint,
      status: 'verified',
      verifiedAt: new Date().toISOString(),
    });
    toast.success('Safety number marked as verified on this device');
  };

  return (
    <div className="safe-px safe-pt safe-pb h-[100dvh] min-h-[100svh]">
      <div
        className={`glass-panel grid h-full overflow-hidden rounded-3xl ${
          activeChat && isInfoPanelOpen
            ? 'lg:grid-cols-[76px_320px_minmax(0,1fr)] 2xl:grid-cols-[76px_320px_minmax(0,1fr)_340px]'
            : 'lg:grid-cols-[76px_320px_minmax(0,1fr)]'
        }`}
      >
        <AppRail currentUser={user} />
        <div className={`${showMobileChat ? 'hidden lg:block' : 'block'} min-h-0 min-w-0`}>
          <ChatSidebar
            currentUser={user}
            chats={chatsQuery.data ?? []}
            activeChatId={activeChatId}
            search={search}
            searchResults={usersQuery.data ?? []}
            isSearching={usersQuery.isFetching}
            directoryUsers={directoryUsersQuery.data ?? []}
            notifications={notifications}
            unreadNotificationCount={unreadNotificationCount}
            isCreatingGroup={createGroupMutation.isPending}
            isGroupDialogOpen={isGroupDialogOpen}
            onSearchChange={setSearch}
            onSelectChat={(chatId) => {
              setActiveChatId(chatId);
              setShowMobileChat(true);
            }}
            onOpenDirect={(userId) => directChatMutation.mutate(userId)}
            onOpenNotificationChat={(chatId) => {
              setActiveChatId(chatId);
              setShowMobileChat(true);
            }}
            onMarkNotificationsRead={markNotificationsRead}
            onDismissNotification={dismissNotification}
            onOpenGroupDialog={() => setIsGroupDialogOpen(true)}
            onCloseGroupDialog={() => setIsGroupDialogOpen(false)}
            onCreateGroup={(payload) => createGroupMutation.mutate(payload)}
            onLogout={() => logoutMutation.mutate()}
          />
        </div>

        <div
          className={`${showMobileChat ? 'flex' : 'hidden lg:flex'} min-h-0 min-w-0 flex-col overflow-hidden bg-card`}
        >
          {activeChat ? (
            <>
              <div className="shrink-0">
                <ChatHeader
                  chat={activeChat}
                  currentUserId={user.id}
                  onBack={() => setShowMobileChat(false)}
                  onToggleInfo={() => setInfoPanelOpen(!isInfoPanelOpen)}
                  onVoiceCall={() => void calls.begin(activeChat, 'audio')}
                  isCalling={Boolean(calls.call)}
                />
              </div>
              <div className="chat-canvas min-h-0 flex-1 overflow-hidden">
                {messagesQuery.isError ? (
                  <div className="h-full p-4">
                    <ErrorState
                      title="Unable to load messages"
                      description="Try opening the secure conversation again."
                      onRetry={() => void messagesQuery.refetch()}
                    />
                  </div>
                ) : (
                  <MessageList
                    chat={activeChat}
                    messages={secureMessages}
                    currentUserId={user.id}
                    typingNames={typingNames}
                    hasMore={Boolean(messagesQuery.hasNextPage)}
                    isLoadingMore={messagesQuery.isFetchingNextPage}
                    onLoadMore={() => {
                      if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
                        void messagesQuery.fetchNextPage();
                      }
                    }}
                    localStatuses={localStatusMap}
                    peerPublicAgreementKey={primaryPeerDevice?.publicAgreementKey}
                    onReact={(messageId, emoji) => reactMutation.mutate({ messageId, emoji })}
                    onRetry={handleRetry}
                  />
                )}
              </div>
              <div className="shrink-0">
                <MessageComposer
                  disabled={!activeChat.isGroupChat && !primaryPeerDevice}
                  onTypingStart={handleTypingStart}
                  onTypingStop={handleTypingStop}
                  onSend={handleSend}
                />
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-4 sm:p-6">
              <EmptyState
                title="Choose a secure conversation"
                description="Pick a chat from the sidebar or search for someone to begin encrypted messaging."
              />
            </div>
          )}
        </div>

        {activeChat && isInfoPanelOpen ? (
          <ChatInfoPanel
            chat={activeChat}
            currentUser={user}
            peerBundle={peerBundle}
            localFingerprint={currentDevice?.fingerprint ?? null}
            verification={verificationByChat[activeChat.id] ?? null}
            onVerifySafetyNumber={handleVerifySafetyNumber}
            onUpdateDisappearingMode={(seconds) =>
              disappearingMutation.mutate({ chatId: activeChat.id, seconds })
            }
            onRenameGroup={
              activeChat.isGroupChat
                ? async (name) => {
                    await renameGroupMutation.mutateAsync({ chatId: activeChat.id, name });
                  }
                : undefined
            }
            isRenamingGroup={renameGroupMutation.isPending}
            directoryUsers={directoryUsersQuery.data ?? []}
            onAddGroupMember={
              activeChat.isGroupChat
                ? async (memberUserId) => {
                    await addGroupMemberMutation.mutateAsync({
                      chatId: activeChat.id,
                      userId: memberUserId,
                    });
                  }
                : undefined
            }
            onRemoveGroupMember={
              activeChat.isGroupChat
                ? async (memberUserId) => {
                    await removeGroupMemberMutation.mutateAsync({
                      chatId: activeChat.id,
                      userId: memberUserId,
                    });
                  }
                : undefined
            }
            messages={secureMessages}
            isUpdatingGroupMembers={
              addGroupMemberMutation.isPending || removeGroupMemberMutation.isPending
            }
            onClose={() => setInfoPanelOpen(false)}
          />
        ) : null}
      </div>
    </div>
  );
};
