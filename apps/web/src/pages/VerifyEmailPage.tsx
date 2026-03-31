import { AuthLayout } from '@/components/layout/AuthLayout';
import { VerifyEmailCard } from '@/features/auth/components/VerifyEmailCard';
import { useAuthBootstrap } from '@/hooks/use-auth-bootstrap';

export const VerifyEmailPage = () => {
  useAuthBootstrap();

  return (
    <AuthLayout>
      <VerifyEmailCard />
    </AuthLayout>
  );
};
