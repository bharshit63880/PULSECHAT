import type { PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';

import { CallOverlay } from '@/features/calls/CallOverlay';
import { useCallController } from '@/features/calls/use-call-controller';
import { useAuthStore } from '@/store/auth-store';

const CallContext = createContext<ReturnType<typeof useCallController> | null>(null);
export const CallProvider = ({ children }: PropsWithChildren) => {
  const token = useAuthStore((state) => state.token); const user = useAuthStore((state) => state.user);
  const controller = useCallController(token, user);
  return <CallContext.Provider value={controller}>{children}<CallOverlay call={controller.call} remoteStream={controller.remoteStream} muted={controller.muted} onAccept={() => void controller.accept()} onEnd={() => void controller.end(controller.call?.direction === 'incoming' ? 'call:reject' : undefined)} onMute={controller.setMuted} /></CallContext.Provider>;
};
export const useCalls = () => { const value = useContext(CallContext); if (!value) throw new Error('CallProvider is required'); return value; };
