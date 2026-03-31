import { AppProviders } from './providers';

import { AppRouter } from '@/routes/AppRouter';

export const App = () => (
  <AppProviders>
    <AppRouter />
  </AppProviders>
);
