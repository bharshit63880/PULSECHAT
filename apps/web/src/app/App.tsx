import { AppProviders } from './providers';

import { Spinner } from '@/components/common/Spinner';
import { useAuthBootstrap } from '@/hooks/use-auth-bootstrap';
import { AppRouter } from '@/routes/AppRouter';

const AuthBootstrapGate = () => {
  const { isLoading } = useAuthBootstrap();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-app">
        <Spinner />
      </div>
    );
  }

  return <AppRouter />;
};

export const App = () => (
  <AppProviders>
    <AuthBootstrapGate />
  </AppProviders>
);
