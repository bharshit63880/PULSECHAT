import { useContext } from 'react';

import { CallContext } from '@/features/calls/call-context';

export const useCalls = () => {
  const value = useContext(CallContext);

  if (!value) {
    throw new Error('CallProvider is required');
  }

  return value;
};
