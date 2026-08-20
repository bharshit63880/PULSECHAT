import { createContext } from 'react';

import type { useCallController } from '@/features/calls/use-call-controller';

export const CallContext = createContext<ReturnType<typeof useCallController> | null>(null);
