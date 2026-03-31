import { LoginForm } from '@/features/auth/components/LoginForm';
import { AuthLayout } from '@/components/layout/AuthLayout';

export const LoginPage = () => (
  <AuthLayout>
    <LoginForm />
  </AuthLayout>
);
