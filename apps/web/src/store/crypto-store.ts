import type { DeviceRegistrationDto } from '@chat-app/shared';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type VerificationRecord = {
  peerDeviceId: string;
  peerFingerprint: string;
  combinedFingerprint: string;
  status: 'unverified' | 'verified' | 'changed';
  verifiedAt?: string | null;
};

type CryptoState = {
  currentDevice: DeviceRegistrationDto | null;
  setCurrentDevice: (device: DeviceRegistrationDto | null) => void;
  verificationByChat: Record<string, VerificationRecord>;
  upsertVerification: (chatId: string, payload: VerificationRecord) => void;
};

export const useCryptoStore = create<CryptoState>()(
  persist(
    (set) => ({
      currentDevice: null,
      verificationByChat: {},
      setCurrentDevice: (currentDevice) => set({ currentDevice }),
      upsertVerification: (chatId, payload) =>
        set((state) => ({
          verificationByChat: {
            ...state.verificationByChat,
            [chatId]: payload
          }
        }))
    }),
    {
      name: 'pulse-chat-crypto'
    }
  )
);
