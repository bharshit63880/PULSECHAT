import type { PropsWithChildren } from 'react';

import type { MessageDto } from '@chat-app/shared';

import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { disconnectSocket, getSocket, SOCKET_EVENTS } from '@/lib/socket';
import { useAuthStore } from '@/store/auth-store';

const queryClient = new QueryClient();

const MobileSocketBridge = () => {
  const token = useAuthStore((state) => state.token);
  const queryClientInstance = useQueryClient();

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    const socket = getSocket(token);
    socket.emit(SOCKET_EVENTS.SETUP);

    const onReceiveMessage = ({ chatId }: { chatId: string; message: MessageDto }) => {
      void queryClientInstance.invalidateQueries({ queryKey: ['chats'] });
      void queryClientInstance.invalidateQueries({ queryKey: ['messages', chatId] });
    };

    const onMessageAck = ({ chatId }: { chatId: string; message: MessageDto }) => {
      void queryClientInstance.invalidateQueries({ queryKey: ['messages', chatId] });
    };

    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, onReceiveMessage);
    socket.on(SOCKET_EVENTS.MESSAGE_ACK, onMessageAck);

    return () => {
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, onReceiveMessage);
      socket.off(SOCKET_EVENTS.MESSAGE_ACK, onMessageAck);
    };
  }, [queryClientInstance, token]);

  return null;
};

export const AppProviders = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <MobileSocketBridge />
    {children}
  </QueryClientProvider>
);
