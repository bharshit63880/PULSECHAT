import { useEffect, useState } from 'react';

import { ensureLocalDevice } from '@/features/encryption/crypto';
import { useCryptoStore } from '@/store/crypto-store';

export const useDeviceBootstrap = () => {
  const currentDevice = useCryptoStore((state) => state.currentDevice);
  const setCurrentDevice = useCryptoStore((state) => state.setCurrentDevice);
  const [isReady, setIsReady] = useState(Boolean(currentDevice));

  useEffect(() => {
    let cancelled = false;

    void ensureLocalDevice().then((device) => {
      if (cancelled) {
        return;
      }

      setCurrentDevice({
        deviceId: device.deviceId,
        label: device.label,
        platform: device.platform,
        userAgent: device.userAgent,
        appVersion: device.appVersion,
        publicIdentityKey: device.publicIdentityKey,
        publicAgreementKey: device.publicAgreementKey,
        fingerprint: device.fingerprint
      });
      setIsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [setCurrentDevice]);

  return {
    device: currentDevice,
    isReady
  };
};
