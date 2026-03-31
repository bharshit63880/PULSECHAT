import type { PropsWithChildren } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

import { useThemeSync } from '@/hooks/use-theme-sync';
import { queryClient } from '@/lib/query-client';

const ThemeBridge = ({ children }: PropsWithChildren) => {
  useThemeSync();
  return <>{children}</>;
};

export const AppProviders = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeBridge>
        {children}
        <Toaster richColors position="top-right" />
      </ThemeBridge>
    </BrowserRouter>
  </QueryClientProvider>
);
